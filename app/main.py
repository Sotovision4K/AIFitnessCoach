import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from pydantic import ValidationError

from .dependency import auth_provider, get_llm_client, get_settings
from .exceptions.base import AppBaseException
from .routes.v1.routes import v1_router as api_v1_router

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


def _load_settings():
    """Single, cached settings load with a useful failure message.

    On Lambda this runs during INIT. If env vars are missing, fail loudly with
    the missing field names instead of a generic Pydantic traceback buried in
    CloudWatch.
    """
    try:
        return get_settings()
    except ValidationError as exc:
        missing = sorted(
            {err["loc"][0] for err in exc.errors() if err["type"] == "missing"}
        )
        logger.critical(
            "Configuration error: missing required environment variables: %s",
            ", ".join(str(m) for m in missing) or "<see traceback>",
        )
        # Re-raise so Lambda init fails fast and CloudWatch shows the cause.
        raise


_settings = _load_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warm expensive clients on cold start.

    What we DO pre-warm:
      - Cognito JWKS (one HTTPS round-trip to fetch signing keys).
      - CognitoAdapter singleton.
      - Anthropic SDK client (HTTPS connection pool).

    What we deliberately do NOT pre-warm:
      - aioboto3 resources (DynamoDB, EventBridge). They are bound to the
        asyncio event loop they were opened in, and Mangum creates a new loop
        per Lambda invocation, so a resource opened during startup would be
        unusable for actual request handling. They stay per-request.
    """
    started = time.perf_counter()

    # 1. Cognito: pre-instantiate adapter + warm JWKS cache.
    try:
        cognito = auth_provider(settings=_settings)
        # Duck-typed: only JWT-based providers expose warm_jwks(). Other
        # IDPPort implementations (mock, OIDC introspection, etc.) skip this.
        warmer = getattr(cognito, "warm_jwks", None)
        if callable(warmer):
            n_keys = warmer()
            logger.info("Pre-warmed Cognito JWKS: %d signing key(s) cached", n_keys)
        else:
            logger.info("IDP provider has no JWKS pre-warm; skipping")
    except Exception as e:  # noqa: BLE001
        # Don't crash startup — first real request will retry.
        logger.warning("JWKS pre-warm failed (will retry on first request): %s", e)

    # 2. Anthropic: instantiate the SDK client so its HTTPS pool is ready.
    try:
        get_llm_client()
        logger.info("Pre-warmed Anthropic client")
    except Exception as e:  # noqa: BLE001
        logger.warning("Anthropic pre-warm failed: %s", e)

    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info("Cold-start pre-warm complete in %.1f ms", elapsed_ms)

    yield
    # No shutdown work needed: Lambda just freezes the process.


app = FastAPI(
    title="AI Coach LLM API",
    docs_url="/docs" if _settings.ENV != "prod" else None,
    redoc_url="/redoc" if _settings.ENV != "prod" else None,
    openapi_url="/openapi.json" if _settings.ENV != "prod" else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppBaseException)
async def app_exception_handler(
    request: Request, exc: AppBaseException
) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all so every unhandled error gets one structured log line + a
    generic 500 instead of leaking the traceback to the client."""
    logger.exception(
        "unhandled_exception method=%s path=%s",
        request.method,
        request.url.path,
    )
    return JSONResponse(status_code=500, content={"error": "internal_error"})


@app.middleware("http")
async def access_log_middleware(request: Request, call_next):
    """One INFO line per request: method, path, status, duration, user_id.

    Replaces ad-hoc per-route logging. Skip /docs and the openapi schema so
    we don't pollute logs with browser noise.
    """
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000

    path = request.url.path
    if path in ("/openapi.json",) or path.startswith(("/docs", "/redoc")):
        return response

    # user_id is set by the auth dependency; falls back to '-' for anon routes.
    user_id = getattr(request.state, "user_id", "-")
    logger.info(
        "%s %s -> %d %.1fms user=%s",
        request.method,
        path,
        response.status_code,
        elapsed_ms,
        user_id,
    )
    return response


app.include_router(api_v1_router)

# Mangum handler for AWS Lambda (no-op when running under uvicorn locally).
# lifespan="on" makes Mangum drive startup/shutdown so our pre-warm runs.
handler = Mangum(app, lifespan="on")

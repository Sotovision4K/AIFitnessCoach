import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum

from .exceptions.base import AppBaseException
from .routes.v1.routes import v1_router as api_v1_router
from .config import Settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

app = FastAPI(title="AI Coach LLM API")

_settings = Settings()  # type: ignore[call-arg]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppBaseException)
async def app_exception_handler(request: Request, exc: AppBaseException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=exc.to_dict())


app.include_router(api_v1_router)

# Mangum handler for AWS Lambda (optional, ignored locally)
handler = Mangum(app, lifespan="off")

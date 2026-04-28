# Iron Mind — AI Coach

> A personal project. Built for one purpose: **automate progressive overload**.

Progressive overload is the foundational principle of muscle growth — gradually
increase the demand on your muscles (more weight, more reps, more sets, better
tempo) and they adapt by getting bigger and stronger. The principle is simple.
The bookkeeping is not.

Most people stall not because they don't know what to do, but because tracking
last week's lifts, deciding the next jump, balancing volume across muscle
groups, and rotating accessories every few weeks is **tedious work that humans
quietly skip**. That's exactly the kind of work software is good at.

**Iron Mind** is my attempt to remove that friction: an LLM-driven coach that
reads your history, applies progressive-overload logic, and produces the next
week's plan automatically. You just lift.

---

## What it does

- Onboarding captures your stats, experience, equipment, and goals.
- A FastAPI backend persists your profile and asks an LLM (Claude) to generate a
  structured weekly plan grounded in progressive-overload rules.
- Plans are produced **asynchronously** via EventBridge + a worker Lambda, so the
  request returns instantly and the plan shows up when it's ready.
- A React + Vite frontend renders the plan, exercise by exercise, day by day.

---

## Tech stack

**Backend** — Python 3.12, FastAPI, Mangum, Pydantic v2, aioboto3, Anthropic
SDK. Packaged as a container image and deployed to AWS Lambda.

**Frontend** — React 19, TypeScript, Vite, Tailwind v4, React Router v7,
React Hook Form + Zod, AWS Amplify (Cognito Hosted UI via OIDC).

**Infra** — Terraform (`infra/`). Lambda runs on `arm64` (Graviton) for cost
and cold-start wins.

**CI/CD** — GitHub Actions (`.github/workflows/aws.yaml`): path-filtered build,
buildx for `linux/arm64`, push to ECR, update both Lambdas.

---

## Architecture

```
                        ┌────────────────────────────┐
   Client (web app) ───►│  API Gateway (HTTP API v2) │
                        │  $default stage            │
                        │  ANY /  +  ANY /{proxy+}   │
                        └──────────────┬─────────────┘
                                       │  AWS_PROXY (payload v2.0)
                                       ▼
                        ┌────────────────────────────┐
                        │  Lambda: ai-coach-<env>-api│
                        │  image CMD =               │
                        │   app.main.handler         │
                        │  (FastAPI + Mangum)        │
                        └──────┬───────────┬─────────┘
                               │           │
                       DynamoDB│           │ events:PutEvents
                               ▼           ▼
                  ┌────────────────┐  ┌────────────────────────────┐
                  │ DynamoDB       │  │ EventBridge bus            │
                  │  user_table    │  │  ai-coach-<env>-bus        │
                  │  workout_plans │  │ rule:                      │
                  │  workout_jobs  │  │  WorkoutGenerationRequested│
                  └────────────────┘  └──────────┬─────────────────┘
                                                 │ target
                                                 ▼
                                  ┌────────────────────────────┐
                                  │  Lambda: ai-coach-<env>-   │
                                  │   worker                   │
                                  │  image CMD =               │
                                  │   app.handlers.workout_    │
                                  │   worker.handler           │
                                  └──────────────┬─────────────┘
                                                 │ on failure
                                                 ▼
                                  ┌────────────────────────────┐
                                  │  SQS DLQ                   │
                                  │  ai-coach-<env>-worker-dlq │
                                  └────────────────────────────┘
```

### Why this shape

- **API Gateway HTTP API v2** — cheaper and faster than REST API, payload v2.0
  maps cleanly to Mangum.
- **Single container image, two Lambdas** — `api` and `worker` run the same
  image with different `CMD` overrides (`ImageConfig.Command`). One build,
  two entrypoints.
- **Async via EventBridge** — LLM calls take seconds. The API enqueues a
  `WorkoutGenerationRequested` event, returns a `job_id`, and the worker does
  the slow work. The frontend polls `workout_jobs` for status.
- **DLQ on the worker** — failed plan generations land in SQS instead of
  vanishing, so I can inspect and replay them.
- **Cognito** — auth handled by Cognito Hosted UI; the frontend uses
  `react-oidc-context`, the backend validates JWTs.

---

## Repository layout

```
app/                FastAPI app + worker handler (hexagonal-ish: ports/adapters)
  main.py             FastAPI entrypoint, Mangum handler
  handlers/           Lambda worker entrypoints
  routes/v1/          HTTP routes
  services/           Business logic (workout generation, prompt building)
  ports/              Interfaces (repo, LLM, event bus, IDP)
  adapters/           AWS / Anthropic implementations of the ports
  models/, schemas/   Domain models and request/response DTOs
frontend/ai_coach/  React + Vite + Tailwind app (Iron Mind UI)
infra/              Terraform for AWS resources
Dockerfile          Lambda container image (arm64)
.github/workflows/  CI/CD
```

---

## Local development

### Backend

```powershell
docker compose -f docker-compose.dev.yml up
```

Or bare-metal:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```powershell
cd frontend/ai_coach
npm install
npm run dev
```

---

## Deploy

Push to `main`. The workflow detects whether `app/`, `Dockerfile`, or
`frontend/` changed and only deploys what's needed. Manual runs accept
`force_backend` / `force_frontend` inputs.

The image is built with `docker buildx --platform linux/arm64` to match the
Lambda architecture set in Terraform.

---

## Status

This is a personal project — actively evolving, opinionated, and built for me
first. If it helps you, great. If something's broken, it's probably because I
was busy lifting.

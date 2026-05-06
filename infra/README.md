# AI Coach LLM — Infrastructure

Terraform stack that provisions the serverless AWS infrastructure for the
`AI_COACH_LLM` FastAPI application. The previous ECS Fargate setup has been
removed; everything now runs on **Lambda + API Gateway + EventBridge**.

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

   Single ECR repo (ai-coach-api) holds ONE container image; both Lambdas
   pull the same image and override the CMD via image_config.command.
```

### Data plane summary

| Component        | Resource                                                | Purpose                                                 |
|------------------|---------------------------------------------------------|---------------------------------------------------------|
| Edge             | `aws_apigatewayv2_api` (HTTP API)                       | Single entry point. Catch-all `ANY /` + `ANY /{proxy+}` |
| Sync compute     | Lambda `*-api` (FastAPI + Mangum, container image)      | Serves every HTTP route via Mangum                      |
| Async compute    | Lambda `*-worker` (same image, different CMD)           | Generates workout plans, polled via `jobs` table        |
| Event plane      | `aws_cloudwatch_event_bus` + `_rule` + `_target`        | API publishes `WorkoutGenerationRequested`              |
| Failure capture  | `aws_sqs_queue` `*-worker-dlq`                          | Captures EventBridge → Lambda delivery failures         |
| State            | 3× `aws_dynamodb_table` (`user_table`, `workout_plans`, `workout_jobs`) | App state                       |
| Image registry   | `aws_ecr_repository` `ai-coach-api`                     | One image, shared by both Lambdas                       |
| Identity         | 2× `aws_iam_role` (api / worker) with inline policies   | Least-privilege per Lambda                              |
| Observability    | 2× `aws_cloudwatch_log_group` (`/aws/lambda/<fn>`)      | 30-day retention by default                             |

## Module layout

```
infra/
├── main.tf                    # provider locals + wiring
├── variables.tf
├── outputs.tf                 # api_base_url, lambda names, dlq_url, ...
├── versions.tf
├── providers.tf
├── terraform.tfvars(.example)
└── modules/
    ├── api-gateway/           # HTTP API + integration + 2 routes + stage + permission
    ├── dynamodb-table/        # generic DynamoDB table
    ├── ecr/                   # generic ECR repository
    ├── eventbridge/           # custom bus + rule + target + SQS DLQ + queue policy
    └── lambdas/               # generic Lambda (Image or Zip) + log group
```

## Deploy checklist

1. **Build & push the container image**
   ```powershell
   $acct = (aws sts get-caller-identity --query Account --output text)
   $region = "us-east-1"
   $repo = "$acct.dkr.ecr.$region.amazonaws.com/ai-coach-api"

   aws ecr get-login-password --region $region | `
     docker login --username AWS --password-stdin "$acct.dkr.ecr.$region.amazonaws.com"
   docker build --platform linux/arm64 -t "${repo}:latest" .
   docker push "${repo}:latest"
   ```
   (Run `terraform apply` once first to create the ECR repo, or split apply
   into two passes: ECR first, then everything else.)

2. **Configure variables** — copy `terraform.tfvars.example` → `terraform.tfvars`,
   fill in `cognito_*`, `anthropic_api_key` (or use `TF_VAR_anthropic_api_key`),
   and `allowed_origins`.

3. **Apply**
   ```powershell
   terraform init
   terraform apply
   ```

4. **Smoke test**
   ```
   GET  <api_base_url>/api/v1/health/                  # → {"status":"ok"}
   POST <api_base_url>/api/v1/workout/generate         # → 202 + jobId
   GET  <api_base_url>/api/v1/workout/jobs/<jobId>     # → PENDING → RUNNING → COMPLETED
   ```

## Outputs

| Output                | Meaning                                                    |
|-----------------------|------------------------------------------------------------|
| `api_base_url`        | Frontend base URL — append `/api/v1/...`                   |
| `api_lambda_name`     | Name of the API Lambda                                     |
| `worker_lambda_name`  | Name of the worker Lambda                                  |
| `event_bus_name`      | Custom EventBridge bus the API publishes to                |
| `worker_dlq_url`      | SQS URL where failed worker invocations land               |
| `ecr_repository_urls` | Map of ECR repo URLs                                       |
| `dynamodb_table_names`| Map of DynamoDB table names                                |

## Security notes

- **Rotate any AWS keys that were previously committed in `terraform.tfvars`.**
  The file has been blanked; prefer env vars / SSO / a profile going forward.
- `anthropic_api_key` is `sensitive`. For real environments, store it in
  Secrets Manager and add the secret ARN to `anthropic_secret_arns` so the
  Lambdas can `secretsmanager:GetSecretValue` it.
- Both Lambda IAM roles are scoped to the three DynamoDB tables and (for the
  API role) `events:PutEvents` only on the project bus.
- No VPC, NAT, or load balancer — Lambdas run in the AWS-managed network.

## Lambda CPU architecture

Both Lambda functions are deployed on **`arm64` (AWS Graviton2)** by default —
roughly 20% cheaper per GB-second and typically faster cold starts than
`x86_64`. This is set in two places:

- `modules/lambdas/variables.tf` → `variable "architecture" { default = "arm64" }`
  with a validation block restricting it to `arm64` or `x86_64`.
- Root `main.tf` → both module calls (`module.lambda_api`, `module.lambda_worker`)
  pass `architecture = "arm64"` explicitly.

> **Important:** the container image **must** be built for the same architecture
> as the Lambda runtime. When building locally on an x86_64 machine, force the
> ARM build:
>
> ```powershell
> docker build --platform linux/arm64 -t "${repo}:latest" .
> docker push "${repo}:latest"
> ```
>
> If you ever need to switch to x86_64, change both Lambda module calls to
> `architecture = "x86_64"` and rebuild the image with `--platform linux/amd64`.

```

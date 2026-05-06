###############################################################################
# Provider / global
###############################################################################
variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region"
}

variable "aws_access_key" {
  type        = string
  default     = ""
  description = "Optional. Prefer env vars / SSO / shared profile over committing this."
  sensitive   = true
}

variable "aws_secret_key" {
  type        = string
  default     = ""
  description = "Optional. Prefer env vars / SSO / shared profile over committing this."
  sensitive   = true
}

variable "project" {
  type        = string
  default     = "ai-coach"
  description = "Short project name, used as a prefix for resources"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Deployment environment (dev, staging, prod)"
}

variable "extra_tags" {
  type    = map(string)
  default = {}
}

###############################################################################
# ECR
###############################################################################
variable "ecr_repositories" {
  description = "Map of ECR repositories to create. Key = logical name."
  type = map(object({
    name                 = string
    image_tag_mutability = optional(string, "MUTABLE")
    force_delete         = optional(bool, true)
    scan_on_push         = optional(bool, true)
  }))
  default = {
    api = {
      name = "ai-coach-api"
    }
    post_sign_up = {
      name = "ai-coach-dev-post-sign-up"
    }
  }
}

variable "api_image_repo_key" {
  type        = string
  default     = "api"
  description = "Key of ecr_repositories that holds the FastAPI image"
}

variable "post_sign_up_image_repo_key" {
  type        = string
  default     = "post_sign_up"
  description = "Key of ecr_repositories that holds the Cognito post-sign-up Lambda image"
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Container image tag deployed to both Lambdas"
}

###############################################################################
# DynamoDB tables — must include the three logical keys: workout_plans, users, jobs
###############################################################################
variable "dynamodb_tables" {
  description = "Map of DynamoDB tables. MUST contain logical keys: workout_plans, users, jobs."
  type = map(object({
    name         = string
    billing_mode = optional(string, "PAY_PER_REQUEST")
    hash_key     = string
    range_key    = optional(string, null)
    attributes = list(object({
      name = string
      type = string
    }))
    global_secondary_indexes = optional(list(object({
      name            = string
      hash_key        = string
      range_key       = optional(string, null)
      projection_type = optional(string, "ALL")
    })), [])
  }))
  default = {
    users = {
      name     = "ai-coach-users"
      hash_key = "userId"
      attributes = [
        { name = "userId", type = "S" },
      ]
    }
    workout_plans = {
      name      = "ai-coach-workout-plans"
      hash_key  = "userId"
      range_key = "createdAt"
      attributes = [
        { name = "userId", type = "S" },
        { name = "createdAt", type = "S" },
      ]
    }
    jobs = {
      name     = "ai-coach-workout-jobs"
      hash_key = "jobId"
      attributes = [
        { name = "jobId", type = "S" },
        { name = "userId", type = "S" },
      ]
      global_secondary_indexes = [
        {
          name     = "userId-index"
          hash_key = "userId"
        },
      ]
    }
  }
}

variable "users_table_name" {
  type        = string
  default     = "ai-coach-users"
  description = "USERS_TABLE_NAME env var (must match dynamodb_tables.users.name)"
}

variable "workout_plans_table_name" {
  type        = string
  default     = "ai-coach-workout-plans"
  description = "DYNAMO_TABLE_NAME env var (must match dynamodb_tables.workout_plans.name)"
}

variable "jobs_table_name" {
  type        = string
  default     = "ai-coach-workout-jobs"
  description = "JOBS_TABLE_NAME env var (must match dynamodb_tables.jobs.name)"
}

###############################################################################
# Lambdas
###############################################################################
variable "api_memory_size" {
  type    = number
  default = 1024
}

variable "worker_memory_size" {
  type    = number
  default = 1024
}

variable "log_retention_days" {
  type    = number
  default = 30
}

###############################################################################
# Application config -> Lambda env vars
###############################################################################
variable "anthropic_api_key" {
  type        = string
  default     = ""
  sensitive   = true
  description = "Anthropic API key. Prefer setting via TF_VAR_anthropic_api_key or sourcing from Secrets Manager."
}

variable "anthropic_api_model" {
  type    = string
  default = "claude-3-5-sonnet-20241022"
}

variable "anthropic_secret_arns" {
  type        = list(string)
  default     = []
  description = "Optional Secrets Manager ARNs the Lambdas may read."
}

variable "cognito_user_pool_id" {
  type    = string
  default = ""
}

variable "cognito_client_id" {
  type    = string
  default = ""
}

variable "cognito_region" {
  type    = string
  default = "us-east-1"
}

variable "cognito_jwks_url" {
  type    = string
  default = ""
}

variable "allowed_origins" {
  type        = list(string)
  default     = ["*"]
  description = "ALLOWED_ORIGINS for FastAPI CORSMiddleware (JSON-encoded into the env var)"
}

variable "log_level" {
  type    = string
  default = "INFO"
}

variable "temperature" {
  type    = number
  default = 0.4
}

variable "max_tokens" {
  type    = number
  default = 4096
}

variable "extra_lambda_env" {
  type        = map(string)
  default     = {}
  description = "Additional environment variables merged into both Lambdas"
}

###############################################################################
# EventBridge
###############################################################################
variable "event_source" {
  type    = string
  default = "ai-coach.api"
}

variable "event_detail_type" {
  type    = string
  default = "WorkoutGenerationRequested"
}

###############################################################################
# API Gateway
###############################################################################
variable "gateway_cors_allow_origins" {
  type        = list(string)
  default     = []
  description = "Leave empty to let FastAPI handle CORS (recommended). If set, enables CORS at the gateway."
}

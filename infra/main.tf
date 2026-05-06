###############################################################################
# Common locals
###############################################################################
locals {
  common_tags = merge(
    {
      Project     = var.project
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.extra_tags,
  )

  name_prefix    = "${var.project}-${var.environment}"
  event_bus_name = "${local.name_prefix}-bus"


  # Shared environment variables for both Lambdas (driven by app/config.py Settings).
  # NOTE: AWS_REGION is reserved by the Lambda runtime; the app reads it implicitly.
  lambda_env = merge({
    ENV                        = var.environment
    DYNAMO_TABLE_NAME          = var.workout_plans_table_name
    USERS_TABLE_NAME           = var.users_table_name
    JOBS_TABLE_NAME            = var.jobs_table_name
    EVENT_BUS_NAME             = local.event_bus_name
    EVENT_SOURCE               = var.event_source
    EVENT_DETAIL_TYPE_GENERATE = var.event_detail_type
    ALLOWED_ORIGINS            = jsonencode(var.allowed_origins)
    LOG_LEVEL                  = var.log_level
    TEMPERATURE                = tostring(var.temperature)
    MAX_TOKENS                 = tostring(var.max_tokens)
    ANTHROPIC_API_MODEL        = var.anthropic_api_model
    ANTHROPIC_API_KEY          = var.anthropic_api_key
    COGNITO_USER_POOL_ID       = var.cognito_user_pool_id
    COGNITO_CLIENT_ID          = var.cognito_client_id
    COGNITO_REGION             = var.cognito_region
    COGNITO_JWKS_URL           = var.cognito_jwks_url
  }, var.extra_lambda_env)

  table_arns = [
    module.dynamodb["workout_plans"].table_arn,
    module.dynamodb["users"].table_arn,
    module.dynamodb["jobs"].table_arn,
    "${module.dynamodb["workout_plans"].table_arn}/index/*",
    "${module.dynamodb["users"].table_arn}/index/*",
    "${module.dynamodb["jobs"].table_arn}/index/*",
  ]

  image_uri              = "${module.ecr[var.api_image_repo_key].repository_url}:${var.image_tag}"
  post_sign_up_image_uri = "${module.ecr[var.post_sign_up_image_repo_key].repository_url}:${var.image_tag}"
}

###############################################################################
# ECR repository (holds the FastAPI container image used by both Lambdas)
###############################################################################
module "ecr" {
  source   = "./modules/ecr"
  for_each = var.ecr_repositories

  name                 = each.value.name
  image_tag_mutability = each.value.image_tag_mutability
  force_delete         = each.value.force_delete
  scan_on_push         = each.value.scan_on_push
  tags                 = local.common_tags
}

# # Resolve the image tag to its immutable digest. This makes Terraform fail at
# # plan time if the image hasn't been pushed yet (instead of producing a broken
# # Lambda), AND it forces Lambda to update whenever the same tag is re-pushed
# # with new content.
# data "aws_ecr_image" "api" {
#   repository_name = module.ecr[var.api_image_repo_key].repository_name
#   image_tag       = var.image_tag
# }

# data "aws_ecr_image" "post_sign_up" {
#   repository_name = module.ecr[var.post_sign_up_image_repo_key].repository_name
#   image_tag       = var.image_tag
# }

###############################################################################
# DynamoDB tables (workout_plans, users, jobs)
###############################################################################
module "dynamodb" {
  source   = "./modules/dynamodb-table"
  for_each = var.dynamodb_tables

  name                     = each.value.name
  billing_mode             = each.value.billing_mode
  hash_key                 = each.value.hash_key
  range_key                = each.value.range_key
  attributes               = each.value.attributes
  global_secondary_indexes = each.value.global_secondary_indexes
  tags                     = local.common_tags
}

###############################################################################
# IAM roles for the two Lambdas
###############################################################################
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# --- API Lambda role ---
resource "aws_iam_role" "api_lambda" {
  name               = "${local.name_prefix}-api-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = local.common_tags
}

resource "aws_iam_role_policy_attachment" "api_lambda_basic" {
  role       = aws_iam_role.api_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "api_lambda_inline" {
  statement {
    sid    = "DynamoDBCrud"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:DeleteItem",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
    ]
    resources = local.table_arns
  }

  statement {
    sid       = "EventBridgePublish"
    effect    = "Allow"
    actions   = ["events:PutEvents"]
    resources = [module.eventbridge.bus_arn]
  }

  dynamic "statement" {
    for_each = length(var.anthropic_secret_arns) > 0 ? [1] : []
    content {
      sid       = "ReadAnthropicSecret"
      effect    = "Allow"
      actions   = ["secretsmanager:GetSecretValue"]
      resources = var.anthropic_secret_arns
    }
  }
}

resource "aws_iam_role_policy" "api_lambda_inline" {
  name   = "${local.name_prefix}-api-lambda-inline"
  role   = aws_iam_role.api_lambda.id
  policy = data.aws_iam_policy_document.api_lambda_inline.json
}

# --- Worker Lambda role (no events:PutEvents) ---
resource "aws_iam_role" "worker_lambda" {
  name               = "${local.name_prefix}-worker-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = local.common_tags
}

resource "aws_iam_role_policy_attachment" "worker_lambda_basic" {
  role       = aws_iam_role.worker_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "worker_lambda_inline" {
  statement {
    sid    = "DynamoDBCrud"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:DeleteItem",
      "dynamodb:BatchGetItem",
      "dynamodb:BatchWriteItem",
    ]
    resources = local.table_arns
  }

  dynamic "statement" {
    for_each = length(var.anthropic_secret_arns) > 0 ? [1] : []
    content {
      sid       = "ReadAnthropicSecret"
      effect    = "Allow"
      actions   = ["secretsmanager:GetSecretValue"]
      resources = var.anthropic_secret_arns
    }
  }
}

resource "aws_iam_role_policy" "worker_lambda_inline" {
  name   = "${local.name_prefix}-worker-lambda-inline"
  role   = aws_iam_role.worker_lambda.id
  policy = data.aws_iam_policy_document.worker_lambda_inline.json
}

###############################################################################
# Lambdas: API (FastAPI + Mangum) and Worker (EventBridge consumer)
###############################################################################
module "lambda_api" {
  source = "./modules/lambdas"

  function_name         = "${local.name_prefix}-api"
  role_arn              = aws_iam_role.api_lambda.arn
  package_type          = "Image"
  image_uri             = local.image_uri
  image_command         = ["app.main.handler"]
  timeout               = 30
  memory_size           = var.api_memory_size
  architecture          = "arm64"
  environment_variables = local.lambda_env
  log_retention_days    = var.log_retention_days
  tags                  = local.common_tags
}

module "lambda_worker" {
  source = "./modules/lambdas"

  function_name         = "${local.name_prefix}-worker"
  role_arn              = aws_iam_role.worker_lambda.arn
  package_type          = "Image"
  image_uri             = local.image_uri
  image_command         = ["app.handlers.workout_worker.handler"]
  timeout               = 300
  memory_size           = var.worker_memory_size
  architecture          = "arm64"
  environment_variables = local.lambda_env
  log_retention_days    = var.log_retention_days
  tags                  = local.common_tags
}

module "lambda_post_sign-up"{
  source = "./modules/lambdas"

  function_name        = "${local.name_prefix}-post-sign-up"
  role_arn             = aws_iam_role.worker_lambda.arn
  package_type         = "Image"
  image_uri             = local.post_sign_up_image_uri
  image_command         = ["app.handlers.post_sign_up.handler"]
  timeout               = 300
  memory_size           = var.worker_memory_size
  architecture          = "arm64"
  environment_variables = local.lambda_env
  log_retention_days    = var.log_retention_days
  tags                  = local.common_tags


}

###############################################################################
# API Gateway (HTTP API v2) -> API Lambda
###############################################################################
module "api_gateway" {
  source = "./modules/api-gateway"

  name                 = "${local.name_prefix}-http-api"
  lambda_function_name = module.lambda_api.function_name
  lambda_invoke_arn    = module.lambda_api.invoke_arn
  cors_allow_origins   = var.gateway_cors_allow_origins
  tags                 = local.common_tags
}

###############################################################################
# EventBridge: bus + rule + worker target + DLQ
###############################################################################
module "eventbridge" {
  source = "./modules/eventbridge"

  bus_name           = local.event_bus_name
  rule_name          = "${local.name_prefix}-workout-generation"
  event_source       = var.event_source
  event_detail_type  = var.event_detail_type
  worker_lambda_arn  = module.lambda_worker.function_arn
  worker_lambda_name = module.lambda_worker.function_name
  dlq_name           = "${local.name_prefix}-worker-dlq"
  tags               = local.common_tags
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = var.role_arn
  package_type  = var.package_type
  timeout       = var.timeout
  memory_size   = var.memory_size
  architectures = [var.architecture]

  # Image mode
  image_uri = var.package_type == "Image" ? var.image_uri : null

  dynamic "image_config" {
    for_each = var.package_type == "Image" && var.image_command != null ? [1] : []
    content {
      command = var.image_command
    }
  }

  # Zip mode
  handler          = var.package_type == "Zip" ? var.handler : null
  runtime          = var.package_type == "Zip" ? var.runtime : null
  filename         = var.package_type == "Zip" ? var.filename : null
  source_code_hash = var.package_type == "Zip" && var.filename != null ? filebase64sha256(var.filename) : null

  environment {
    variables = var.environment_variables
  }

  tags       = var.tags
  depends_on = [aws_cloudwatch_log_group.this]
}

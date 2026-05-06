variable "name" {
  type        = string
  description = "Name of the HTTP API"
}

variable "lambda_function_name" {
  type        = string
  description = "Name of the Lambda backing the API (for lambda:InvokeFunction permission)"
}

variable "lambda_invoke_arn" {
  type        = string
  description = "Lambda invoke ARN used by the AWS_PROXY integration"
}

variable "cors_allow_origins" {
  type        = list(string)
  default     = []
  description = "If non-empty, enable CORS at the gateway with these origins"
}

variable "tags" {
  type    = map(string)
  default = {}
}

variable "function_name" {
  type        = string
  description = "Lambda function name"
}

variable "role_arn" {
  type        = string
  description = "Execution role ARN"
}

variable "package_type" {
  type        = string
  default     = "Image"
  description = "Image or Zip"
  validation {
    condition     = contains(["Image", "Zip"], var.package_type)
    error_message = "package_type must be Image or Zip."
  }
}

# --- Image packaging ---
variable "image_uri" {
  type        = string
  default     = null
  description = "ECR image URI (required when package_type=Image)"
}

variable "image_command" {
  type        = list(string)
  default     = null
  description = "Optional CMD override (image_config.command). Use to point a shared image at a different handler."
}

# --- Zip packaging ---
variable "handler" {
  type        = string
  default     = null
  description = "Handler (zip mode)"
}

variable "runtime" {
  type        = string
  default     = null
  description = "Runtime (zip mode)"
}

variable "filename" {
  type        = string
  default     = null
  description = "Path to deployment zip (zip mode)"
}

# --- Common ---
variable "timeout" {
  type    = number
  default = 30
}

variable "memory_size" {
  type    = number
  default = 1024
}

variable "architecture" {
  type        = string
  default     = "arm64"
  description = "Lambda CPU architecture. arm64 (Graviton2) is ~20% cheaper and typically has faster cold starts than x86_64. Container images MUST be built for the same arch (e.g. `docker build --platform linux/arm64`)."

  validation {
    condition     = contains(["arm64", "x86_64"], var.architecture)
    error_message = "architecture must be either \"arm64\" or \"x86_64\"."
  }
}

variable "environment_variables" {
  type        = map(string)
  default     = {}
  description = "Lambda environment variables"
}

variable "log_retention_days" {
  type    = number
  default = 30
}

variable "tags" {
  type    = map(string)
  default = {}
}

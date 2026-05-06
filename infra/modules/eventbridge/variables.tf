variable "bus_name" {
  type        = string
  description = "Custom EventBridge bus name"
}

variable "rule_name" {
  type        = string
  default     = "workout-generation-requested"
  description = "Rule name"
}

variable "event_source" {
  type        = string
  default     = "ai-coach.api"
  description = "Event source value the rule matches on"
}

variable "event_detail_type" {
  type        = string
  default     = "WorkoutGenerationRequested"
  description = "Event detail-type value the rule matches on"
}

variable "worker_lambda_arn" {
  type        = string
  description = "ARN of the worker Lambda target"
}

variable "worker_lambda_name" {
  type        = string
  description = "Name of the worker Lambda (for invoke permission)"
}

variable "dlq_name" {
  type    = string
  default = "ai-coach-worker-dlq"
}

variable "maximum_retry_attempts" {
  type    = number
  default = 2
}

variable "maximum_event_age_in_seconds" {
  type    = number
  default = 3600
}

variable "tags" {
  type    = map(string)
  default = {}
}

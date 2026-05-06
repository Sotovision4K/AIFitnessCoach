variable "name" {
  type        = string
  description = "Name of the DynamoDB table"
}

variable "billing_mode" {
  type        = string
  default     = "PAY_PER_REQUEST"
  description = "Billing mode (PAY_PER_REQUEST or PROVISIONED)"
}

variable "hash_key" {
  type        = string
  description = "Partition key name"
}

variable "range_key" {
  type        = string
  default     = null
  description = "Optional sort key name"
}

variable "attributes" {
  description = "List of attribute definitions"
  type = list(object({
    name = string
    type = string
  }))
}

variable "global_secondary_indexes" {
  description = "List of GSI definitions"
  type = list(object({
    name            = string
    hash_key        = string
    range_key       = optional(string, null)
    projection_type = optional(string, "ALL")
  }))
  default = []
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags applied to the table"
}

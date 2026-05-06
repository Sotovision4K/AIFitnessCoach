variable "name" {
  type        = string
  description = "Name of the ECR repository"
}

variable "image_tag_mutability" {
  type        = string
  default     = "MUTABLE"
  description = "Tag mutability setting (MUTABLE or IMMUTABLE)"
}

variable "force_delete" {
  type        = bool
  default     = true
  description = "Whether to delete the repository even if it contains images"
}

variable "scan_on_push" {
  type        = bool
  default     = true
  description = "Enable image scanning on push"
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "Tags applied to the repository"
}

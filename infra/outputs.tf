output "api_base_url" {
  description = "Base URL of the HTTP API. Frontend calls <api_base_url>/api/v1/..."
  value       = module.api_gateway.invoke_url
}

output "api_lambda_name" {
  value = module.lambda_api.function_name
}

output "worker_lambda_name" {
  value = module.lambda_worker.function_name
}

output "event_bus_name" {
  value = module.eventbridge.bus_name
}

output "worker_dlq_url" {
  value = module.eventbridge.dlq_url
}

output "ecr_repository_urls" {
  value = { for k, m in module.ecr : k => m.repository_url }
}

output "dynamodb_table_names" {
  value = { for k, m in module.dynamodb : k => m.table_name }
}

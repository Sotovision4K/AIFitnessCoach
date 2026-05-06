resource "aws_cloudwatch_event_bus" "this" {
  name = var.bus_name
  tags = var.tags
}

resource "aws_cloudwatch_event_rule" "this" {
  name           = var.rule_name
  event_bus_name = aws_cloudwatch_event_bus.this.name
  description    = "Routes ${var.event_detail_type} events to the worker Lambda"

  event_pattern = jsonencode({
    "source"      = [var.event_source]
    "detail-type" = [var.event_detail_type]
  })

  tags = var.tags
}

# DLQ for failed deliveries from the rule target
resource "aws_sqs_queue" "dlq" {
  name                       = var.dlq_name
  message_retention_seconds  = 1209600
  visibility_timeout_seconds = 60
  tags                       = var.tags
}

data "aws_iam_policy_document" "dlq_policy" {
  statement {
    sid    = "AllowEventBridgeToSendMessage"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
    actions   = ["sqs:SendMessage"]
    resources = [aws_sqs_queue.dlq.arn]
    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values   = [aws_cloudwatch_event_rule.this.arn]
    }
  }
}

resource "aws_sqs_queue_policy" "dlq" {
  queue_url = aws_sqs_queue.dlq.id
  policy    = data.aws_iam_policy_document.dlq_policy.json
}

resource "aws_cloudwatch_event_target" "worker" {
  rule           = aws_cloudwatch_event_rule.this.name
  event_bus_name = aws_cloudwatch_event_bus.this.name
  target_id      = "worker-lambda"
  arn            = var.worker_lambda_arn

  retry_policy {
    maximum_event_age_in_seconds = var.maximum_event_age_in_seconds
    maximum_retry_attempts       = var.maximum_retry_attempts
  }

  dead_letter_config {
    arn = aws_sqs_queue.dlq.arn
  }
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = var.worker_lambda_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.this.arn
}

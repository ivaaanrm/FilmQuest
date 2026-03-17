# ---------- IAM ----------

resource "aws_iam_role" "question_generator" {
  name = "${var.project_name}-question-generator"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "lambda.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "question_generator_logs" {
  role       = aws_iam_role.question_generator.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ---------- Lambda function ----------

# Placeholder zip — replaced by CI/CD or manual upload to S3
data "archive_file" "question_generator_placeholder" {
  type        = "zip"
  output_path = "${path.module}/.build/question_generator_placeholder.zip"

  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'placeholder'}"
    filename = "handler.py"
  }
}

resource "aws_lambda_function" "question_generator" {
  function_name = "${var.project_name}-question-generator"
  role          = aws_iam_role.question_generator.arn
  handler       = "handler.handler"
  runtime       = "python3.13"
  timeout       = 29
  memory_size   = 256
  # reserved_concurrent_executions = 0  # Set to -1 (or remove) to re-enable

  filename         = data.archive_file.question_generator_placeholder.output_path
  source_code_hash = data.archive_file.question_generator_placeholder.output_base64sha256

  environment {
    variables = {
      OPENAI_API_KEY = data.aws_ssm_parameter.openai_api_key.value
      OPENAI_MODEL   = var.openai_model
      QUESTION_COUNT = "10"
    }
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# ---------- API Gateway permission ----------

resource "aws_lambda_permission" "question_generator_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.question_generator.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

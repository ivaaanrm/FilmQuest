# ---------- IAM ----------

resource "aws_iam_role" "recommender" {
  name = "${var.project_name}-recommender"

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

resource "aws_iam_role_policy_attachment" "recommender_logs" {
  role       = aws_iam_role.recommender.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ---------- Lambda function ----------

data "archive_file" "recommender_placeholder" {
  type        = "zip"
  output_path = "${path.module}/.build/recommender_placeholder.zip"

  source {
    content  = "def handler(event, context): return {'statusCode': 200, 'body': 'placeholder'}"
    filename = "handler.py"
  }
}

resource "aws_lambda_function" "recommender" {
  function_name = "${var.project_name}-recommender"
  role          = aws_iam_role.recommender.arn
  handler       = "handler.handler"
  runtime       = "python3.13"
  timeout       = 60
  memory_size   = 256

  filename         = data.archive_file.recommender_placeholder.output_path
  source_code_hash = data.archive_file.recommender_placeholder.output_base64sha256

  environment {
    variables = {
      OPENAI_API_KEY       = data.aws_ssm_parameter.openai_api_key.value
      OPENAI_MODEL         = var.openai_model
      TMDB_API_KEY         = data.aws_ssm_parameter.tmdb_api_key.value
      RECOMMENDATION_COUNT = tostring(var.recommendation_count)
    }
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# ---------- API Gateway permission ----------

resource "aws_lambda_permission" "recommender_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recommender.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

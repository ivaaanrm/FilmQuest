# SSM parameters are pre-populated manually — Terraform reads them as data
# sources so that secrets never appear in state as managed resources.

data "aws_ssm_parameter" "openai_api_key" {
  name = "/${var.project_name}/openai-api-key"
}

data "aws_ssm_parameter" "tmdb_api_key" {
  name = "/${var.project_name}/tmdb-api-key"
}

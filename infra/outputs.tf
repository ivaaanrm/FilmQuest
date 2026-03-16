output "cloudfront_domain" {
  description = "CloudFront distribution domain name for the frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "api_gateway_url" {
  description = "Base URL for the API Gateway prod stage"
  value       = aws_api_gateway_stage.prod.invoke_url
}

output "frontend_bucket_name" {
  description = "S3 bucket name for deploying frontend assets"
  value       = aws_s3_bucket.frontend.id
}

output "lambda_artifacts_bucket_name" {
  description = "S3 bucket name for Lambda deployment zips"
  value       = aws_s3_bucket.lambda_artifacts.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}

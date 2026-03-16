variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-south-2"
}

variable "openai_model" {
  description = "OpenAI model ID"
  type        = string
  default     = "gpt-4o-mini"
}

variable "recommendation_count" {
  description = "Number of movies to recommend"
  type        = number
  default     = 5
}

variable "project_name" {
  description = "Project name used as a prefix for resource naming"
  type        = string
  default     = "filmquest"
}

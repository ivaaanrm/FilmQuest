import json

from config import Config
from openai_client import OpenAILLMClient
from service import QuestionService

_CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def _build_service(config: Config) -> QuestionService:
    llm = OpenAILLMClient(api_key=config.openai_api_key, model=config.openai_model)
    return QuestionService(llm=llm)


# Initialised once per Lambda container (outside the handler) to reuse across warm invocations.
_config = Config()
_service = _build_service(_config)


def handler(event: dict, context: object) -> dict:
    try:
        response = _service.get_questions(_config.question_count)
        return {
            "statusCode": 200,
            "headers": _CORS_HEADERS,
            "body": response.model_dump_json(),
        }
    except Exception:
        return {
            "statusCode": 502,
            "headers": _CORS_HEADERS,
            "body": json.dumps({"error": "LLM unavailable"}),
        }

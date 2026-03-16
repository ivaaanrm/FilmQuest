import json

from config import Config
from models import RecommendationRequest
from openai_client import OpenAILLMClient
from service import RecommendationService
from tmdb_client import TMDBClient

_CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


def _build_service(config: Config) -> RecommendationService:
    llm = OpenAILLMClient(api_key=config.openai_api_key, model=config.openai_model)
    movie_db = TMDBClient(api_key=config.tmdb_api_key)
    return RecommendationService(llm=llm, movie_db=movie_db)


# Initialised once per Lambda container (outside the handler) to reuse across warm invocations.
_config = Config()
_service = _build_service(_config)


def handler(event: dict, context: object) -> dict:
    try:
        body = json.loads(event.get("body") or "{}")
        request = RecommendationRequest.model_validate(body)
    except Exception:
        return {
            "statusCode": 400,
            "headers": _CORS_HEADERS,
            "body": json.dumps({"error": "Invalid request body"}),
        }

    try:
        response = _service.get_recommendations(request, _config.recommendation_count)
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

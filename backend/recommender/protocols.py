from typing import Protocol

from models import Movie, RecommendationRequest


class LLMClient(Protocol):
    def get_movie_titles(self, request: RecommendationRequest, count: int) -> list[str]: ...


class MovieDatabaseClient(Protocol):
    def get_movie(self, title: str) -> Movie | None: ...

from concurrent.futures import ThreadPoolExecutor, as_completed

from models import Movie, RecommendationRequest, RecommendationsResponse
from protocols import LLMClient, MovieDatabaseClient


class RecommendationService:
    def __init__(self, llm: LLMClient, movie_db: MovieDatabaseClient) -> None:
        self._llm = llm
        self._movie_db = movie_db

    def get_recommendations(
        self, request: RecommendationRequest, count: int
    ) -> RecommendationsResponse:
        titles = self._llm.get_movie_titles(request, count)
        print(titles)
        movies = self._fetch_movies_concurrently(titles)
        return RecommendationsResponse(movies=movies)

    def _fetch_movies_concurrently(self, titles: list[str]) -> list[Movie]:
        movies: list[Movie] = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(self._movie_db.get_movie, title): title for title in titles}
            for future in as_completed(futures):
                result = future.result()
                if result is not None:
                    movies.append(result)
        return movies

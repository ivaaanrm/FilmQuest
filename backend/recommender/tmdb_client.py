import requests

from models import Movie

_TMDB_BASE_URL = "https://api.themoviedb.org/3"
_TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"


class TMDBClient:
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self._session = requests.Session()

    def get_movie(self, title: str) -> Movie | None:
        try:
            response = self._session.get(
                f"{_TMDB_BASE_URL}/search/movie",
                params={"query": title, "api_key": self._api_key},
                timeout=5,
            )
            response.raise_for_status()
            results = response.json().get("results", [])
            if not results:
                return None
            data = results[0]
            year: int | None = None
            if release_date := data.get("release_date"):
                year = int(release_date[:4])
            poster_path = data.get("poster_path")
            return Movie(
                title=data.get("title", title),
                year=year,
                overview=data.get("overview") or None,
                poster_url=f"{_TMDB_IMAGE_BASE_URL}{poster_path}" if poster_path else None,
                rating=data.get("vote_average") or None,
            )
        except Exception:
            return None

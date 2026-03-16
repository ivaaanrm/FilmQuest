import requests

from models import Movie

_TMDB_BASE_URL = "https://api.themoviedb.org/3"
_TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"


class TMDBClient:
    def __init__(self, api_key: str) -> None:
        self._session = requests.Session()
        # TMDB issues two credential types: a short API key (passed as a query
        # param) and a long JWT read-access token (passed as a Bearer header).
        # Support both so either value works in the config.
        if api_key.startswith("eyJ"):
            self._session.headers["Authorization"] = f"Bearer {api_key}"
            self._params: dict[str, str] = {}
        else:
            self._params = {"api_key": api_key}

    def get_movie(self, title: str) -> Movie | None:
        try:
            response = self._session.get(
                f"{_TMDB_BASE_URL}/search/movie",
                params={"query": title, **self._params},
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

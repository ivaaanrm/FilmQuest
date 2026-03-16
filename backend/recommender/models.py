from pydantic import BaseModel


class Answer(BaseModel):
    question: str
    answer: str


class RecommendationRequest(BaseModel):
    answers: list[Answer]


class MovieTitlesResponse(BaseModel):
    titles: list[str]


class Movie(BaseModel):
    title: str
    year: int | None = None
    overview: str | None = None
    poster_url: str | None = None
    rating: float | None = None


class RecommendationsResponse(BaseModel):
    movies: list[Movie]

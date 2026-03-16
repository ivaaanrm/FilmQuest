from pydantic import BaseModel


class Question(BaseModel):
    id: int
    text: str
    options: list[str]


class QuestionsResponse(BaseModel):
    questions: list[Question]

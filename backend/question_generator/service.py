from models import QuestionsResponse
from protocols import LLMClient


class QuestionService:
    def __init__(self, llm: LLMClient) -> None:
        self._llm = llm

    def get_questions(self, count: int) -> QuestionsResponse:
        return self._llm.generate_questions(count)

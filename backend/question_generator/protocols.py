from typing import Protocol

from models import QuestionsResponse


class LLMClient(Protocol):
    def generate_questions(self, count: int) -> QuestionsResponse: ...

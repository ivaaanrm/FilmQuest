from pathlib import Path

from openai import OpenAI

from models import QuestionsResponse

_PROMPTS_DIR = Path(__file__).parent / "prompts"
_SYSTEM_PROMPT = (_PROMPTS_DIR / "system.md").read_text(encoding="utf-8")
_USER_PROMPT_TEMPLATE = (_PROMPTS_DIR / "user.md").read_text(encoding="utf-8")


class OpenAILLMClient:
    def __init__(self, api_key: str, model: str) -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def generate_questions(self, count: int) -> QuestionsResponse:
        user_prompt = _USER_PROMPT_TEMPLATE.format(count=count)
        last_exc: Exception | None = None
        for _ in range(2):
            try:
                response = self._client.beta.chat.completions.parse(
                    model=self._model,
                    messages=[
                        {"role": "system", "content": _SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format=QuestionsResponse,
                )
                return response.choices[0].message.parsed
            except Exception as exc:
                last_exc = exc
        raise RuntimeError("LLM failed after 2 attempts") from last_exc

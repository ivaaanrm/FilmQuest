"""Lightweight FastAPI wrapper around the Lambda handlers for local development."""

import importlib.util
import json
import sys
from pathlib import Path
from types import ModuleType

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

_backend = Path(__file__).resolve().parent

# Bare module names shared by both Lambda packages (config, models, etc.).
# These must be evicted from sys.modules between handler loads so that each
# handler picks up its own version.
_SHARED_MODULE_NAMES = {"config", "models", "protocols", "service", "openai_client"}


def _load_handler(subdir: str) -> ModuleType:
    """Load a Lambda handler module with its directory isolated on sys.path."""
    pkg_dir = str(_backend / subdir)

    # Remove any cached bare modules from a previous handler load.
    for name in _SHARED_MODULE_NAMES:
        sys.modules.pop(name, None)

    sys.path.insert(0, pkg_dir)
    try:
        handler_path = _backend / subdir / "handler.py"
        spec = importlib.util.spec_from_file_location(
            f"_filmquest_{subdir}_handler", handler_path
        )
        mod = importlib.util.module_from_spec(spec)  # type: ignore[arg-type]
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        return mod
    finally:
        sys.path.remove(pkg_dir)


_qg_handler = _load_handler("question_generator")
_rec_handler = _load_handler("recommender")

app = FastAPI(title="FilmQuest Dev Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _lambda_to_response(result: dict) -> JSONResponse:
    return JSONResponse(
        status_code=result["statusCode"],
        content=json.loads(result["body"]),
    )


@app.get("/questions")
def get_questions() -> JSONResponse:
    result = _qg_handler.handler({}, None)
    return _lambda_to_response(result)


@app.post("/recommendations")
async def post_recommendations(request: Request) -> JSONResponse:
    body = await request.body()
    event = {"body": body.decode()}
    result = _rec_handler.handler(event, None)
    return _lambda_to_response(result)

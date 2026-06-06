from contextlib import asynccontextmanager
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.routes import analytics, chat, documents
from app.config import get_settings

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
load_dotenv()

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    settings.uploads_path.mkdir(parents=True, exist_ok=True)
    settings.chroma_path.mkdir(parents=True, exist_ok=True)
    if settings.google_api_key:
        genai.configure(api_key=settings.google_api_key)
    yield


app = FastAPI(
    title="AI Teaching Assistant API",
    description="Production RAG-powered educational assistant",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/health")
@limiter.limit(f"{settings.rate_limit_requests}/{settings.rate_limit_window_seconds}second")
async def health(request: Request):
    return {
        "status": "healthy",
        "gemini_configured": bool(settings.google_api_key),
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )

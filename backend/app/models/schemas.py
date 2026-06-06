from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=8000)
    session_id: str | None = None
    document_ids: list[str] | None = None


class ChatMessage(BaseModel):
    role: str
    content: str
    sources: list[dict[str, Any]] = []
    timestamp: str | None = None


class SessionResponse(BaseModel):
    id: str
    title: str
    messages: list[ChatMessage] = []
    created_at: str | None = None
    updated_at: str | None = None


class DocumentResponse(BaseModel):
    id: str
    filename: str
    chunk_count: int = 0
    embedding_status: str = "pending"
    created_at: str | None = None
    size_bytes: int | None = None


class AnalyticsResponse(BaseModel):
    total_documents: int
    total_chunks: int
    total_sessions: int
    total_messages: int

from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.deps import get_memory, get_rag
from app.models.schemas import ChatRequest, SessionResponse
from app.services.memory import ConversationMemory
from app.services.rag.pipeline import RAGPipeline
from app.utils.sanitize import sanitize_user_input

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions")
def create_session(memory: ConversationMemory = Depends(get_memory)) -> dict:
    session_id = memory.create_session()
    return {"session_id": session_id}


@router.get("/sessions")
def list_sessions(memory: ConversationMemory = Depends(get_memory)) -> list[dict]:
    return [
        {
            "id": s["id"],
            "title": s["title"],
            "updated_at": s.get("updated_at"),
            "message_count": len(s.get("messages", [])),
        }
        for s in memory.list_sessions()
    ]


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(session_id: str, memory: ConversationMemory = Depends(get_memory)) -> SessionResponse:
    session = memory.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(**session)


@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, memory: ConversationMemory = Depends(get_memory)) -> dict:
    if not memory.delete_session(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True}


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    rag: RAGPipeline = Depends(get_rag),
    memory: ConversationMemory = Depends(get_memory),
):
    message = sanitize_user_input(body.message)
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session_id = body.session_id
    if not session_id:
        session_id = memory.create_session()
    elif not memory.get_session(session_id):
        session_id = memory.create_session()

    memory.add_message(session_id, "user", message)
    history = memory.get_history(session_id)

    async def event_generator():
        full_response = ""
        sources: list = []
        yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"

        async for event in rag.answer_stream(
            message,
            history=history[:-1],
            document_ids=body.document_ids,
        ):
            if event["type"] == "sources":
                sources = event.get("sources", [])
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "token":
                full_response += event.get("content", "")
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "error":
                yield f"data: {json.dumps(event)}\n\n"
            elif event["type"] == "done":
                memory.add_message(session_id, "assistant", full_response, sources)
                yield f"data: {json.dumps({'type': 'done', 'session_id': session_id})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

from fastapi import APIRouter, Depends

from app.api.deps import get_chroma, get_memory
from app.models.schemas import AnalyticsResponse
from app.services.chroma_store import ChromaStore
from app.services.memory import ConversationMemory

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    chroma: ChromaStore = Depends(get_chroma),
    memory: ConversationMemory = Depends(get_memory),
) -> AnalyticsResponse:
    docs = chroma.list_documents()
    total_chunks = sum(d.get("chunk_count", 0) for d in docs)
    sessions = memory.list_sessions()
    total_messages = sum(len(s.get("messages", [])) for s in sessions)

    return AnalyticsResponse(
        total_documents=len(docs),
        total_chunks=total_chunks,
        total_sessions=len(sessions),
        total_messages=total_messages,
    )

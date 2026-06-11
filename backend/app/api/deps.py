from functools import lru_cache

from app.config import Settings, get_settings
from app.services.chroma_store import ChromaStore
from app.services.document_processor import DocumentProcessor
from app.services.embeddings import EmbeddingService
from app.services.memory import ConversationMemory
from app.services.rag.pipeline import RAGPipeline


@lru_cache
def get_chroma() -> ChromaStore:
    return ChromaStore(get_settings())


@lru_cache
def get_embeddings() -> EmbeddingService:
    return EmbeddingService(get_settings())


@lru_cache
def get_memory() -> ConversationMemory:
    return ConversationMemory()


@lru_cache
def get_rag() -> RAGPipeline:
    settings = get_settings()
    chroma = get_chroma()
    embeddings = get_embeddings()
    return RAGPipeline(settings, chroma, embeddings)


@lru_cache
def get_processor() -> DocumentProcessor:
    settings = get_settings()
    return DocumentProcessor(settings, get_chroma(), get_embeddings())

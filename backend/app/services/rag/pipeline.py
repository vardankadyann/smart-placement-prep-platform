from __future__ import annotations

from typing import Any, AsyncGenerator

import google.generativeai as genai
import os
api_key = os.getenv("GOOGLE_API_KEY")

from app.config import Settings
from app.services.chroma_store import ChromaStore
from app.services.embeddings import EmbeddingService
from app.services.rag.compressor import ContextCompressor
from app.services.rag.hybrid_search import HybridSearch
from app.services.rag.query_rewrite import QueryRewriter
from app.services.rag.reranker import Reranker

TEACHING_SYSTEM_PROMPT = """You are an expert AI Teaching Assistant. Your role is to help students learn from their uploaded course materials.

RULES:
1. Answer ONLY using the provided context from uploaded documents.
2. If the answer is not in the context, respond exactly: "I couldn't find this information in the uploaded material."
3. Never invent facts, citations, or page numbers.

TEACHING STYLE:
- Explain concepts simply, as if teaching a motivated student
- Use concrete examples and analogies when helpful
- Break complex topics into clear step-by-step explanations
- Offer brief summaries when appropriate
- If asked, create short quiz questions with answers based on the context

When citing sources, reference them as [Source N] matching the context labels."""


class RAGPipeline:
    def __init__(
        self,
        settings: Settings,
        chroma: ChromaStore,
        embeddings: EmbeddingService,
    ) -> None:
        self.settings = settings
        self.chroma = chroma
        self.embeddings = embeddings
        self.rewriter = QueryRewriter(settings)
        self.hybrid = HybridSearch(chroma, embeddings)
        self.reranker = Reranker(settings)
        self.compressor = ContextCompressor(settings)
        self.model = genai.GenerativeModel(
            settings.gemini_model,
            system_instruction=TEACHING_SYSTEM_PROMPT,
        )

    async def retrieve(
        self,
        query: str,
        history: list[dict[str, str]] | None = None,
        document_ids: list[str] | None = None,
    ) -> tuple[str, list[dict[str, Any]]]:
        rewritten = await self.rewriter.rewrite(query, history)
        query_embedding = self.embeddings.embed_query(rewritten)

        candidates = self.hybrid.search(
            query=rewritten,
            query_embedding=query_embedding,
            top_k=self.settings.top_k_retrieval,
            document_ids=document_ids,
        )

        reranked = await self.reranker.rerank(
            query=rewritten,
            candidates=candidates,
            top_k=self.settings.top_k_after_rerank,
        )

        context = await self.compressor.compress(rewritten, reranked)
        sources = self._build_sources(reranked)
        return context, sources

    async def answer_stream(
        self,
        query: str,
        history: list[dict[str, str]] | None = None,
        document_ids: list[str] | None = None,
    ) -> AsyncGenerator[dict[str, Any], None]:
        context, sources = await self.retrieve(query, history, document_ids)

        yield {"type": "sources", "sources": sources}

        if not context.strip():
            yield {
                "type": "token",
                "content": "I couldn't find this information in the uploaded material.",
            }
            yield {"type": "done"}
            return

        history_block = ""
        if history:
            history_block = "\n".join(
                f"{m['role'].upper()}: {m['content'][:500]}" for m in history[-6:]
            )

        prompt = f"""Context from uploaded materials:
{context}

Conversation history:
{history_block or 'None'}

Student question: {query}

Provide a helpful teaching response based ONLY on the context above."""

        try:
            response = await self.model.generate_content_async(
                prompt,
                stream=True,
            )
            async for chunk in response:
                if chunk.text:
                    yield {"type": "token", "content": chunk.text}
        except Exception as e:
            yield {"type": "error", "content": str(e)}

        yield {"type": "done"}

    @staticmethod
    def _build_sources(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
        sources: list[dict[str, Any]] = []
        seen: set[str] = set()
        for i, chunk in enumerate(chunks):
            meta = chunk.get("metadata", {})
            doc_id = meta.get("document_id", "")
            filename = meta.get("filename", "Document")
            key = f"{doc_id}_{chunk.get('id', i)}"
            if key in seen:
                continue
            seen.add(key)
            sources.append(
                {
                    "id": chunk.get("id", str(i)),
                    "document_id": doc_id,
                    "filename": filename,
                    "excerpt": chunk.get("text", "")[:300],
                    "chunk_index": meta.get("chunk_index", i),
                    "score": round(chunk.get("hybrid_score", chunk.get("vector_score", 0)), 3),
                }
            )
        return sources

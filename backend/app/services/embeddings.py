from __future__ import annotations

import google.generativeai as genai

from app.config import Settings


class EmbeddingService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        print("API KEY START:", settings.google_api_key[:10])
        genai.configure(api_key=settings.google_api_key)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        embeddings: list[list[float]] = []
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            for text in batch:
                result = genai.embed_content(
                    model=self.settings.embedding_model,
                    content=text,
                    task_type="retrieval_document",
                )
                emb = self._extract_embedding(result)
                embeddings.append(emb)
        return embeddings

    def embed_query(self, query: str) -> list[float]:
        result = genai.embed_content(
            model=self.settings.embedding_model,
            content=query,
            task_type="retrieval_query",
        )
        return self._extract_embedding(result)

    @staticmethod
    def _extract_embedding(result: object) -> list[float]:
        if isinstance(result, dict):
            emb = result.get("embedding")
            if emb is not None:
                return list(emb)
        if hasattr(result, "embedding"):
            return list(result.embedding)
        return []

from __future__ import annotations

from typing import Any

from app.services.chroma_store import ChromaStore
from app.services.embeddings import EmbeddingService


class HybridSearch:
    def __init__(self, chroma: ChromaStore, embeddings: EmbeddingService) -> None:
        self.chroma = chroma
        self.embeddings = embeddings

    def search(
        self,
        query: str,
        query_embedding: list[float],
        top_k: int = 12,
        document_ids: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        vector_results = self.chroma.vector_search(
            query_embedding=query_embedding,
            n_results=top_k,
            document_ids=document_ids,
        )

        all_records = self.chroma.get_all_chunk_records()
        if document_ids:
            all_records = [
                r for r in all_records if r.get("metadata", {}).get("document_id") in document_ids
            ]

        keyword_results = self.chroma.keyword_search_candidates(
            [{"text": r["text"], "metadata": r["metadata"], "id": r["id"]} for r in all_records],
            query,
            top_k=top_k,
        )

        merged: dict[str, dict[str, Any]] = {}

        for rank, item in enumerate(vector_results):
            cid = item["id"]
            merged[cid] = {
                **item,
                "vector_rank": rank,
                "vector_score": item.get("vector_score", 0.0),
                "bm25_score": 0.0,
            }

        for rank, item in enumerate(keyword_results):
            cid = item["id"]
            if cid in merged:
                merged[cid]["bm25_score"] = item.get("bm25_score", 0.0)
                merged[cid]["bm25_rank"] = rank
            else:
                merged[cid] = {
                    "id": cid,
                    "text": item["text"],
                    "metadata": item.get("metadata", {}),
                    "vector_score": 0.0,
                    "bm25_score": item.get("bm25_score", 0.0),
                    "bm25_rank": rank,
                }

        max_vector = max((m["vector_score"] for m in merged.values()), default=1.0) or 1.0
        max_bm25 = max((m["bm25_score"] for m in merged.values()), default=1.0) or 1.0

        for item in merged.values():
            norm_v = item["vector_score"] / max_vector
            norm_b = item["bm25_score"] / max_bm25
            item["hybrid_score"] = 0.65 * norm_v + 0.35 * norm_b

        return sorted(merged.values(), key=lambda x: x["hybrid_score"], reverse=True)[:top_k]

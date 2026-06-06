from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from app.config import Settings


class ChromaStore:
    """Persistent vector store (numpy-based, ChromaDB-compatible API)."""

    def __init__(self, settings: Settings) -> None:
        self.data_dir = settings.chroma_path
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.meta_path = self.data_dir / "metadata.json"
        self.emb_path = self.data_dir / "embeddings.npy"
        self._records: list[dict[str, Any]] = []
        self._embeddings: np.ndarray | None = None
        self._load()

    def _load(self) -> None:
        if self.meta_path.exists():
            self._records = json.loads(self.meta_path.read_text(encoding="utf-8"))
        else:
            self._records = []
        if self.emb_path.exists() and self._records:
            self._embeddings = np.load(self.emb_path)
        else:
            self._embeddings = (
                np.zeros((0, 768), dtype=np.float32) if not self._records else None
            )

    def _save(self) -> None:
        self.meta_path.write_text(
            json.dumps(self._records, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        if self._embeddings is not None and len(self._embeddings):
            np.save(self.emb_path, self._embeddings)

    def add_chunks(
        self,
        document_id: str,
        filename: str,
        chunks: list[str],
        embeddings: list[list[float]],
    ) -> int:
        if not chunks:
            return 0

        new_embs = np.array(embeddings, dtype=np.float32)
        if self._embeddings is None or len(self._embeddings) == 0:
            self._embeddings = new_embs
        else:
            self._embeddings = np.vstack([self._embeddings, new_embs])

        created = datetime.now(timezone.utc).isoformat()
        base_index = len(self._records)
        for i, text in enumerate(chunks):
            self._records.append(
                {
                    "id": f"{document_id}_{base_index + i}",
                    "text": text,
                    "metadata": {
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": i,
                        "created_at": created,
                    },
                }
            )

        self._save()
        return len(chunks)

    def delete_document(self, document_id: str) -> int:
        indices = [
            i
            for i, r in enumerate(self._records)
            if r.get("metadata", {}).get("document_id") == document_id
        ]
        if not indices:
            return 0

        keep = [i for i in range(len(self._records)) if i not in set(indices)]
        self._records = [self._records[i] for i in keep]
        if self._embeddings is not None and len(self._embeddings):
            self._embeddings = self._embeddings[keep] if keep else np.zeros((0, self._embeddings.shape[1]))
        else:
            self._embeddings = np.zeros((0, 768), dtype=np.float32)

        self._save()
        return len(indices)

    def vector_search(
        self,
        query_embedding: list[float],
        n_results: int = 12,
        document_ids: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        if not self._records or self._embeddings is None or len(self._embeddings) == 0:
            return []

        q = np.array(query_embedding, dtype=np.float32)
        q_norm = np.linalg.norm(q) or 1.0
        embs = self._embeddings
        norms = np.linalg.norm(embs, axis=1)
        norms[norms == 0] = 1.0
        scores = embs @ q / (norms * q_norm)

        candidates: list[tuple[int, float]] = []
        for i, score in enumerate(scores):
            meta = self._records[i].get("metadata", {})
            if document_ids and meta.get("document_id") not in document_ids:
                continue
            candidates.append((i, float(score)))

        candidates.sort(key=lambda x: x[1], reverse=True)
        results: list[dict[str, Any]] = []
        for idx, score in candidates[:n_results]:
            rec = self._records[idx]
            results.append(
                {
                    "id": rec["id"],
                    "text": rec["text"],
                    "metadata": rec["metadata"],
                    "vector_score": score,
                }
            )
        return results

    def keyword_search_candidates(
        self,
        all_docs: list[dict[str, Any]],
        query: str,
        top_k: int = 12,
    ) -> list[dict[str, Any]]:
        from rank_bm25 import BM25Okapi

        if not all_docs:
            return []
        tokenized_corpus = [d["text"].lower().split() for d in all_docs]
        bm25 = BM25Okapi(tokenized_corpus)
        scores = bm25.get_scores(query.lower().split())
        ranked = sorted(
            zip(all_docs, scores),
            key=lambda x: x[1],
            reverse=True,
        )[:top_k]
        return [{**doc, "bm25_score": float(score)} for doc, score in ranked if score > 0]

    def get_all_chunk_records(self) -> list[dict[str, Any]]:
        return [
            {
                "id": r["id"],
                "text": r["text"],
                "metadata": r.get("metadata", {}),
            }
            for r in self._records
        ]

    def list_documents(self) -> list[dict[str, Any]]:
        docs: dict[str, dict[str, Any]] = {}
        for rec in self._records:
            meta = rec.get("metadata", {})
            doc_id = meta.get("document_id", "")
            if not doc_id:
                continue
            if doc_id not in docs:
                docs[doc_id] = {
                    "id": doc_id,
                    "filename": meta.get("filename", "unknown"),
                    "chunk_count": 0,
                    "embedding_status": "completed",
                    "created_at": meta.get("created_at"),
                }
            docs[doc_id]["chunk_count"] += 1
        return sorted(docs.values(), key=lambda x: x.get("created_at") or "", reverse=True)

    def get_document_chunk_count(self, document_id: str) -> int:
        return sum(
            1
            for r in self._records
            if r.get("metadata", {}).get("document_id") == document_id
        )

    @staticmethod
    def new_document_id() -> str:
        return str(uuid.uuid4())

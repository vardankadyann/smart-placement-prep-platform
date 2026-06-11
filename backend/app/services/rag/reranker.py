from __future__ import annotations

from typing import Any

import google.generativeai as genai
import os
api_key = os.getenv("GOOGLE_API_KEY")

from app.config import Settings


class Reranker:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.model = genai.GenerativeModel(settings.gemini_model)

    async def rerank(
        self,
        query: str,
        candidates: list[dict[str, Any]],
        top_k: int = 6,
    ) -> list[dict[str, Any]]:
        if not candidates:
            return []
        if len(candidates) <= top_k:
            return candidates

        snippets = "\n\n".join(
            f"[{i}] {c['text'][:400]}"
            for i, c in enumerate(candidates[:12])
        )

        prompt = f"""Rate relevance of each passage to the query. Return ONLY comma-separated indices from most to least relevant (e.g. 2,0,5,1).

Query: {query}

Passages:
{snippets}

Ranked indices:"""

        try:
            response = await self.model.generate_content_async(prompt)
            text = (response.text or "").strip()
            indices: list[int] = []
            for part in text.replace("\n", ",").split(","):
                part = part.strip().strip("[]")
                if part.isdigit():
                    idx = int(part)
                    if 0 <= idx < len(candidates) and idx not in indices:
                        indices.append(idx)
            if indices:
                reranked = [candidates[i] for i in indices]
                seen = set(indices)
                reranked.extend(c for i, c in enumerate(candidates) if i not in seen)
                return reranked[:top_k]
        except Exception:
            pass

        return sorted(candidates, key=lambda x: x.get("hybrid_score", 0), reverse=True)[:top_k]

from __future__ import annotations

from typing import Any

import google.generativeai as genai
import os
api_key = os.getenv("GOOGLE_API_KEY")

from app.config import Settings


class ContextCompressor:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.model = genai.GenerativeModel(settings.gemini_model)

    async def compress(self, query: str, chunks: list[dict[str, Any]]) -> str:
        if not chunks:
            return ""

        combined = "\n\n---\n\n".join(
            f"[Source {i + 1}: {c.get('metadata', {}).get('filename', 'doc')}]\n{c['text']}"
            for i, c in enumerate(chunks)
        )

        if len(combined) < 4000:
            return combined

        prompt = f"""Extract only the sentences from the passages that help answer the query.
Preserve source markers. Be concise.

Query: {query}

Passages:
{combined[:12000]}

Compressed context:"""

        try:
            response = await self.model.generate_content_async(prompt)
            return (response.text or combined)[:8000]
        except Exception:
            return combined[:8000]

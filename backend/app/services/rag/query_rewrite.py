from __future__ import annotations

import google.generativeai as genai
import os
api_key = os.getenv("GOOGLE_API_KEY")

from app.config import Settings


class QueryRewriter:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.model = genai.GenerativeModel(settings.gemini_model)

    async def rewrite(self, query: str, history: list[dict[str, str]] | None = None) -> str:
        history_text = ""
        if history:
            recent = history[-4:]
            history_text = "\n".join(f"{m['role']}: {m['content'][:200]}" for m in recent)

        prompt = f"""Rewrite the user's question into a standalone search query for document retrieval.
Keep it concise and focused on key concepts. Output ONLY the rewritten query.

Conversation:
{history_text or 'None'}

User question: {query}

Rewritten query:"""

        try:
            response = await self.model.generate_content_async(prompt)
            rewritten = (response.text or query).strip().strip('"')
            return rewritten if rewritten else query
        except Exception:
            return query

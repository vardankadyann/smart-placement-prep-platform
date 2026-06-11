from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any


class ConversationMemory:
    """In-memory conversation store. Replace with Redis/DB for production scale."""

    def __init__(self) -> None:
        self._sessions: dict[str, dict[str, Any]] = {}

    def create_session(self, title: str | None = None) -> str:
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = {
            "id": session_id,
            "title": title or "New Chat",
            "messages": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        return session_id

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        return self._sessions.get(session_id)

    def list_sessions(self) -> list[dict[str, Any]]:
        sessions = list(self._sessions.values())
        return sorted(sessions, key=lambda s: s.get("updated_at", ""), reverse=True)

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        sources: list[dict[str, Any]] | None = None,
    ) -> None:
        session = self._sessions.get(session_id)
        if not session:
            return
        session["messages"].append(
            {
                "role": role,
                "content": content,
                "sources": sources or [],
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )
        session["updated_at"] = datetime.now(timezone.utc).isoformat()
        if role == "user" and session["title"] == "New Chat":
            session["title"] = content[:50] + ("..." if len(content) > 50 else "")

    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False

    def get_history(self, session_id: str) -> list[dict[str, str]]:
        session = self._sessions.get(session_id)
        if not session:
            return []
        return [{"role": m["role"], "content": m["content"]} for m in session["messages"]]

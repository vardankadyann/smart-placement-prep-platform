from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from app.config import Settings
from app.services.chroma_store import ChromaStore
from app.services.embeddings import EmbeddingService
from app.utils.chunking import recursive_chunk_text
from app.utils.pdf import extract_text_from_pdf

ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME = {"application/pdf"}


class DocumentProcessor:
    def __init__(
        self,
        settings: Settings,
        chroma: ChromaStore,
        embeddings: EmbeddingService,
    ) -> None:
        self.settings = settings
        self.chroma = chroma
        self.embeddings = embeddings
        settings.uploads_path.mkdir(parents=True, exist_ok=True)

    def validate_file(self, filename: str, content_type: str | None, size: int) -> None:
        ext = Path(filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError("Only PDF files are allowed.")
        if content_type and content_type not in ALLOWED_MIME:
            raise ValueError("Invalid file type. Only PDF is supported.")
        if size > self.settings.max_upload_bytes:
            raise ValueError(f"File exceeds {self.settings.max_upload_size_mb}MB limit.")

    async def process_pdf(self, file_path: Path, original_filename: str) -> dict[str, Any]:
        document_id = self.chroma.new_document_id()
        text = extract_text_from_pdf(file_path)
        if not text.strip():
            raise ValueError("Could not extract text from PDF. The file may be scanned or empty.")

        chunks = recursive_chunk_text(
            text,
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap,
        )
        if not chunks:
            raise ValueError("No content chunks generated from PDF.")

        embeddings = self.embeddings.embed_texts(chunks)
        if len(embeddings) != len(chunks):
            raise ValueError("Embedding generation failed.")

        chunk_count = self.chroma.add_chunks(
            document_id=document_id,
            filename=original_filename,
            chunks=chunks,
            embeddings=embeddings,
        )

        dest = self.settings.uploads_path / f"{document_id}.pdf"
        shutil.copy(file_path, dest)

        return {
            "id": document_id,
            "filename": original_filename,
            "chunk_count": chunk_count,
            "embedding_status": "completed",
            "size_bytes": file_path.stat().st_size,
        }

    def delete_document(self, document_id: str) -> dict[str, Any]:
        deleted_chunks = self.chroma.delete_document(document_id)
        pdf_path = self.settings.uploads_path / f"{document_id}.pdf"
        if pdf_path.exists():
            pdf_path.unlink()
        return {"id": document_id, "deleted_chunks": deleted_chunks}

    def search_documents(self, query: str) -> list[dict[str, Any]]:
        docs = self.chroma.list_documents()
        q = query.lower()
        return [d for d in docs if q in d.get("filename", "").lower()]

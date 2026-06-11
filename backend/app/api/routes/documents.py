from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile

from app.api.deps import get_chroma, get_processor
from app.models.schemas import DocumentResponse
from app.services.chroma_store import ChromaStore
from app.services.document_processor import DocumentProcessor

router = APIRouter(prefix="/documents", tags=["documents"])


@router.get("", response_model=list[DocumentResponse])
def list_documents(chroma: ChromaStore = Depends(get_chroma)) -> list[DocumentResponse]:
    docs = chroma.list_documents()
    return [DocumentResponse(**d) for d in docs]


@router.get("/search")
def search_documents(
    q: str = Query(..., min_length=1, max_length=200),
    processor: DocumentProcessor = Depends(get_processor),
) -> list[dict]:
    return processor.search_documents(q)


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    processor: DocumentProcessor = Depends(get_processor),
) -> DocumentResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    content = await file.read()
    try:
        processor.validate_file(file.filename, file.content_type, len(content))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = Path(tmp.name)

    try:
        result = await processor.process_pdf(tmp_path, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}") from e
    finally:
        if tmp_path.exists():
            tmp_path.unlink()

    return DocumentResponse(**result)


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    processor: DocumentProcessor = Depends(get_processor),
) -> dict:
    result = processor.delete_document(document_id)
    if result["deleted_chunks"] == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return result

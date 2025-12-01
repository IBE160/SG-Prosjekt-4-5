import os
from typing import List

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import pdfplumber

from backend.database import get_db
from backend.models.document import Document
from backend.schemas.document import Document as DocumentSchema, DocumentCreate
from backend.core.dependencies import get_current_user
from backend.models.user import User

router = APIRouter()

UPLOAD_DIR = "./backend/uploads"

@router.post("/upload", response_model=DocumentSchema)
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    text_content = ""
    with pdfplumber.open(file_location) as pdf:
        for page in pdf.pages:
            text_content += page.extract_text() if page.extract_text() else ""

    db_document = Document(
        title=file.filename,
        file_path=file_location,
        owner_id=current_user.id,
        content=text_content
    )
    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)

    return db_document

@router.get("/documents", response_model=List[DocumentSchema])
async def get_user_documents(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.owner_id == current_user.id))
    documents = result.scalars().all()
    return documents

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == document_id, Document.owner_id == current_user.id))
    document = result.scalars().first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == document_id, Document.owner_id == current_user.id))
    document = result.scalars().first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    os.remove(document.file_path)  # Delete the file from the filesystem

    await db.delete(document)
    await db.commit()

    return {"ok": True}
from typing import List
import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.database import get_db
from backend.models.document import Document
from backend.models.summary import Summary
from backend.models.flashcard import Flashcard
from backend.schemas.summary import Summary as SummarySchema, SummaryCreate
from backend.schemas.flashcard import Flashcard as FlashcardSchema, FlashcardCreate
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.core.ai import process_document_for_summary, process_document_for_flashcards

router = APIRouter()

@router.post("/summarize/{document_id}", response_model=SummarySchema)
async def generate_summary(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == document_id, Document.owner_id == current_user.id))
    document = result.scalars().first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        summary_text = await process_document_for_summary(document.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {e}")

    db_summary = Summary(
        document_id=document_id,
        summary_text=summary_text
    )
    db.add(db_summary)
    await db.commit()
    await db.refresh(db_summary)

    return db_summary

@router.post("/generate-flashcards/{document_id}", response_model=List[FlashcardSchema])
async def generate_flashcards(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == document_id, Document.owner_id == current_user.id))
    document = result.scalars().first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        generated_flashcards_data = await process_document_for_flashcards(document.content)
        generated_flashcards = [
            Flashcard(document_id=document_id, question=fc["question"], answer=fc["answer"])
            for fc in generated_flashcards_data
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate flashcards: {e}")

    db.add_all(generated_flashcards)
    await db.commit()
    for fc in generated_flashcards:
        await db.refresh(fc)

    return generated_flashcards

@router.get("/summaries/{document_id}", response_model=List[SummarySchema])
async def get_summaries_for_document(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Summary)
        .join(Document)
        .filter(Summary.document_id == document_id, Document.owner_id == current_user.id)
    )
    summaries = result.scalars().all()
    return summaries

@router.get("/flashcards/{document_id}", response_model=List[FlashcardSchema])
async def get_flashcards_for_document(document_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Flashcard)
        .join(Document)
        .filter(Flashcard.document_id == document_id, Document.owner_id == current_user.id)
    )
    flashcards = result.scalars().all()
    return flashcards
from datetime import datetime
from pydantic import BaseModel

class FlashcardBase(BaseModel):
    question: str
    answer: str

class FlashcardCreate(FlashcardBase):
    document_id: int

class Flashcard(FlashcardBase):
    id: int
    document_id: int
    created_at: datetime

    class Config:
        orm_mode = True
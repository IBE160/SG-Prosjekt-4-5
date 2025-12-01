from datetime import datetime
from pydantic import BaseModel

class SummaryBase(BaseModel):
    summary_text: str

class SummaryCreate(SummaryBase):
    document_id: int

class Summary(SummaryBase):
    id: int
    document_id: int
    created_at: datetime

    class Config:
        orm_mode = True
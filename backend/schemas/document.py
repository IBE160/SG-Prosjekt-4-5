from datetime import datetime
from pydantic import BaseModel

class DocumentBase(BaseModel):
    title: str

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    file_path: str
    owner_id: int
    created_at: datetime
    content: str

    class Config:
        orm_mode = True
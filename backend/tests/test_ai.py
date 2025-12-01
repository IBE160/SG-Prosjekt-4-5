import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.document import Document
from backend.models.user import User
from backend.core.security import create_access_token
from datetime import timedelta
from backend.core.settings import settings
from unittest.mock import patch

@pytest.fixture
async def authenticated_client(client: AsyncClient, test_user: User):
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": test_user.email}, expires_delta=access_token_expires
    )
    client.headers = {
        "Authorization": f"Bearer {access_token}"
    }
    return client

@pytest.fixture
async def test_user(db: AsyncSession):
    user = User(email="test_ai_user@example.com", hashed_password="hashedpassword")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@pytest.fixture
async def test_document_with_content(db: AsyncSession, test_user: User):
    document = Document(
        title="AI Test Document",
        file_path="/tmp/ai_test_doc.pdf",
        owner_id=test_user.id,
        content="This is a test document for AI summarization and flashcard generation. It contains information about various topics. We will summarize this content and create flashcards from it."
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document

@patch("backend.core.ai.summarize_text_with_gemini")
async def test_generate_summary(mock_summarize_text_with_gemini, authenticated_client: AsyncClient, test_document_with_content: Document):
    mock_summarize_text_with_gemini.return_value = "This is a generated summary."
    response = await authenticated_client.post(f"/ai/summarize/{test_document_with_content.id}")
    assert response.status_code == 200
    assert response.json()["summary_text"] == "This is a generated summary."
    assert response.json()["document_id"] == test_document_with_content.id

@patch("backend.core.ai.generate_flashcards_with_gemini")
async def test_generate_flashcards(mock_generate_flashcards_with_gemini, authenticated_client: AsyncClient, test_document_with_content: Document):
    mock_generate_flashcards_with_gemini.return_value = [
        {"question": "What is this?", "answer": "A test document."},
        {"question": "What does it contain?", "answer": "Information about various topics."}
    ]
    response = await authenticated_client.post(f"/ai/generate-flashcards/{test_document_with_content.id}")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["question"] == "What is this?"
    assert response.json()[1]["answer"] == "Information about various topics."

async def test_get_summaries_for_document(authenticated_client: AsyncClient, test_document_with_content: Document):
    # First, generate a summary
    await authenticated_client.post(f"/ai/summarize/{test_document_with_content.id}")
    
    response = await authenticated_client.get(f"/ai/summaries/{test_document_with_content.id}")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert "summary_text" in response.json()[0]

async def test_get_flashcards_for_document(authenticated_client: AsyncClient, test_document_with_content: Document):
    # First, generate flashcards
    await authenticated_client.post(f"/ai/generate-flashcards/{test_document_with_content.id}")

    response = await authenticated_client.get(f"/ai/flashcards/{test_document_with_content.id}")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert "question" in response.json()[0]
    assert "answer" in response.json()[0]

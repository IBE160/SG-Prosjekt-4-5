import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.document import Document
from backend.models.user import User
from backend.core.security import create_access_token
from datetime import timedelta
from backend.core.settings import settings

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
    user = User(email="test_doc_user@example.com", hashed_password="hashedpassword")
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@pytest.fixture
async def test_document(db: AsyncSession, test_user: User):
    document = Document(
        title="Test Document",
        file_path="/tmp/test_doc.pdf",
        owner_id=test_user.id,
        content="This is the content of the test document."
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document

async def test_upload_pdf(authenticated_client: AsyncClient):
    # Create a dummy PDF file for testing
    with open("test.pdf", "wb") as f:
        f.write(b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000059 00000 n\n0000000111 00000 n\ntrailer<</Size 4/Root 1 0 R>>startxref\n156\n%%EOF")

    with open("test.pdf", "rb") as f:
        response = await authenticated_client.post(
            "/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")}
        )
    assert response.status_code == 200
    assert response.json()["title"] == "test.pdf"
    assert "file_path" in response.json()
    assert "content" in response.json()

async def test_get_user_documents(authenticated_client: AsyncClient, test_document: Document):
    response = await authenticated_client.get("/documents")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["title"] == test_document.title

async def test_delete_document(authenticated_client: AsyncClient, test_document: Document):
    response = await authenticated_client.delete(f"/documents/document/{test_document.id}")
    assert response.status_code == 204

    # Verify it's actually deleted
    response = await authenticated_client.get("/documents")
    assert response.status_code == 200
    assert len(response.json()) == 0

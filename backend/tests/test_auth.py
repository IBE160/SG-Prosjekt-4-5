import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

async def test_create_user(client: AsyncClient):
    response = await client.post(
        "/auth/signup",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

async def test_login_for_access_token(client: AsyncClient):
    # First, create a user
    await client.post(
        "/auth/signup",
        json={"email": "login@example.com", "password": "password123"},
    )

    response = await client.post(
        "/auth/login",
        data={"username": "login@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

async def test_login_incorrect_password(client: AsyncClient):
    # First, create a user
    await client.post(
        "/auth/signup",
        json={"email": "wrongpass@example.com", "password": "password123"},
    )

    response = await client.post(
        "/auth/login",
        data={"username": "wrongpass@example.com", "password": "wrongpassword"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

async def test_login_nonexistent_user(client: AsyncClient):
    response = await client.post(
        "/auth/login",
        data={"username": "nonexistent@example.com", "password": "password123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
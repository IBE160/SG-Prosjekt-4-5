# AI Study Buddy

This repository contains the source code for the AI Study Buddy project, a web application designed to help students automate the process of summarizing lecture notes and creating flashcards using AI.

## 🚀 Project Overview

AI Study Buddy allows users to upload PDF documents, which are then processed by a backend service to generate concise summaries and a set of flashcards. This helps students save time and focus on understanding the course material.

The project is built with a modern web stack, utilizing a FastAPI backend for the API and a React frontend for the user interface. It integrates with the Gemini CLI for AI-powered text generation and uses a PostgreSQL database for data storage.

## ✨ Features

-   **User Authentication:** Secure user registration and login using JWT.
-   **PDF Upload:** Upload PDF documents for processing.
-   **AI Summarization:** Generate summaries of uploaded documents using the Gemini CLI.
-   **Flashcard Generation:** Automatically create flashcards from the document content.
-   **Dashboard:** View and manage your uploaded documents.
-   **Study View:** Display and study the generated summaries and flashcards.

## 🛠️ Technologies Used

-   **Frontend:**
    -   React
    -   Vite
    -   Tailwind CSS
-   **Backend:**
    -   FastAPI
    -   Python 3.11
    -   SQLAlchemy
    -   `pdfplumber` for PDF processing
    -   Gemini CLI for AI integration
-   **Database:**
    -   PostgreSQL
-   **Containerization:**
    -   Docker (for PostgreSQL)

## ⚙️ Getting Started

### Prerequisites

-   Python 3.11 or later
-   Node.js and npm
-   Docker
-   Gemini CLI configured in your system's PATH

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SG-Prosjekt-4-5
```

### 2. Set up the Database

The project uses a PostgreSQL database, which can be easily started using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the required database and credentials.

### 3. Set up the Backend

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install the required Python packages:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Start the backend server:**

    ```bash
    uvicorn main:app --reload --port 8000
    ```

The backend API will be available at `http://localhost:8000`.

### 4. Set up the Frontend

1.  **Navigate to the frontend directory:**

    ```bash
    cd ../frontend
    ```

2.  **Install the required npm packages:**

    ```bash
    npm install
    ```

3.  **Start the frontend development server:**

    ```bash
    npm run dev
    ```

The frontend application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🔌 API Endpoints

The backend API provides the following endpoints:

| Method | Endpoint                 | Description                               |
| :----- | :----------------------- | :---------------------------------------- |
| POST   | `/auth/signup`           | Register a new user.                      |
| POST   | `/auth/login`            | Authenticate a user and return a JWT.     |
| POST   | `/documents/upload`      | Upload a PDF document.                    |
| GET    | `/documents`             | Get a list of the user's documents.       |
| DELETE | `/documents/document/{id}` | Delete a document.                        |
| POST   | `/ai/summarize/{id}`     | Generate a summary for a document.        |
| POST   | `/ai/generate-flashcards/{id}` | Generate flashcards for a document.   |
| GET    | `/ai/summaries/{id}`     | Get the summaries for a document.         |
| GET    | `/ai/flashcards/{id}`    | Get the flashcards for a document.        |
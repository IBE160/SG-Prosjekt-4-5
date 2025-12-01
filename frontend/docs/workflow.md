# Frontend Workflow

This document outlines the primary user workflows for the Study Buddy frontend application.

## 1. User Authentication

The authentication flow handles user registration, login, and logout, providing access to the application's features.

- **Registration:**
  1. A new user navigates to the `/register` page.
  2. The user fills out the registration form with their details (e.g., username, email, password).
  3. The frontend validates the form inputs and sends a request to the backend's `/api/auth/register` endpoint.
  4. Upon successful registration, the user is typically redirected to the login page to sign in.

- **Login:**
  1. An existing user navigates to the `/login` page.
  2. The user enters their credentials (email and password).
  3. The frontend sends these credentials to the backend's `/api/auth/token` endpoint.
  4. On successful authentication, the backend returns a JWT (JSON Web Token).
  5. The frontend securely stores this token (e.g., in `localStorage` or an HttpOnly cookie) and redirects the user to their main dashboard.

- **Logout:**
  1. A logged-in user clicks the "Logout" button, typically located in the navigation bar.
  2. The frontend removes the stored JWT token from the client.
  3. The user's session is terminated, and they are redirected to the login or home page.

## 2. Document Management & Interaction

This workflow covers how users upload, view, and interact with their study documents.

- **Document Upload:**
  1. From the main dashboard, the user selects an option to upload a new document.
  2. The user chooses a file (e.g., PDF, DOCX, TXT) from their local machine via a file input dialog.
  3. The frontend sends the selected file to the backend's `/api/documents/upload` endpoint, often with a progress indicator.
  4. After a successful upload, the dashboard's document list is updated to include the new document.

- **Document Viewing and Analysis:**
  1. The user clicks on a document from their list on the dashboard.
  2. The application navigates to a dedicated document view page (e.g., `/documents/{document_id}`).
  3. The frontend fetches the document's content and metadata from the backend.
  4. From this view, the user can initiate AI-powered actions:
     - **Generate Summary:** The user clicks a "Summarize" button, which sends a request to the `/api/ai/summarize` endpoint with the document ID. The frontend then displays the returned summary text in a modal or a dedicated section.
     - **Generate Flashcards:** The user clicks a "Create Flashcards" button, triggering a request to `/api/ai/generate-flashcards`. The frontend then navigates to a flashcard interface to display the newly created flashcards.

## 3. Study Session

This workflow describes how users engage with the study materials generated from their documents.

- **Flashcard Study:**
  1. After generating flashcards or selecting an existing flashcard deck, the user enters the study interface.
  2. The frontend displays one flashcard at a time, showing the "front" side (question or term).
  3. The user can click or tap the card to "flip" it, revealing the "back" side (answer or definition).
  4. The user can navigate through the deck of flashcards using "Next" and "Previous" buttons.
  5. (Optional) The interface may include features for self-assessment (e.g., "I knew this," "I didn't know this") to track progress.

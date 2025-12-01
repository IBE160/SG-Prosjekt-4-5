const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiService = {
  async request(endpoint, method = 'GET', data = null, authRequired = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (authRequired) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Handle case where token is required but not found
        throw new Error('Authentication token not found.');
      }
    }

    const config = {
      method,
      headers,
      body: data ? JSON.stringify(data) : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const responseData = await response.json();

      if (!response.ok) {
        // If response is not OK, throw an error with the response data
        throw new Error(responseData.detail || 'Something went wrong with the API request.');
      }

      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error; // Re-throw to be handled by the calling component
    }
  },

  // Authentication Endpoints
  async login(email, password) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const config = {
      method: 'POST',
      headers,
      body: formData.toString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, config);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Something went wrong with the login request.');
      }

      // Assuming the token is in responseData.access_token
      if (responseData.access_token) {
        localStorage.setItem('token', responseData.access_token);
      }

      return responseData;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  async signup(email, password) {
    // Assuming the backend /signup endpoint expects email and password directly
    return this.request('/auth/signup', 'POST', { email, password });
  },

  // Document Endpoints
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    // For file uploads, Content-Type should not be set manually,
    // as fetch will set it correctly with the boundary for FormData
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('Authentication token not found.');
    }

    const config = {
      method: 'POST',
      headers,
      body: formData,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, config);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Document upload failed.');
      }
      return responseData;
    } catch (error) {
      console.error('Document Upload Error:', error);
      throw error;
    }
  },

  async getDocuments() {
    return this.request('/documents/', 'GET', null, true);
  },

  async getDocument(documentId) {
    return this.request(`/documents/${documentId}`, 'GET', null, true);
  },

  async deleteDocument(documentId) {
    return this.request(`/documents/${documentId}`, 'DELETE', null, true);
  },

  // AI Endpoints
  async summarizeDocument(documentId) {
    return this.request(`/ai/summarize/${documentId}`, 'POST', null, true);
  },

  async generateFlashcards(documentId) {
    return this.request(`/ai/generate-flashcards/${documentId}`, 'POST', null, true);
  },
};

export default apiService;
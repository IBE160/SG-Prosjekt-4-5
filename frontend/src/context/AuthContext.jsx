import React, { createContext, useState, useContext, useEffect } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // In a real app, you'd want to validate this token with the backend
      // For now, we'll assume if a token exists, the user is "logged in"
      // A more robust solution would decode the token or make a /me request
      setUser({ email: 'user@example.com' }); // Placeholder user info
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      const newToken = response.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser({ email }); // Set user info, ideally from token decoding or /me endpoint
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    setLoading(true);
    try {
      await apiService.signup(email, password);
      // After successful signup, automatically log them in or redirect to login
      await login(email, password); // Auto-login after signup
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

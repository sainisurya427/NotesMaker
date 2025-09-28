import axios from 'axios';
import type { AuthResponse, User, Note } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  googleAuth: async (token: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const notesAPI = {
  getNotes: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },

  createNote: async (noteData: { title: string; content: string }): Promise<Note> => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  updateNote: async (id: string, noteData: { title: string; content: string }): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  deleteNote: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};
// src/lib/apiClient.ts
import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:5001/api' : '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
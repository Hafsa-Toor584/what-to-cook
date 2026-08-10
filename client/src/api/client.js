import axios from 'axios';

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
  // Long enough to survive a free-tier API cold start
  timeout: 45000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wtc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

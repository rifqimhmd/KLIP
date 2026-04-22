import axios from 'axios';

// The backend API root. Set VITE_API_URL in your .env (e.g. http://localhost:8000 or http://localhost:8000/api)
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const normalizedBaseURL = rawBaseURL.replace(/\/$/, '');
const baseURL = normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`;

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
  },
});

// Use Bearer token auth for API requests (no cookie-based session required)
api.defaults.withCredentials = false;

// Add bearer token to every request if it exists in localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('No auth_token found in localStorage for request:', config.url);
  }

  // Debug: log token untuk chat dan admin pengaduan endpoint
  if (config.url?.includes('/chat/') || config.url?.includes('/admin/pengaduan')) {
    console.log(`Request to ${config.url}:`, {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      authHeader: config.headers.Authorization ? 'Present' : 'Missing'
    });
  }

  // Avoid stale browser/proxy cache for dynamic API reads (user/profile/lists).
  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _t: Date.now(),
    };
  }

  return config;
});

// Flag to prevent multiple redirects
let isRedirecting = false;

// Intercept responses to handle authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    // For 401 errors, redirect to login (only once)
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

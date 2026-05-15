import axios from 'axios';

// Default: relative `/api` so the Vite dev proxy forwards to Laravel (see `frontend/vite.config.js`).
// Optional override: set `VITE_API_URL` in repo-root `.env` (e.g. `http://127.0.0.1:8000`) to call Laravel
// directly and bypass the proxy (useful if the proxy target is wrong or unreachable).
const rawApi = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const baseURL =
  rawApi.length > 0
    ? rawApi.endsWith('/api')
      ? rawApi
      : `${rawApi}/api`
    : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
  },
});

// Use Bearer token auth for API requests (no cookie-based session required)
api.defaults.withCredentials = false;

// Add bearer token and API headers to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ensure Laravel treats this as API request (not web)
  config.headers.Accept = 'application/json';
  config.headers['X-Requested-With'] = 'XMLHttpRequest';

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

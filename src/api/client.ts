import axios from 'axios';

const AUTH_STORAGE_KEY = 'dpp-auth';

const client = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://3.120.228.32:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
      const token = parsed.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default client;

import axios from 'axios';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  // Production deployment
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://backend-lilac-seven-64.vercel.app/api';
  }
  return 'http://localhost:4000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfReady: Promise<void> | null = null;

function csrfCookieUrl(): string {
  return `${getBaseURL().replace(/\/api$/, '')}/sanctum/csrf-cookie`;
}

function ensureCsrfCookie(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!csrfReady) {
    csrfReady = axios
      .get(csrfCookieUrl(), { withCredentials: true })
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        csrfReady = null;
      });
  }
  return csrfReady;
}

function getXsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get' && method !== 'head' && method !== 'options') {
      await ensureCsrfCookie();
      const xsrf = getXsrfToken();
      if (xsrf) {
        config.headers['X-XSRF-TOKEN'] = xsrf;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1] || ''));
          if (payload.exp && payload.exp > Date.now() / 1000) {
            return api(originalRequest);
          }
        } catch {}
      }

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

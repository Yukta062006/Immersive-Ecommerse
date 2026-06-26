import { create } from 'zustand';
import { User } from '@/types/user';
import api from '@/lib/api';

const USER_STORAGE_KEY = 'immersive_user';

function isNetworkError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'code' in err) {
    return (err as { code: string }).code === 'ERR_NETWORK' || (err as { code: string }).code === 'ECONNREFUSED';
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message: string }).message;
    return msg.includes('Network Error') || msg.includes('ERR_NETWORK');
  }
  return false;
}

function generateFakeToken(): string {
  return btoa(JSON.stringify({ iat: Date.now(), exp: Date.now() + 86400000 }));
}

function saveUserToStorage(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMockAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

let userLoaded = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isMockAuth: false,

  login: async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const user = data.user;
      saveUserToStorage(user);
      userLoaded = true;
      set({ user, isAuthenticated: true, isMockAuth: false });
    } catch (err) {
      if (isNetworkError(err)) {
        const mockUser: User = {
          id: 'mock_' + Date.now(),
          email,
          name: email.split('@')[0],
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('accessToken', generateFakeToken());
        localStorage.setItem('refreshToken', generateFakeToken());
        saveUserToStorage(mockUser);
        userLoaded = true;
        set({ user: mockUser, isAuthenticated: true, isMockAuth: true });
      } else {
        throw err;
      }
    }
  },

  signup: async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/signup', { name, email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      const user = data.user;
      saveUserToStorage(user);
      userLoaded = true;
      set({ user, isAuthenticated: true, isMockAuth: false });
    } catch (err) {
      if (isNetworkError(err)) {
        const mockUser: User = {
          id: 'mock_' + Date.now(),
          email,
          name,
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('accessToken', generateFakeToken());
        localStorage.setItem('refreshToken', generateFakeToken());
        saveUserToStorage(mockUser);
        userLoaded = true;
        set({ user: mockUser, isAuthenticated: true, isMockAuth: true });
      } else {
        throw err;
      }
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    saveUserToStorage(null);
    userLoaded = false;
    set({ user: null, isAuthenticated: false, isMockAuth: false });
  },

  loadUser: async () => {
    if (userLoaded) return;
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        userLoaded = true;
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get('/auth/me');
      const user = data.user;
      saveUserToStorage(user);
      userLoaded = true;
      set({ user, isAuthenticated: true, isMockAuth: false, isLoading: false });
    } catch (err) {
      if (isNetworkError(err)) {
        const stored = loadUserFromStorage();
        if (stored) {
          userLoaded = true;
          set({ user: stored, isAuthenticated: true, isMockAuth: true, isLoading: false });
          return;
        }
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      saveUserToStorage(null);
      userLoaded = true;
      set({ isLoading: false });
    }
  },
}));

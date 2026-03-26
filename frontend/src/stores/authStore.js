import { create } from 'zustand';
import { STORAGE_KEYS } from '../utils/constants';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  accessToken: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  loading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    set({ token, accessToken: token, isAuthenticated: !!token });
  },

  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    set({ 
      token: accessToken, 
      accessToken, 
      refreshToken, 
      isAuthenticated: !!accessToken 
    });
  },

  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  login: (user, accessToken, refreshToken) => {
    set({
      user,
      token: accessToken,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      error: null,
    });
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  logout: () => {
    set({
      user: null,
      token: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
    });
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...userData };
    set({ user: updatedUser });
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

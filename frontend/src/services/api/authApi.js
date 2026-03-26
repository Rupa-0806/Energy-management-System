import apiClient from './client';

// Mock data for development when backend is unavailable
const MOCK_USER = {
  id: 1,
  email: 'demo@energy.com',
  name: 'Demo User',
  role: 'ADMIN',
  avatar: null,
};

const MOCK_TOKEN = 'mock-jwt-token-for-development-' + Date.now();
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-' + Date.now();

// Check if we should use mock (when backend is unavailable)
const useMock = async (apiCall, mockResponse) => {
  try {
    return await apiCall();
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.warn('Backend unavailable, using mock data');
      return mockResponse;
    }
    throw error;
  }
};

export const authApi = {
  // Login
  login: async (email, password) => {
    return useMock(
      async () => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
      },
      // Mock response when backend is down
      {
        accessToken: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        tokenType: 'Bearer',
        user: { ...MOCK_USER, email, name: email.split('@')[0] },
        expiresIn: 900,
        refreshExpiresIn: 604800,
      }
    );
  },

  // Logout with refresh token
  logout: async (refreshToken) => {
    return useMock(
      async () => {
        const response = await apiClient.post('/auth/logout', { refreshToken });
        return response.data;
      },
      { success: true }
    );
  },

  // Register
  register: async (userData) => {
    return useMock(
      async () => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
      },
      {
        accessToken: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        tokenType: 'Bearer',
        user: { ...MOCK_USER, ...userData },
        expiresIn: 900,
        refreshExpiresIn: 604800,
      }
    );
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    return useMock(
      async () => {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data;
      },
      {
        accessToken: 'mock-new-access-token-' + Date.now(),
        refreshToken: 'mock-new-refresh-token-' + Date.now(),
        expiresIn: 900,
        refreshExpiresIn: 604800,
      }
    );
  },

  // Google OAuth - verify ID token from Google Sign-In
  googleAuth: async (idToken) => {
    return useMock(
      async () => {
        const response = await apiClient.post('/auth/google', { idToken });
        return response.data;
      },
      {
        accessToken: MOCK_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        tokenType: 'Bearer',
        user: { ...MOCK_USER, email: 'google@example.com' },
        expiresIn: 900,
        refreshExpiresIn: 604800,
      }
    );
  },

  // Get current user
  getCurrentUser: async () => {
    return useMock(
      async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
      },
      MOCK_USER
    );
  },

  // Verify email with OTP code
  verifyEmail: async (email, code) => {
    try {
      const response = await apiClient.post('/auth/verify-email', { email, code });
      return response.data;
    } catch (error) {
      // Extract error message from response
      const message = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Verification failed';
      throw new Error(message);
    }
  },

  // Resend OTP verification code
  resendOtp: async (email) => {
    try {
      const response = await apiClient.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to resend verification code';
      throw new Error(message);
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await apiClient.post('/auth/request-password-reset', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },
};

export default authApi;

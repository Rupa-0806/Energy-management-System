import { createContext, useCallback, useEffect, useState, useRef } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import authApi from '../services/api/authApi';

// Storage key for pending verification email
const PENDING_VERIFICATION_KEY = 'ems_pending_verification_email';

// Default context value to prevent null errors during lazy loading
const defaultContextValue = {
  user: null,
  token: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  pendingVerificationEmail: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  googleLogin: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {},
  setError: () => {},
  handleOAuth2Callback: async () => ({ success: false }),
  verifyEmail: async () => ({ success: false }),
  resendOtp: async () => ({ success: false }),
  clearPendingVerification: () => {},
};

export const AuthContext = createContext(defaultContextValue);

// Token refresh buffer - refresh 1 minute before expiry
const TOKEN_REFRESH_BUFFER = 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState(
    () => localStorage.getItem(PENDING_VERIFICATION_KEY)
  );
  const refreshTimeoutRef = useRef(null);

  // Clear pending verification state
  const clearPendingVerification = useCallback(() => {
    localStorage.removeItem(PENDING_VERIFICATION_KEY);
    setPendingVerificationEmail(null);
  }, []);

  // Set pending verification email (persists in localStorage)
  const setPendingVerification = useCallback((email) => {
    if (email) {
      localStorage.setItem(PENDING_VERIFICATION_KEY, email);
      setPendingVerificationEmail(email);
    }
  }, []);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback((expiresIn) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const refreshTime = (expiresIn * 1000) - TOKEN_REFRESH_BUFFER;
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (storedRefreshToken) {
            const response = await authApi.refreshToken(storedRefreshToken);
            handleAuthSuccess(response);
          }
        } catch (err) {
          console.error('Token refresh failed:', err);
          handleLogout();
        }
      }, refreshTime);
    }
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback((response) => {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData, expiresIn } = response;
    
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setUser(userData);
    setIsAuthenticated(true);

    // Schedule next token refresh
    if (expiresIn) {
      scheduleTokenRefresh(expiresIn);
    }

    return { success: true, user: userData };
  }, [scheduleTokenRefresh]);

  // Handle logout
  const handleLogout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedAccessToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (storedAccessToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Try to refresh token on app load to ensure validity
        if (storedRefreshToken) {
          authApi.refreshToken(storedRefreshToken)
            .then(response => handleAuthSuccess(response))
            .catch(err => {
              console.warn('Token refresh on load failed:', err);
              // Keep existing tokens, they might still be valid
            });
        }
      } catch (err) {
        console.error('Failed to parse stored user data:', err);
        handleLogout();
      }
    }

    setLoading(false);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [handleAuthSuccess, handleLogout]);

  const login = useCallback(
    async (email, password) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.login(email, password);
        
        // Check if email verification is required
        if (response.requiresVerification) {
          setPendingVerification(email);
          return { 
            success: false, 
            requiresVerification: true, 
            email,
            message: response.message || 'Please verify your email'
          };
        }
        
        // Clear any pending verification on successful login
        clearPendingVerification();
        return handleAuthSuccess(response);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
        
        // Check if error response indicates verification required
        if (err.response?.data?.requiresVerification) {
          setPendingVerification(email);
          return { 
            success: false, 
            requiresVerification: true, 
            email,
            message: err.response?.data?.message || 'Please verify your email'
          };
        }
        
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess, setPendingVerification, clearPendingVerification]
  );

  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.register(userData);
        
        // Check if email verification is required
        if (response.requiresVerification) {
          setPendingVerification(userData.email);
          return { 
            success: true, // Registration succeeded, but needs verification
            requiresVerification: true, 
            email: userData.email,
            message: response.message || 'Please check your email for verification code'
          };
        }
        
        // If no verification required (email not configured), proceed normally
        clearPendingVerification();
        return handleAuthSuccess(response);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess, setPendingVerification, clearPendingVerification]
  );

  const googleLogin = useCallback(
    async (idToken) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.googleAuth(idToken);
        return handleAuthSuccess(response);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Google login failed. Please try again.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (storedRefreshToken) {
        await authApi.logout(storedRefreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      handleLogout();
      setLoading(false);
    }
  }, [handleLogout]);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }, []);

  // Handle OAuth2 callback (for redirect flow)
  const handleOAuth2Callback = useCallback((params) => {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn, error: oauthError } = params;
    
    if (oauthError) {
      setError(oauthError);
      return { success: false, error: oauthError };
    }

    if (newAccessToken && newRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newAccessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);
      setIsAuthenticated(true);
      
      if (expiresIn) {
        scheduleTokenRefresh(parseInt(expiresIn));
      }

      // Fetch user data
      authApi.getCurrentUser()
        .then(userData => {
          setUser(userData);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        })
        .catch(console.error);

      return { success: true };
    }

    return { success: false, error: 'Invalid OAuth2 callback' };
  }, [scheduleTokenRefresh]);

  // Verify email with OTP code
  const verifyEmail = useCallback(
    async (email, code) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authApi.verifyEmail(email, code);
        
        // Check if auth tokens are in response (from loginAfterVerification)
        if (response.auth) {
          clearPendingVerification();
          return handleAuthSuccess(response.auth);
        }
        
        // Fallback: if response has tokens directly
        if (response.accessToken) {
          clearPendingVerification();
          return handleAuthSuccess(response);
        }

        // Verification succeeded but no tokens (edge case)
        return { success: true, message: response.message };
      } catch (err) {
        const errorMessage = err.message || err.response?.data?.message || 'Verification failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [handleAuthSuccess, clearPendingVerification]
  );

  // Resend OTP verification code
  const resendOtp = useCallback(
    async (email) => {
      try {
        setError(null);
        const response = await authApi.resendOtp(email);
        return { success: true, message: response.message };
      } catch (err) {
        const errorMessage = err.message || err.response?.data?.message || 'Failed to resend code';
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const value = {
    user,
    token: accessToken,
    accessToken,
    refreshToken,
    isAuthenticated,
    loading,
    error,
    pendingVerificationEmail,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    setError,
    handleOAuth2Callback,
    verifyEmail,
    resendOtp,
    clearPendingVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Default fallback for when context is not yet available
const defaultAuth = {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Return default if context is null (during lazy loading race condition)
  return context || defaultAuth;
};

export default useAuth;

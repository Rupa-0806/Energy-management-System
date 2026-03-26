import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader, User, Zap, ArrowLeft, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { isValidEmail } from '../utils/validators';
import { REGISTRATION_ROLES } from '../utils/constants';
import { MeshGradient } from '../components/animations/AnimatedGradient';
import { cn } from '../utils/cn';
import googleAuthService from '../services/auth/GoogleAuthService';

// Input field component - MUST be outside the main component to prevent re-creation on each render
const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
      <input
        {...props}
        className={cn(
          'w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700/50 dark:text-white transition-all duration-200',
          error 
            ? 'border-danger-500 focus:ring-danger-500' 
            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
        )}
      />
    </div>
    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-danger-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

// Google Icon SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" className="mr-2">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, googleLogin, loading, error, setError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [googleError, setGoogleError] = useState(null);
  const googleInitialized = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'USER',
  });
  const [errors, setErrors] = useState({});

  // Handle successful Google credential
  const handleGoogleCredential = useCallback(async (result) => {
    if (result.success && result.credential) {
      setGoogleLoading(true);
      setGoogleError(null);
      try {
        const authResult = await googleLogin(result.credential);
        if (authResult.success) {
          navigate('/app/dashboard');
        } else {
          setGoogleError(authResult.error || 'Google sign-in failed');
        }
      } catch (err) {
        console.error('[LoginPage] Google login error:', err);
        setGoogleError(err.message || 'An error occurred during Google sign-in');
      } finally {
        setGoogleLoading(false);
      }
    }
  }, [googleLogin, navigate]);

  // Handle Google auth errors
  const handleGoogleError = useCallback((error) => {
    console.error('[LoginPage] Google auth error:', error);
    setGoogleLoading(false);
    
    // Map error codes to user-friendly messages
    const errorMessages = {
      POPUP_CLOSED_BY_USER: 'Sign-in was cancelled. Please try again.',
      POPUP_BLOCKED: 'Popup was blocked. Please allow popups for this site and try again.',
      NETWORK_ERROR: 'Network error. Please check your internet connection.',
      FEDCM_ERROR: 'Authentication error. Please try again or use email sign-in.',
      GOOGLE_SCRIPT_LOAD_FAILED: 'Failed to load Google Sign-In. Please refresh the page.',
    };

    setGoogleError(errorMessages[error.code] || error.message || 'Google sign-in failed');
  }, []);

  // Initialize Google Sign-In with the production service
  useEffect(() => {
    if (googleInitialized.current) return;
    googleInitialized.current = true;

    const initGoogle = async () => {
      if (!googleAuthService.isAvailable()) {
        console.log('[LoginPage] Google Sign-In not configured');
        return;
      }

      try {
        // Set up callbacks
        googleAuthService
          .onCredential(handleGoogleCredential)
          .onError(handleGoogleError);

        // Initialize the service
        const success = await googleAuthService.initialize({
          autoSelect: false,
          cancelOnTapOutside: true,
        });

        setGoogleAvailable(success);
        
        if (success) {
          console.log('[LoginPage] Google Sign-In initialized');
        }
      } catch (err) {
        console.error('[LoginPage] Google init error:', err);
        setGoogleAvailable(false);
      }
    };

    initGoogle();

    // Cleanup on unmount
    return () => {
      googleAuthService.cancel();
    };
  }, [handleGoogleCredential, handleGoogleError]);

  // Trigger Google Sign-In with fallback strategies
  const handleGoogleSignIn = useCallback(async () => {
    if (!googleAvailable) {
      setError('Google Sign-In is not available. Please use email sign-in.');
      return;
    }

    setGoogleLoading(true);
    setGoogleError(null);

    try {
      await googleAuthService.signIn({ resetStrategy: true });
    } catch (err) {
      console.error('[LoginPage] Google sign-in error:', err);
      setGoogleError('Failed to start Google sign-in. Please try again.');
    } finally {
      // Loading state will be cleared by credential/error callbacks
      // But set a timeout as fallback
      setTimeout(() => setGoogleLoading(false), 10000);
    }
  }, [googleAvailable, setError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!isLogin && !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character (@#$%^&+=!)';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        
        // Check if email verification is required
        if (result.requiresVerification) {
          toast.success('Please verify your email to continue');
          navigate('/verify-email', { state: { email: formData.email } });
          return;
        }
        
        if (result.success) {
          toast.success('Welcome back!');
          navigate('/app/dashboard');
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        // Split name into firstName and lastName for backend
        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        // Backend requires lastName to be non-blank, use firstName if only one name provided
        const lastName = nameParts.slice(1).join(' ') || firstName;
        
        const result = await register({
          email: formData.email,
          password: formData.password,
          firstName,
          lastName,
          role: formData.role,
        });
        
        // Check if email verification is required
        if (result.requiresVerification) {
          toast.success('Registration successful! Please verify your email.');
          navigate('/verify-email', { state: { email: formData.email } });
          return;
        }
        
        if (result.success) {
          toast.success('Account created successfully!');
          navigate('/app/dashboard');
        } else if (result.error) {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error(isLogin ? 'Login error:' : 'Registration error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <MeshGradient className="absolute inset-0 opacity-50 dark:opacity-30 pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Back to home button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </motion.div>

      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Card */}
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-slate-700/50">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-10 text-center overflow-hidden">
            {/* Animated circles */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full"
            />
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <Zap className="w-8 h-8 text-primary-600" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
            >
              Energy Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-primary-100 text-sm"
            >
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </motion.p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {/* Error alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-danger-50 dark:bg-danger-900/50 border border-danger-200 dark:border-danger-700 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="text-danger-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-danger-800 dark:text-danger-200 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name field (register only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <InputField
                      label="Full Name"
                      icon={User}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      error={errors.name}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email field */}
              <InputField
                label="Email Address"
                icon={Mail}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                error={errors.email}
              />

              {/* Password field */}
              <InputField
                label="Password"
                icon={Lock}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
              />

              {/* Confirm password field (register only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <InputField
                      label="Confirm Password"
                      icon={Lock}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      error={errors.confirmPassword}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Role selection (register only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700/50 dark:text-white transition-all duration-200 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 appearance-none cursor-pointer"
                        >
                          {REGISTRATION_ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label} - {role.description}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </motion.button>

              {/* Divider */}
              {googleAuthService.isAvailable() && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* Google Sign-In Button */}
                  {googleAuthService.isAvailable() && (
                    <>
                      <motion.button
                        whileHover={{ scale: googleAvailable ? 1.02 : 1 }}
                        whileTap={{ scale: googleAvailable ? 0.98 : 1 }}
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || !googleAvailable}
                        className={`w-full bg-white dark:bg-slate-700 border text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-all flex items-center justify-center shadow-sm ${
                          googleAvailable 
                            ? 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:shadow' 
                            : 'border-gray-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                        } disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        {googleLoading ? (
                          <Loader size={18} className="animate-spin mr-2" />
                        ) : (
                          <GoogleIcon />
                        )}
                        {googleLoading ? 'Signing in...' : 'Continue with Google'}
                      </motion.button>
                      
                      {/* Google Error Display */}
                      {googleError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 dark:text-red-400 text-sm text-center mt-2"
                        >
                          {googleError}
                        </motion.p>
                      )}
                    </>
                  )}
                </>
              )}
            </form>

            {/* Toggle login/register */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setError(null);
                    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                  }}
                  className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50/50 dark:bg-slate-900/50 px-8 py-4 text-center border-t border-gray-200/50 dark:border-slate-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Energy Management System. All rights reserved.
            </p>
          </div>
        </div>

        {/* Demo credentials info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg text-center border border-gray-200/50 dark:border-slate-700/50"
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Demo Credentials</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-500">Email: </span>
              <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">demo@example.com</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-500">Password: </span>
              <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">Demo@123</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

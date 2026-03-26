import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { MeshGradient } from '../components/animations/AnimatedGradient';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendOtp, pendingVerificationEmail, clearPendingVerification } = useAuth();
  
  // Get email from navigation state or auth context
  const email = location.state?.email || pendingVerificationEmail;
  
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  
  const inputRefs = useRef([]);

  // Redirect if no email to verify
  useEffect(() => {
    if (!email) {
      toast.error('No email to verify. Please register or login first.');
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = useCallback((index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    setError('');
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === OTP_LENGTH - 1) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === OTP_LENGTH) {
        handleVerify(fullOtp);
      }
    }
  }, [otp]);

  const handleKeyDown = useCallback((index, e) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus appropriate input
      const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto-submit if complete
      if (pastedData.length === OTP_LENGTH) {
        handleVerify(pastedData);
      }
    }
  }, [otp]);

  const handleVerify = async (code = otp.join('')) => {
    if (code.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await verifyEmail(email, code);
      
      if (result.success) {
        setIsSuccess(true);
        toast.success('Email verified successfully!');
        
        // Delay navigation for success animation
        setTimeout(() => {
          navigate('/app/dashboard', { replace: true });
        }, 1500);
      } else {
        // Handle specific error cases
        if (result.error?.includes('expired')) {
          setError('Verification code has expired. Please request a new one.');
          setOtp(Array(OTP_LENGTH).fill(''));
        } else if (result.error?.includes('attempts')) {
          const remainingAttempts = parseInt(result.error.match(/\d+/)?.[0] || '0');
          setAttemptsLeft(remainingAttempts);
          setError(result.error);
          if (remainingAttempts === 0) {
            setError('Too many failed attempts. Please request a new code.');
            setOtp(Array(OTP_LENGTH).fill(''));
          }
        } else {
          setError(result.error || 'Invalid verification code');
          setAttemptsLeft(prev => Math.max(0, prev - 1));
        }
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError('');

    try {
      const result = await resendOtp(email);
      
      if (result.success) {
        toast.success('New verification code sent to your email');
        setResendCooldown(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(''));
        setAttemptsLeft(3);
        inputRefs.current[0]?.focus();
      } else {
        if (result.error?.includes('rate limit') || result.error?.includes('Too many')) {
          setError('Too many requests. Please wait before requesting another code.');
          setResendCooldown(RESEND_COOLDOWN * 2);
        } else {
          setError(result.error || 'Failed to resend code');
        }
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError('Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    clearPendingVerification?.();
    navigate('/login', { replace: true });
  };

  // Mask email for display
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <MeshGradient className="absolute inset-0 opacity-50 dark:opacity-30 pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleBackToLogin}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Login</span>
      </motion.button>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
          {/* Success State */}
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Redirecting to your dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </motion.div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We've sent a 6-digit code to
                  </p>
                  <p className="text-primary-600 dark:text-primary-400 font-medium">
                    {maskedEmail}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                  <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        disabled={isVerifying || isSuccess}
                        className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all duration-200 bg-white dark:bg-slate-700 text-gray-900 dark:text-white outline-none
                          ${digit ? 'border-primary-500 dark:border-primary-400' : 'border-gray-200 dark:border-slate-600'}
                          ${error ? 'border-red-500 dark:border-red-400 shake' : ''}
                          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      />
                    ))}
                  </div>
                  
                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm"
                      >
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Attempts remaining */}
                  {attemptsLeft < 3 && attemptsLeft > 0 && (
                    <p className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400">
                      {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleVerify()}
                  disabled={otp.join('').length !== OTP_LENGTH || isVerifying}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium 
                    hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                    flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Verify Email
                    </>
                  )}
                </motion.button>

                {/* Resend section */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-colors
                      ${resendCooldown > 0 || isResending
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                      }`}
                  >
                    <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                    {isResending
                      ? 'Sending...'
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Code'
                    }
                  </button>
                </div>

                {/* Security note */}
                <div className="mt-6 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    The code will expire in 10 minutes. Check your spam folder if you don't see it in your inbox.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CSS for shake animation */}
      <style>{`
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

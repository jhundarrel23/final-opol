/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const usePasswordRecovery = () => {
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation helper
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email?.trim());
  }, []);

  // Password validation helper
  const validatePassword = useCallback((password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
    }
    if (!hasUpperCase || !hasLowerCase) {
      return { isValid: false, message: 'Password must contain both uppercase and lowercase letters.' };
    }
    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).' };
    }

    return { isValid: true, message: '' };
  }, []);

  // Step 1: Request password reset link
  const handleForgotPassword = async (email = resetEmail) => {
    clearMessages();
    setIsLoading(true);

    if (!email?.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return false;
    }

    try {
      const { data } = await axiosInstance.post(
        '/api/coordinator/forgot-password',
        { email: email.trim().toLowerCase() },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false // Explicitly set for public route
        }
      );

      if (data?.success || data?.message) {
        setSuccess(
          "If an account with that email exists, we've sent password reset instructions to your inbox."
        );
        setResetEmail('');
        return true;
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      handleErrorResponse(err, 'forgot-password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password using token (PUBLIC route - no authentication required)
  const handleResetPasswordWithToken = async ({ token, email, password, password_confirmation }) => {
    clearMessages();
    setIsLoading(true);

    if (!token?.trim() || !email?.trim()) {
      setError('Invalid or expired reset link. Please request a new password reset.');
      setIsLoading(false);
      return false;
    }

    if (!password || !password_confirmation) {
      setError('Please fill in all password fields.');
      setIsLoading(false);
      return false;
    }

    if (password !== password_confirmation) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return false;
    }

    try {
      const { data } = await axiosInstance.post(
        '/api/coordinator/reset-password',
        { token: token.trim(), email: email.trim().toLowerCase(), password, password_confirmation },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false // FIXED: Explicitly set to false for public route
        }
      );

      if (data?.success || data?.message) {
        setSuccess('Password reset successful! You can now log in with your new password.');
        setTimeout(() => {
          navigate('/coordinator/login', {
            state: { message: 'Password reset successfully. Please log in with your new password.' },
          });
        }, 2000);
        return true;
      }
    } catch (err) {
      console.error('Reset password error:', err);
      handleErrorResponse(err, 'reset-password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Force reset password (PROTECTED route - requires authentication)
  const handleForceResetPassword = async ({ new_password, new_password_confirmation }) => {
    clearMessages();
    setIsLoading(true);

    if (!new_password || !new_password_confirmation) {
      setError('Please fill in all password fields.');
      setIsLoading(false);
      return false;
    }

    if (new_password !== new_password_confirmation) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return false;
    }

    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return false;
    }

    try {
      const { data } = await axiosInstance.post(
        '/api/coordinator/force-reset-password',
        { new_password, new_password_confirmation },
        {
          withCredentials: true,
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (data?.success || data?.message) {
        setSuccess('Password updated successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/coordinator/dashboard', { replace: true });
        }, 2000);
        return true;
      }
    } catch (err) {
      console.error('Force reset error:', err);
      handleErrorResponse(err, 'force-reset');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Change password (PROTECTED route - requires authentication)
  const handleRegularPasswordChange = async ({ current_password, new_password, new_password_confirmation }) => {
    clearMessages();
    setIsLoading(true);

    if (!current_password || !new_password || !new_password_confirmation) {
      setError('Please fill in all password fields.');
      setIsLoading(false);
      return false;
    }

    if (new_password !== new_password_confirmation) {
      setError('New passwords do not match.');
      setIsLoading(false);
      return false;
    }

    if (current_password === new_password) {
      setError('New password must be different from your current password.');
      setIsLoading(false);
      return false;
    }

    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return false;
    }

    try {
      const { data } = await axiosInstance.post(
        '/api/coordinator/change-password', // FIXED: Use different endpoint for authenticated password change
        { current_password, new_password, new_password_confirmation },
        {
          withCredentials: true,
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (data?.success || data?.message) {
        setSuccess('Password updated successfully!');
        return true;
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Regular password change error:', err);
      }
      handleErrorResponse(err, 'regular-change');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Centralized error handler
  const handleErrorResponse = (err, context) => {
    if (err.code === 'ECONNABORTED') {
      setError('Request timed out. Please check your connection and try again.');
      return;
    }

    if (err.message === 'Network Error') {
      setError('Unable to connect to server. Please check your internet connection.');
      return;
    }

    if (!err.response) {
      setError('Unable to reach the server. Please check your connection and try again.');
      return;
    }

    const { status, data } = err.response;

    switch (status) {
      case 400:
        if (context === 'reset-password') {
          if (data?.message?.toLowerCase().includes('expired')) {
            setError('This password reset link has expired. Please request a new one.');
          } else if (data?.message?.toLowerCase().includes('invalid')) {
            setError('Invalid or expired reset link. Please request a new password reset.');
          } else if (data?.message?.toLowerCase().includes('used')) {
            setError('This reset link has already been used. Please request a new one if needed.');
          } else {
            setError('Invalid request. Please try requesting a new password reset.');
          }
        } else if (context === 'regular-change') {
          setError(data?.message || 'Current password is incorrect.');
        } else {
          setError(data?.message || 'Invalid request. Please check your information and try again.');
        }
        break;

      case 401:
        if (context === 'regular-change' || context === 'force-reset') {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            navigate('/coordinator/login', {
              state: { message: 'Session expired. Please log in again.' },
            });
          }, 2000);
        } else {
          setError('Authentication failed. Please try again.');
        }
        break;

      case 404:
        if (context === 'forgot-password') {
          setError('No account found with this email address.');
        } else if (context === 'reset-password') {
          setError('Invalid or expired reset link. Please request a new one.');
        } else {
          setError('The requested resource was not found.');
        }
        break;

      case 422:
        if (data?.errors && typeof data.errors === 'object') {
          const firstErrorKey = Object.keys(data.errors)[0];
          const firstError = data.errors[firstErrorKey];
          if (Array.isArray(firstError)) {
            setError(firstError[0]);
          } else {
            setError(firstError);
          }
        } else if (data?.message) {
          setError(data.message);
        } else {
          setError('Validation failed. Please check your input and try again.');
        }
        break;

      case 429:
        setError('Too many requests. Please wait a few minutes before trying again.');
        break;

      case 500:
        setError('Server error occurred. Please try again in a few moments.');
        break;

      default:
        setError(data?.message || `An unexpected error occurred (${status}). Please try again.`);
    }
  };

  // Clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // Reset all states
  const resetState = useCallback(() => {
    setResetEmail('');
    setError('');
    setSuccess('');
    setIsLoading(false);
  }, []);

  return {
    resetEmail,
    setResetEmail,
    error,
    success,
    isLoading,
    handleForgotPassword,
    handleResetPasswordWithToken,
    handleForceResetPassword,
    handleRegularPasswordChange,
    clearMessages,
    resetState,
    validateEmail,  
    validatePassword,
  };
};

export default usePasswordRecovery;
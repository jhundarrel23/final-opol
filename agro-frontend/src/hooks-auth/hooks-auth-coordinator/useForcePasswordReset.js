/* eslint-disable no-lonely-if */
// hooks/useForcePasswordReset.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

export const useForcePasswordReset = () => {
  const navigate = useNavigate();

  // State
  const [formData, setFormData] = useState({
    new_password: '',
    new_password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState({
    new_password: false,
    confirmation: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // --- Auth check ---
  useEffect(() => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (!token || !userStr) {
        console.log('No token or user data found, redirecting to login');
        navigate('/coordinator-login');
        return;
      }

      const user = JSON.parse(userStr);

      if (!user || user.role !== 'coordinator') {
        console.log('Invalid user or role, redirecting to login');
        navigate('/coordinator-login');
        return;
      }

      // ✅ Changed to use must_reset_password to match login hook
      const needsPasswordReset = user.must_reset_password;

      if (!needsPasswordReset) {
        console.log('User does not need password reset, redirecting to dashboard');
        navigate('/coordinator/dashboard');
        return;
      }

      console.log('User needs password reset, staying on reset page');
    } catch (error) {
      console.error('Error in auth check:', error);
      navigate('/coordinator-login');
    }
  }, [navigate]);

  // --- Helpers ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.new_password) {
      newErrors.new_password = 'New password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    if (!formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Password confirmation is required';
    } else if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    if (password.length < 6) return 25;
    if (password.length < 8) return 50;
    if (password.length < 12) return 75;
    return 100;
  };

  const updateUserLocalStorage = () => {
    const updateStorage = (storageType) => {
      const userStr = storageType.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // ✅ Changed to clear must_reset_password to match login hook
          user.must_reset_password = false;
          storageType.setItem('user', JSON.stringify(user));
          console.log(
            `Updated ${storageType === localStorage ? 'localStorage' : 'sessionStorage'} user data`
          );
        } catch (error) {
          console.error(
            `Error updating ${storageType === localStorage ? 'localStorage' : 'sessionStorage'}:`,
            error
          );
        }
      }
    };

    updateStorage(localStorage);
    updateStorage(sessionStorage);
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      console.log('Submitting password reset...');
      const response = await axiosInstance.post(
        'api/coordinator/force-reset-password',
        formData
      );

      console.log('Password reset response:', response);

      if ([200, 201].includes(response.status)) {
        console.log('Password reset successful');
        updateUserLocalStorage();
        setSuccess(true);

        // Show success message before redirecting
        setTimeout(() => {
          navigate('/coordinator/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Password reset error:', error);

      if (error.response?.status === 401) {
        setErrors({ general: 'Session expired. Please log in again.' });
        // Clear storage and redirect after showing error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setTimeout(() => navigate('/coordinator-login'), 2000);
      } else if (error.response?.data) {
        const { errors: validationErrors, message } = error.response.data;
        setErrors(validationErrors || { general: message || 'Password reset failed.' });
      } else if (error.code === 'ECONNABORTED') {
        setErrors({ general: 'Request timed out. Please try again.' });
      } else if (error.message === 'Network Error') {
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Derived values ---
  const passwordStrength = getPasswordStrength(formData.new_password);
  const passwordsMatch =
    formData.new_password &&
    formData.new_password_confirmation &&
    formData.new_password === formData.new_password_confirmation;

  return {
    formData,
    showPassword,
    loading,
    errors,
    success,
    passwordStrength,
    passwordsMatch,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
  };
};
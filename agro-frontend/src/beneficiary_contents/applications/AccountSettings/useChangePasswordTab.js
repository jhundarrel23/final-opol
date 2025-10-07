import { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const useChangePasswordTab = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // ---------------- INPUT HANDLING ----------------
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;

    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
    setValidationErrors((prev) => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });

    if (field === 'newPassword') validateNewPassword(value);
    if (field === 'confirmPassword') validateConfirmPassword(value, formData.newPassword);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ---------------- VALIDATION ----------------
  const validateCurrentPassword = (password) => {
    return !password?.trim()
      ? { currentPassword: 'Current password is required' }
      : {};
  };

  const validateNewPassword = (password) => {
    const errors = {};

    if (!password?.trim()) {
      errors.newPassword = 'New password is required';
    } else if (password.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (password.length > 128) {
      errors.newPassword = 'Password must not exceed 128 characters';
    } else {
      const requirements = {
        lower: /[a-z]/.test(password),
        upper: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      };

      const missing = Object.entries(requirements)
        .filter(([, met]) => !met)
        .map(([key]) => key);

      if (missing.length) {
        errors.newPassword = `Password must include: ${missing.join(', ')}`;
      } else if (password === formData.currentPassword) {
        errors.newPassword = 'New password must be different from current password';
      } else if (
        /^(.)\1+$/.test(password) ||
        /123456|654321|qwerty|password|admin/i.test(password) ||
        /^[a-zA-Z]+$/.test(password) ||
        /^[0-9]+$/.test(password)
      ) {
        errors.newPassword = 'Password is too weak. Avoid common patterns.';
      }
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return errors;
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    const errors = {};
    if (!confirmPassword?.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return errors;
  };

  const validateForm = () => {
    setValidationErrors({});
    const errors = {
      ...validateCurrentPassword(formData.currentPassword),
      ...validateNewPassword(formData.newPassword),
      ...validateConfirmPassword(formData.confirmPassword, formData.newPassword)
    };

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please correct the errors below');
      return false;
    }
    return true;
  };

  // ---------------- STRENGTH & REQUIREMENTS ----------------
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: 'error' };

    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[^A-Za-z0-9]/.test(password),
      password.length >= 12,
      !/(.)\1{2,}/.test(password)
    ];

    const score = checks.filter(Boolean).length;
    if (score <= 2) return { score, label: 'Weak', color: 'red' };
    if (score <= 4) return { score, label: 'Fair', color: 'orange' };
    if (score <= 5) return { score, label: 'Good', color: 'blue' };
    return { score, label: 'Strong', color: 'green' };
  };

  const getPasswordRequirements = (password = '') => [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Number', met: /\d/.test(password) },
    { text: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  // ---------------- API ----------------
  const changePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axiosInstance.put('/api/user/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword
      });

      if (res.data.success) {
        setSuccess('Password changed successfully!');
        resetForm();
      }
    } catch (err) {
      const { response } = err;
      if (response?.status === 422) {
        const serverErrors = response.data.errors || {};
        setValidationErrors({
          currentPassword: serverErrors.current_password?.[0],
          newPassword: serverErrors.new_password?.[0],
          confirmPassword: serverErrors.new_password_confirmation?.[0]
        });
        setError('Please correct the errors below');
      } else if (response?.status === 401) {
        setError('Current password is incorrect');
      } else if (response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection.');
      } else {
        setError(response?.data?.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HELPERS ----------------
  const resetForm = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  const hasFormData = () =>
    !!(formData.currentPassword || formData.newPassword || formData.confirmPassword);

  const isFormValid = () =>
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword &&
    Object.keys(validationErrors).length === 0;

  return {
    formData,
    showPasswords,
    loading,
    error,
    success,
    validationErrors,
    handleInputChange,
    togglePasswordVisibility,
    changePassword,
    resetForm,
    getPasswordStrength,
    getPasswordRequirements,
    hasFormData,
    isFormValid,
    validateForm
  };
};

export default useChangePasswordTab;

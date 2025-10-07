import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function useResetPasswordBeneficiary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async ({ token, email, password, confirmPassword }) => {
    // Frontend validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Valid email is required.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('/api/beneficiary/reset-password', {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(res.data.message || 'Password has been reset successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return { handleResetPassword, loading, error, success };
}

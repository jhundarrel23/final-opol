import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

export default function useForgotPasswordBeneficiary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPassword = async (email) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosInstance.post('api/beneficiary/forgot-password', {
        email,
      });
      setSuccess(res.data.message || 'Password reset link sent to your email.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return { handleForgotPassword, loading, error, success };
}

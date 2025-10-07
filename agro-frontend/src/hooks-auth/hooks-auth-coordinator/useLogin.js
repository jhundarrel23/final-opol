/* eslint-disable camelcase */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const useLoginCoordinator = (setIsLoggedIn, setUser) => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  // Handle login
  const handleLogin = async (loginData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const { emailOrUsername, password, rememberMe } = loginData;

    if (!emailOrUsername || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        '/api/coordinator/login',
        { emailOrUsername, password },
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (!response || !response.data) {
        throw new Error('Invalid response from server.');
      }

      const { token, data: user, must_reset_password } = response.data;

      if (token && user) {

        const needsPasswordReset = must_reset_password || user.force_password_reset || false;
        
        const userToStore = {
          ...user,
          must_reset_password: needsPasswordReset,
          // Remove any conflicting flags
          force_password_reset: undefined,
        };

      
        Object.keys(userToStore).forEach(key => {
          if (userToStore[key] === undefined) {
            delete userToStore[key];
          }
        });

        // Save token + user (localStorage if rememberMe, else sessionStorage)
        if (rememberMe) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userToStore));
        } else {
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(userToStore));
        }

        // Attach token globally
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (setIsLoggedIn) setIsLoggedIn(true);
        if (setUser) setUser(userToStore);

        // 🚀 Redirect logic
        if (needsPasswordReset) {
          navigate('/coordinator/force-reset-password', { replace: true });
        } else if (user.role === 'coordinator') {
          navigate('/coordinator/dashboard', { replace: true });
        } else {
          navigate('/error', { replace: true });
        }
      } else {
        throw new Error('Login failed. Missing token or user data.');
      }
    } catch (err) {
      console.error('Login error:', err);
      handleErrorResponse(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle errors
  const handleErrorResponse = (err) => {
    if (err.code === 'ECONNABORTED') {
      setError('Request timed out. Please try again.');
    } else if (err.response) {
      const { status, data } = err.response;

      if (status === 401 || status === 422) {
        setError('Invalid email/username or password.');
      } else if (status === 403) {
        setError('Access denied. You are not authorized to log in.');
      } else if (status === 404) {
        setError('Email address not found. Please check and try again.');
      } else if (status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else if (status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(data?.message || `Unexpected error: ${status}`);
      }
    } else if (err.message === 'Network Error') {
      setError('Network error. Please check your internet connection.');
    } else {
      setError('Unable to reach the server. Please check your connection.');
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      emailOrUsername: '',
      password: '',
    });
    clearMessages();
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleLogin,
    error,
    success,
    isLoading,
    clearMessages,
    resetForm,
  };
};

export default useLoginCoordinator;
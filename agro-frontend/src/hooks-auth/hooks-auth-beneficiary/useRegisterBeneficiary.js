import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const useRegisterBeneficiary = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const navigate = useNavigate();

  // Refs for debouncing
  const usernameCheckTimeout = useRef(null);
  const emailCheckTimeout = useRef(null);
  const lastCheckedUsername = useRef('');
  const lastCheckedEmail = useRef('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    if (error) setError('');
    if (success) setSuccess('');

    // Username availability check
    if (name === 'username') {
      if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);

      const trimmedValue = value.trim();
      if (trimmedValue.length >= 3 && trimmedValue !== lastCheckedUsername.current) {
        setIsCheckingUsername(true);
        setFormErrors((prev) => ({ ...prev, username: '' }));
        usernameCheckTimeout.current = setTimeout(() => {
          checkAvailability({ username: trimmedValue });
        }, 500);
      } else {
        setIsCheckingUsername(false);
      }
    }

    // Email availability check
    if (name === 'email') {
      if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);

      const trimmedValue = value.trim();
      if (
        trimmedValue &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue) &&
        trimmedValue !== lastCheckedEmail.current
      ) {
        setIsCheckingEmail(true);
        setFormErrors((prev) => ({ ...prev, email: '' }));
        emailCheckTimeout.current = setTimeout(() => {
          checkAvailability({ email: trimmedValue });
        }, 500);
      } else {
        setIsCheckingEmail(false);
      }
    }
  };

  // Single API for both username & email
  const checkAvailability = async (params) => {
    try {
      const response = await axiosInstance.get('api/beneficiary/check-availability', {
        params,
        timeout: 5000,
      });

      if (params.username) lastCheckedUsername.current = params.username;
      if (params.email) lastCheckedEmail.current = params.email;

      if (params.username) {
        if (response.data?.username_available) {
          setFormErrors((prev) => ({ ...prev, username: '' }));
        } else {
          setFormErrors((prev) => ({ ...prev, username: 'Username is already taken' }));
        }
        setIsCheckingUsername(false);
      }

      if (params.email) {
        if (response.data?.email_available) {
          setFormErrors((prev) => ({ ...prev, email: '' }));
        } else {
          setFormErrors((prev) => ({ ...prev, email: 'Email is already registered' }));
        }
        setIsCheckingEmail(false);
      }
    } catch (err) {
      console.error('Availability check error:', err);
      if (params.username) {
        setFormErrors((prev) => ({ ...prev, username: 'Unable to check username availability' }));
        setIsCheckingUsername(false);
      }
      if (params.email) {
        setFormErrors((prev) => ({ ...prev, email: 'Unable to check email availability' }));
        setIsCheckingEmail(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
      if (emailCheckTimeout.current) clearTimeout(emailCheckTimeout.current);
    };
  }, []);

  // 🔥 Live validation for matching username & password
  useEffect(() => {
    const username = formData.username.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    const newErrors = {};

    if (username && password && password.toLowerCase() === username.toLowerCase()) {
      newErrors.password = 'Password cannot be the same as your username';
    }

    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors((prev) => ({
      ...prev,
      ...newErrors,
      password:
        newErrors.password ||
        (prev.password === 'Password cannot be the same as your username' ? '' : prev.password),
      confirmPassword:
        newErrors.confirmPassword ||
        (prev.confirmPassword === 'Passwords do not match' ? '' : prev.confirmPassword),
    }));
  }, [formData.username, formData.password, formData.confirmPassword]);

  const validateForm = () => {
    const errors = {};
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!firstName) {
      errors.firstName = 'First name is required';
    } else if (firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s\-']+$/.test(firstName)) {
      errors.firstName = 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (!lastName) {
      errors.lastName = 'Last name is required';
    } else if (lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s\-']+$/.test(lastName)) {
      errors.lastName = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (formData.middleName.trim() && !/^[a-zA-Z\s\-']+$/.test(formData.middleName.trim())) {
      errors.middleName = 'Middle name can only contain letters, spaces, hyphens, and apostrophes';
    }

    if (formData.extensionName.trim() && !/^[a-zA-Z\s\-'.]+$/.test(formData.extensionName.trim())) {
      errors.extensionName =
        'Extension name can only contain letters, spaces, hyphens, periods, and apostrophes';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (username.length > 50) {
      errors.username = 'Username cannot exceed 50 characters';
    } else if (
      !/^[a-zA-Z0-9_]+$/.test(username) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)
    ) {
      errors.username = 'Username must be letters/numbers or a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (password.length > 50) {
      errors.password = 'Password cannot exceed 50 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    Object.keys(formErrors).forEach((key) => {
      if (formErrors[key] && !errors[key]) {
        errors[key] = formErrors[key];
      }
    });

    return errors;
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please fix the highlighted fields to continue');
      setIsLoading(false);
      return;
    }

    if (isCheckingUsername || isCheckingEmail) {
      setError('Please wait while we verify your information');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        'api/beneficiary/register',
        {
          fname: formData.firstName.trim(),
          mname: formData.middleName.trim() || null,
          lname: formData.lastName.trim(),
          extension_name: formData.extensionName.trim() || null,
          username: formData.username.trim(),
          email: formData.email.trim() || null,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        },
        { timeout: 15000 }
      );

      if (response.data?.success) {
        setSuccess('Registration successful! You can now sign in to your account.');
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          extensionName: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
        });
        setFormErrors({});
        setTimeout(() => navigate('/beneficiary-login'), 3000);
      } else {
        setError(response.data?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 422) {
        const backendErrors = {};
        const dataErrors = err.response.data?.errors || {};

        const fieldMapping = {
          fname: 'firstName',
          mname: 'middleName',
          lname: 'lastName',
          extension_name: 'extensionName',
          username: 'username',
          email: 'email',
          password: 'password',
          password_confirmation: 'confirmPassword',
        };

        Object.keys(dataErrors).forEach((field) => {
          const frontendField = fieldMapping[field] || field;
          if (Array.isArray(dataErrors[field]) && dataErrors[field].length > 0) {
            backendErrors[frontendField] = dataErrors[field][0];
          }
        });

        setFormErrors(backendErrors);
        setError('Please fix the highlighted fields and try again');
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleRegister,
    formErrors,
    error,
    success,
    isLoading,
    isCheckingUsername,
    isCheckingEmail,
  };
};

export default useRegisterBeneficiary;

import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useRegister = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldError[name]) {
      setFieldError((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setFieldError({});

    const { username, email, password, confirmPassword } = form;

    const newFieldError = {};
    if (!username) newFieldError.username = true;
    if (!email) newFieldError.email = true;
    if (!password) newFieldError.password = true;
    if (!confirmPassword) newFieldError.confirmPassword = true;

    if (Object.keys(newFieldError).length > 0) {
      setFieldError(newFieldError);
      setError('Please fill out all fields.');
      return;
    }

    if (!isEmailValid(email)) {
      setFieldError({ email: true });
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setFieldError({ password: true, confirmPassword: true });
      setError('Passwords do not match.');
      return;
    }

    const payload = {
      username,
      email,
      password,
      password_confirmation: confirmPassword,
      role: 'admin',  // Always set role to admin
    };

    setLoading(true);

    try {
      // Registering the admin
      const response = await axios.post(
        'http://localhost:8000/api/admin/register', // Registration route for admin
        payload
      );

      console.log('✅ API Response:', response.data);

      setForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      setSuccessMessage('Admin registered successfully!');
      navigate('/login'); // Redirect to login after successful registration
    } catch (err) {
      console.error('Registration Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    error,
    successMessage,
    loading,
    fieldError,
    handleChange,
    handleSubmit,
  };
};

export default useRegister;

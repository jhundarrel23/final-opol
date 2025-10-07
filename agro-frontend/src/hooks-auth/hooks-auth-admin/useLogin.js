import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useLogin = (setIsLoggedIn, setUser, role = '') => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    const { emailOrUsername, password } = formData;

    if (!emailOrUsername || !password) {
      setError('Please fill in all fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/admin/login',
        {
          emailOrUsername: emailOrUsername, 
          password: password,
          role: role,   
        },
        {
          withCredentials: true,
        }
      );

      // Log the response for debugging purposes
      console.log(response.data);

      const { access_token: accessToken, user } = response.data;

      if (accessToken && user) {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;


        if (setIsLoggedIn) setIsLoggedIn(true);
        if (setUser) setUser(user);

      
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'coordinator') {
          navigate('/dashboard');
        } else {
          navigate('/error');  // 
        }
      } else {
        setError('Login failed. Missing token or user data.');
      } 
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401 || status === 422) {
          setError('Invalid email/username or password.');
        } else if (status === 403) {
          setError('Access denied. You are not authorized to log in.');
        } else {
          setError(`Unexpected error: ${data?.message || status}`);
        }


      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleLogin,
    error,
    isLoading,
  };
};

export default useLogin;

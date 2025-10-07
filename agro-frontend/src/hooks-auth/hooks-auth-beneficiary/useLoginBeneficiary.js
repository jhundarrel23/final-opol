 import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { beneficiaryDetailsService } from '../../api/rsbsaService';

const useLoginBeneficiary = () => {
  const [formData, setFormData] = useState({ username: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Prevent access to login form if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'beneficiary') {
          // Redirect to dashboard
          navigate('/beneficiary/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('Error parsing user from localStorage', err);
        // If invalid, clear storage just in case
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    }
  }, [navigate]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
    setSuccess('');
  }, []);

  const storeAuth = useCallback((token, user) => {
    try {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userRole');
    } catch (err) {
      console.error('Error storing auth:', err);
    }
  }, []);

  // Fetch beneficiary details and RSBSA information
  const fetchBeneficiaryDetails = useCallback(async (userId) => {
    try {
      console.log('🔍 Fetching beneficiary details for user:', userId);
      const result = await beneficiaryDetailsService.getDetailsByUserId(userId);
      
      if (result.success && result.data) {
        const beneficiaryDetails = result.data;
        
        // Store beneficiary ID and RSBSA information
        localStorage.setItem('beneficiaryId', beneficiaryDetails.id);
        localStorage.setItem('beneficiaryDetails', JSON.stringify(beneficiaryDetails));
        
        // Store RSBSA numbers if available
        if (beneficiaryDetails.system_generated_rsbsa_number) {
          localStorage.setItem('rsbsaNumber', beneficiaryDetails.system_generated_rsbsa_number);
        } else if (beneficiaryDetails.manual_rsbsa_number) {
          localStorage.setItem('rsbsaNumber', beneficiaryDetails.manual_rsbsa_number);
        }
        
        console.log('✅ Beneficiary details stored:', {
          beneficiaryId: beneficiaryDetails.id,
          rsbsaNumber: beneficiaryDetails.system_generated_rsbsa_number || beneficiaryDetails.manual_rsbsa_number
        });
        
        return beneficiaryDetails;
      }
      
      console.warn('⚠️ No beneficiary details found for user:', userId);
      return null;
    } catch (err) {
      console.error('❌ Error fetching beneficiary details:', err);
      return null;
    }
  }, []);

  const handleLogin = useCallback(async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const { username, password } = formData;
      if (!username || !password) {
        setError('Username and password are required.');
        return;
      }

      const response = await axiosInstance.post('/api/beneficiary/login', { emailOrUsername: username, password });
      const { token, data: user } = response.data;

      if (!token || !user || user.role !== 'beneficiary') {
        throw new Error('Invalid login or role.');
      }

      storeAuth(token, user);
      
      // Fetch beneficiary details after successful login
      await fetchBeneficiaryDetails(user.id);
      
      setSuccess('Login successful! Redirecting...');

      setTimeout(() => {
        navigate('/beneficiary/dashboard', { replace: true });
      }, 1500);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, storeAuth, navigate, fetchBeneficiaryDetails]);

  return {
    formData,
    setFormData,
    handleChange,
    handleLogin,
    error,
    success,
    isLoading
  };
};

export default useLoginBeneficiary;

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const useSubsidy = () => {
  const [subsidyPrograms, setSubsidyPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);

  const fetchSubsidyPrograms = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError('');
      setNotRegistered(false);

      const response = await axiosInstance.get('/api/subsidy-programs/my-programs');
      
      // Handle successful response
      const programs = response.data.programs?.data || response.data.programs || [];
      setSubsidyPrograms(programs);
      
    } catch (err) {
      console.error('Error fetching subsidy programs:', err);
      
      // Check if it's a 404 error with beneficiary not registered message
      if (err.response?.status === 404 && 
          err.response?.data?.message === 'You are not registered as a beneficiary.') {
        setNotRegistered(true);
        setSubsidyPrograms(err.response.data.programs || []);
        setError('');
      } else {
        // Handle other errors
        const message = err.response?.data?.message || err.message || 'Failed to fetch subsidy programs';
        setError(message);
        setSubsidyPrograms([]);
        setNotRegistered(false);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubsidyPrograms(false);
    setRefreshing(false);
  }, [fetchSubsidyPrograms]);

  const fetchProgramDetails = useCallback(async (programId) => {
    try {
      const response = await axiosInstance.get(`/api/subsidy-programs/my-programs/${programId}`);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404 && 
          err.response?.data?.message === 'You are not registered as a beneficiary.') {
        throw new Error('You are not registered as a beneficiary.');
      }
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch program details');
    }
  }, []);

  useEffect(() => {
    fetchSubsidyPrograms();
  }, [fetchSubsidyPrograms]);

  const totalPrograms = subsidyPrograms.length;
  const hasPrograms = totalPrograms > 0;

  return {
    subsidyPrograms,
    totalPrograms,
    hasPrograms,
    loading,
    refreshing,
    error,
    notRegistered,
    fetchSubsidyPrograms,
    refresh: refresh,
    refetch: fetchSubsidyPrograms, // Alias for refetch
    fetchProgramDetails,
    clearError: () => {
      setError('');
      setNotRegistered(false);
    }
  };
};

export default useSubsidy;
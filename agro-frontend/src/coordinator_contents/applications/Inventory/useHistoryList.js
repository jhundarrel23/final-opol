/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const useHistoryList = (filters = {}) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Helper function to extract array from API response
  const extractDataArray = (responseData) => {
    // If responseData is already an array, return it
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // If responseData is an object, check common API response patterns
    if (responseData && typeof responseData === 'object') {
      // Common patterns for API responses
      const possibleArrayKeys = [
        'data',
        'stocks',
        'results',
        'items',
        'transactions',
        'history',
        'records'
      ];

      for (const key of possibleArrayKeys) {
        if (Array.isArray(responseData[key])) {
          console.log(`Found array data in response.${key}`);
          return responseData[key];
        }
      }

      // Check if it's a paginated response
      if (responseData.data && Array.isArray(responseData.data.data)) {
        console.log('Found paginated array data in response.data.data');
        return responseData.data.data;
      }

      // If it's an object with numeric keys (array-like object)
      const keys = Object.keys(responseData);
      if (keys.length > 0 && keys.every(key => !isNaN(key))) {
        console.log('Converting array-like object to array');
        return Object.values(responseData);
      }
    }

    console.warn('Could not extract array from API response, using empty array. Response data:', responseData);
    return [];
  };

  const fetchHistoryList = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);
        
    try {
      const params = { ...filtersRef.current, ...customFilters };
      
      console.log('Fetching history with params:', params);
      const response = await axiosInstance.get('/api/inventory/stocks', { params });
      
      console.log('Raw API response:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data is array:', Array.isArray(response.data));

      const extractedData = extractDataArray(response.data);
      console.log('Extracted data:', extractedData);
      console.log('Extracted data length:', extractedData.length);

      setHistoryData(extractedData);
      return extractedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch transaction history';
      setError(errorMessage);
      console.error('Error fetching history:', err);
      
      // Set empty array on error to prevent prop type warnings
      setHistoryData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []); 

  const refreshHistory = useCallback(() => {
    return fetchHistoryList();
  }, [fetchHistoryList]);

  useEffect(() => {
    fetchHistoryList();
  }, []); 

  return {
    historyData,
    loading,
    error,
    fetchHistoryList,
    refreshHistory
  };
};

export default useHistoryList;
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const useFarmInformation = (userId) => {
  const [farmParcels, setFarmParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFarmInformation = useCallback(async (showLoading = true) => {
    if (!userId) {
      setError('User ID is required');
      console.warn(' No userId provided to useFarmInformation hook');
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError('');

      console.log(`📡 Fetching farm information for userId: ${userId}...`);

      const response = await axiosInstance.get(`/api/rsbsa/farm-parcels/user/${userId}`);

      console.log('✅ Raw API response:', response.data);

      if (response.data?.success) {
        const fetchedData = response.data.data || [];
        console.log(' Farm parcels fetched:', fetchedData);
        setFarmParcels(fetchedData);
      } else {
        const msg = response.data?.message || 'Failed to fetch farm information';
        console.error(' API returned error:', msg);
        setError(msg);
        setFarmParcels([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to fetch farm information';
      console.error('🚨 Error fetching farm information:', err);
      setError(errorMessage);
      setFarmParcels([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing farm information...');
    setRefreshing(true);
    await fetchFarmInformation(false);
    setRefreshing(false);
  }, [fetchFarmInformation]);


  useEffect(() => {
    if (userId) {
      console.log('👤 userId changed or mounted, fetching data...');
      fetchFarmInformation();
    } else {
      console.log('⚠️ No userId, clearing farm parcels');
      setFarmParcels([]);
      setError('');
    }
  }, [userId, fetchFarmInformation]);


  const totalArea = farmParcels.reduce((sum, parcel) => 
    sum + (Number(parcel.total_farm_area) || 0), 0
  );

  const totalCommodities = farmParcels.reduce((sum, parcel) => 
    sum + ((parcel.commodities || []).length), 0
  );

  const hasData = farmParcels.length > 0;

  return {

    farmParcels,
    totalArea,
    totalCommodities,
    hasData,
    

    loading,
    error,
    refreshing,
    
  
    fetchFarmInformation,
    refresh,
    

    clearError: () => setError('')
  };
};

export default useFarmInformation;

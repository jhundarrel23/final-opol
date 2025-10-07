import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

function useSectors() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Uniform error handling */
  const handleRequest = useCallback(async (requestFn) => {
    try {
      const response = await requestFn();
      return { data: response.data, error: null };
    } catch (err) {
      console.error('API error:', err);
      return { data: null, error: err.response?.data?.message || err.message };
    }
  }, []);

  /** Fetch all active sectors */
  const fetchSectors = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await handleRequest(() =>
      axiosInstance.get('api/sectors')
    );

    if (error) setError(error);
    if (data) setSectors(data);

    setLoading(false);
  }, [handleRequest]);

  /** Get sector summary with coordinator and beneficiary counts */
  const getSectorSummary = useCallback(
    () => handleRequest(() => axiosInstance.get('api/sectors/summary')),
    [handleRequest]
  );

  /** Get coordinators and their beneficiaries for a specific sector */
  const getCoordinatorsWithBeneficiaries = useCallback(
    (sectorId) =>
      handleRequest(() =>
        axiosInstance.get(`api/sectors/${sectorId}/coordinators-beneficiaries`)
      ),
    [handleRequest]
  );

  /** Get all sectors including soft-deleted */
  const getAllWithTrashed = useCallback(
    () => handleRequest(() => axiosInstance.get('api/sectors/with-trashed')),
    [handleRequest]
  );

  /** Check if sector name exists */
  const checkName = useCallback(
    (name) =>
      handleRequest(() =>
        axiosInstance.get('api/sectors/check-name', { params: { name } })
      ),
    [handleRequest]
  );

  /** Create new sector */
  const createSector = useCallback(
    (payload) => handleRequest(() => axiosInstance.post('api/sectors', payload)),
    [handleRequest]
  );

  /** Get single sector by ID */
  const getSector = useCallback(
    (id) => handleRequest(() => axiosInstance.get(`api/sectors/${id}`)),
    [handleRequest]
  );

  /** Update sector */
  const updateSector = useCallback(
    (id, payload) =>
      handleRequest(() => axiosInstance.put(`api/sectors/${id}`, payload)),
    [handleRequest]
  );

  /** Soft delete sector */
  const deleteSector = useCallback(
    (id) => handleRequest(() => axiosInstance.delete(`api/sectors/${id}`)),
    [handleRequest]
  );

  /** Restore soft-deleted sector */
  const restoreSector = useCallback(
    (id) => handleRequest(() => axiosInstance.post(`api/sectors/${id}/restore`)),
    [handleRequest]
  );

  /** Initial fetch on mount */
  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return {
    // State
    sectors,
    loading,
    error,

    // Core methods
    fetchSectors,
    getSectorSummary,
    getCoordinatorsWithBeneficiaries,

    // CRUD
    createSector,
    getSector,
    updateSector,
    deleteSector,
    restoreSector,

    // Utility
    getAllWithTrashed,
    checkName,
  };
}

export default useSectors;

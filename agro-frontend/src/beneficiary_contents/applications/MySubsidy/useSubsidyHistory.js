/* eslint-disable consistent-return */
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const useSubsidyHistory = () => {
  const [subsidyHistory, setSubsidyHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });

  const getBeneficiaryValue = (program, field) => {
    return program.items_summary?.[field] || 0;
  };

  const parseHistory = (history) => {
    if (!history) return;

    if (history.data && Array.isArray(history.data)) {
      setSubsidyHistory(history.data);
      setPagination({
        current_page: history.current_page || 1,
        per_page: history.per_page || 10,
        total: history.total || 0,
        last_page: history.last_page || 1
      });
      return;
    }

    if (Array.isArray(history)) {
      setSubsidyHistory(history);
      setPagination((p) => ({
        ...p,
        total: history.length,
        last_page: 1,
        current_page: 1
      }));
      return;
    }

    setSubsidyHistory([]);
    setPagination((p) => ({ ...p, total: 0, last_page: 1, current_page: 1 }));
  };

  const fetchSubsidyHistory = useCallback(async (showLoading = true, params = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.page) queryParams.append('page', params.page);
      if (params.search) queryParams.append('search', params.search);

      const url = `/api/subsidy-programs/my-beneficiary-subsidy-history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await axiosInstance.get(url);
      parseHistory(response.data?.history ?? response.data?.data ?? response.data ?? []);
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        parseHistory([]);
        setError('API endpoint not found. Please verify the route exists.');
        return;
      }

      const message = err.response?.data?.message || err.message || 'Failed to fetch subsidy history';
      setError(message);
      setSubsidyHistory([]);
      setPagination((p) => ({ ...p, total: 0, last_page: 1, current_page: 1 }));
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async (params = {}) => {
    setRefreshing(true);
    try {
      await fetchSubsidyHistory(false, params);
    } finally {
      setRefreshing(false);
    }
  }, [fetchSubsidyHistory]);

  const loadPage = useCallback(async (page, params = {}) => {
    await fetchSubsidyHistory(true, { ...params, page });
  }, [fetchSubsidyHistory]);

  const filterByStatus = useCallback(async (status, resetPage = true) => {
    const params = { status };
    if (resetPage) params.page = 1;
    await fetchSubsidyHistory(true, params);
  }, [fetchSubsidyHistory]);

  const changePerPage = useCallback(async (perPage) => {
    await fetchSubsidyHistory(true, { per_page: perPage, page: 1 });
  }, [fetchSubsidyHistory]);

  const searchHistory = useCallback(async (searchTerm, params = {}) => {
    await fetchSubsidyHistory(true, { ...params, search: searchTerm, page: 1 });
  }, [fetchSubsidyHistory]);

  useEffect(() => {
    fetchSubsidyHistory();
  }, [fetchSubsidyHistory]);

  const totalHistory = subsidyHistory.length;
  const hasHistory = totalHistory > 0;
  const completedPrograms = subsidyHistory.filter(p => p.status === 'completed').length;
  const cancelledPrograms = subsidyHistory.filter(p => p.status === 'cancelled').length;

  const totalValueReceived = subsidyHistory.reduce(
    (sum, p) => sum + getBeneficiaryValue(p, 'total_value'),
    0
  );
  
  const totalItemsReceived = subsidyHistory.reduce(
    (sum, p) => sum + getBeneficiaryValue(p, 'total_items'),
    0
  );

  const programStats = {
    total: totalHistory,
    completed: completedPrograms,
    cancelled: cancelledPrograms,
    totalValue: totalValueReceived,
    totalItems: totalItemsReceived,
    averageValuePerProgram: totalHistory > 0 ? Math.round(totalValueReceived / totalHistory) : 0
  };

  return {
    subsidyHistory,
    pagination,
    programStats,
    loading,
    refreshing,
    error,
    hasHistory,
    totalHistory,
    fetchSubsidyHistory,
    refresh,
    loadPage,
    filterByStatus,
    changePerPage,
    searchHistory,
    clearError: () => setError(''),
    resetPagination: () => setPagination({ current_page: 1, per_page: 10, total: 0, last_page: 1 })
  };
};

export default useSubsidyHistory;
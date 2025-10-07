/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';

// API Endpoints
const SERVICE_CATALOGS_ENDPOINT = '/api/service-catalogs';
const SERVICE_EVENTS_ENDPOINT = '/api/service-events';
const BENEFICIARIES_ENDPOINT = '/api/rsbsa/coordinator-beneficiaries/my-beneficiaries'; // From your api.php
const INVENTORY_STOCKS_ENDPOINT = '/api/inventory-stocks';

// Helper to extract array from response (handles {data: []} or direct [])
const extractDataArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (responseData && typeof responseData === 'object') {
    const keys = ['data', 'events', 'results', 'items', 'records', 'beneficiaries', 'stocks', 'catalogs'];
    for (const key of keys) {
      if (Array.isArray(responseData[key])) return responseData[key];
    }
    if (responseData.data && Array.isArray(responseData.data.data)) return responseData.data.data;
  }
  return [];
};

// Service Catalogs
export const useServiceCatalogs = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCatalogs = useCallback(async (customFilters = {}) => {
    setLoading(true); setError(null);
    try {
      const params = { ...filters, ...customFilters };
      const response = await axiosInstance.get(SERVICE_CATALOGS_ENDPOINT, { params });
      const extracted = extractDataArray(response.data);
      setData(extracted);
      return extracted;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch catalogs';
      setError(msg); setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchCatalogs(); }, [fetchCatalogs]);

  const refresh = () => fetchCatalogs();
  return { data, loading, error, refresh, fetchCatalogs };
};

export const useCreateServiceCatalog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCatalog = useCallback(async (data) => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.post(SERVICE_CATALOGS_ENDPOINT, data);
      return response.data.data || response.data;
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.message || 'Failed to create catalog';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCatalog, loading, error };
};

export const useUpdateServiceCatalog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCatalog = useCallback(async (id, data) => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.put(`${SERVICE_CATALOGS_ENDPOINT}/${id}`, data);
      return response.data.data || response.data;
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.message || 'Failed to update catalog';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateCatalog, loading, error };
};

export const useDeleteServiceCatalog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteCatalog = useCallback(async (id) => {
    setLoading(true); setError(null);
    try {
      await axiosInstance.delete(`${SERVICE_CATALOGS_ENDPOINT}/${id}`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete catalog';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteCatalog, loading, error };
};

// Service Events
export const useServiceEvents = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async (customFilters = {}) => {
    setLoading(true); setError(null);
    try {
      const params = { ...filters, ...customFilters };
      const response = await axiosInstance.get(SERVICE_EVENTS_ENDPOINT, { params });
      const extracted = extractDataArray(response.data);
      setData(extracted);
      return extracted;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch events';
      setError(msg); setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const refresh = () => fetchEvents();
  return { data, loading, error, refresh, fetchEvents };
};

export const useCreateServiceEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createEvent = useCallback(async (data) => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.post(SERVICE_EVENTS_ENDPOINT, data);
      return response.data.data || response.data;
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.message || 'Failed to create event';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createEvent, loading, error };
};

export const useUpdateServiceEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateEvent = useCallback(async (id, data) => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.put(`${SERVICE_EVENTS_ENDPOINT}/${id}`, data);
      return response.data.data || response.data;
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.message || 'Failed to update event';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateEvent, loading, error };
};

export const useDeleteServiceEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteEvent = useCallback(async (id) => {
    setLoading(true); setError(null);
    try {
      await axiosInstance.delete(`${SERVICE_EVENTS_ENDPOINT}/${id}`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete event';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteEvent, loading, error };
};

// Beneficiaries for Events
export const useCreateBeneficiary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBeneficiary = useCallback(async (eventId, data) => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.post(`${SERVICE_EVENTS_ENDPOINT}/${eventId}/beneficiaries`, data);
      return response.data.data || response.data;
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.message || 'Failed to add beneficiary';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBeneficiary = useCallback(async (eventId, beneficiaryId) => {
    setLoading(true); setError(null);
    try {
      await axiosInstance.delete(`${SERVICE_EVENTS_ENDPOINT}/${eventId}/beneficiaries/${beneficiaryId}`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete beneficiary';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBeneficiary, deleteBeneficiary, loading, error };
};

// Stocks for Events
export const useCreateServiceEventStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStock = useCallback(async (eventId, data) => {
    setLoading(true); setError(null);
    try {
      const response = await axiosInstance.post(`${SERVICE_EVENTS_ENDPOINT}/${eventId}/stocks`, data);
      return response.data.data || response.data;
    } catch (err) {
      const msg = err.response?.data?.errors || err.response?.data?.message || 'Failed to link stock';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStock = useCallback(async (eventId, stockId) => {
    setLoading(true); setError(null);
    try {
      await axiosInstance.delete(`${SERVICE_EVENTS_ENDPOINT}/${eventId}/stocks/${stockId}`);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to unlink stock';
      setError(msg); throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createStock, deleteStock, loading, error };
};

// Beneficiaries List (for selection)
export const useBeneficiaries = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBeneficiaries = useCallback(async (customFilters = {}) => {
    setLoading(true); setError(null);
    try {
      const params = { ...filters, ...customFilters };
      const response = await axiosInstance.get(BENEFICIARIES_ENDPOINT, { params });
      const extracted = extractDataArray(response.data);
      setData(extracted);
      return extracted;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch beneficiaries';
      setError(msg); setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchBeneficiaries(); }, [fetchBeneficiaries]);

  const refresh = () => fetchBeneficiaries();
  return { data, loading, error, refresh, fetchBeneficiaries };
};

// Inventory Stocks (for selection)
export const useInventoryStocks = (filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStocks = useCallback(async (customFilters = {}) => {
    setLoading(true); setError(null);
    try {
      const params = { ...filters, ...customFilters };
      const response = await axiosInstance.get(INVENTORY_STOCKS_ENDPOINT, { params });
      const extracted = extractDataArray(response.data);
      setData(extracted);
      return extracted;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch stocks';
      setError(msg); setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  const refresh = () => fetchStocks();
  return { data, loading, error, refresh, fetchStocks };
};
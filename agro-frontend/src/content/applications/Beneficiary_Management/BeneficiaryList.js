// BeneficiaryList.jsx
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-alert */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CircularProgress, 
  Box, 
  Typography, 
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axiosInstance from '../../../api/axiosInstance';
import BeneficiaryTable from './BeneficiaryTable';
import UserProfileModal from './UserProfileModal';

function BeneficiaryList({ onDataUpdate, onEditBeneficiary }) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    barangays: [],
    roles: [],
    statuses: [],
    genders: []
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/admin/filter-options');
      if (response.data?.success) {
        setFilterOptions(response.data.data || { barangays: [], roles: [], statuses: [], genders: [] });
      }
    } catch {
      // silently ignore filter options failure
    }
  }, []);

  const fetchBeneficiaries = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');

    try {
      const queryParams = {
        per_page: pagination.per_page,
        page: pagination.current_page,
        ...filters,
        ...params
      };

      Object.keys(queryParams).forEach((key) => {
        if (!queryParams[key] || queryParams[key] === 'all') delete queryParams[key];
      });

      const response = await axiosInstance.get('/api/admin/users', { params: queryParams });

      if (response.data?.success && response.data.data) {
        const paginatedData = response.data.data;

        setBeneficiaries(paginatedData.data || []);
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 15,
          total: paginatedData.total || 0
        });

        onDataUpdate?.();
      } else {
        setError('Invalid response format from server');
        setBeneficiaries([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      }
    } catch (err) {
      let errorMessage = 'An error occurred while fetching users';
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      setError(errorMessage);
      setBeneficiaries([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page, pagination.current_page, onDataUpdate]);

  useEffect(() => {
    fetchFilterOptions();
    fetchBeneficiaries();
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchBeneficiaries({ ...newFilters, page: 1 });
  }, [fetchBeneficiaries]);

  const handlePaginationChange = useCallback((newPage, newPerPage) => {
    const updates = { page: newPage };
    if (newPerPage && newPerPage !== pagination.per_page) {
      updates.per_page = newPerPage;
    }
    setPagination((prev) => ({
      ...prev,
      current_page: newPage,
      ...(newPerPage && { per_page: newPerPage })
    }));
    fetchBeneficiaries(updates);
  }, [fetchBeneficiaries, pagination.per_page]);

  const handleRefresh = () => {
    fetchBeneficiaries();
  };

  const handleEdit = (beneficiary) => {
    if (onEditBeneficiary) {
      onEditBeneficiary(beneficiary);
    } else {
      setSnackbar({
        open: true,
        message: `Edit functionality for ${beneficiary.fname} ${beneficiary.lname} not implemented yet`,
        severity: 'info'
      });
    }
  };

  const handleStatusToggle = async (beneficiary) => {
    const currentStatus = beneficiary.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmToggle = window.confirm(
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} ${beneficiary.fname} ${beneficiary.lname}?`
    );
    if (!confirmToggle) return;

    try {
      const response = await axiosInstance.patch(`/api/admin/users/${beneficiary.id}/toggle-status`);
      if (response.data?.success) {
        setSnackbar({
          open: true,
          message: `${beneficiary.fname} ${beneficiary.lname} has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
          severity: 'success'
        });
        fetchBeneficiaries();
      } else {
        throw new Error(response.data?.message || 'Failed to update status');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to update user status: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleViewProfile = (beneficiary) => {
    setSelectedUserId(beneficiary.id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUserId(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Derived totals from current page (fallback if backend summary is unavailable)
  const derivedTotals = useMemo(() => {
    const total = pagination.total || beneficiaries.length;
    const beneficiariesCount = beneficiaries.filter((u) => u.role === 'beneficiary').length;
    const coordinatorsCount = beneficiaries.filter((u) => u.role === 'coordinator').length;
    const active = beneficiaries.filter((u) => u.status === 'active').length;
    const inactive = beneficiaries.filter((u) => u.status === 'inactive').length;
    const suspended = beneficiaries.filter((u) => u.status === 'suspended').length;
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;
    return { total, beneficiaries: beneficiariesCount, coordinators: coordinatorsCount, active, inactive, suspended, activeRate };
  }, [beneficiaries, pagination.total]);

  if (loading && beneficiaries.length === 0) {
    return (
      <Card sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading users...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (error && beneficiaries.length === 0) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Error loading users:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Alert>
      </Card>
    );
  }

  return (
    <>
      <BeneficiaryTable
        beneficiaries={beneficiaries}
        onEdit={handleEdit}
        onStatusToggle={handleStatusToggle}
        onViewProfile={handleViewProfile}
        onFiltersChange={handleFiltersChange}
        onPaginationChange={handlePaginationChange}
        filterOptions={filterOptions}
        pagination={pagination}
        loading={loading}
        onRefresh={handleRefresh}
        totals={derivedTotals}
      />

      <UserProfileModal
        open={modalOpen}
        onClose={handleCloseModal}
        userId={selectedUserId}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default BeneficiaryList;
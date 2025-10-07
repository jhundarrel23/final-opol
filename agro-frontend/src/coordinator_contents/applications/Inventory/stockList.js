/* eslint-disable no-alert */

import { useState, useEffect } from 'react';
import {
  Card,
  CircularProgress,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import axiosInstance from '../../../api/axiosInstance';
import InventoryStockTable from './InventoryStockTable';
import AddStockModal from './AddStockModal';

function StockList() {
  console.log('StockList component rendered'); // Debug log

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    movement_type: 'all',
    transaction_type: 'all',
    status: 'all',
    is_verified: 'all'
  });

  const movementTypeOptions = [
    { id: 'all', name: 'All Movements' },
    { id: 'stock_in', name: 'Stock In' },
    { id: 'stock_out', name: 'Stock Out' },
    { id: 'adjustment', name: 'Adjustment' },
    { id: 'transfer', name: 'Transfer' },
    { id: 'distribution', name: 'Distribution' }
  ];

  const transactionTypeOptions = [
    { id: 'all', name: 'All Transaction Types' },
    { id: 'purchase', name: 'Purchase' },
    { id: 'grant', name: 'Grant' },
    { id: 'return', name: 'Return' },
    { id: 'distribution', name: 'Distribution' },
    { id: 'damage', name: 'Damage' },
    { id: 'expired', name: 'Expired' },
    { id: 'transfer_in', name: 'Transfer In' },
    { id: 'transfer_out', name: 'Transfer Out' },
    { id: 'adjustment', name: 'Adjustment' },
    { id: 'initial_stock', name: 'Initial Stock' }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Status' },
    { id: 'pending', name: 'Pending' },
    { id: 'approved', name: 'Approved' },
    { id: 'completed', name: 'Completed' },
    { id: 'rejected', name: 'Rejected' }
  ];

  const verificationOptions = [
    { id: 'all', name: 'All Records' },
    { id: 'verified', name: 'Verified' },
    { id: 'unverified', name: 'Unverified' }
  ];

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/inventory/stocks');
      console.log('✅ Stock API Response:', response.data);
      const data = response.data.data ? response.data.data : response.data;
      setStocks(data);
    } catch (err) {
      console.error('❌ Error fetching stocks:', err);
      setError(
        err.response?.data?.error ||
        err.response?.statusText ||
        'Failed to fetch stock records'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleFilterChange = (filterType) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: event.target.value
    }));
  };

  const applyFilters = (stocks, filters) => {
    return stocks.filter((stock) => {
      if (filters.movement_type !== 'all' && stock.movement_type !== filters.movement_type) return false;
      if (filters.transaction_type !== 'all' && stock.transaction_type !== filters.transaction_type) return false;
      if (filters.status !== 'all' && stock.status !== filters.status) return false;
      if (filters.is_verified !== 'all') {
        const isVerified = filters.is_verified === 'verified';
        if (stock.is_verified !== isVerified) return false;
      }
      return true;
    });
  };

  const handleEdit = (stock) => {
    console.log('Edit stock:', stock);
    setSelectedStock(stock);
    setEditModalOpen(true);
  };

  const handleEditStockSubmit = async (updatedStock) => {
    try {
      const response = await axiosInstance.put(`/api/inventory/stocks/${updatedStock.id}`, updatedStock);
      console.log('✅ Stock Record Updated:', response.data);
      setStocks((prev) =>
        prev.map((s) => (s.id === updatedStock.id ? response.data.data : s))
      );
      setEditModalOpen(false);
      setSelectedStock(null);
      setNotification({ open: true, message: response.data.message || 'Stock updated successfully', severity: 'success' });
    } catch (err) {
      console.error('❌ Error updating stock:', err);
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to update stock',
        severity: 'error'
      });
    }
  };

  const handleVerify = async (stock) => {
    try {
      const response = await axiosInstance.put(`/api/inventory/stocks/${stock.id}/verify`);
      console.log('✅ Stock verified successfully:', response.data);
      setStocks((prev) =>
        prev.map((s) => (s.id === stock.id ? { ...s, is_verified: true, verified_by: response.data.data.verified_by } : s))
      );
      setNotification({ open: true, message: response.data.message || 'Stock verified successfully', severity: 'success' });
    } catch (err) {
      console.error('❌ Error verifying stock:', err);
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to verify stock',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (stock) => {
    if (window.confirm('Are you sure you want to delete this stock record?')) {
      try {
        const response = await axiosInstance.delete(`/api/inventory/stocks/${stock.id}`);
        console.log('✅ Stock deleted successfully:', response.data);
        setStocks((prev) => prev.filter((s) => s.id !== stock.id));
        setNotification({ open: true, message: response.data.message || 'Stock deleted successfully', severity: 'success' });
      } catch (err) {
        console.error('❌ Error deleting stock:', err);
        setNotification({
          open: true,
          message: err.response?.data?.error || 'Failed to delete stock',
          severity: 'error'
        });
      }
    }
  };

  const handleAddStock = () => {
    console.log('Add Stock button clicked');
    setAddModalOpen(true);
  };

  const handleAddStockSubmit = async (newStock) => {
    try {
      const response = await axiosInstance.post('/api/inventory/stocks', newStock);
      console.log('✅ Stock Record Created:', response.data);
      setStocks((prev) => [response.data.data, ...prev]);
      setAddModalOpen(false);
      setNotification({ open: true, message: response.data.message || 'Stock created successfully', severity: 'success' });
    } catch (err) {
      console.error('❌ Error creating stock:', err);
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to create stock',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const filteredStocks = applyFilters(stocks, filters);

  if (loading) {
    return (
      <Card sx={{ p: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={fetchStocks}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {console.log('Rendering StockList JSX')}
      
      {/* Filter Controls with Add Button */}
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{
          mb: 2,
          p: 2,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          width: '100%',
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}
      >
        <Box display="flex" gap={2} alignItems="center" sx={{ flexWrap: 'wrap', flex: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Movement Type</InputLabel>
            <Select
              value={filters.movement_type}
              onChange={handleFilterChange('movement_type')}
              label="Movement Type"
            >
              {movementTypeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={filters.transaction_type}
              onChange={handleFilterChange('transaction_type')}
              label="Transaction Type"
            >
              {transactionTypeOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange('status')}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Verification</InputLabel>
            <Select
              value={filters.is_verified}
              onChange={handleFilterChange('is_verified')}
              label="Verification"
            >
              {verificationOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddTwoToneIcon fontSize="small" />}
          onClick={handleAddStock}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '150px',
            whiteSpace: 'nowrap'
          }}
        >
          Add New Transaction
        </Button>
      </Box>

      {/* Records count */}
      <Box sx={{ mb: 2, px: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Stock Records ({filteredStocks.length} records found)
        </Typography>
      </Box>

      {/* Stock Table */}
      <InventoryStockTable
        stocks={filteredStocks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onVerify={handleVerify}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddStockSubmit}
        title="Add New Stock Transaction"
      />

      {/* Edit Stock Modal */}
      <AddStockModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStock(null);
        }}
        onSubmit={handleEditStockSubmit}
        title="Edit Stock Transaction"
        initialData={selectedStock}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StockList;
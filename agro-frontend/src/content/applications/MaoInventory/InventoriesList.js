/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Alert,
  Button,
  Snackbar,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  FilterList,
  TrendingUp,
  TrendingDown,
  Warning
} from '@mui/icons-material';
import axiosInstance from '../../../api/axiosInstance';
import InventoryTable from './InventoryTable';

function InventoriesList({ onViewTransactions, onEdit, onDelete, onAddStock }) {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInventories = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get('/api/inventory/items');
      // Handle the Laravel API response structure
      const inventoryData = response.data || [];
      
      if (Array.isArray(inventoryData)) {
        console.log('Inventory data:', inventoryData); // Debug log to see the data structure
        setInventories(inventoryData);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('Error fetching inventories:', err);
      
      let errorMessage = 'Failed to load inventory data';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  // Filtered and computed data - updated to use the correct API fields
  const filteredInventories = useMemo(() => {
    return inventories.filter(item => {
      const matchesSearch = !searchTerm || 
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toString().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || item.assistance_category === categoryFilter;
      const matchesType = !typeFilter || item.item_type === typeFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'low_stock') {
        // Consider low stock as having less than 10 units available
        matchesStatus = (item.available || 0) <= 10 && (item.available || 0) > 0;
      } else if (statusFilter === 'out_of_stock') {
        matchesStatus = (item.on_hand || 0) === 0;
      } else if (statusFilter === 'reserved') {
        matchesStatus = (item.reserved || 0) > 0;
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [inventories, searchTerm, categoryFilter, typeFilter, statusFilter]);

  // Updated stats calculation to use your backend data structure
  const stats = useMemo(() => {
    const total = inventories.length;
    const outOfStock = inventories.filter(item => (item.on_hand || 0) === 0).length;
    const lowStock = inventories.filter(item => 
      (item.available || 0) <= 10 && (item.available || 0) > 0
    ).length;
    const totalOnHand = inventories.reduce((sum, item) => 
      sum + ((item.on_hand || 0) * (item.unit_value || 0)), 0
    );
    const totalReserved = inventories.reduce((sum, item) => 
      sum + ((item.reserved || 0) * (item.unit_value || 0)), 0
    );
    const totalAvailable = inventories.reduce((sum, item) => 
      sum + ((item.available || 0) * (item.unit_value || 0)), 0
    );
    
    return { 
      total, 
      lowStock, 
      outOfStock, 
      totalOnHand, 
      totalReserved, 
      totalAvailable 
    };
  }, [inventories]);

  const handleRefresh = () => {
    fetchInventories();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading inventory data...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                <Refresh sx={{ mr: 1 }} />
                Retry
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Error loading inventory:</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Quick Stats - Updated for your data structure */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h6" color="primary.main">
                      {stats.total}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Items
                    </Typography>
                    <Typography variant="h6">
                      {stats.total}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'warning.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Warning color="warning" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Low Available
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {stats.lowStock}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'error.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrendingDown color="error" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Out of Stock
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {stats.outOfStock}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: 'success.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrendingUp color="success" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Available Value
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ₱{stats.totalAvailable.toLocaleString('en-PH', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, Item ID, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="aid">aid</MenuItem>
                    <MenuItem value="monetary">Monetary</MenuItem>
                    <MenuItem value="service">Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="seed">Seed</MenuItem>
                    <MenuItem value="fertilizer">Fertilizer</MenuItem>
                    <MenuItem value="pesticide">Pesticide</MenuItem>
                    <MenuItem value="equipment">Equipment</MenuItem>
                    <MenuItem value="fuel">Fuel</MenuItem>
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="low_stock">Low Available</MenuItem>
                    <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                    <MenuItem value="reserved">Has Reserved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterList />}
                    onClick={handleClearFilters}
                    fullWidth
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleRefresh}
                  >
                    <Refresh />
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Active Filters Display */}
            {(searchTerm || categoryFilter || typeFilter || statusFilter) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Active filters:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {searchTerm && (
                    <Chip
                      label={`Search: "${searchTerm}"`}
                      size="small"
                      onDelete={() => setSearchTerm('')}
                    />
                  )}
                  {categoryFilter && (
                    <Chip
                      label={`Category: ${categoryFilter}`}
                      size="small"
                      onDelete={() => setCategoryFilter('')}
                    />
                  )}
                  {typeFilter && (
                    <Chip
                      label={`Type: ${typeFilter}`}
                      size="small"
                      onDelete={() => setTypeFilter('')}
                    />
                  )}
                  {statusFilter && (
                    <Chip
                      label={`Status: ${statusFilter.replace('_', ' ')}`}
                      size="small"
                      onDelete={() => setStatusFilter('')}
                    />
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <InventoryTable
          inventories={filteredInventories}
          onViewTransactions={onViewTransactions}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddStock={onAddStock}
        />

        {/* Floating Action Button */}
        <Tooltip title="Add New Item">
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000
            }}
            onClick={() => showSnackbar('Add new item functionality coming soon', 'info')}
          >
            <Add />
          </Fab>
        </Tooltip>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

InventoriesList.propTypes = {
  onViewTransactions: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onAddStock: PropTypes.func
};

InventoriesList.defaultProps = {
  onViewTransactions: null,
  onEdit: null,
  onDelete: null,
  onAddStock: null,
};

export default InventoriesList;
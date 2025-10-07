/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardHeader,
  Typography,
  Alert,
  Button,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider
} from '@mui/material';
import {
  Refresh,
  Clear,
  Search,
  FilterList,
  Download,
  Print,
  TrendingUp,
  TrendingDown,
  SwapHoriz
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axiosInstance from '../../../api/axiosInstance';
import StockTransactionsTable from './StockTransactionsTable';

// Helper function to determine movement type from transaction type
const determineMovementType = (transactionType) => {
  const stockInTypes = ['purchase', 'grant', 'return', 'transfer_in', 'initial_stock'];
  const stockOutTypes = ['distribution', 'damage', 'expired', 'transfer_out'];
  
  if (stockInTypes.includes(transactionType)) {
    return 'stock_in';
  } if (stockOutTypes.includes(transactionType)) {
    return 'stock_out';
  } 
    return 'adjustment';
  
};

function StockTransactionsList({ selectedInventory, onClearSelection }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = '/api/inventory/stocks';
      const params = new URLSearchParams();
      
      // Add filters as query parameters
      if (selectedInventory) {
        params.append('inventory_id', selectedInventory.id);
      }
      if (movementTypeFilter) {
        params.append('movement_type', movementTypeFilter);
      }
      if (transactionTypeFilter) {
        params.append('transaction_type', transactionTypeFilter);
      }
      if (dateFrom) {
        params.append('date_from', dateFrom.toISOString().split('T')[0]);
      }
      if (dateTo) {
        params.append('date_to', dateTo.toISOString().split('T')[0]);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(url);
      const transactionData = response.data.data || response.data;
      
      if (Array.isArray(transactionData)) {
        // Sort by transaction date descending
        const sortedTransactions = transactionData.sort((a, b) => 
          new Date(b.transaction_date) - new Date(a.transaction_date)
        );
        setTransactions(sortedTransactions);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('Error fetching stock transactions:', err);
      
      let errorMessage = 'Failed to load stock transactions';
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
    fetchTransactions();
  }, [selectedInventory, movementTypeFilter, transactionTypeFilter, dateFrom, dateTo, statusFilter]);

  // Filtered transactions based on search term
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    
    return transactions.filter(transaction =>
      transaction.inventory?.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  // Transaction statistics with proper movement type detection
  const stats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    
    const stockInCount = filteredTransactions.filter(t => {
      const actualMovementType = t.movement_type || determineMovementType(t.transaction_type);
      return actualMovementType === 'stock_in' || 
             ['purchase', 'grant', 'return', 'transfer_in', 'initial_stock'].includes(t.transaction_type);
    }).length;
    
    const stockOutCount = filteredTransactions.filter(t => {
      const actualMovementType = t.movement_type || determineMovementType(t.transaction_type);
      return actualMovementType === 'stock_out' || 
             ['distribution', 'damage', 'expired', 'transfer_out'].includes(t.transaction_type);
    }).length;
    
    const totalValue = filteredTransactions.reduce((sum, t) => sum + (parseFloat(t.total_value) || 0), 0);
    
    return { totalTransactions, stockInCount, stockOutCount, totalValue };
  }, [filteredTransactions]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setMovementTypeFilter('');
    setTransactionTypeFilter('');
    setDateFrom(null);
    setDateTo(null);
    setStatusFilter('');
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleExport = () => {
    showSnackbar('Export functionality coming soon', 'info');
  };

  if (loading) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading stock transactions...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              <Refresh sx={{ mr: 1 }} />
              Retry
            </Button>
          }
          sx={{ m: 2 }}
        >
          <Typography variant="body2">
            <strong>Error loading transactions:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Alert>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <Card variant="outlined" sx={{ mb: 3, mt: 3, mx: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Stock Transactions
                </Typography>
                {selectedInventory && (
                  <Chip
                    label={`${selectedInventory.item_name}`}
                    variant="outlined"
                    color="primary"
                    size="small"
                    onDelete={onClearSelection}
                    deleteIcon={<Clear />}
                    sx={{ fontWeight: 500 }}
                  />
                )}
              </Box>
            }
            subheader={`${filteredTransactions.length} transactions found`}
            action={
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleExport}
                  startIcon={<Download />}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefresh}
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </Box>
            }
          />
        </Card>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3, mx: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
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
                  <SwapHoriz color="primary" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.totalTransactions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
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
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                    {stats.stockInCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock In
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
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
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                    {stats.stockOutCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Stock Out
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>₱</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    ₱{stats.totalValue.toLocaleString('en-PH', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card variant="outlined" sx={{ mb: 3, mx: 3, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Filters & Search
            </Typography>
            <Grid container spacing={2} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search transactions..."
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

              {/* Movement Type Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Movement</InputLabel>
                  <Select
                    value={movementTypeFilter}
                    onChange={(e) => setMovementTypeFilter(e.target.value)}
                    label="Movement"
                  >
                    <MenuItem value="">All Movements</MenuItem>
                    <MenuItem value="stock_in">Stock In</MenuItem>
                    <MenuItem value="stock_out">Stock Out</MenuItem>
                    <MenuItem value="adjustment">Adjustment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Transaction Type Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={transactionTypeFilter}
                    onChange={(e) => setTransactionTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="purchase">Purchase</MenuItem>
                    <MenuItem value="grant">Grant</MenuItem>
                    <MenuItem value="distribution">Distribution</MenuItem>
                    <MenuItem value="damage">Damage</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                    <MenuItem value="return">Return</MenuItem>
                    <MenuItem value="transfer_in">Transfer In</MenuItem>
                    <MenuItem value="transfer_out">Transfer Out</MenuItem>
                    <MenuItem value="adjustment">Adjustment</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Range */}
              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="From Date"
                  value={dateFrom}
                  onChange={setDateFrom}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <DatePicker
                  label="To Date"
                  value={dateTo}
                  onChange={setDateTo}
                  renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                />
              </Grid>
            </Grid>

            {/* Filter Actions */}
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterList />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Box>

            {/* Active Filters Display */}
            {(searchTerm || movementTypeFilter || transactionTypeFilter || dateFrom || dateTo) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
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
                    {movementTypeFilter && (
                      <Chip
                        label={`Movement: ${movementTypeFilter}`}
                        size="small"
                        onDelete={() => setMovementTypeFilter('')}
                      />
                    )}
                    {transactionTypeFilter && (
                      <Chip
                        label={`Type: ${transactionTypeFilter}`}
                        size="small"
                        onDelete={() => setTransactionTypeFilter('')}
                      />
                    )}
                    {dateFrom && (
                      <Chip
                        label={`From: ${dateFrom.toLocaleDateString()}`}
                        size="small"
                        onDelete={() => setDateFrom(null)}
                      />
                    )}
                    {dateTo && (
                      <Chip
                        label={`To: ${dateTo.toLocaleDateString()}`}
                        size="small"
                        onDelete={() => setDateTo(null)}
                      />
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Card>

        {/* Transactions Table */}
        <Box sx={{ mx: 3, mb: 3 }}>
          <StockTransactionsTable
            transactions={filteredTransactions}
            selectedInventory={selectedInventory}
          />
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
      </Box>
    </LocalizationProvider>
  );
}

StockTransactionsList.propTypes = {
  selectedInventory: PropTypes.object,
  onClearSelection: PropTypes.func
};

StockTransactionsList.defaultProps = {
  selectedInventory: null,
  onClearSelection: () => {}
};

export default StockTransactionsList;
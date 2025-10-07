/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { exportTransactionHistoryToPDF } from './pdfExportUtils';
import PropTypes from 'prop-types';
import {
  Box,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
  useTheme,
  Chip,
  Collapse,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Button,
  TablePagination,
  TableSortLabel,
  Avatar,
  Divider,
  Paper,
  Menu,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DistributionIcon from '@mui/icons-material/Share';
import AdjustIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import RefreshIcon from '@mui/icons-material/Refresh';

// Helper function to determine if transaction reduces stock
const isStockReduction = (movementType, transactionType) => {
  // Check movement type first
  if (movementType === 'stock_out') return true;
  
  // Check transaction types that reduce stock
  const reductionTransactions = [
    'distribution', 
    'damage', 
    'expired', 
    'transfer_out'
  ];
  
  return reductionTransactions.includes(transactionType);
};

// Helper functions for movement types
const getMovementTypeLabel = (movementType) => {
  const movementMap = {
    stock_in: { 
      text: 'Stock In', 
      color: 'success', 
      icon: <TrendingUpIcon fontSize="small" /> 
    },
    stock_out: { 
      text: 'Stock Out', 
      color: 'error', 
      icon: <TrendingDownIcon fontSize="small" /> 
    },
    adjustment: { 
      text: 'Adjustment', 
      color: 'warning', 
      icon: <AdjustIcon fontSize="small" /> 
    },
    transfer: { 
      text: 'Transfer', 
      color: 'info', 
      icon: <SwapHorizIcon fontSize="small" /> 
    },
    distribution: { 
      text: 'Distribution', 
      color: 'primary', 
      icon: <DistributionIcon fontSize="small" /> 
    }
  };

  const movement = movementMap[movementType] || { 
    text: movementType || 'Unknown', 
    color: 'default', 
    icon: null 
  };

  return (
    <Chip
      icon={movement.icon}
      label={movement.text}
      size="small"
      color={movement.color}
      variant="outlined"
      sx={{ fontSize: '0.75rem', height: '28px' }}
    />
  );
};

const getTransactionTypeLabel = (transactionType) => {
  const typeMap = {
    purchase: { text: 'Purchase', color: 'primary' },
    grant: { text: 'Grant', color: 'success' },
    return: { text: 'Return', color: 'info' },
    distribution: { text: 'Distribution', color: 'primary' },
    damage: { text: 'Damaged/Lost', color: 'error' },
    expired: { text: 'Expired Items', color: 'error' },
    transfer_in: { text: 'Transfer In', color: 'info' },
    transfer_out: { text: 'Transfer Out', color: 'info' },
    adjustment: { text: 'Stock Adjustment', color: 'warning' },
    initial_stock: { text: 'Initial Stock', color: 'default' }
  };

  const transaction = typeMap[transactionType] || { 
    text: transactionType || 'Unknown', 
    color: 'default' 
  };

  return (
    <Chip
      label={transaction.text}
      size="small"
      color={transaction.color}
      variant="filled"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  );
};

// Helper functions for export (text versions)
const getMovementTypeText = (movementType) => {
  const movementMap = {
    stock_in: 'Stock In',
    stock_out: 'Stock Out',
    adjustment: 'Adjustment',
    transfer: 'Transfer',
    distribution: 'Distribution'
  };
  return movementMap[movementType] || movementType || 'Unknown';
};

const getTransactionTypeText = (transactionType) => {
  const typeMap = {
    purchase: 'Purchase',
    grant: 'Grant',
    return: 'Return',
    distribution: 'Distribution',
    damage: 'Damaged/Lost',
    expired: 'Expired Items',
    transfer_in: 'Transfer In',
    transfer_out: 'Transfer Out',
    adjustment: 'Stock Adjustment',
    initial_stock: 'Initial Stock'
  };
  return typeMap[transactionType] || transactionType || 'Unknown';
};

// Safe formatting functions
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return `₱${parseFloat(amount).toLocaleString('en-PH', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

const formatCurrencyForExport = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
  return parseFloat(amount).toFixed(2);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '—';
  }
};

const formatDateShort = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return '—';
  }
};

// Quantity/number formatter to avoid long floats
const formatQuantity = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

// Safe property access helper
const safeGet = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

// Expandable Historical Details Row
const HistoryDetailsRow = ({ stock, isOpen }) => {
  // Safely extract personnel information
  const getPersonnelName = (person) => {
    if (!person) return 'System';
    if (typeof person === 'string') return person;
    if (typeof person === 'object') {
      const fname = person.fname || '';
      const mname = person.mname ? ` ${person.mname}` : '';
      const lname = person.lname || '';
      const extension = person.extension_name ? ` ${person.extension_name}` : '';
      return `${fname}${mname} ${lname}${extension}`.trim() || 'Unknown User';
    }
    return 'Unknown User';
  };

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom component="div" fontWeight={600} sx={{ mb: 3 }}>
              Complete Transaction Record
            </Typography>
            
            {/* Transaction Overview */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="primary" fontWeight={600}>
                      Transaction Timeline
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Transaction Date: <strong>{formatDate(stock.transaction_date)}</strong>
                  </Typography>
                  {stock.date_received && (
                    <Typography variant="body2" color="text.secondary">
                      Date Received: <strong>{formatDate(stock.date_received)}</strong>
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="primary" fontWeight={600}>
                      Personnel
                    </Typography>
                  </Box>
                  {(() => {
                    const transactedBy = getPersonnelName(stock.transacted_by);
                    const verifiedBy = getPersonnelName(stock.verified_by);
                    
                    // If transacted_by is unknown/system but we have a verifier, show the verifier as transacted
                    if ((transactedBy === 'Unknown User' || transactedBy === 'System') && verifiedBy !== 'Unknown User' && verifiedBy !== 'System') {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          Transacted by: <strong>{verifiedBy}</strong>
                        </Typography>
                      );
                    }
                    
                    // Otherwise show transacted_by and only show verified_by if different
                    return (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Transacted by: <strong>{transactedBy}</strong>
                        </Typography>
                        {stock.verified_by && verifiedBy !== transactedBy && verifiedBy !== 'Unknown User' && verifiedBy !== 'System' && (
                          <Typography variant="body2" color="text.secondary">
                            Verified by: <strong>{verifiedBy}</strong>
                          </Typography>
                        )}
                      </>
                    );
                  })()}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShippingIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="primary" fontWeight={600}>
                      Logistics
                    </Typography>
                  </Box>
                  {stock.source && (
                    <Typography variant="body2" color="text.secondary">
                      Source: <strong>{stock.source}</strong>
                    </Typography>
                  )}
                  {stock.destination && (
                    <Typography variant="body2" color="text.secondary">
                      Destination: <strong>{stock.destination}</strong>
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Additional Details Grid */}
            <Grid container spacing={3}>
              {/* Batch & Quality Info */}
              {(stock.batch_number || stock.expiry_date) && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Batch & Quality Information
                  </Typography>
                  {stock.batch_number && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">Batch Number</Typography>
                      <Typography variant="body2" fontWeight={500}>{stock.batch_number}</Typography>
                    </Box>
                  )}
                  {stock.expiry_date && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                        color={new Date(stock.expiry_date) < new Date() ? 'error.main' : 'text.primary'}
                      >
                        {formatDateShort(stock.expiry_date)}
                        {new Date(stock.expiry_date) < new Date() && ' (Expired)'}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              )}

              {/* Financial Summary */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Financial Summary
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Unit Cost</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatCurrency(stock.unit_cost)} per {safeGet(stock, 'inventory.unit', 'unit')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">Total Value</Typography>
                  <Typography variant="h6" fontWeight={600} color="primary.main">
                    {formatCurrency(stock.total_value)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Running Balance After Transaction</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {stock.running_balance || '0'} {safeGet(stock, 'inventory.unit', 'units')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Remarks Section */}
            {stock.remarks && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="info.main" gutterBottom>
                  Transaction Notes
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  "{stock.remarks}"
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

const TransactionHistoryTable = ({ 
  stocks = [], 
  loading = false, 
  onRefresh = () => {}, 
  error = null 
}) => {
  const theme = useTheme();
  
  // State management
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [orderBy, setOrderBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  
  // Filters
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    movementType: '',
    transactionType: '',
    itemSearch: '',
    showFilters: false
  });

  // Safely handle stocks prop - ensure it's always an array
  const stocksArray = Array.isArray(stocks) ? stocks : [];

  // Filter and sort logic
  const getFilteredAndSortedStocks = () => {
    let filtered = [...stocksArray];

    // Apply filters
    if (filters.dateFrom) {
      filtered = filtered.filter(stock => {
        try {
          return new Date(stock.transaction_date) >= new Date(filters.dateFrom);
        } catch {
          return false;
        }
      });
    }
    if (filters.dateTo) {
      filtered = filtered.filter(stock => {
        try {
          return new Date(stock.transaction_date) <= new Date(filters.dateTo);
        } catch {
          return false;
        }
      });
    }
    if (filters.movementType) {
      filtered = filtered.filter(stock => stock.movement_type === filters.movementType);
    }
    if (filters.transactionType) {
      filtered = filtered.filter(stock => stock.transaction_type === filters.transactionType);
    }
    if (filters.itemSearch) {
      const searchTerm = filters.itemSearch.toLowerCase();
      filtered = filtered.filter(stock => {
        const itemName = safeGet(stock, 'inventory.item_name', '').toLowerCase();
        const reference = (stock.reference || '').toLowerCase();
        return itemName.includes(searchTerm) || reference.includes(searchTerm);
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      try {
        if (orderBy === 'transaction_date') {
          const aDate = new Date(a.transaction_date);
          const bDate = new Date(b.transaction_date);
          return order === 'asc' ? aDate - bDate : bDate - aDate;
        }
        if (orderBy === 'quantity') {
          return order === 'asc' ? (a.quantity || 0) - (b.quantity || 0) : (b.quantity || 0) - (a.quantity || 0);
        }
        if (orderBy === 'total_value') {
          const aValue = parseFloat(a.total_value) || 0;
          const bValue = parseFloat(b.total_value) || 0;
          return order === 'asc' ? aValue - bValue : bValue - aValue;
        }
      } catch (error) {
        console.warn('Sorting error:', error);
      }
      return 0;
    });

    return filtered;
  };

  const filteredStocks = getFilteredAndSortedStocks();
  const paginatedStocks = filteredStocks.slice(page * limit, page * limit + limit);

  // Event handlers
  const handleExpandRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      movementType: '',
      transactionType: '',
      itemSearch: '',
      showFilters: filters.showFilters
    });
    setPage(0);
  };

  // Safe export functions
  const downloadFile = (content, filename, contentType) => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Date & Time',
        'Item Name',
        'Item Type',
        'Unit',
        'Movement Type',
        'Transaction Type',
        'Quantity',
        'Unit Cost (PHP)',
        'Total Value (PHP)',
        'Running Balance',
        'Reference',
        'Source',
        'Destination',
        'Batch Number',
        'Expiry Date',
        'Transacted By',
        'Remarks'
      ];

      const getPersonnelNameForExport = (person) => {
        if (!person) return 'System';
        if (typeof person === 'string') return person;
        if (typeof person === 'object') {
          const fname = person.fname || '';
          const mname = person.mname ? ` ${person.mname}` : '';
          const lname = person.lname || '';
          const extension = person.extension_name ? ` ${person.extension_name}` : '';
          return `${fname}${mname} ${lname}${extension}`.trim() || 'Unknown User';
        }
        return 'Unknown User';
      };

      const csvData = filteredStocks.map(stock => [
        formatDate(stock.transaction_date),
        safeGet(stock, 'inventory.item_name', 'Unknown Item'),
        safeGet(stock, 'inventory.item_type', ''),
        safeGet(stock, 'inventory.unit', ''),
        getMovementTypeText(stock.movement_type),
        getTransactionTypeText(stock.transaction_type),
        // FIXED: Proper sign handling for CSV export
        `${isStockReduction(stock.movement_type, stock.transaction_type) ? '-' : '+'}${Math.abs(stock.quantity || 0)}`,
        formatCurrencyForExport(stock.unit_cost),
        formatCurrencyForExport(stock.total_value),
        stock.running_balance || '0',
        stock.reference || '',
        stock.source || '',
        stock.destination || '',
        stock.batch_number || '',
        stock.expiry_date ? formatDateShort(stock.expiry_date) : '',
        getPersonnelNameForExport(stock.transacted_by),
        stock.remarks || ''
      ]);

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(field => 
            typeof field === 'string' && field.includes(',') 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `transaction-history-${timestamp}.csv`;
      
      downloadFile(BOM + csvContent, filename, 'text/csv;charset=utf-8;');
      setExportAnchorEl(null);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  // PDF export using utility
  const exportToPDF = () => {
    try {
      exportTransactionHistoryToPDF(filteredStocks, filters);
      setExportAnchorEl(null);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportClick = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  // Reset page when stocks change
  useEffect(() => {
    setPage(0);
  }, [stocksArray]);

  if (error) {
    return (
      <Card>
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6">Error Loading Transaction History</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
          {onRefresh && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
            >
              Try Again
            </Button>
          )}
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header with filters */}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Transaction History ({filteredStocks.length.toLocaleString()} records)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => handleFilterChange('showFilters', !filters.showFilters)}
                variant={filters.showFilters ? 'contained' : 'outlined'}
              >
                Filters
              </Button>
              {onRefresh && (
                <Button
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={onRefresh}
                  disabled={loading}
                  variant="outlined"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              )}
              <Button
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportClick}
                variant="outlined"
                disabled={loading || filteredStocks.length === 0}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={handleExportClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={exportToCSV}>
                  <ListItemIcon>
                    <TableViewIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={exportToPDF}>
                  <ListItemIcon>
                    <PictureAsPdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as PDF</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        }
      />

      {/* Filters Panel */}
      <Collapse in={filters.showFilters}>
        <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                label="From Date"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                label="To Date"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Movement Type"
                value={filters.movementType}
                onChange={(e) => handleFilterChange('movementType', e.target.value)}
              >
                <MenuItem value="">All Movements</MenuItem>
                <MenuItem value="stock_in">Stock In</MenuItem>
                <MenuItem value="stock_out">Stock Out</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="distribution">Distribution</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                select
                label="Transaction Type"
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              >
                <MenuItem value="">All Transactions</MenuItem>
                <MenuItem value="purchase">Purchase</MenuItem>
                <MenuItem value="grant">Grant</MenuItem>
                <MenuItem value="distribution">Distribution</MenuItem>
                <MenuItem value="damage">Damage/Loss</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
                <MenuItem value="adjustment">Adjustment</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                size="small"
                label="Search Items"
                value={filters.itemSearch}
                onChange={(e) => handleFilterChange('itemSearch', e.target.value)}
                placeholder="Item name or reference"
              />
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <Button
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      <Divider />

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading transaction history...</Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50px' }}></TableCell>
                <TableCell sx={{ width: '240px', fontWeight: 600, color: 'text.secondary' }}>
                  Item & Reference
                </TableCell>
                <TableCell sx={{ width: '120px', fontWeight: 600, color: 'text.secondary' }}>
                  Movement
                </TableCell>
                <TableCell sx={{ width: '140px', fontWeight: 600, color: 'text.secondary' }}>
                  Transaction
                </TableCell>
                <TableCell align="right" sx={{ width: '100px' }}>
                  <TableSortLabel
                    active={orderBy === 'quantity'}
                    direction={orderBy === 'quantity' ? order : 'asc'}
                    onClick={() => handleSort('quantity')}
                    sx={{ fontWeight: 600, color: 'text.secondary' }}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ width: '140px' }}>
                  <TableSortLabel
                    active={orderBy === 'total_value'}
                    direction={orderBy === 'total_value' ? order : 'asc'}
                    onClick={() => handleSort('total_value')}
                    sx={{ fontWeight: 600, color: 'text.secondary' }}
                  >
                    Total Value
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ width: '100px', fontWeight: 600, color: 'text.secondary' }}>
                  Balance
                </TableCell>
                <TableCell sx={{ width: '140px' }}>
                  <TableSortLabel
                    active={orderBy === 'transaction_date'}
                    direction={orderBy === 'transaction_date' ? order : 'asc'}
                    onClick={() => handleSort('transaction_date')}
                    sx={{ fontWeight: 600, color: 'text.secondary' }}
                  >
                    Date & Time
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ width: '120px', fontWeight: 600, color: 'text.secondary' }}>
                  Reference
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStocks.length > 0 ? (
                paginatedStocks.map((stock) => {
                  const isExpanded = expandedRows.has(stock.id);
                  const hasDetails = stock.source || stock.destination || stock.batch_number || stock.remarks;
                  
                  return (
                    <>
                      <TableRow hover key={stock.id}>
                        {/* Expand/Collapse Button */}
                        <TableCell>
                          {hasDetails && (
                            <IconButton
                              size="small"
                              onClick={() => handleExpandRow(stock.id)}
                              sx={{ color: 'text.secondary' }}
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                        </TableCell>
                        
                        {/* Item & Reference */}
                        <TableCell>
                          <Box>
                            <Typography fontWeight="600" noWrap sx={{ maxWidth: '200px' }}>
                              {safeGet(stock, 'inventory.item_name', 'Unknown Item')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {safeGet(stock, 'inventory.item_type', '')} 
                              {safeGet(stock, 'inventory.item_type', '') && safeGet(stock, 'inventory.unit', '') && ' • '}
                              {safeGet(stock, 'inventory.unit', '')}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Movement Type */}
                        <TableCell>
                          {getMovementTypeLabel(stock.movement_type)}
                        </TableCell>

                        {/* Transaction Type */}
                        <TableCell>
                          {getTransactionTypeLabel(stock.transaction_type)}
                        </TableCell>

                        {/* Quantity - FIXED: Proper sign handling */}
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="600"
                            color={isStockReduction(stock.movement_type, stock.transaction_type) ? 'error.main' : 'success.main'}
                          >
                            {isStockReduction(stock.movement_type, stock.transaction_type) ? '-' : '+'}{formatQuantity(Math.abs(stock.quantity || 0))}
                          </Typography>
                        </TableCell>

                        {/* Total Value */}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="500">
                            {formatCurrency(stock.total_value)}
                          </Typography>
                        </TableCell>

                        {/* Running Balance */}
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatQuantity(stock.running_balance)}
                          </Typography>
                        </TableCell>

                        {/* Date & Time */}
                        <TableCell>
                          <Typography variant="body2" color="text.primary">
                            {formatDate(stock.transaction_date)}
                          </Typography>
                        </TableCell>

                        {/* Reference */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {stock.reference || '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expandable Details Row */}
                      {hasDetails && (
                        <HistoryDetailsRow stock={stock} isOpen={isExpanded} />
                      )}
                    </>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No transaction history found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {filters.dateFrom || filters.dateTo || filters.movementType || filters.transactionType || filters.itemSearch
                        ? 'Try adjusting your filters to see more results.'
                        : 'Transaction history will appear here once stock movements are recorded.'
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {!loading && filteredStocks.length > 0 && (
        <Box p={2}>
          <TablePagination
            component="div"
            count={filteredStocks.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={(e) => {
              setLimit(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Card>
  );
};

// PropTypes for type checking
TransactionHistoryTable.propTypes = {
  stocks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      transaction_date: PropTypes.string,
      movement_type: PropTypes.string,
      transaction_type: PropTypes.string,
      quantity: PropTypes.number,
      unit_cost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      total_value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      running_balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      reference: PropTypes.string,
      source: PropTypes.string,
      destination: PropTypes.string,
      batch_number: PropTypes.string,
      expiry_date: PropTypes.string,
      remarks: PropTypes.string,
      transacted_by: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          fname: PropTypes.string,
          mname: PropTypes.string,
          lname: PropTypes.string,
          extension_name: PropTypes.string,
          email: PropTypes.string,
          username: PropTypes.string
        })
      ]),
      verified_by: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          fname: PropTypes.string,
          mname: PropTypes.string,
          lname: PropTypes.string,
          extension_name: PropTypes.string,
          email: PropTypes.string,
          username: PropTypes.string
        })
      ]),
      inventory: PropTypes.shape({
        item_name: PropTypes.string,
        item_type: PropTypes.string,
        unit: PropTypes.string
      })
    })
  ),
  loading: PropTypes.bool,
  onRefresh: PropTypes.func,
  error: PropTypes.string
};

// PropTypes for HistoryDetailsRow
HistoryDetailsRow.propTypes = {
  stock: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default TransactionHistoryTable;
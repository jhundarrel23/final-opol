/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Box,
  Chip,
  Avatar,
  useTheme,
  TableSortLabel,
  Collapse,
  IconButton,
  Tooltip,
  Stack,
  Checkbox
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  ExpandMore,
  ExpandLess,
  Person,
  Business,
  CalendarToday,
  Receipt,
  Visibility,
  Edit,
  Delete,
  Verified,
  CheckCircle,
  Share as DistributionIcon,
  Tune as AdjustIcon
} from '@mui/icons-material';

// Helper functions
const formatQuantityValue = (value, unit) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  const discreteUnits = ['bag', 'sack', 'piece', 'set', 'roll', 'can', 'bottle', 'pcs'];
  const measurableUnits = ['kg', 'g', 'lb', 'liter', 'ml', 'meter', 'l'];
  if (discreteUnits.includes(unit?.toLowerCase())) {
    return Math.round(num).toLocaleString();
  }
  if (measurableUnits.includes(unit?.toLowerCase())) {
    const rounded = Math.round(num * 100) / 100;
    return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const getUserFullName = (user) => {
  if (!user) return 'System';
  
  const parts = [
    user.fname,
    user.mname,
    user.lname,
    user.extension_name
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(' ') : user.username || 'Unknown User';
};

const getMovementTypeConfig = (movementType, transactionType) => {
  // Determine movement type based on transaction type if movement_type is not properly set
  let actualMovementType = movementType;
  
  if (!movementType || movementType === 'unknown') {
    // Infer movement type from transaction type
    const stockInTypes = ['purchase', 'grant', 'return', 'transfer_in', 'initial_stock'];
    const stockOutTypes = ['distribution', 'damage', 'expired', 'transfer_out'];
    const adjustmentTypes = ['adjustment'];
    
    if (stockInTypes.includes(transactionType)) {
      actualMovementType = 'stock_in';
    } else if (stockOutTypes.includes(transactionType)) {
      actualMovementType = 'stock_out';
    } else if (adjustmentTypes.includes(transactionType)) {
      actualMovementType = 'adjustment';
    }
  }

  const movementMap = {
    stock_in: { 
      text: 'Stock In', 
      color: 'success', 
      icon: <TrendingUp fontSize="small" /> 
    },
    stock_out: { 
      text: 'Stock Out', 
      color: 'error', 
      icon: <TrendingDown fontSize="small" /> 
    },
    adjustment: { 
      text: 'Adjustment', 
      color: 'warning', 
      icon: <AdjustIcon fontSize="small" /> 
    },
    transfer: { 
      text: 'Transfer', 
      color: 'info', 
      icon: <SwapHoriz fontSize="small" /> 
    },
    distribution: { 
      text: 'Distribution', 
      color: 'primary', 
      icon: <DistributionIcon fontSize="small" /> 
    }
  };

  const movement = movementMap[actualMovementType] || { 
    text: 'Unknown', 
    color: 'default', 
    icon: null 
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {movement.icon}
      <Typography 
        variant="body2" 
        fontWeight="medium"
        sx={{ color: `${movement.color}.main` }}
      >
        {movement.text}
      </Typography>
    </Box>
  );
};

const getTransactionTypeConfig = (transactionType) => {
  const typeMap = {
    purchase: { text: 'Purchase', color: 'primary' },
    grant: { text: 'grant', color: 'success' },
    return: { text: 'Return', color: 'info' },
    distribution: { text: 'Distribution', color: 'primary' },
    damage: { text: 'Damaged/Lost', color: 'error' },
    expired: { text: 'Expired Items', color: 'error' },
    transfer_in: { text: 'Transfer In', color: 'info' },
    transfer_out: { text: 'Transfer Out', color: 'info' },
    adjustment: { text: 'Stock Adjustment', color: 'warning' },
    initial_stock: { text: 'Initial Stock', color: 'default' }
  };

  const transaction = typeMap[transactionType] || { text: transactionType, color: 'default' };

  return (
    <Chip
      label={transaction.text}
      size="small"
      color={transaction.color}
      variant="outlined"
      sx={{ fontSize: '0.75rem', height: '24px' }}
    />
  );
};

const getStatusLabel = (status) => {
  const statusMap = {
    pending: { text: 'Pending', color: 'warning' },
    approved: { text: 'Approved', color: 'info' },
    rejected: { text: 'Rejected', color: 'error' },
    completed: { text: 'Completed', color: 'success' }
  };

  const statusInfo = statusMap[status] || { text: 'Unknown', color: 'default' };

  return (
    <Chip
      label={statusInfo.text}
      size="small"
      color={statusInfo.color}
      variant="filled"
      sx={{ fontSize: '0.75rem', height: '24px', fontWeight: 500 }}
    />
  );
};

const getQuantityDisplay = (quantity, movementType, unit) => {
  const isNegative = movementType === 'stock_out' || movementType === 'distribution';
  const formattedQuantity = formatQuantityValue(Math.abs(quantity), unit);
  const displayQuantity = isNegative ? `-${formattedQuantity}` : `+${formattedQuantity}`;
  
  return (
    <Typography 
      variant="body2" 
      fontWeight="600"
      sx={{ 
        color: isNegative ? 'error.main' : 'success.main'
      }}
    >
      {displayQuantity}
    </Typography>
  );
};

const formatCurrency = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num) || num === 0) return '—';
  return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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

const applyPagination = (transactions, page, limit) => {
  return transactions.slice(page * limit, page * limit + limit);
};

// Expandable row component for additional details
const TransactionDetailsRow = ({ transaction, isOpen }) => {
  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom component="div" fontWeight={600}>
              Transaction Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
              {transaction.source && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Source
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.source}
                  </Typography>
                </Box>
              )}
              {transaction.destination && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Destination
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.destination}
                  </Typography>
                </Box>
              )}
              {transaction.date_received && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Date Received
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(transaction.date_received)}
                  </Typography>
                </Box>
              )}
              {transaction.expiry_date && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Expiry Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color={new Date(transaction.expiry_date) < new Date() ? 'error.main' : 'text.primary'}>
                    {formatDate(transaction.expiry_date)}
                  </Typography>
                </Box>
              )}
              {transaction.batch_number && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Batch Number
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {transaction.batch_number}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Transacted By
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {getUserFullName(transaction.transactor)}
                </Typography>
              </Box>
              {transaction.verifiedBy && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Verified By
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getUserFullName(transaction.verifiedBy)}
                  </Typography>
                </Box>
              )}
            </Box>
            {transaction.remarks && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Remarks
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  {transaction.remarks}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

function StockTransactionsTable({ transactions, selectedInventory }) {
  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? transactions.map((t) => t.id) : []);
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandRow = (transactionId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedTransactions = transactions.slice().sort((a, b) => {
    let aVal = a[orderBy];
    let bVal = b[orderBy];

    // Handle date fields
    if (['transaction_date', 'created_at'].includes(orderBy)) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    // Handle numeric fields
    if (['quantity', 'unit_cost', 'total_value', 'running_balance'].includes(orderBy)) {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }

    // Handle string fields
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } 
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    
  });

  const paginatedTransactions = applyPagination(sortedTransactions, page, rowsPerPage);

  const selectedAll = selected.length === transactions.length && transactions.length > 0;
  const selectedSome = selected.length > 0 && selected.length < transactions.length;

  if (transactions.length === 0) {
    return (
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stock transactions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedInventory 
                      ? `No transactions found for ${selectedInventory.item_name}`
                      : 'Stock movements will appear here once you start managing inventory.'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: '60px' }}>
                <Checkbox
                  color="primary"
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ width: '50px' }} />
              <TableCell sx={{ width: '220px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Item & Reference
              </TableCell>
              {!selectedInventory && (
                <TableCell sx={{ width: '180px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                  Item Details
                </TableCell>
              )}
              <TableCell sx={{ width: '120px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Movement
              </TableCell>
              <TableCell sx={{ width: '140px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Transaction
              </TableCell>
              <TableCell align="right" sx={{ width: '100px' }}>
                <TableSortLabel
                  active={orderBy === 'quantity'}
                  direction={orderBy === 'quantity' ? order : 'asc'}
                  onClick={() => handleRequestSort('quantity')}
                  sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}
                >
                  Quantity
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ width: '120px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Unit Cost
              </TableCell>
              <TableCell align="right" sx={{ width: '140px' }}>
                <TableSortLabel
                  active={orderBy === 'total_value'}
                  direction={orderBy === 'total_value' ? order : 'asc'}
                  onClick={() => handleRequestSort('total_value')}
                  sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}
                >
                  Total Value
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ width: '120px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Balance
              </TableCell>
              <TableCell sx={{ width: '110px' }}>
                <TableSortLabel
                  active={orderBy === 'transaction_date'}
                  direction={orderBy === 'transaction_date' ? order : 'asc'}
                  onClick={() => handleRequestSort('transaction_date')}
                  sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '100px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Status
              </TableCell>
              <TableCell sx={{ width: '160px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Transacted By
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.map((transaction) => {
              const isSelected = selected.includes(transaction.id);
              const isExpanded = expandedRows.has(transaction.id);
              const hasDetails = transaction.source || transaction.destination || transaction.date_received || transaction.expiry_date || transaction.remarks;
              const actualMovementType = transaction.movement_type || determineMovementType(transaction.transaction_type);
              
              return (
                <React.Fragment key={transaction.id}>
                  <TableRow hover selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(e, transaction.id)}
                      />
                    </TableCell>
                    
                    {/* Expand/Collapse Button */}
                    <TableCell>
                      {hasDetails && (
                        <IconButton
                          size="small"
                          onClick={() => handleExpandRow(transaction.id)}
                          sx={{ color: 'text.secondary' }}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      )}
                    </TableCell>
                    
                    {/* Reference & Date */}
                    <TableCell sx={{ maxWidth: '220px' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="600">
                          {formatDate(transaction.transaction_date)}
                        </Typography>
                        {transaction.reference && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            Ref: {transaction.reference}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {formatDateTime(transaction.created_at)}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Item Details (only show if not filtered by specific inventory) */}
                    {!selectedInventory && (
                      <TableCell sx={{ maxWidth: '180px' }}>
                        <Box>
                          <Typography fontWeight="bold" noWrap>
                            {transaction.inventory?.item_name || 'Unknown Item'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            Item ID: {transaction.inventory?.id || 'N/A'}
                          </Typography>
                          {transaction.inventory && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: (transaction.inventory.current_stock || 0) <= (transaction.inventory.minimum_stock || 0) ? 'warning.main' : 'success.main',
                                  fontWeight: 600,
                                  fontFamily: 'monospace'
                                }}
                              >
                                Stock: {(transaction.inventory.current_stock || 0).toLocaleString()} {transaction.inventory.unit || ''}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                    )}

                    {/* Movement Type */}
                    <TableCell>
                      {getMovementTypeConfig(actualMovementType, transaction.transaction_type)}
                    </TableCell>

                    {/* Transaction Type */}
                    <TableCell>
                      {getTransactionTypeConfig(transaction.transaction_type)}
                    </TableCell>

                    {/* Quantity */}
                    <TableCell align="right">
                      <Box>
                        {getQuantityDisplay(transaction.quantity, actualMovementType, transaction.inventory?.unit)}
                        <Typography variant="caption" color="text.secondary">
                          {transaction.inventory?.unit || 'unit'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Unit Cost */}
                    <TableCell align="right">
                      <Typography variant="body2" color="text.primary">
                        {formatCurrency(transaction.unit_cost)}
                      </Typography>
                    </TableCell>

                    {/* Total Value */}
                    <TableCell align="right">
                      <Typography fontWeight="600" color="text.primary">
                        {formatCurrency(transaction.total_value)}
                      </Typography>
                    </TableCell>

                    {/* Running Balance */}
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          parseFloat(transaction.running_balance || 0) <= 0 ? 'error.main' : 'text.primary'
                        }
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {formatQuantityValue(transaction.running_balance, transaction.inventory?.unit)} {transaction.inventory?.unit || 'unit'}
                      </Typography>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(transaction.transaction_date)}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {getStatusLabel(transaction.status)}
                    </TableCell>

                    {/* Transacted By - Only name, no username or avatar */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="500" noWrap>
                        {getUserFullName(transaction.transactor)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expandable Details Row */}
                  {hasDetails && (
                    <TransactionDetailsRow transaction={transaction} isOpen={isExpanded} />
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box p={2}>
        <TablePagination
          component="div"
          count={transactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          showFirstButton
          showLastButton
        />
      </Box>
    </Card>
  );
}

StockTransactionsTable.propTypes = {
  transactions: PropTypes.array.isRequired,
  selectedInventory: PropTypes.object
};

StockTransactionsTable.defaultProps = {
  transactions: [],
  selectedInventory: null
};

export default StockTransactionsTable;
/* eslint-disable no-unused-vars */
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
  IconButton,
  Tooltip,
  Typography,
  Box,
  Chip,
  useTheme,
  TableSortLabel,
  Collapse,
  Paper,
  Stack,
  LinearProgress,
  alpha
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Inventory,
  BookmarkBorder
} from '@mui/icons-material';

// Updated functions to use the correct API field names
const getStockStatusColor = (onHand, reserved, available) => {
  if (onHand === 0) return 'error';
  if (available <= 10 && available > 0) return 'warning';
  return 'success';
};

const getStockStatusIcon = (onHand, reserved, available) => {
  if (onHand === 0) return <ErrorIcon fontSize="small" />;
  if (available <= 10 && available > 0) return <Warning fontSize="small" />;
  return <CheckCircle fontSize="small" />;
};

const getStockLevel = (available) => {
  if (available === 0) return 0;
  // For visual representation, we'll use a scale where 50+ available = 100%
  return Math.min((available / 50) * 100, 100);
};

const getCategoryLabel = (category) => {
  const categoryMap = {
    aid: 'Aid',
    monetary: 'Monetary',
    service: 'Service'
  };
  const text = categoryMap[category] || 'Unknown';
  return (
    <Chip
      label={text}
      size="small"
      variant="outlined"
      sx={{ 
        fontWeight: 500,
        fontSize: '0.75rem'
      }}
    />
  );
};

const getTypeLabel = (type) => {
  const typeMap = {
    seed: 'Seed',
    fertilizer: 'Fertilizer',
    pesticide: 'Pesticide',
    equipment: 'Equipment',
    fuel: 'Fuel',
    cash: 'Cash',
    other: 'Other'
  };
  const text = typeMap[type] || 'Unknown';
  return (
    <Chip
      label={text}
      size="small"
      variant="outlined"
      sx={{ 
        fontWeight: 500,
        fontSize: '0.75rem'
      }}
    />
  );
};

const formatCurrency = (value) => {
  if (!value || value === 0) return '—';
  return `₱${parseFloat(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatQuantity = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num * 100) / 100;
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

function InventoryTable({ inventories, onEdit, onDelete, onViewTransactions, onAddStock }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('item_name');
  const [order, setOrder] = useState('asc');
  const [expandedRows, setExpandedRows] = useState(new Set());

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

  const handleExpandRow = (itemId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const sortedInventories = inventories.slice().sort((a, b) => {
    let aVal = a[orderBy];
    let bVal = b[orderBy];

    if (['on_hand', 'reserved', 'available', 'unit_value'].includes(orderBy)) {
      aVal = parseFloat(aVal) || 0;
      bVal = parseFloat(bVal) || 0;
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    } 
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
  });

  const paginatedInventories = sortedInventories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (inventories.length === 0) {
    return (
      <Card elevation={1} sx={{ borderRadius: 2 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          px={3}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <Inventory sx={{ fontSize: 40, color: 'grey.400' }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No inventory items found
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
            Start building your inventory by adding your first item. Track stock levels, monitor values, and manage your agricultural resources efficiently.
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card elevation={1} sx={{ borderRadius: 2 }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                width={50} 
                sx={{ 
                  bgcolor: 'grey.50',
                  fontWeight: 600
                }} 
              />
              <TableCell 
                sx={{ 
                  fontWeight: 600, 
                  bgcolor: 'grey.50',
                  minWidth: 100
                }}
              >
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleRequestSort('id')}
                >
                  Item ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 200 }}>
                <TableSortLabel
                  active={orderBy === 'item_name'}
                  direction={orderBy === 'item_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('item_name')}
                >
                  Item Details
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 120 }}>
                <TableSortLabel
                  active={orderBy === 'item_type'}
                  direction={orderBy === 'item_type' ? order : 'asc'}
                  onClick={() => handleRequestSort('item_type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 120 }}>
                <TableSortLabel
                  active={orderBy === 'assistance_category'}
                  direction={orderBy === 'assistance_category' ? order : 'asc'}
                  onClick={() => handleRequestSort('assistance_category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 160 }}>
                <TableSortLabel
                  active={orderBy === 'on_hand'}
                  direction={orderBy === 'on_hand' ? order : 'asc'}
                  onClick={() => handleRequestSort('on_hand')}
                >
                  On Hand
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 120 }}>
                <TableSortLabel
                  active={orderBy === 'reserved'}
                  direction={orderBy === 'reserved' ? order : 'asc'}
                  onClick={() => handleRequestSort('reserved')}
                >
                  Reserved
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 120 }}>
                <TableSortLabel
                  active={orderBy === 'available'}
                  direction={orderBy === 'available' ? order : 'asc'}
                  onClick={() => handleRequestSort('available')}
                >
                  Available
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 120 }}>
                <TableSortLabel
                  active={orderBy === 'unit_value'}
                  direction={orderBy === 'unit_value' ? order : 'asc'}
                  onClick={() => handleRequestSort('unit_value')}
                >
                  Unit Price
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50', minWidth: 140 }}>
                Total Value
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>
                Trackable
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInventories.map((item) => (
              <React.Fragment key={item.id}>
                <TableRow
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    },
                    cursor: 'pointer',
                    borderBottom: expandedRows.has(item.id) ? 'none' : undefined
                  }}
                  onClick={() => handleExpandRow(item.id)}
                >
                  {/* Expand Icon */}
                  <TableCell>
                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                      {expandedRows.has(item.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>

                  {/* Item ID */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      #{item.id}
                    </Typography>
                  </TableCell>

                  {/* Item Details */}
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {item.item_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description || 'No description'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {getTypeLabel(item.item_type)}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    {getCategoryLabel(item.assistance_category)}
                  </TableCell>

                  {/* On Hand */}
                  <TableCell align="right">
                    <Stack spacing={1} alignItems="flex-end">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getStockStatusIcon(item.on_hand, item.reserved, item.available)}
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600 }}
                          color={`${getStockStatusColor(item.on_hand, item.reserved, item.available)}.main`}
                        >
                          {formatQuantity(item.on_hand)} {item.unit || ''}
                        </Typography>
                      </Stack>
                      <Box sx={{ width: 80 }}>
                        <LinearProgress
                          variant="determinate"
                          value={getStockLevel(item.available)}
                          color={getStockStatusColor(item.on_hand, item.reserved, item.available)}
                          sx={{ height: 4, borderRadius: 2 }}
                        />
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Reserved */}
                  <TableCell align="right">
                    <Stack spacing={0.5} alignItems="flex-end">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {item.reserved > 0 && <BookmarkBorder fontSize="small" color="warning" />}
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 600 }}
                          color={item.reserved > 0 ? 'warning.main' : 'text.secondary'}
                        >
                          {formatQuantity(item.reserved)} {item.unit || ''}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>

                  {/* Available */}
                  <TableCell align="right">
                    <Stack spacing={0.5} alignItems="flex-end">
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600 }}
                        color={item.available > 0 ? 'success.main' : 'error.main'}
                      >
                        {formatQuantity(item.available)} {item.unit || ''}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Unit Price */}
                  <TableCell align="right">
                    <Stack spacing={0.5} alignItems="flex-end">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.unit_value)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per {item.unit || 'unit'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Total Value */}
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {formatCurrency((parseFloat(item.on_hand) || 0) * (parseFloat(item.unit_value) || 0))}
                    </Typography>
                  </TableCell>

                  {/* Trackable */}
                  <TableCell align="center">
                    <Chip
                      label={item.is_trackable_stock ? 'Yes' : 'No'}
                      color={item.is_trackable_stock ? 'success' : 'default'}
                      size="small"
                      variant={item.is_trackable_stock ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                </TableRow>

                {/* Expanded Row */}
                <TableRow>
                  <TableCell sx={{ py: 0 }} colSpan={11}>
                    <Collapse in={expandedRows.has(item.id)} timeout="auto" unmountOnExit>
                      <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 1, m: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                          Detailed Information
                        </Typography>
                        
                        <Box display="flex" flexWrap="wrap" gap={4}>
                          {/* Description */}
                          {item.description && (
                            <Box sx={{ minWidth: 200, maxWidth: 400 }}>
                              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                                Description
                              </Typography>
                              <Paper 
                                variant="outlined"
                                sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}
                              >
                                <Typography variant="body2">
                                  {item.description}
                                </Typography>
                              </Paper>
                            </Box>
                          )}

                          {/* Stock Analysis */}
                          <Box>
                            <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                              Stock Analysis
                            </Typography>
                            <Stack spacing={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                {item.on_hand === 0 ? (
                                  <>
                                    <ErrorIcon color="error" fontSize="small" />
                                    <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                                      Out of Stock
                                    </Typography>
                                  </>
                                ) : item.available <= 10 ? (
                                  <>
                                    <Warning color="warning" fontSize="small" />
                                    <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                                      Low Available Stock
                                    </Typography>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle color="success" fontSize="small" />
                                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                      Stock Level Good
                                    </Typography>
                                  </>
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                On Hand: {formatQuantity(item.on_hand)} {item.unit || 'units'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Reserved: {formatQuantity(item.reserved)} {item.unit || 'units'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Available: {formatQuantity(item.available)} {item.unit || 'units'}
                              </Typography>
                              {item.reserved > 0 && (
                                <Typography variant="body2" color="warning.main">
                                  {formatQuantity(item.reserved)} units are reserved for pending programs
                                </Typography>
                              )}
                            </Stack>
                          </Box>

                          {/* Financial Info */}
                          <Box>
                            <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                              Financial Summary
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                Unit Value: {formatCurrency(item.unit_value)}
                              </Typography>
                              <Typography variant="body2">
                                Total On Hand Value: {formatCurrency((item.on_hand || 0) * (item.unit_value || 0))}
                              </Typography>
                              <Typography variant="body2">
                                Reserved Value: {formatCurrency((item.reserved || 0) * (item.unit_value || 0))}
                              </Typography>
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                Available Value: {formatCurrency((item.available || 0) * (item.unit_value || 0))}
                              </Typography>
                            </Stack>
                          </Box>

                          {/* Operational Info */}
                          <Box>
                            <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
                              Operational Details
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2">
                                Tracking: {item.is_trackable_stock ? 'Enabled' : 'Disabled'}
                              </Typography>
                              <Typography variant="body2">
                                Unit: {item.unit || 'Not specified'}
                              </Typography>
                              <Typography variant="body2">
                                Category: {item.assistance_category || 'Not specified'}
                              </Typography>
                              <Typography variant="body2">
                                Type: {item.item_type || 'Not specified'}
                              </Typography>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={inventories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton
        showLastButton
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}
      />
    </Card>
  );
}

InventoryTable.propTypes = {
  inventories: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewTransactions: PropTypes.func,
  onAddStock: PropTypes.func
};

InventoryTable.defaultProps = {
  inventories: [],
  onEdit: null,
  onDelete: null,
  onViewTransactions: null,
  onAddStock: null
};

export default InventoryTable;
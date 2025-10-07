
/* eslint-disable no-else-return */
/* eslint-disable no-unused-vars */
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Box,
  Card,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Typography,
  useTheme,
  Chip,
  Collapse,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import Label from 'src/components/Label';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DistributionIcon from '@mui/icons-material/Share';
import AdjustIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BulkActions from './BulkActions';

const formatQuantityValue = (value, unit) => {
  if (value === null || value === undefined) return '0';

  const discreteUnits = ['bag', 'sack', 'piece', 'set', 'roll', 'can', 'bottle', 'pcs'];
  const measurableUnits = ['kg', 'g', 'lb', 'liter', 'ml', 'meter', 'php', 'l'];
  if (discreteUnits.includes(unit?.toLowerCase())) {
    return Math.round(value).toString();
  } else if (measurableUnits.includes(unit?.toLowerCase())) {
    return parseFloat(value).toFixed(2);
  } else {
    return parseFloat(value).toFixed(2);
  }
};

const getUserFullName = (user) => {
  if (!user) return 'System';
  const parts = [user.fname, user.mname, user.lname, user.extension_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.username || 'Unknown User';
};

const getMovementTypeLabel = (movementType) => {
  const movementMap = {
    stock_in: { text: 'Stock In', color: 'success', icon: <TrendingUpIcon fontSize="small" /> },
    stock_out: { text: 'Stock Out', color: 'error', icon: <TrendingDownIcon fontSize="small" /> },
    adjustment: { text: 'Adjustment', color: 'warning', icon: <AdjustIcon fontSize="small" /> },
    transfer: { text: 'Transfer', color: 'info', icon: <SwapHorizIcon fontSize="small" /> },
    distribution: { text: 'Distribution', color: 'primary', icon: <DistributionIcon fontSize="small" /> }
  };

  const movement = movementMap[movementType] || { text: 'Unknown', color: 'default', icon: null };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {movement.icon}
      <Typography variant="body2" fontWeight="medium" sx={{ color: `${movement.color}.main` }}>
        {movement.text}
      </Typography>
    </Box>
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

  return <Label color={statusInfo.color}>{statusInfo.text}</Label>;
};

const getVerificationLabel = (isVerified, verifiedBy) => {
  if (isVerified) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CheckCircleIcon sx={{ color: 'success.main', fontSize: '16px' }} />
        <Typography variant="body2" color="success.main" fontWeight="medium">
          Verified
        </Typography>
      </Box>
    );
  }
  return <Typography variant="body2" color="text.secondary">Unverified</Typography>;
};

const getQuantityDisplay = (quantity, movementType, unit) => {
  const isNegative = movementType === 'stock_out' || movementType === 'distribution';
  const formattedQuantity = formatQuantityValue(Math.abs(quantity), unit);
  const displayQuantity = isNegative ? `-${formattedQuantity}` : `+${formattedQuantity}`;

  return (
    <Typography
      variant="body2"
      fontWeight="600"
      sx={{ color: isNegative ? 'error.main' : 'success.main' }}
    >
      {displayQuantity}
    </Typography>
  );
};

const formatCurrency = (amount) => {
  if (!amount) return '—';
  return `₱${parseFloat(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const applyPagination = (stocks, page, limit) => {
  return stocks.slice(page * limit, page * limit + limit);
};

// View Modal for Stock Details
const StockViewModal = ({ open, onClose, stock }) => {
  if (!stock) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Stock Transaction Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Item</Typography>
            <Typography variant="body1" fontWeight="bold">
              {stock.inventory?.item_name || stock.inventory?.name || 'Unknown Item'}
            </Typography>
          </Box>
          {stock.reference && (
            <Box>
              <Typography variant="caption" color="text.secondary">Reference</Typography>
              <Typography variant="body2">Ref: {stock.reference}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Movement Type</Typography>
            <Typography variant="body2">{getMovementTypeLabel(stock.movement_type)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Transaction Type</Typography>
            <Typography variant="body2">{getTransactionTypeLabel(stock.transaction_type)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Quantity</Typography>
            <Typography variant="body2">
              {getQuantityDisplay(stock.quantity, stock.movement_type, stock.inventory?.unit)} {stock.inventory?.unit || 'unit'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Unit Cost</Typography>
            <Typography variant="body2">{formatCurrency(stock.unit_cost)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Total Value</Typography>
            <Typography variant="body2">{formatCurrency(stock.total_value)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Transaction Date</Typography>
            <Typography variant="body2">{formatDate(stock.transaction_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Typography variant="body2">{getStatusLabel(stock.status)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Verification</Typography>
            <Typography variant="body2">{getVerificationLabel(stock.is_verified, stock.verified_by)}</Typography>
          </Box>
          {stock.source && (
            <Box>
              <Typography variant="caption" color="text.secondary">Source</Typography>
              <Typography variant="body2">{stock.source}</Typography>
            </Box>
          )}
          {stock.destination && (
            <Box>
              <Typography variant="caption" color="text.secondary">Destination</Typography>
              <Typography variant="body2">{stock.destination}</Typography>
            </Box>
          )}
          {stock.date_received && (
            <Box>
              <Typography variant="caption" color="text.secondary">Date Received</Typography>
              <Typography variant="body2">{formatDate(stock.date_received)}</Typography>
            </Box>
          )}
          {stock.expiry_date && (
            <Box>
              <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
              <Typography variant="body2" color={new Date(stock.expiry_date) < new Date() ? 'error.main' : 'text.primary'}>
                {formatDate(stock.expiry_date)}
              </Typography>
            </Box>
          )}
          {stock.batch_number && (
            <Box>
              <Typography variant="caption" color="text.secondary">Batch Number</Typography>
              <Typography variant="body2">{stock.batch_number}</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">Transacted By</Typography>
            <Typography variant="body2">{getUserFullName(stock.transactor)}</Typography>
          </Box>
          {stock.verified_by && (
            <Box>
              <Typography variant="caption" color="text.secondary">Verified By</Typography>
              <Typography variant="body2">{getUserFullName(stock.verified_by)}</Typography>
            </Box>
          )}
          {stock.remarks && (
            <Box>
              <Typography variant="caption" color="text.secondary">Remarks</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{stock.remarks}</Typography>
            </Box>
          )}

          {Array.isArray(stock.attachments) && stock.attachments.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary">Attachments</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {stock.attachments.map((file, idx) => (
                  <Box key={idx} sx={{ width: 140 }}>
                    <a href={file.file_path || file.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{
                        width: 140,
                        height: 90,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'grey.50'
                      }}>
                        {String(file.file_type || '').startsWith('image/') ? (
                          <img src={file.file_path || file.url} alt={file.file_name || 'attachment'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Typography variant="caption">{file.file_name || 'Document'}</Typography>
                        )}
                      </Box>
                    </a>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }} noWrap>
                      {file.file_name || 'Attachment'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Expandable row component for additional details
const StockDetailsRow = ({ stock, isOpen }) => {
  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom component="div" fontWeight={600}>
              Transaction Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mt: 2 }}>
              {stock.source && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Source
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {stock.source}
                  </Typography>
                </Box>
              )}
              {stock.destination && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Destination
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {stock.destination}
                  </Typography>
                </Box>
              )}
              {stock.date_received && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Date Received
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(stock.date_received)}
                  </Typography>
                </Box>
              )}
              {stock.expiry_date && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Expiry Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color={new Date(stock.expiry_date) < new Date() ? 'error.main' : 'text.primary'}>
                    {formatDate(stock.expiry_date)}
                  </Typography>
                </Box>
              )}
              {stock.batch_number && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Batch Number
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {stock.batch_number}
                  </Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Transacted By
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {getUserFullName(stock.transactor)}
                </Typography>
              </Box>
              {stock.verified_by && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Verified By
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getUserFullName(stock.verified_by)}
                  </Typography>
                </Box>
              )}
            </Box>
            {stock.remarks && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Remarks
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  {stock.remarks}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

const InventoryStockTable = ({
  stocks: propStocks,
  onEdit,
  onDelete,
  onVerify,
  onView,
  hideFilters = false,
  userRole = 'user' // New prop for user role
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [orderBy, setOrderBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const stocks = propStocks || [];

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? stocks.map((s) => s.id) : []);
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleLimitChange = (event) => setLimit(parseInt(event.target.value, 10));

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

  const handleView = (stock) => {
    setSelectedStock(stock);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedStock(null);
  };

  // Memoize sorted stocks to prevent unnecessary re-renders
  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => {
      if (orderBy === 'transaction_date') {
        const aDate = new Date(a.transaction_date);
        const bDate = new Date(b.transaction_date);
        return order === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (orderBy === 'quantity') {
        return order === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
      }
      if (orderBy === 'total_value') {
        const aValue = parseFloat(a.total_value) || 0;
        const bValue = parseFloat(b.total_value) || 0;
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }, [stocks, orderBy, order]);

  const paginated = applyPagination(sortedStocks, page, limit);

  const selectedAll = selected.length === stocks.length && stocks.length > 0;
  const selectedSome = selected.length > 0 && selected.length < stocks.length;
  const bulkActionsActive = selected.length > 0;

  return (
    <Card>
      {bulkActionsActive && (
        <Box flex={1} p={2}>
          <BulkActions selected={selected} />
        </Box>
      )}

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
                  onClick={() => handleSort('quantity')}
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
                  onClick={() => handleSort('total_value')}
                  sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}
                >
                  Total Value
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '110px' }}>
                <TableSortLabel
                  active={orderBy === 'transaction_date'}
                  direction={orderBy === 'transaction_date' ? order : 'asc'}
                  onClick={() => handleSort('transaction_date')}
                  sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ width: '100px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Status
              </TableCell>
              <TableCell align="center" sx={{ width: '110px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Verified
              </TableCell>
              <TableCell align="right" sx={{ width: '120px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '12px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((stock) => {
                const isSelected = selected.includes(stock.id);
                const isExpanded = expandedRows.has(stock.id);
                const hasDetails = stock.source || stock.destination || stock.date_received || stock.expiry_date || stock.remarks;

                return (
                  <>
                    <TableRow hover key={stock.id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(e, stock.id)}
                        />
                      </TableCell>
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
                      <TableCell sx={{ maxWidth: '220px' }}>
                        <Box>
                          <Typography fontWeight="bold" noWrap>
                            {stock.inventory?.item_name || stock.inventory?.name || 'Unknown Item'}
                          </Typography>
                          {stock.reference && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              Ref: {stock.reference}
                            </Typography>
                          )}
                          {stock.inventory?.item_type && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {stock.inventory.item_type}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{getMovementTypeLabel(stock.movement_type)}</TableCell>
                      <TableCell>{getTransactionTypeLabel(stock.transaction_type)}</TableCell>
                      <TableCell align="right">
                        <Box>
                          {getQuantityDisplay(stock.quantity, stock.movement_type, stock.inventory?.unit)}
                          <Typography variant="caption" color="text.secondary">
                            {stock.inventory?.unit || 'unit'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.primary">
                          {formatCurrency(stock.unit_cost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="600" color="text.primary">
                          {formatCurrency(stock.total_value)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(stock.transaction_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusLabel(stock.status)}</TableCell>
                      <TableCell align="center">{getVerificationLabel(stock.is_verified, stock.verified_by)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details" arrow>
                            <IconButton
                              size="small"
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main', backgroundColor: 'action.hover' }
                              }}
                              onClick={() => handleView(stock)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {userRole === 'admin' && !stock.is_verified && onVerify && (
                            <Tooltip title="Verify Stock" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'success.main', backgroundColor: 'action.hover' }
                                }}
                                onClick={() => onVerify(stock)}
                              >
                                <VerifiedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {userRole !== 'admin' && onEdit && (
                            <Tooltip title="Edit Stock" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'warning.main', backgroundColor: 'action.hover' }
                                }}
                                onClick={() => onEdit(stock)}
                              >
                                <EditTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {userRole !== 'admin' && onDelete && (
                            <Tooltip title="Delete Stock" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main', backgroundColor: 'action.hover' }
                                }}
                                onClick={() => onDelete(stock)}
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                    {hasDetails && <StockDetailsRow stock={stock} isOpen={isExpanded} />}
                  </>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No stock records found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Stock movements will appear here once you start managing inventory.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box p={2}>
        <TablePagination
          component="div"
          count={stocks.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>

      <StockViewModal open={viewModalOpen} onClose={handleCloseViewModal} stock={selectedStock} />
    </Card>
  );
};

InventoryStockTable.propTypes = {
  stocks: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onVerify: PropTypes.func,
  onView: PropTypes.func,
  hideFilters: PropTypes.bool,
  userRole: PropTypes.string // New prop for user role
};

InventoryStockTable.defaultProps = {
  stocks: [],
  hideFilters: false,
  userRole: 'user'
};

export default InventoryStockTable;
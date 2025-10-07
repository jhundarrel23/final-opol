/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-else-return */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
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
  TableRow,
  TableContainer,
  TablePagination,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Collapse
} from '@mui/material';

import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import BulkActions from './BulkActions';

const formatStockValue = (value, unit) => {
  if (value === null || value === undefined) return '0';
  const discreteUnits = ['bag', 'sack', 'piece', 'set', 'roll', 'can', 'bottle'];
  const measurableUnits = ['kg', 'g', 'lb', 'liter', 'ml', 'meter'];
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  if (discreteUnits.includes(unit)) {
    return Math.round(num).toLocaleString();
  }
  if (measurableUnits.includes(unit)) {
    return (Math.round(num * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return (Math.round(num * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const getAvailableValue = (item) => {
  return item?.available ?? item?.available_stock ?? item?.current_stock ?? item?.on_hand ?? 0;
};

const getReservedValue = (item) => {
  return item?.reserved ?? item?.reserved_stock ?? 0;
};

const formatCurrencyPeso = (amount) => {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '—';
  return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getAssistanceCategoryLabel = (category) => {
  const categoryMap = {
    aid: { text: 'aid', icon: <InventoryIcon fontSize="small" /> },
    monetary: { text: 'Monetary', icon: <AttachMoneyIcon fontSize="small" /> },
    service: { text: 'Service', icon: <BuildIcon fontSize="small" /> }
  };
  const { text, icon } = categoryMap[category] || { text: 'Unknown', icon: null };
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {icon}
      <Typography variant="body2" fontWeight="medium">
        {text}
      </Typography>
    </Box>
  );
};

const getItemTypeLabel = (itemType) => {
  const typeMap = {
    seed: 'Seed',
    fertilizer: 'Fertilizer',
    pesticide: 'Pesticide',
    equipment: 'Equipment',
    fuel: 'Fuel',
    cash: 'Cash',
    other: 'Other'
  };
  const text = typeMap[itemType] || 'Unknown';
  return (
    <Typography
      variant="body2"
      sx={{
        px: 1.5,
        py: 0.5,
        backgroundColor: 'grey.100',
        borderRadius: 1,
        fontSize: '0.75rem',
        fontWeight: 500,
        display: 'inline-block',
        color: 'text.primary'
      }}
    >
      {text}
    </Typography>
  );
};

const getStockTrackingLabel = (isTrackable) => {
  return (
    <Typography
      variant="body2"
      sx={{
        color: isTrackable ? 'success.main' : 'text.secondary',
        fontWeight: isTrackable ? 600 : 400
      }}
    >
      {isTrackable ? 'Tracked' : 'Not Tracked'}
    </Typography>
  );
};

const getUnitDisplay = (unit) => {
  const unitMap = {
    kg: 'kg',
    g: 'g',
    lb: 'lb',
    bag: 'bag',
    sack: 'sack',
    liter: 'L',
    ml: 'mL',
    can: 'can',
    bottle: 'bottle',
    piece: 'pcs',
    set: 'set',
    roll: 'roll',
    meter: 'm',
    php: 'PHP'
  };
  return unitMap[unit] || unit;
};

const applyPagination = (items, page, limit) => {
  return items.slice(page * limit, page * limit + limit);
};

const InventoryTable = ({ items: propItems, onEdit, onDelete }) => {
  const theme = useTheme();

  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Success message state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const items = propItems || [];

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? items.map((i) => i.id) : []);
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

  // Handle delete confirmation dialog
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete && onDelete) {
      try {
        await onDelete(itemToDelete);
        
        // Show success message
        setSuccessMessage(`Item "${itemToDelete.item_name}" has been deleted successfully.`);
        setShowSuccessMessage(true);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
        
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    
    // Close dialog and reset state
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const paginated = applyPagination(items, page, limit);

  const selectedAll = selected.length === items.length && items.length > 0;
  const selectedSome = selected.length > 0 && selected.length < items.length;
  const bulkActionsActive = selected.length > 0;

  return (
    <>
      <Card>
        {/* Success Message */}
        <Collapse in={showSuccessMessage}>
          <Box p={2}>
            <Alert 
              severity="success" 
              onClose={() => setShowSuccessMessage(false)}
              sx={{ mb: 0 }}
            >
              {successMessage}
            </Alert>
          </Box>
        </Collapse>

        {bulkActionsActive && (
          <Box flex={1} p={2}>
            <BulkActions />
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
                <TableCell sx={{ width: '280px', fontWeight: 600, color: 'text.secondary' }}>
                  Item Details
                </TableCell>
                <TableCell sx={{ width: '140px', fontWeight: 600, color: 'text.secondary' }}>
                  Category
                </TableCell>
                <TableCell sx={{ width: '120px', fontWeight: 600, color: 'text.secondary' }}>
                  Type
                </TableCell>
                <TableCell sx={{ width: '100px', fontWeight: 600, color: 'text.secondary' }}>
                  Unit
                </TableCell>
                <TableCell align="right" sx={{ width: '140px', fontWeight: 600, color: 'text.secondary' }}>
                  Unit Value
                </TableCell>
                <TableCell align="right" sx={{ width: '140px', fontWeight: 600, color: 'text.secondary' }}>
                  Available Stock
                </TableCell>
                <TableCell align="right" sx={{ width: '140px', fontWeight: 600, color: 'text.secondary' }}>
                  Reserved
                </TableCell>
                <TableCell align="center" sx={{ width: '140px', fontWeight: 600, color: 'text.secondary' }}>
                  Stock Tracking
                </TableCell>
                <TableCell align="right" sx={{ width: '120px', fontWeight: 600, color: 'text.secondary' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <TableRow hover key={item.id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={(e) => handleSelectOne(e, item.id)}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: '280px' }}>
                        <Box>
                          <Typography fontWeight="bold" noWrap>
                            {item.item_name}
                          </Typography>
                          {item.description && (
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '250px' }}>
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{getAssistanceCategoryLabel(item.assistance_category)}</TableCell>
                      <TableCell>{getItemTypeLabel(item.item_type)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.unit ? getUnitDisplay(item.unit) : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {item.unit_value ? (
                          <Typography fontWeight="600" color="text.primary">
                            {formatCurrencyPeso(item.unit_value)}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight="600" 
                          color={getAvailableValue(item) > 0 ? 'success.main' : 'error.main'}
                        >
                          {formatStockValue(getAvailableValue(item), item.unit)} {getUnitDisplay(item.unit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight="600" 
                          color={getReservedValue(item) > 0 ? 'warning.main' : 'text.secondary'}
                        >
                          {formatStockValue(getReservedValue(item), item.unit)} {getUnitDisplay(item.unit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{getStockTrackingLabel(item.is_trackable_stock)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit Item" arrow>
                            <IconButton
                              size="small"
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'warning.main', backgroundColor: 'action.hover' }
                              }}
                              onClick={() => onEdit?.(item)}
                            >
                              <EditTwoToneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Item" arrow>
                            <IconButton
                              size="small"
                              sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main', backgroundColor: 'action.hover' }
                              }}
                              onClick={() => handleDeleteClick(item)}
                            >
                              <DeleteTwoToneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No inventory items found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start by adding your first inventory item.
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
            count={items.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={limit}
            onRowsPerPageChange={handleLimitChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="span">
            Delete Item
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this inventory item?
          </Typography>
          {itemToDelete && (
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: 'grey.50', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {itemToDelete.item_name}
              </Typography>
              {itemToDelete.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {itemToDelete.description}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Category: {itemToDelete.assistance_category} • Type: {itemToDelete.item_type}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

InventoryTable.propTypes = {
  items: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

InventoryTable.defaultProps = {
  items: []
};

export default InventoryTable;
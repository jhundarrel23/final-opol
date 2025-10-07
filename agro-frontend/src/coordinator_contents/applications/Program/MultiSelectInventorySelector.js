/* eslint-disable no-unused-vars */
// MultiSelectInventorySelector.jsx - Multi-select inventory selector for Step 1
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Chip,
  InputAdornment,
  LinearProgress,
  Stack,
  IconButton,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Alert,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Search as SearchIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  LocalAtm as CashIcon,
  LocalShipping as AidIcon,
  LocalGasStation as GasIcon,
  CardGiftcard as VoucherIcon,
  Build as ServiceIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';

const theme = {
  primary: '#2d5016',      // Forest Green
  secondary: '#4a7c59',    // Leaf Green
  success: '#2e7d32',      // Keep success green
  warning: '#ed6c02',       // Keep warning orange
  error: '#d32f2f',         // Keep error red
  info: '#4a7c59',         // Leaf Green for info
  background: '#f8fdf9',    // Light forest background
  surface: '#ffffff',
  surfaceVariant: '#e8f5e8', // Light forest variant
  outline: '#4a7c59',       // Leaf green outline
  primaryLight: '#e8f5e8',  // Light forest background
  successLight: '#e8f5e8',  // Light forest background
  warningLight: '#fff3e0',
  errorLight: '#ffebee'
};

const assistanceIcons = {
  aid: <AidIcon />,
  cash: <CashIcon />,
  gasoline: <GasIcon />,
  voucher: <VoucherIcon />,
  service: <ServiceIcon />
};

const assistanceColors = {
  aid: theme.primary,
  cash: theme.success,
  gasoline: theme.warning,
  voucher: theme.secondary,
  service: theme.info
};

const formatQuantity = (value, decimals = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '0';
  const factor = 10 ** decimals;
  const rounded = Math.round(num * factor) / factor;
  return rounded.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

const getStockStatus = (available, total) => {
  const percentage = (available / total) * 100;
  if (available <= 0) return { color: 'error', label: 'Out of Stock', severity: 'error' };
  if (percentage < 10) return { color: 'error', label: 'Critical', severity: 'error' };
  if (percentage < 30) return { color: 'warning', label: 'Low Stock', severity: 'warning' };
  return { color: 'success', label: 'In Stock', severity: 'success' };
};

const MultiSelectInventorySelector = ({
  inventoryOptions,
  selectedItems = [],
  onSelectItems,
  loading,
  disabled
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showSelectedDialog, setShowSelectedDialog] = useState(false);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = inventoryOptions;

    // Filter by assistance type
    if (filterType !== 'all') {
      items = items.filter(item => item.assistance_category === filterType);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.item_name.toLowerCase().includes(search) ||
        item.unit.toLowerCase().includes(search) ||
        (item.assistance_category || '').toLowerCase().includes(search)
      );
    }

    return items;
  }, [inventoryOptions, searchTerm, filterType]);

  const handleToggleItem = (item) => {
    if (disabled) return;
    
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      // Remove item
      onSelectItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      // Add item
      onSelectItems([...selectedItems, item]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onSelectItems([...filteredItems]);
  };

  const handleClearAll = () => {
    onSelectItems([]);
  };

  const handleRemoveItem = (itemId) => {
    onSelectItems(selectedItems.filter(item => item.id !== itemId));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Loading inventory items...
        </Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Search items by name, unit, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            color={showFilters ? 'primary' : 'default'}
            sx={{ 
              border: `1px solid ${theme.outline}`,
              borderRadius: 2,
              '&:hover': { bgcolor: theme.primaryLight }
            }}
          >
            <FilterIcon />
          </IconButton>
        </Box>

        <Collapse in={showFilters}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: theme.surfaceVariant }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="600">
              Filter by Type
            </Typography>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(e, newValue) => newValue && setFilterType(newValue)}
              size="small"
              sx={{ 
                mt: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButton-root': {
                  flex: '1 1 auto',
                  minWidth: '100px'
                }
              }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="aid">
                <AidIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> aid
              </ToggleButton>
              <ToggleButton value="cash">
                <CashIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Cash
              </ToggleButton>
              <ToggleButton value="gasoline">
                <GasIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Fuel
              </ToggleButton>
              <ToggleButton value="service">
                <ServiceIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> Service
              </ToggleButton>
            </ToggleButtonGroup>
          </Card>
        </Collapse>

        {/* Selection Controls */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={handleSelectAll}
              disabled={disabled || filteredItems.length === 0}
              sx={{ 
                borderColor: theme.primary,
                color: theme.primary,
                '&:hover': { borderColor: theme.primary, bgcolor: theme.primaryLight }
              }}
            >
              Select All Visible
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={handleClearAll}
              disabled={disabled || selectedItems.length === 0}
              sx={{ 
                borderColor: theme.error,
                color: theme.error,
                '&:hover': { borderColor: theme.error, bgcolor: theme.errorLight }
              }}
            >
              Clear All
            </Button>
          </Box>
          
          {selectedItems.length > 0 && (
            <Button
              size="small"
              variant="contained"
              onClick={() => setShowSelectedDialog(true)}
              sx={{ 
                bgcolor: theme.primary,
                '&:hover': { bgcolor: theme.primary + 'dd' }
              }}
            >
              View Selected ({selectedItems.length})
            </Button>
          )}
        </Box>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ 
              bgcolor: theme.successLight,
              borderRadius: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" fontWeight="600">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click "View Selected" to see details or "Clear All" to start over
                </Typography>
              </Box>
            </Box>
          </Alert>
        )}
      </Stack>

      {/* Inventory Cards Grid */}
      {filteredItems.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {searchTerm || filterType !== 'all'
            ? 'No items match your search or filter criteria.'
            : 'No inventory items available. Please add items to your inventory first.'}
        </Alert>
      ) : (
        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
          <Grid container spacing={2}>
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some(selected => selected.id === item.id);
              const stockStatus = getStockStatus(item.available_stock, item.on_hand);
              const percentAvailable = item.on_hand > 0 
                ? (item.available_stock / item.on_hand) * 100 
                : 0;
              const assistanceColor = assistanceColors[item.assistance_category] || theme.info;

              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    variant="outlined"
                    onClick={() => handleToggleItem(item)}
                    sx={{
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      borderRadius: 2,
                      border: isSelected 
                        ? `2px solid ${theme.primary}` 
                        : `1px solid ${theme.outline}`,
                      bgcolor: isSelected ? theme.primaryLight : theme.surface,
                      transition: 'all 0.2s ease',
                      opacity: disabled ? 0.6 : 1,
                      '&:hover': disabled ? {} : {
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                        borderColor: theme.primary
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Box flex="1">
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                bgcolor: assistanceColor + '20',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: assistanceColor
                              }}
                            >
                              {assistanceIcons[item.assistance_category] || <InventoryIcon />}
                            </Box>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ flex: 1, fontSize: '0.875rem' }}>
                              {item.item_name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Unit: {item.unit}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={isSelected}
                          color="primary"
                          sx={{ 
                            p: 0.5,
                            '&.Mui-checked': { color: theme.primary }
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Stock Information */}
                      <Box mb={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Stock Status
                          </Typography>
                          <Chip
                            label={stockStatus.label}
                            color={stockStatus.color}
                            size="small"
                            sx={{ height: '20px', fontSize: '0.7rem' }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(percentAvailable, 100)}
                          color={stockStatus.color}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: theme.outline,
                            mb: 1
                          }}
                        />
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              On Hand
                            </Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.813rem' }}>
                              {formatQuantity(item.on_hand)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Reserved
                            </Typography>
                            <Typography variant="body2" fontWeight="600" color={theme.warning} sx={{ fontSize: '0.813rem' }}>
                              {formatQuantity(item.reserved)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Available
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="600"
                              color={item.available_stock > 0 ? theme.success : theme.error}
                              sx={{ fontSize: '0.813rem' }}
                            >
                              {formatQuantity(item.available_stock)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Category Badge */}
                      <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                        <Chip
                          label={item.assistance_category || 'other'}
                          size="small"
                          sx={{
                            bgcolor: assistanceColor + '20',
                            color: assistanceColor,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: '20px',
                            textTransform: 'capitalize'
                          }}
                        />
                        {item.is_trackable_stock && (
                          <Chip
                            label="Trackable"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Results Summary */}
      <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.outline}` }}>
        <Typography variant="caption" color="text.secondary">
          Showing {filteredItems.length} of {inventoryOptions.length} items
          {selectedItems.length > 0 && ` • ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''} selected`}
        </Typography>
      </Box>

      {/* Selected Items Dialog */}
      <Dialog
        open={showSelectedDialog}
        onClose={() => setShowSelectedDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Selected Items ({selectedItems.length})
            </Typography>
            <IconButton onClick={() => setShowSelectedDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedItems.map((item) => (
              <ListItem key={item.id} divider>
                <ListItemText
                  primary={item.item_name}
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Unit: {item.unit} • Available: {formatQuantity(item.available_stock)} {item.unit}
                      </Typography>
                      <Chip
                        label={item.assistance_category || 'other'}
                        size="small"
                        sx={{
                          ml: 1,
                          bgcolor: assistanceColors[item.assistance_category] + '20',
                          color: assistanceColors[item.assistance_category],
                          fontSize: '0.7rem',
                          height: '20px',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveItem(item.id)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSelectedDialog(false)}>
            Close
          </Button>
          <Button
            onClick={handleClearAll}
            color="error"
            variant="outlined"
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiSelectInventorySelector;

/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Alert
} from '@mui/material';
import axiosInstance from '../../../api/axiosInstance';

const EditItemModal = ({ open, onClose, onSubmit, item }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    assistance_category: 'aid',
    item_type: 'seed',
    unit: 'kg',
    unit_value: '',
    is_trackable_stock: true,
    available: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const assistanceCategoryOptions = [
    { id: 'aid', name: 'aid Items' },
    { id: 'monetary', name: 'Monetary Assistance' },
    { id: 'service', name: 'Service/Support' }
  ];

  const itemTypeOptions = [
    { id: 'seed', name: 'Seeds' },
    { id: 'fertilizer', name: 'Fertilizer' },
    { id: 'pesticide', name: 'Pesticide' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'fuel', name: 'Fuel' },
    { id: 'cash', name: 'Cash' },
    { id: 'other', name: 'Other' }
  ];

  const unitOptions = [
    { id: 'kg', name: 'Kilograms (kg)' },
    { id: 'g', name: 'Grams (g)' },
    { id: 'lb', name: 'Pounds (lb)' },
    { id: 'bag', name: 'Bags' },
    { id: 'sack', name: 'Sacks' },
    { id: 'liter', name: 'Liters (L)' },
    { id: 'ml', name: 'Milliliters (mL)' },
    { id: 'can', name: 'Cans' },
    { id: 'bottle', name: 'Bottles' },
    { id: 'piece', name: 'Pieces' },
    { id: 'set', name: 'Sets' },
    { id: 'roll', name: 'Rolls' },
    { id: 'meter', name: 'Meters (m)' },
    { id: 'php', name: 'PHP (₱)' }
  ];

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name || '',
        description: item.description || '',
        assistance_category: item.assistance_category || 'aid',
        item_type: item.item_type || 'seed',
        unit: item.unit || 'kg',
        unit_value: item.unit_value || '',
        is_trackable_stock: item.is_trackable_stock ?? true,
        available: item.available ?? item.available_stock ?? item.current_stock ?? item.on_hand ?? 0
      });
    }
  }, [item]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setError('');
      setLoading(false);
    }
  }, [open]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.item_name.trim()) {
        throw new Error('Item name is required');
      }

      // Prepare data for API
      const submitData = {
        item_name: formData.item_name.trim(),
        description: formData.description.trim(),
        assistance_category: formData.assistance_category,
        item_type: formData.item_type,
        unit: formData.unit,
        unit_value: formData.unit_value ? parseFloat(formData.unit_value) : null,
        is_trackable_stock: formData.is_trackable_stock,
        available: formData.is_trackable_stock ? parseFloat(formData.available) || 0 : 0
      };

      // Make API call to update item
      const response = await axiosInstance.put(`/api/inventories/${item.id}`, submitData);
      
      console.log('✅ Item Updated:', response.data);
      
      // Call parent callback with updated item
      onSubmit(response.data);
      onClose();
      
    } catch (err) {
      console.error('❌ Error updating item:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="600">
          Edit Inventory Item
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update the details for "{item.item_name}"
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.item_name}
                onChange={handleInputChange('item_name')}
                required
                error={!formData.item_name.trim()}
                helperText={!formData.item_name.trim() ? 'Item name is required' : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Assistance Category</InputLabel>
                <Select
                  value={formData.assistance_category}
                  onChange={handleInputChange('assistance_category')}
                  label="Assistance Category"
                >
                  {assistanceCategoryOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                multiline
                rows={2}
                placeholder="Optional description of the item"
              />
            </Grid>

            {/* Item Classification */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, mt: 2 }}>
                Item Classification
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Item Type</InputLabel>
                <Select
                  value={formData.item_type}
                  onChange={handleInputChange('item_type')}
                  label="Item Type"
                >
                  {itemTypeOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={handleInputChange('unit')}
                  label="Unit of Measure"
                >
                  {unitOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, mt: 2 }}>
                Pricing
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit Value (₱)"
                type="number"
                value={formData.unit_value}
                onChange={handleInputChange('unit_value')}
                inputProps={{ 
                  min: "0", 
                  step: "0.01" 
                }}
                placeholder="0.00"
                helperText="Cost per unit in Philippine Pesos"
              />
            </Grid>

            {/* Stock Management */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, mt: 2 }}>
                Stock Management
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_trackable_stock}
                    onChange={handleSwitchChange('is_trackable_stock')}
                  />
                }
                label="Track stock levels for this item"
              />
            </Grid>

            {formData.is_trackable_stock && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Available Stock"
                    type="number"
                    value={formData.available}
                    onChange={handleInputChange('available')}
                    inputProps={{ 
                      min: "0", 
                      step: "0.01" 
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reserved Stock"
                    type="number"
                    value={formData.reserved}
                    onChange={handleInputChange('reserved')}
                    inputProps={{ 
                      min: "0", 
                      step: "0.01" 
                    }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={onClose}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.item_name.trim()}
            sx={{
              minWidth: 100,
              borderRadius: '8px'
            }}
          >
            {loading ? 'Updating...' : 'Update Item'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

EditItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  item: PropTypes.object
};

export default EditItemModal;
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Alert,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../../api/axiosInstance';

const AddItemModal = ({ open, onClose, onSubmit }) => {
  // ---------------- UNITS ----------------
  const allUnits = {
    weight: [
      { value: 'kg', label: 'Kilogram (kg)' },
      { value: 'g', label: 'Gram (g)' }
    ],
    volume: [
      { value: 'liter', label: 'Liter (L)' },
      { value: 'ml', label: 'Milliliter (mL)' }
    ],
    container: [
      { value: 'bag', label: 'Bag' },
      { value: 'sack', label: 'Sack' },
      { value: 'can', label: 'Can' },
      { value: 'bottle', label: 'Bottle' }
    ],
    count: [
      { value: 'piece', label: 'Piece (pc)' },
      { value: 'set', label: 'Set' },
      { value: 'roll', label: 'Roll' }
    ],
    length: [{ value: 'meter', label: 'Meter (m)' }],
    currency: [{ value: 'php', label: 'Philippine Peso (PHP)' }]
  };

  const unitMapping = {
    seed: [...allUnits.weight, ...allUnits.container],
    fertilizer: [...allUnits.weight, ...allUnits.container],
    pesticide: [...allUnits.volume, ...allUnits.container],
    fuel: [...allUnits.volume],
    equipment: [...allUnits.count, ...allUnits.length],
    other: [...allUnits.weight, ...allUnits.volume, ...allUnits.container, ...allUnits.count, ...allUnits.length],
    cash: [...allUnits.currency]
  };

  // ---------------- STATE ----------------
  const [form, setForm] = useState({
    item_name: '',
    unit: '',
    item_type: '',
    assistance_category: '',
    is_trackable_stock: true,
    unit_value: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // ---------------- OPTIONS ----------------
  const aidItemTypes = [
    { value: 'seed', label: 'Seed' },
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'pesticide', label: 'Pesticide' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'other', label: 'Other' }
  ];

  // ✅ REMOVED 'service' option
  const assistanceCategoryOptions = [
    { value: 'aid', label: 'Aid Items' },
    { value: 'monetary', label: 'Monetary Assistance' }
  ];

  // ---------------- HANDLERS ----------------
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setForm((prev) => {
        const updated = { ...prev, [name]: fieldValue };

        // Reset dependent fields when changing item_type under aid
        if (name === 'item_type' && prev.assistance_category === 'aid') {
          updated.unit = '';
        }

        return updated;
      });

      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Adjust form based on assistance_category
  useEffect(() => {
    setForm((prev) => {
      if (prev.assistance_category === 'monetary') {
        return {
          ...prev,
          item_type: 'cash',
          item_name: 'Cash Assistance',
          unit: 'php',
          is_trackable_stock: false
        };
      }
      if (prev.assistance_category === 'aid') {
        return {
          ...prev,
          item_type: '',
          unit: '',
          item_name: '',
          is_trackable_stock: true
        };
      }
      return prev;
    });
  }, [form.assistance_category]);

  // ---------------- VALIDATION ----------------
  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.assistance_category) {
      newErrors.assistance_category = 'Please select assistance category';
    }

    if (form.assistance_category === 'aid') {
      if (!form.item_name.trim()) newErrors.item_name = 'Item name is required';
      if (!form.unit) newErrors.unit = 'Unit is required';
      if (!form.item_type) newErrors.item_type = 'Item type is required';
    }

    if (form.assistance_category === 'monetary') {
      if (!form.unit_value || isNaN(form.unit_value) || Number(form.unit_value) <= 0) {
        newErrors.unit_value = 'Amount must be greater than 0';
      }
    }

    if (form.unit_value && (isNaN(form.unit_value) || Number(form.unit_value) < 0)) {
      newErrors.unit_value = 'Unit value must be positive';
    }

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }, [form]);

  const resetForm = () => {
    setForm({
      item_name: '',
      unit: '',
      item_type: '',
      assistance_category: '',
      is_trackable_stock: true,
      unit_value: '',
      description: ''
    });
    setErrors({});
    setSuccessInfo(null);
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        item_name: form.item_name.trim(),
        unit: form.unit || null,
        item_type: form.item_type,
        assistance_category: form.assistance_category,
        is_trackable_stock: form.is_trackable_stock && form.assistance_category === 'aid',
        unit_value: form.unit_value ? parseFloat(form.unit_value) : null,
        description: form.description.trim() || null
      };

      const { data } = await axiosInstance.post('api/inventory/items', payload);

      setSuccessInfo({
        item_name: form.item_name || `${form.item_type} assistance`,
        type: form.assistance_category
      });

      onSubmit?.(data);

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('❌ Error creating item:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Failed to create item. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // ---------------- DERIVED ----------------
  const isAidItem = form.assistance_category === 'aid';
  const isMonetaryItem = form.assistance_category === 'monetary';

  const availableUnits = useMemo(() => {
    if (isAidItem && form.item_type) return unitMapping[form.item_type] || [];
    if (isMonetaryItem) return unitMapping.cash || [];
    return [];
  }, [isAidItem, isMonetaryItem, form.item_type]);

  const getUnitHelperText = () => {
    if (isAidItem && form.item_type) {
      const unitTypes = {
        seed: 'Seeds are typically measured in kg, g, sack, or bag',
        fertilizer: 'Fertilizers are typically measured in kg, g, sack, or bag',
        pesticide: 'Pesticides are typically measured in liters, ml, bottle, or can',
        fuel: 'Fuel is typically measured in liters',
        equipment: 'Equipment is typically measured in pieces, sets, rolls, or meters',
        other: 'Select appropriate unit for this item'
      };
      return unitTypes[form.item_type];
    }
    if (isMonetaryItem) return 'Monetary assistance is in Philippine Peso (PHP)';
    return '';
  };

  // ---------------- RENDER ----------------
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Add New Inventory Item
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create a new item for your inventory management system
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {successInfo && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>{successInfo.item_name}</strong> ({successInfo.type}) added successfully!
          </Alert>
        )}

        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Grid container spacing={3} mt={0.5}>
          {/* Category */}
          <Grid item xs={12}>
            <FormControl fullWidth required error={!!errors.assistance_category}>
              <InputLabel>Assistance Category</InputLabel>
              <Select name="assistance_category" value={form.assistance_category} onChange={handleChange}>
                {assistanceCategoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.assistance_category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {errors.assistance_category}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {form.assistance_category && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {isAidItem && 'Aid Item Details'}
                    {isMonetaryItem && 'Monetary Assistance Details'}
                  </Typography>
                </Divider>
              </Grid>

              {/* Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Item Name"
                  name="item_name"
                  value={form.item_name}
                  onChange={handleChange}
                  error={!!errors.item_name}
                  helperText={errors.item_name}
                  disabled={isMonetaryItem}
                />
              </Grid>

              {/* Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required={isAidItem} error={!!errors.item_type} disabled={!isAidItem}>
                  <InputLabel>Item Type</InputLabel>
                  <Select name="item_type" value={form.item_type} onChange={handleChange}>
                    {isAidItem &&
                      aidItemTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    {isMonetaryItem && <MenuItem value="cash">Cash</MenuItem>}
                  </Select>
                  {errors.item_type && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.item_type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Unit */}
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  required={isAidItem || isMonetaryItem}
                  error={!!errors.unit}
                  disabled={isAidItem && !form.item_type}
                >
                  <InputLabel>Unit</InputLabel>
                  <Select name="unit" value={form.unit} onChange={handleChange}>
                    {availableUnits.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.unit ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {errors.unit}
                    </Typography>
                  ) : (
                    getUnitHelperText() && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                        {getUnitHelperText()}
                      </Typography>
                    )
                  )}
                </FormControl>
              </Grid>

              {/* Unit Value */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  required={isMonetaryItem}
                  label={isMonetaryItem ? 'Amount (PHP)' : 'Unit Value'}
                  name="unit_value"
                  value={form.unit_value}
                  onChange={handleChange}
                  error={!!errors.unit_value}
                  helperText={
                    errors.unit_value ||
                    (isMonetaryItem ? 'Enter cash amount' : 'Optional - cost per unit')
                  }
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>

              {/* Trackable Stock */}
              {isAidItem && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="is_trackable_stock"
                        checked={form.is_trackable_stock}
                        onChange={handleChange}
                      />
                    }
                    label="Track Stock Quantities"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Enable stock level tracking for this item
                  </Typography>
                </Grid>
              )}

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description || 'Optional - additional details'}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {successInfo ? 'Close' : 'Cancel'}
        </Button>
        {!successInfo && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading || !form.assistance_category}>
            {loading ? 'Creating...' : 'Add Item'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

AddItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func
};

export default AddItemModal;
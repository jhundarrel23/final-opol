/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
  Autocomplete,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  CircularProgress,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Inventory, 
  Receipt, 
  Assignment, 
  AccountBalance,
  Check,
  RadioButtonUnchecked,
  AutoFixHigh,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import axiosInstance from '../../../api/axiosInstance';
import { useBeneficiaries } from "../Program/useBeneficiaries"; // Adjust path as needed

// Custom Step Icon Component
const CustomStepIcon = ({ active, completed, icon }) => {
  if (completed) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'success.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <Check fontSize="small" />
      </Box>
    );
  }
  
  if (active) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.15)'
        }}
      >
        {icon}
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'grey.200',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'grey.500',
        border: '1px solid',
        borderColor: 'grey.300'
      }}
    >
      <RadioButtonUnchecked fontSize="small" />
    </Box>
  );
};

const AddStockModal = ({ open, onClose, onSubmit, onStockAdded, userRole = 'coordinator' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [formData, setFormData] = useState({
    inventory_id: '',
    quantity: '',
    movement_type: 'stock_in',
    transaction_type: 'purchase',
    unit_cost: '',
    reference: '',
    source: '',
    destination: '',
    beneficiary_id: '', // Added for beneficiary tracking
    date_received: new Date(),
    transaction_date: new Date(),
    batch_number: '',
    expiry_date: null,
    remarks: '',
    status: 'pending',
    transacted_by: null
  });

  const [inventoryItems, setInventoryItems] = useState([]);
  const [itemStocks, setItemStocks] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]); // files/images to upload
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [calculatedValues, setCalculatedValues] = useState({
    total_value: 0,
    running_balance: 0
  });

  // Beneficiaries hook
  const {
    beneficiaryOptions,
    beneficiariesLoading,
    beneficiariesError,
    fetchBeneficiaries,
    resetBeneficiariesState
  } = useBeneficiaries();

  // State for optional donation values
  const [showOptionalValues, setShowOptionalValues] = useState(false);

  // Stock validation state
  const [stockValidation, setStockValidation] = useState({
    currentStock: 0,
    isChecking: false,
    hasError: false,
    errorMessage: ''
  });

  // Simplified workflow steps
  const steps = [
    { label: 'Item & Transaction', icon: <Inventory fontSize="small" /> },
    { label: 'Details & Dates', icon: <Assignment fontSize="small" /> },
    { label: 'Review & Submit', icon: <Receipt fontSize="small" /> }
  ];

  // Movement types
  const movementTypes = [
    { value: 'stock_in', label: 'Stock In', desc: 'Items coming into inventory' },
    { value: 'stock_out', label: 'Stock Out', desc: 'Items leaving inventory' },
    { value: 'adjustment', label: 'Adjustment', desc: 'Quantity corrections' },
    { value: 'transfer', label: 'Transfer', desc: 'Moving between locations' },
    { value: 'distribution', label: 'Distribution', desc: 'Items distributed to beneficiaries' }
  ];

  // Transaction types mapped to movement types
  const transactionTypes = {
    stock_in: [
      { value: 'purchase', label: 'Purchase', requiresCost: true, requiresSource: true },
      { value: 'grant', label: 'Grant', requiresCost: false, requiresSource: true, allowsOptionalCost: true },
      { value: 'return', label: 'Return', requiresCost: false, requiresSource: false },
      { value: 'transfer_in', label: 'Transfer In', requiresCost: false, requiresSource: true },
      { value: 'adjustment', label: 'Stock Adjustment (+)', requiresCost: false, requiresSource: false },
      { value: 'initial_stock', label: 'Initial Stock', requiresCost: true, requiresSource: false }
    ],
    stock_out: [
      { value: 'distribution', label: 'Distribution', requiresDestination: true },
      { value: 'damage', label: 'Damaged/Lost', requiresDestination: false },
      { value: 'expired', label: 'Expired Items', requiresDestination: false },
      { value: 'transfer_out', label: 'Transfer Out', requiresDestination: true },
      { value: 'adjustment', label: 'Stock Adjustment (-)', requiresDestination: false }
    ],
    adjustment: [
      { value: 'adjustment', label: 'Stock Count Adjustment', requiresCost: false }
    ],
    transfer: [
      { value: 'transfer_in', label: 'Transfer In', requiresSource: true },
      { value: 'transfer_out', label: 'Transfer Out', requiresDestination: true }
    ],
    distribution: [
      { value: 'distribution', label: 'Beneficiary Distribution', requiresDestination: true }
    ]
  };

  // Source/Destination suggestions
  const commonSources = [
    'Main Warehouse',
    'Agricultural Supply Store',
    'Donation Center',
    'Regional Office',
    'Partner Organization',
    'Field Collection',
    'Return Processing'
  ];

  const commonDestinations = [
    'Distribution Center',
    'Beneficiary Group A',
    'Beneficiary Group B',
    'Field Office',
    'Emergency Reserve',
    'Quality Control',
    'Disposal Area'
  ];

  // Common reference patterns
  const referencePatterns = {
    purchase: 'PO-YYYY-###',
    grant: 'DON-YYYY-###',
    distribution: 'DIST-YYYY-###',
    transfer_in: 'TIN-YYYY-###',
    transfer_out: 'TOUT-YYYY-###',
    adjustment: 'ADJ-YYYY-###'
  };

  // Helper function to check if transaction reduces stock
  const isStockReductionTransaction = (movementType, transactionType) => {
    const reductionMovements = ['stock_out', 'distribution'];
    const reductionTransactions = ['distribution', 'damage', 'expired', 'transfer_out'];
    
    return reductionMovements.includes(movementType) || 
           reductionTransactions.includes(transactionType);
  };

  // Helper function to check if current transaction allows optional cost
  const allowsOptionalCost = () => {
    const currentTransactionType = getCurrentTransactionType();
    return currentTransactionType?.allowsOptionalCost === true;
  };

  // Enhanced function to get item stock
  const getItemStock = (item) => {
    if (!item) return 0;
    
    const itemId = item.id;
    if (itemStocks[itemId] !== undefined) {
      return itemStocks[itemId];
    }
    
    return item?.current_stock || 
           item?.stock || 
           item?.quantity || 
           item?.on_hand || 
           item?.available_stock || 
           item?.stock_quantity ||
           item?.remaining_stock ||
           item?.stock_on_hand ||
           item?.available_quantity ||
           item?.total_stock ||
           0;
  };

  // Function to fetch individual item stock
  const fetchItemStock = async (itemId) => {
    try {
      const response = await axiosInstance.get('/api/inventory/items');
      const items = Array.isArray(response.data) ? response.data : response.data.data || [];
      const item = items.find(item => item.id == itemId);
      
      if (!item) return 0;
      
      const stockValue = item.current_stock ||
                        item.stock ||
                        item.on_hand ||
                        item.available ||
                        item.quantity ||
                        0;
      
      return stockValue;
      
    } catch (error) {
      console.warn('Failed to fetch items:', error.response?.status, error.message);
      return 0;
    }
  };

  // Function to check stock availability
  const checkStockAvailability = async (inventoryId, requestedQuantity) => {
    if (!inventoryId || !requestedQuantity || requestedQuantity <= 0) {
      setStockValidation({
        currentStock: 0,
        isChecking: false,
        hasError: false,
        errorMessage: ''
      });
      return;
    }

    if (!isStockReductionTransaction(formData.movement_type, formData.transaction_type)) {
      setStockValidation({
        currentStock: 0,
        isChecking: false,
        hasError: false,
        errorMessage: ''
      });
      return;
    }

    setStockValidation(prev => ({ ...prev, isChecking: true, hasError: false }));

    try {
      const selectedItem = inventoryItems.find(item => item.id === inventoryId);
      let currentStock = getItemStock(selectedItem);
      let hasApiData = false;

      try {
        const response = await axiosInstance.get(
          `/api/inventory/stocks/check/${inventoryId}/${requestedQuantity}`
        );

        if (response.status === 200 && response.data) {
          currentStock = response.data.on_hand || response.data.available || currentStock;
          hasApiData = true;
          
          setStockValidation({
            currentStock,
            isChecking: false,
            hasError: false,
            errorMessage: ''
          });
          return;
        }
      } catch (apiError) {
        if (apiError.response?.status === 422 && apiError.response?.data) {
          const errorData = apiError.response.data;
          setStockValidation({
            currentStock: errorData.on_hand || 0,
            isChecking: false,
            hasError: true,
            errorMessage: `${errorData.message || 'Insufficient stock'}. Available: ${errorData.available || 0}, Required: ${errorData.required || requestedQuantity}`
          });
          return;
        }
        
        console.warn('API stock check failed, using local data:', apiError);
        hasApiData = false;
      }

      if (!hasApiData) {
        if (currentStock === 0) {
          setStockValidation({
            currentStock: 0,
            isChecking: false,
            hasError: true,
            errorMessage: 'No stock available for this item. Cannot proceed with distribution/stock-out.'
          });
          return;
        }

        if (currentStock < requestedQuantity) {
          setStockValidation({
            currentStock,
            isChecking: false,
            hasError: true,
            errorMessage: `Insufficient stock (local check). Only ${currentStock} units available, but ${requestedQuantity} requested.`
          });
          return;
        }

        setStockValidation({
          currentStock,
          isChecking: false,
          hasError: false,
          errorMessage: ''
        });
      }

    } catch (error) {
      console.error('Error checking stock:', error);
      setStockValidation({
        currentStock: 0,
        isChecking: false,
        hasError: true,
        errorMessage: 'Failed to check stock availability. Please try again.'
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchInventoryItems();
      fetchBeneficiaries(); // Fetch beneficiaries when modal opens
      resetForm();
    } else {
      resetBeneficiariesState(); // Clean up when modal closes
    }
  }, [open]);

  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitCost = parseFloat(formData.unit_cost) || 0;
    const totalValue = quantity * unitCost;
    
    setCalculatedValues(prev => ({
      ...prev,
      total_value: totalValue
    }));
  }, [formData.quantity, formData.unit_cost]);

  useEffect(() => {
    const availableTypes = transactionTypes[formData.movement_type] || [];
    if (!availableTypes.find(t => t.value === formData.transaction_type)) {
      setFormData(prev => ({
        ...prev,
        transaction_type: availableTypes[0]?.value || 'purchase'
      }));
    }
  }, [formData.movement_type]);

  useEffect(() => {
    if (!allowsOptionalCost()) {
      setShowOptionalValues(false);
      if (!getCurrentTransactionType()?.requiresCost) {
        setFormData(prev => ({ ...prev, unit_cost: '' }));
      }
    }
  }, [formData.transaction_type, formData.movement_type]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.inventory_id && formData.quantity && formData.movement_type && formData.transaction_type) {
        checkStockAvailability(formData.inventory_id, parseFloat(formData.quantity));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.inventory_id, formData.quantity, formData.movement_type, formData.transaction_type]);

  const fetchInventoryItems = async () => {
    try {
      let response;
      try {
        response = await axiosInstance.get('/api/inventory/items');
      } catch (error) {
        response = await axiosInstance.get('/api/inventories');
      }
      
      const items = response.data.data || response.data || [];
      setInventoryItems(items);
      
      const stockPromises = items.map(async (item) => {
        const stock = await fetchItemStock(item.id);
        return { id: item.id, stock };
      });
      
      try {
        const stockResults = await Promise.allSettled(stockPromises);
        const stockMap = {};
        
        stockResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const { id, stock } = result.value;
            stockMap[id] = stock;
          } else {
            const item = items[index];
            stockMap[item.id] = getItemStock(item);
          }
        });
        
        setItemStocks(stockMap);
      } catch (error) {
        console.warn('Failed to fetch individual stock levels, using item properties:', error);
        const stockMap = {};
        items.forEach(item => {
          stockMap[item.id] = getItemStock(item);
        });
        setItemStocks(stockMap);
      }
      
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      setInventoryItems([]);
      setItemStocks({});
    }
  };

  const resetForm = () => {
    setFormData({
      inventory_id: '',
      quantity: '',
      movement_type: 'stock_in',
      transaction_type: 'purchase',
      unit_cost: '',
      reference: '',
      source: '',
      destination: '',
      beneficiary_id: '',
      date_received: new Date(),
      transaction_date: new Date(),
      batch_number: '',
      expiry_date: null,
      remarks: '',
      status: 'pending',
      transacted_by: null
    });
    setErrors({});
    setCalculatedValues({ total_value: 0, running_balance: 0 });
    setAttachments([]);
    setAttachmentPreviews([]);
    setStockValidation({
      currentStock: 0,
      isChecking: false,
      hasError: false,
      errorMessage: ''
    });
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setShowOptionalValues(false);
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const next = [...attachments, ...files];
    setAttachments(next);
    const newPreviews = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachmentPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeAttachmentAt = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (field) => (event) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.inventory_id) newErrors.inventory_id = 'Please select an inventory item';
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
          newErrors.quantity = 'Quantity must be greater than 0';
        }
        
        if (stockValidation.hasError && isStockReductionTransaction(formData.movement_type, formData.transaction_type)) {
          newErrors.quantity = stockValidation.errorMessage;
        }
        
        if (!formData.movement_type) newErrors.movement_type = 'Please select movement type';
        if (!formData.transaction_type) newErrors.transaction_type = 'Please select transaction type';
        break;
        
      case 1:
        const currentTransactionType = getCurrentTransactionType();
        if (currentTransactionType?.requiresSource && !formData.source) {
          newErrors.source = 'Source is required for this transaction type';
        }
        if (currentTransactionType?.requiresDestination && !formData.destination) {
          newErrors.destination = 'Destination is required for this transaction type';
        }
        if (currentTransactionType?.requiresCost && !formData.unit_cost) {
          newErrors.unit_cost = 'Unit cost is required for this transaction type';
        }
        if (!formData.transaction_date) newErrors.transaction_date = 'Transaction date is required';
        if (formData.movement_type === 'stock_in' && !formData.date_received) {
          newErrors.date_received = 'Date received is required for stock in transactions';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCurrentTransactionType = () => {
    const types = transactionTypes[formData.movement_type] || [];
    return types.find(t => t.value === formData.transaction_type);
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (stockValidation.hasError && isStockReductionTransaction(formData.movement_type, formData.transaction_type)) {
      setErrors({ quantity: stockValidation.errorMessage });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        total_value: calculatedValues.total_value,
        beneficiary_id: formData.beneficiary_id || null, // Include beneficiary_id
        date_received: formData.date_received ? new Date(formData.date_received).toISOString().split('T')[0] : null,
        transaction_date: new Date(formData.transaction_date).toISOString().split('T')[0],
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : null,
        unit_cost: formData.unit_cost || null,
        source: formData.source || null,
        destination: formData.destination || null,
        reference: formData.reference || null,
        batch_number: formData.batch_number || null,
        remarks: formData.remarks || null,
        status: 'pending'
      };

      const postWithOptionalFiles = async () => {
        // If there are attachments, send multipart/form-data
        if (attachments.length > 0) {
          const form = new FormData();
          Object.entries(submitData).forEach(([k, v]) => {
            if (v !== undefined && v !== null) form.append(k, v);
          });
          attachments.forEach((file) => form.append('attachments[]', file));
          try {
            await axiosInstance.post('/api/inventory-stocks', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            return;
          } catch (err) {
            // fallback to alternate endpoint
            await axiosInstance.post('/api/inventory/stocks', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            return;
          }
        }
        // Otherwise, send JSON
        try {
          await axiosInstance.post('/api/inventory-stocks', submitData);
        } catch (error) {
          await axiosInstance.post('/api/inventory/stocks', submitData);
        }
      };

      if (onSubmit) {
        await onSubmit(submitData, attachments);
      } else {
        await postWithOptionalFiles();
        if (onStockAdded) onStockAdded();
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data?.error === 'Insufficient stock') {
        setErrors({ 
          quantity: error.response.data.message || 'Insufficient stock available'
        });
        setCurrentStep(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateReference = () => {
    const pattern = referencePatterns[formData.transaction_type] || 'REF-YYYY-###';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return pattern.replace('YYYY', year).replace('###', random);
  };

  const getItemDisplayName = (item) => item?.item_name || item?.name || 'Unknown Item';
  const getItemUnit = (item) => item?.unit || 'unit';

  const renderStockStatusAlert = () => {
    if (!formData.inventory_id || !isStockReductionTransaction(formData.movement_type, formData.transaction_type)) {
      return null;
    }

    if (stockValidation.isChecking) {
      return (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Checking stock availability...</Typography>
          </Box>
        </Alert>
      );
    }

    if (stockValidation.currentStock === 0) {
      return (
        <Alert severity="error" icon={<Error />} sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>No Stock Available</Typography>
          <Typography variant="body2">
            This item has no stock available. You cannot proceed with this transaction type.
          </Typography>
        </Alert>
      );
    }

    if (stockValidation.hasError) {
      return (
        <Alert severity="error" icon={<Error />} sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Insufficient Stock</Typography>
          <Typography variant="body2">{stockValidation.errorMessage}</Typography>
        </Alert>
      );
    }

    if (stockValidation.currentStock > 0 && stockValidation.currentStock < 10) {
      return (
        <Alert severity="warning" icon={<Warning />} sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Low Stock Warning</Typography>
          <Typography variant="body2">
            Only {stockValidation.currentStock} units available. Consider if this quantity is appropriate for distribution.
          </Typography>
        </Alert>
      );
    }

    if (stockValidation.currentStock > 0) {
      return (
        <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Stock Available</Typography>
          <Typography variant="body2">
            {stockValidation.currentStock} units available for this transaction.
          </Typography>
        </Alert>
      );
    }

    return null;
  };

  const renderOptionalValueFields = () => {
    if (!allowsOptionalCost()) return null;

    return (
      <Grid item xs={12}>
        <Card 
          variant="outlined" 
          sx={{ 
            border: '1px dashed', 
            borderColor: 'grey.300',
            backgroundColor: 'grey.25'
          }}
        >
          <CardContent sx={{ pt: 2, pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                variant="text"
                onClick={() => setShowOptionalValues(!showOptionalValues)}
                startIcon={showOptionalValues ? <ExpandLess /> : <ExpandMore />}
                sx={{ 
                  color: 'text.secondary',
                  textTransform: 'none',
                  fontWeight: 500,
                  p: 0,
                  minHeight: 'auto'
                }}
              >
                Add Value Information (Optional)
              </Button>
            </Box>
            
            <Collapse in={showOptionalValues}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Unit Value (Optional)"
                    type="number"
                    value={formData.unit_cost}
                    onChange={handleChange('unit_cost')}
                    fullWidth
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                    helperText="Estimated value per unit for record keeping"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Estimated Value"
                    type="number"
                    value={calculatedValues.total_value.toFixed(2)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                      sx: {
                        backgroundColor: 'grey.50',
                        '& input': {
                          fontWeight: 600,
                          color: formData.unit_cost ? 'success.main' : 'text.secondary'
                        }
                      }
                    }}
                    fullWidth
                    helperText={formData.unit_cost ? "Automatically calculated" : "Enter unit value above to calculate"}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 1 }}>
                    <Typography variant="body2">
                      <strong>Note:</strong> For donations, adding value information is optional but can help with inventory tracking and reporting. 
                      This represents the estimated value of donated items for record-keeping purposes only.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="h6" color="text.primary" gutterBottom fontWeight={600}>
                  Item Selection & Transaction Type
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose the inventory item and specify the transaction details.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Autocomplete
                options={inventoryItems}
                getOptionLabel={(option) => `${getItemDisplayName(option)} (${getItemUnit(option)})`}
                value={inventoryItems.find(item => item.id === formData.inventory_id) || null}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    inventory_id: newValue ? newValue.id : ''
                  }));
                  setStockValidation({
                    currentStock: 0,
                    isChecking: false,
                    hasError: false,
                    errorMessage: ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Inventory Item"
                    error={!!errors.inventory_id}
                    helperText={errors.inventory_id}
                    fullWidth
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {getItemDisplayName(option)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Unit: {getItemUnit(option)} | Type: {option.item_type || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          color={getItemStock(option) > 0 ? 'success.main' : 'error.main'}
                        >
                          {getItemStock(option)} available
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange('quantity')}
                error={!!errors.quantity || stockValidation.hasError}
                helperText={
                  errors.quantity || 
                  stockValidation.errorMessage ||
                  (isStockReductionTransaction(formData.movement_type, formData.transaction_type) && 
                   stockValidation.currentStock > 0 && 
                   !stockValidation.hasError ? 
                   `Available: ${stockValidation.currentStock} units` : '')
                }
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {stockValidation.isChecking && <CircularProgress size={16} />}
                      {formData.inventory_id && 
                       getItemUnit(inventoryItems.find(i => i.id === formData.inventory_id))
                      }
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.movement_type} required>
                <InputLabel>Movement Type</InputLabel>
                <Select
                  value={formData.movement_type}
                  onChange={handleChange('movement_type')}
                  label="Movement Type"
                >
                  {movementTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {type.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.desc}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth error={!!errors.transaction_type} required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={formData.transaction_type}
                  onChange={handleChange('transaction_type')}
                  label="Transaction Type"
                >
                  {(transactionTypes[formData.movement_type] || []).map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              {renderStockStatusAlert()}
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="h6" color="text.primary" gutterBottom fontWeight={600}>
                  Transaction Details & Dates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete the transaction information and important dates.
                </Typography>
              </Paper>
            </Grid>

            {getCurrentTransactionType()?.requiresSource && (
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={commonSources}
                  value={formData.source}
                  onChange={(event, newValue) => handleChange('source')(newValue || '')}
                  onInputChange={(event, newValue) => handleChange('source')(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Source"
                      error={!!errors.source}
                      helperText={errors.source || 'Where are the items coming from?'}
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>
            )}

            {getCurrentTransactionType()?.requiresDestination && (
              <Grid item xs={12} md={6}>
                <Autocomplete
                  freeSolo
                  options={commonDestinations}
                  value={formData.destination}
                  onChange={(event, newValue) => handleChange('destination')(newValue || '')}
                  onInputChange={(event, newValue) => handleChange('destination')(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Destination"
                      error={!!errors.destination}
                      helperText={errors.destination || 'Where are the items going?'}
                      fullWidth
                      required
                    />
                  )}
                />
              </Grid>
            )}

            {/* Beneficiary Selection - Only show for distribution */}
            {formData.movement_type === 'distribution' && (
              <Grid item xs={12}>
                <Autocomplete
                  options={beneficiaryOptions}
                  loading={beneficiariesLoading}
                  getOptionLabel={(option) => option.full_name}
                  value={beneficiaryOptions.find(b => b.id === formData.beneficiary_id) || null}
                  onChange={(event, newValue) => {
                    handleChange('beneficiary_id')(newValue ? newValue.id : '');
                    // Auto-populate destination with beneficiary info
                    if (newValue) {
                      handleChange('destination')(
                        `${newValue.full_name} - ${newValue.barangay}`
                      );
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" fontWeight={500}>
                          {option.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          RSBSA: {option.rsbsa_number} | {option.barangay}
                          {option.hectar > 0 && ` | ${option.hectar} ha`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Beneficiary (Optional)"
                      error={!!beneficiariesError}
                      helperText={beneficiariesError || "Search and select a beneficiary for this distribution"}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {beneficiariesLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText="No beneficiaries found"
                />
              </Grid>
            )}

            {getCurrentTransactionType()?.requiresCost && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Unit Cost"
                    type="number"
                    value={formData.unit_cost}
                    onChange={handleChange('unit_cost')}
                    error={!!errors.unit_cost}
                    helperText={errors.unit_cost}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Total Value"
                    type="number"
                    value={calculatedValues.total_value.toFixed(2)}
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                      sx: {
                        backgroundColor: 'grey.50',
                        '& input': {
                          fontWeight: 600,
                          color: 'primary.main'
                        }
                      }
                    }}
                    fullWidth
                    helperText="Automatically calculated"
                  />
                </Grid>
              </>
            )}

            {renderOptionalValueFields()}

            <Grid item xs={12} md={8}>
              <TextField
                label="Reference Document"
                value={formData.reference}
                onChange={handleChange('reference')}
                error={!!errors.reference}
                helperText={errors.reference || `e.g., ${referencePatterns[formData.transaction_type] || 'REF-2024-001'}`}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                onClick={() => setFormData(prev => ({ ...prev, reference: generateReference() }))}
                fullWidth
                sx={{ height: '56px' }}
                startIcon={<AutoFixHigh />}
              >
                Generate
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Transaction Date"
                value={formData.transaction_date}
                onChange={handleDateChange('transaction_date')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    error={!!errors.transaction_date}
                    helperText={errors.transaction_date}
                    required
                  />
                )}
                maxDate={new Date()}
              />
            </Grid>

            {formData.movement_type === 'stock_in' && (
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date Received"
                  value={formData.date_received}
                  onChange={handleDateChange('date_received')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.date_received}
                      helperText={errors.date_received}
                      required
                    />
                  )}
                  maxDate={new Date()}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                label="Batch Number"
                value={formData.batch_number}
                onChange={handleChange('batch_number')}
                fullWidth
                helperText="For tracking specific batches (optional)"
                placeholder="e.g., BATCH-2024-001, LOT-ABC123"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Expiry Date"
                value={formData.expiry_date}
                onChange={handleDateChange('expiry_date')}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    helperText="When do these items expire? (optional)"
                  />
                )}
                minDate={new Date()}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Remarks"
                value={formData.remarks}
                onChange={handleChange('remarks')}
                multiline
                rows={3}
                fullWidth
                placeholder="Additional notes about this transaction..."
              />
            </Grid>

            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'grey.300', backgroundColor: 'grey.25' }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Attachments (Photos/Documents)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload photos of items or reference documents (images or PDF). Optional.
                </Typography>
                <Button component="label" variant="outlined" size="small">
                  Upload Files
                  <input type="file" hidden multiple accept="image/*,application/pdf" onChange={handleAttachmentsChange} />
                </Button>
                {attachmentPreviews.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {attachmentPreviews.map((f, idx) => (
                      <Box key={`${f.name}-${idx}`} sx={{ width: 120 }}>
                        <Box sx={{
                          width: 120,
                          height: 80,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'grey.300',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'grey.50'
                        }}>
                          {f.url ? (
                            <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Typography variant="caption">{f.type === 'application/pdf' ? 'PDF' : 'File'}</Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" sx={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</Typography>
                          <Button color="error" size="small" onClick={() => removeAttachmentAt(idx)}>Remove</Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        );

      case 2:
        const selectedBeneficiary = beneficiaryOptions.find(b => b.id === formData.beneficiary_id);
        
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}
              >
                <Typography variant="h6" color="text.primary" gutterBottom fontWeight={600}>
                  Review & Submit Transaction
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please review all details before submitting. This transaction will require admin approval.
                </Typography>
              </Paper>
            </Grid>

            {isStockReductionTransaction(formData.movement_type, formData.transaction_type) && (
              <Grid item xs={12}>
                {renderStockStatusAlert()}
              </Grid>
            )}

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
                    Transaction Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Item:</Typography>
                      <Typography fontWeight={500}>
                        {getItemDisplayName(inventoryItems.find(i => i.id === formData.inventory_id))}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Quantity:</Typography>
                      <Typography fontWeight={500}>
                        {formData.quantity} {getItemUnit(inventoryItems.find(i => i.id === formData.inventory_id))}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Movement:</Typography>
                      <Chip 
                        size="small"
                        label={movementTypes.find(m => m.value === formData.movement_type)?.label}
                        sx={{ 
                          backgroundColor: 'grey.100', 
                          color: 'text.primary',
                          fontWeight: 500
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Transaction Type:</Typography>
                      <Typography fontWeight={500}>{getCurrentTransactionType()?.label}</Typography>
                    </Grid>
                    
                    {selectedBeneficiary && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Beneficiary:</Typography>
                          <Box sx={{ mt: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                            <Typography fontWeight={600}>{selectedBeneficiary.full_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              RSBSA: {selectedBeneficiary.rsbsa_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Address: {selectedBeneficiary.address}
                            </Typography>
                            {selectedBeneficiary.hectar > 0 && (
                              <Typography variant="body2" color="text.secondary">
                                Farm Area: {selectedBeneficiary.hectar} hectares
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                        </Grid>
                      </>
                    )}
                    
                    {(formData.unit_cost || (allowsOptionalCost() && showOptionalValues)) && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Unit Value:</Typography>
                          <Typography fontWeight={500}>
                            {formData.unit_cost ? `₱${parseFloat(formData.unit_cost).toFixed(2)}` : 'Not specified'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Total Value:</Typography>
                          <Typography fontWeight={600} color={formData.unit_cost ? "success.main" : "text.secondary"} variant="h6">
                            {formData.unit_cost ? `₱${calculatedValues.total_value.toFixed(2)}` : 'Not calculated'}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    {formData.reference && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Reference:</Typography>
                        <Typography fontWeight={500}>{formData.reference}</Typography>
                      </Grid>
                    )}
                    {formData.source && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Source:</Typography>
                        <Typography fontWeight={500}>{formData.source}</Typography>
                      </Grid>
                    )}
                    {formData.destination && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Destination:</Typography>
                        <Typography fontWeight={500}>{formData.destination}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">Transaction Date:</Typography>
                      <Typography fontWeight={500}>
                        {new Date(formData.transaction_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    {formData.batch_number && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Batch Number:</Typography>
                        <Typography fontWeight={500}>{formData.batch_number}</Typography>
                      </Grid>
                    )}
                    {isStockReductionTransaction(formData.movement_type, formData.transaction_type) && stockValidation.currentStock > 0 && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Current Stock:</Typography>
                          <Typography fontWeight={500}>{stockValidation.currentStock} units</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" color="text.secondary">Remaining After:</Typography>
                          <Typography 
                            fontWeight={600}
                            color={stockValidation.currentStock - parseFloat(formData.quantity) >= 0 ? 'success.main' : 'error.main'}
                          >
                            {stockValidation.currentStock - parseFloat(formData.quantity || 0)} units
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {formData.transaction_type === 'grant' && allowsOptionalCost() && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 2, borderRadius: 1 }}>
                          <Typography variant="body2">
                            <strong>Drant Record:</strong> {formData.unit_cost ? 
                              `Estimated value of ₱${calculatedValues.total_value.toFixed(2)} recorded for tracking purposes.` : 
                              'No value specified - recorded as grant without monetary value.'}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: 'blue.50',
                  border: '1px solid',
                  borderColor: 'blue.200'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Approval Workflow
                </Typography>
                <Typography variant="body2">
                  As a <strong>{userRole}</strong>, your transaction will be submitted with "Pending" status. 
                  An admin will need to review and approve this transaction before it takes effect on inventory levels.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, maxHeight: '95vh' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            Add New Stock Transaction
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create a new inventory stock movement record (Subject to admin approval)
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={currentStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={index} completed={completedSteps.has(index)}>
                  <StepLabel 
                    StepIconComponent={(props) => (
                      <CustomStepIcon 
                        {...props} 
                        icon={step.icon}
                        completed={completedSteps.has(index)}
                        active={currentStep === index}
                      />
                    )}
                  >
                    <Typography 
                      variant="caption" 
                      fontWeight={currentStep === index ? 600 : 400}
                      color={currentStep === index ? 'primary' : 'text.secondary'}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Step {currentStep + 1} of {steps.length} • {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </Typography>
            </Box>
          </Box>

          {renderStepContent()}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>
          
          <Box sx={{ flex: 1 }} />
          
          {currentStep > 0 && (
            <Button 
              onClick={handleBack}
              disabled={loading}
              color="inherit"
              variant="outlined"
            >
              Back
            </Button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
              disabled={stockValidation.hasError && isStockReductionTransaction(formData.movement_type, formData.transaction_type)}
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={
                loading || 
                (stockValidation.hasError && isStockReductionTransaction(formData.movement_type, formData.transaction_type))
              }
              variant="contained"
              color="primary"
              size="large"
              sx={{ px: 4 }}
            >
              {loading ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddStockModal;
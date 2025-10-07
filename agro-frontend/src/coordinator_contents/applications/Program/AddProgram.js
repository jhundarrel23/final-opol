/* eslint-disable react/jsx-no-undef */
// src/coordinator_contents/applications/Program/AddProgramModal.jsx
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-alert */
/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-restricted-globals */
/* eslint-disable default-case */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Select, MenuItem,
  InputLabel, FormControl, Typography, Alert, AlertTitle, Box, IconButton, Card, CardContent, Autocomplete,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Stepper, Step, StepLabel, LinearProgress, Tooltip, Collapse, Divider, ButtonGroup, FormControlLabel,
  Switch, Accordion, AccordionSummary, AccordionDetails, Checkbox, Stack, Badge
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon, Delete as DeleteIcon, Info as InfoIcon, Assignment as AssignmentIcon,
  People as PeopleIcon, Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon, Tune as TuneIcon, SelectAll as SelectAllIcon,
  PlaylistAdd as PlaylistAddIcon, Clear as ClearIcon, AutoFixHigh as AutoFixHighIcon, 
  TableChart as TableChartIcon, ViewList as ViewListIcon, Speed as SpeedIcon,
  Error as ErrorIcon, Inventory as InventoryIcon, Close as CloseIcon, Print as PrintIcon
} from '@mui/icons-material';
import axiosInstance from '../../../api/axiosInstance';
import { useBeneficiaries } from './useBeneficiaries';
import { useNotifications } from '../../../contexts/NotificationContext';
import { useInventory } from './useInventory';
import { OPOL_BARANGAYS } from './useProgram';
import InventoryCardSelector from './InventoryCardSelector';
import MultiSelectInventorySelector from './MultiSelectInventorySelector';
import ProgramDocument from './ProgramDocument';
import { printElementContent } from '../../../utils/printUtils';

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
  errorLight: '#ffebee',
  text: '#333333'           // Dark text color
};

const assistanceTypes = [
  { value: 'aid', label: 'Aid' },      
  { value: 'cash', label: 'Cash' },
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'service', label: 'Service' }
];

const steps = [
  { label: 'Program Information', icon: <InfoIcon /> },
  { label: 'Program Items', icon: <AssignmentIcon /> },
  { label: 'Assign Beneficiaries', icon: <PeopleIcon /> }
];

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Format quantities to avoid floating precision artifacts like 97.99000000000001
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

// Component for displaying inventory conflicts
const InventoryConflictAlert = ({ conflicts, onClose }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <Alert 
      severity="error" 
      sx={{ 
        mb: 3, 
        borderRadius: 2, 
        bgcolor: theme.errorLight, 
        '& .MuiAlert-icon': { color: theme.error },
        border: `1px solid ${theme.error}`
      }}
      onClose={onClose}
    >
      <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
        <InventoryIcon />
        Insufficient Inventory Stock
      </AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        The following items don't have enough stock available for your program:
      </Typography>

      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
        {conflicts.map((conflict, index) => (
          <Card key={index} variant="outlined" sx={{ 
            mb: 1, 
            p: 1.5, 
            bgcolor: 'white', 
            border: `1px solid ${theme.error}40` 
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight="600" color={theme.error}>
                {conflict.item_name} ({conflict.unit})
              </Typography>
              <Chip 
                label={`Short by ${conflict.shortage}`} 
                color="error" 
                size="small" 
                variant="filled"
              />
            </Box>
            
            <Grid container spacing={2} sx={{ fontSize: '0.875rem' }}>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Requested:</Typography>
                <Typography variant="body2" fontWeight="600">{conflict.required}</Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Available:</Typography>
                <Typography variant="body2" fontWeight="600" color={theme.success}>
                  {conflict.available}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary">Shortage:</Typography>
                <Typography variant="body2" fontWeight="600" color={theme.error}>
                  {conflict.shortage}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Box>

      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
        💡 <strong>Tip:</strong> Reduce quantities or wait for other pending programs to be processed.
      </Typography>
    </Alert>
  );
};

const AddProgramModal = ({ open, onClose, onSubmit }) => {
  const { addNotification } = useNotifications();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: null,
    end_date: null,
    barangay: '',    
    program_items: [],
    beneficiaries: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [showProgramDocument, setShowProgramDocument] = useState(false);
  const [createdProgram, setCreatedProgram] = useState(null);
  const [inventoryConflicts, setInventoryConflicts] = useState([]);

  const { beneficiaryOptions, beneficiariesLoading, fetchBeneficiaries, resetBeneficiariesState } = useBeneficiaries();
  const { inventoryOptions, inventoryLoading, fetchInventoryItems, resetInventoryState } = useInventory();

  const [simulatedStock, setSimulatedStock] = useState({});
  const [expandedBeneficiaries, setExpandedBeneficiaries] = useState({});

  // Bulk allocation states
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [bulkAllocations, setBulkAllocations] = useState({});
  const [viewMode, setViewMode] = useState('table');
  const [bulkToolsExpanded, setBulkToolsExpanded] = useState(false);

  // NEW: Barangay filter
  const [barangayFilter, setBarangayFilter] = useState('');
  
  // Multi-select inventory states
  const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);

  const debounceRef = useRef(null);

  const resetForm = useCallback(() => {
    setForm({
      title: '',
      description: '',
      start_date: null,
      end_date: null,
      barangay: '',      
      program_items: [],
      beneficiaries: []
    });
    setErrors({});
  setSuccessInfo(null);
  setInventoryConflicts([]);
  setActiveStep(0);
  setExpandedBeneficiaries({});
  setBulkMode(false);
  setSelectedBeneficiaries([]);
  setBulkAllocations({});
  setBulkToolsExpanded(false);
  setSimulatedStock({});
  setBarangayFilter('');
  }, []);

  // Fixed useEffect to prevent circular dependencies
  useEffect(() => {
    if (open) {
      fetchBeneficiaries();
      fetchInventoryItems();
      resetForm();
    }
  }, [open]); // Only depend on 'open'

  // Separate cleanup effect
  useEffect(() => {
    return () => {
      if (!open) {
        resetBeneficiariesState();
        resetInventoryState();
      }
    };
  }, [open, resetBeneficiariesState, resetInventoryState]);

  const initializeSimulatedStock = useCallback(() => {
    const stockSim = {};
    inventoryOptions.forEach(item => {
      stockSim[item.id] = {
        original_stock: item.available_stock || item.current_stock || 0,
        remaining_stock: item.available_stock || item.current_stock || 0,
        allocated: 0
      };
    });
    setSimulatedStock(stockSim);
  }, [inventoryOptions]);

  useEffect(() => {
    if (inventoryOptions.length > 0) initializeSimulatedStock();
  }, [inventoryOptions, initializeSimulatedStock]);

  const recalculateStockWithData = useCallback((formData) => {
    const newSimulatedStock = {};
    inventoryOptions.forEach(item => {
      newSimulatedStock[item.id] = {
        original_stock: item.available_stock || item.current_stock || 0,
        remaining_stock: item.available_stock || item.current_stock || 0,
        allocated: 0
      };
    });
    
    formData.beneficiaries.forEach(beneficiary => {
      beneficiary.items.forEach(item => {
        if (item.inventory_id && Number(item.quantity) > 0) {
          const sid = item.inventory_id;
          if (newSimulatedStock[sid]) {
            newSimulatedStock[sid].allocated += Number(item.quantity) || 0;
            newSimulatedStock[sid].remaining_stock =
              newSimulatedStock[sid].original_stock - newSimulatedStock[sid].allocated;
          }
        }
      });
    });
    setSimulatedStock(newSimulatedStock);
  }, [inventoryOptions]);

  useEffect(() => {
    if (!inventoryOptions.length) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      recalculateStockWithData(form);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [form.beneficiaries, form.program_items, inventoryOptions, recalculateStockWithData]);

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!form.title.trim()) newErrors.title = 'Program title is required';
      if (!form.start_date) newErrors.start_date = 'Start date is required';
      if (!form.end_date) newErrors.end_date = 'End date is required';
      if (form.start_date && form.end_date && form.end_date <= form.start_date) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    if (step === 1) {
      if (form.program_items.length === 0) newErrors.program_items = 'At least one program item is required';
      form.program_items.forEach((item, idx) => {
        if (!String(item.item_name || '').trim()) newErrors[`item_${idx}_name`] = 'Item name is required';
        if (!String(item.unit || '').trim()) newErrors[`item_${idx}_unit`] = 'Unit is required';
      });
    }
    if (step === 2) {
      if (form.beneficiaries.length === 0) newErrors.beneficiaries = 'At least one beneficiary is required';
      Object.keys(simulatedStock).forEach(id => {
        const st = simulatedStock[id];
        if (st && st.remaining_stock < 0) newErrors.stock_over = 'Over-allocation detected! Please reduce quantities.';
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Field handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateChange = (field, date) => {
    setForm(prev => ({ ...prev, [field]: date }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Items
  const addProgramItem = () => {
    const newId = Date.now();
    setForm(prev => ({
      ...prev,
      program_items: [
        ...prev.program_items,
        {
          id: newId,
          item_name: '',
          unit: '',
          assistance_type: 'aid', 
          inventory_id: null,
          original_stock: 0,
          is_from_inventory: false
        }
      ],
      beneficiaries: prev.beneficiaries.map(b => ({
        ...b,
        items: [
          ...b.items,
          { 
            item_name: '', 
            quantity: '', 
            unit: '', 
            assistance_type: 'aid', 
            inventory_id: null 
          }
        ]
      }))
    }));
  };

  // Multi-select inventory functions
  const handleMultiSelectItems = (items) => {
    setSelectedInventoryItems(items);
  };

  const addMultipleItems = () => {
    if (selectedInventoryItems.length === 0) return;
    
    const newItems = selectedInventoryItems.map(item => ({
      id: Date.now() + Math.random(),
      item_name: item.item_name,
      unit: item.unit,
      assistance_type: item.assistance_category || 'aid',
      assistance_category: item.assistance_category || 'aid',
      quantity: '',
      unit_value: '',
      total_value: '',
      notes: '',
      inventory_id: item.id,
      original_stock: item.available_stock || 0,
      is_from_inventory: true
    }));

    setForm(prev => ({
      ...prev,
      program_items: [...prev.program_items, ...newItems]
    }));

    // Clear selection and close dialog
    setSelectedInventoryItems([]);
    setShowMultiSelect(false);
  };

  const handleInventorySelect = (itemIndex, inventoryItem) => {
    if (inventoryItem) {
      setForm(prev => {
        const program_items = prev.program_items.map((item, idx) =>
          idx === itemIndex ? {
            ...item,
            inventory_id: inventoryItem.id,
            item_name: inventoryItem.item_name,
            unit: inventoryItem.unit,
            assistance_type: inventoryItem.assistance_category || 'aid',
            original_stock: inventoryItem.available_stock || inventoryItem.current_stock || 0,
            is_from_inventory: true
          } : item
        );
        
        const beneficiaries = prev.beneficiaries.map(b => ({
          ...b,
          items: b.items.map((bItem, idx) => 
            idx === itemIndex ? {
              ...bItem,
              item_name: inventoryItem.item_name,
              unit: inventoryItem.unit,
              assistance_type: inventoryItem.assistance_category || 'aid',
              inventory_id: inventoryItem.id
            } : bItem
          )
        }));
        
        return { ...prev, program_items, beneficiaries };
      });
    } else {
      setForm(prev => ({
        ...prev,
        program_items: prev.program_items.map((item, idx) =>
          idx === itemIndex ? {
            ...item,
            inventory_id: null,
            item_name: '',
            unit: '',
            assistance_type: 'aid',
            original_stock: 0,
            is_from_inventory: false
          } : item
        )
      }));
    }
  };

  const handleProgramItemChange = (itemIndex, field, value) => {
    setForm(prev => {
      const program_items = prev.program_items.map((item, idx) =>
        idx === itemIndex ? { ...item, [field]: value } : item
      );
      
      const beneficiaries = prev.beneficiaries.map(b => ({
        ...b,
        items: b.items.map((bItem, idx) => 
          idx === itemIndex ? { ...bItem, [field]: value } : bItem
        )
      }));
      
      return { ...prev, program_items, beneficiaries };
    });
  };

  const removeProgramItem = (index) => {
    const updated = {
      ...form,
      program_items: form.program_items.filter((_, i) => i !== index),
      beneficiaries: form.beneficiaries.map(ben => ({
        ...ben,
        items: ben.items.filter((_, i) => i !== index)
      }))
    };
    setForm(updated);
    setTimeout(() => recalculateStockWithData(updated), 0);
  };

  // NEW: helper to check barangay
  const isInBarangay = (obj, brgy) => {
    if (!brgy) return true;
    const val = (obj.barangay || obj.address || '').toString().toLowerCase();
    return val.includes(brgy.toLowerCase());
  };

  // Beneficiaries
  const getAvailableBeneficiaries = () => {
    const added = new Set(form.beneficiaries.map(ben => String(ben.beneficiary_id)));
    return beneficiaryOptions
      .filter(opt => !added.has(String(opt.beneficiary_id ?? opt.id)))
      .filter(opt => isInBarangay(opt, barangayFilter));
  };

  const addMultipleBeneficiaries = (count = 50) => {
    const available = getAvailableBeneficiaries().slice(0, count);
    const toAdd = available.map(opt => {
      const beneficiary_id = toNum(opt.beneficiary_id ?? opt.id);
      return {
        id: beneficiary_id,
        beneficiary_id,
        rsbsa_number: opt.rsbsa_number,
        beneficiary_name: opt.full_name,
        address: opt.address,
        commodity: opt.commodity,
        hectar: opt.hectar,
        items: form.program_items.map(programItem => ({
          item_name: programItem.item_name,
          quantity: '',
          unit: programItem.unit,
          assistance_type: programItem.assistance_type,
          inventory_id: programItem.inventory_id
        }))
      };
    });
    setForm(prev => ({ ...prev, beneficiaries: [...prev.beneficiaries, ...toAdd] }));
  };

 const addBeneficiary = (opt) => {
  const beneficiary_id = toNum(opt.beneficiary_id ?? opt.id);
  if (!beneficiary_id) return;
  if (form.beneficiaries.some(b => Number(b.beneficiary_id) === beneficiary_id)) {
    setErrors(prev => ({ ...prev, duplicate_beneficiary: `${opt.full_name} is already added.` }));
    return;
  }
    
   const defaultItems = form.program_items.map(programItem => ({
    item_name: programItem.item_name,
    quantity: '',
    unit: programItem.unit,
    assistance_type: programItem.assistance_type,
    inventory_id: programItem.inventory_id
  }));
    
   const newB = {
    id: beneficiary_id,
    beneficiary_id,
    rsbsa_number: opt.rsbsa_number || '',
    beneficiary_name: opt.full_name,
    address: opt.address,
    commodity: opt.commodity,
    hectar: opt.hectar,
    items: defaultItems
  };
    
      setErrors(prev => ({ ...prev, duplicate_beneficiary: '' }));
  setForm(prev => ({ ...prev, beneficiaries: [...prev.beneficiaries, newB] }));
};

  const removeBeneficiary = (idx) => {
    const updated = { ...form, beneficiaries: form.beneficiaries.filter((_, i) => i !== idx) };
    setForm(updated);
    recalculateStockWithData(updated);
  };

  // Selection
  const handleSelectAllBeneficiaries = () => {
    if (selectedBeneficiaries.length === form.beneficiaries.length) {
      setSelectedBeneficiaries([]);
    } else {
      setSelectedBeneficiaries(form.beneficiaries.map(b => Number(b.beneficiary_id)));
    }
  };

  const handleBeneficiarySelect = (beneficiaryId) => {
    const idNum = Number(beneficiaryId);
    setSelectedBeneficiaries(prev => prev.includes(idNum) ? prev.filter(id => id !== idNum) : [...prev, idNum]);
  };

  // Item allocation change
  const handleItemChange = (bIdx, itemIdx, field, value) => {
    const updated = {
      ...form,
      beneficiaries: form.beneficiaries.map((b, bi) => {
        if (bi !== bIdx) return b;
        const items = b.items.map((item, ii) => {
          if (ii !== itemIdx) return item;
          if (field === 'quantity') {
            if (value === '') return { ...item, quantity: '' };
            const parsed = Number(value);
            const qty = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
            return { ...item, quantity: qty };
          }
          return { ...item, [field]: value };
        });
        return { ...b, items };
      })
    };
    setForm(updated);
    recalculateStockWithData(updated);
  };

  // Bulk Tools
  const handleBulkAllocationAll = () => {
    if (selectedBeneficiaries.length === 0) {
      setErrors(prev => ({ ...prev, bulk: 'Please select beneficiaries first.' }));
      return;
    }
    
    const updated = {
      ...form,
      beneficiaries: form.beneficiaries.map(b => {
        if (!selectedBeneficiaries.includes(Number(b.beneficiary_id))) return b;
        return {
          ...b,
          items: b.items.map((item, itemIdx) => {
            const bulkQty = bulkAllocations[itemIdx];
            if (bulkQty === undefined) return item;
            if (bulkQty === '') return { ...item, quantity: '' };
            return { ...item, quantity: parseFloat(bulkQty) || 0 };
          })
        };
      })
    };
    setForm(updated);
    recalculateStockWithData(updated);
    setBulkAllocations({});
    setErrors(prev => ({ ...prev, bulk: '' }));
  };

  const clearAllAllocations = () => {
    if (selectedBeneficiaries.length === 0) {
      setErrors(prev => ({ ...prev, bulk: 'Please select beneficiaries first.' }));
      return;
    }
    const updated = {
      ...form,
      beneficiaries: form.beneficiaries.map(b => {
        if (!selectedBeneficiaries.includes(Number(b.beneficiary_id))) return b;
        return { ...b, items: b.items.map(item => ({ ...item, quantity: '' })) };
      })
    };
    setForm(updated);
    recalculateStockWithData(updated);
    setErrors(prev => ({ ...prev, bulk: '' }));
  };

  // Navigation
  const handleNext = () => { if (validateStep(activeStep)) setActiveStep(s => s + 1); };
  const handleBack = () => { setActiveStep(s => s - 1); setErrors({}); };

  // Submit
  const submitProgram = async (programData) => {
  setLoading(true);
  setInventoryConflicts([]);
  try {
    const getBeneficiaryId = (id) => {
      const intId = parseInt(String(id), 10);
      return Number.isFinite(intId) && intId > 0 ? intId : null;
    };

        const payload = {
      title: programData.title,
      description: programData.description,
      barangay: programData.barangay || null,  // ✅ Added barangay field
      start_date: programData.start_date
        ? programData.start_date.toISOString().split("T")[0]
        : null,
      end_date: programData.end_date
        ? programData.end_date.toISOString().split("T")[0]
        : null,
      beneficiaries: programData.beneficiaries
        .map((b) => {
          const beneficiary_id = getBeneficiaryId(b.beneficiary_id ?? b.id);
          if (!beneficiary_id) return null;

          const items = b.items
            .filter((item) => {
              if (item.quantity === '' || item.quantity === null || item.quantity === undefined) return false;
              return Number(item.quantity) >= 1;
            })
            .map((item) => ({
              item_name: item.item_name || "Unnamed Item",
              quantity: Number(item.quantity),
              unit: item.unit || "",
              assistance_type: item.assistance_type || "aid", // ✅ Changed default to 'aid'
              inventory_id: item.inventory_id || null,
            }));

          return items.length > 0 ? { beneficiary_id, items } : null;
        })
        .filter(Boolean),
    };

    if (payload.beneficiaries.length === 0) {
      setErrors({ general: "Please add at least one beneficiary with items." });
      setLoading(false);
      return;
    }

    const response = await axiosInstance.post("/api/subsidy-programs", payload);

    if (response.status === 201) {
      const successData = {
        program_title: response.data.program.title,
        beneficiaries_count: payload.beneficiaries.length,
        items_count: payload.beneficiaries.reduce((sum, b) => sum + b.items.length, 0),
        program_id: response.data.program.id,
      };
      setSuccessInfo(successData);
      setCreatedProgram(response.data.program);
      
      addNotification({
        type: 'program_created',
        title: 'Program Created Successfully',
        message: `"${response.data.program.title}" has been created with ${payload.beneficiaries.length} beneficiaries`,
        priority: 'medium',
        data: {
          program_id: response.data.program.id,
          program_title: response.data.program.title,
          beneficiaries_count: payload.beneficiaries.length,
          items_count: payload.beneficiaries.reduce((sum, b) => sum + b.items.length, 0),
          created_at: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    if (error.response?.status === 422 && error.response?.data?.conflicts) {
      setInventoryConflicts(error.response.data.conflicts);
      setErrors({
        general: error.response.data.message || 'Inventory stock conflicts detected.'
      });
      setLoading(false);
      return;
    }

    if (error.response?.data?.errors) {
      const errorMessages = Object.entries(error.response.data.errors)
        .map(([field, messages]) => {
          const messageArray = Array.isArray(messages) ? messages : [messages];
          return `${field}: ${messageArray.join(", ")}`;
        })
        .join(" | ");
      setErrors({ general: errorMessages });
      setLoading(false);
      return;
    }

    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to create program. Please try again.";
    
    setErrors({ general: errorMessage });
  } finally {
    setLoading(false);
  }
};
  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    await submitProgram(form);
  };


  const getStockStatus = (inventoryId) => {
    const stock = simulatedStock[inventoryId];
    if (!stock) return { color: 'default', text: 'Unknown' };
    
    if (stock.remaining_stock < 0) return { color: 'error', text: 'Over-allocated' };
    if (stock.remaining_stock === 0) return { color: 'warning', text: 'Fully Allocated' };
    if (stock.remaining_stock < stock.original_stock * 0.2) return { color: 'warning', text: 'Low Stock' };
    return { color: 'success', text: 'Good Stock' };
  };

  // NEW: derive visible beneficiaries based on barangay filter
  const visibleBeneficiaries = useMemo(() => {
    if (!barangayFilter) return form.beneficiaries;
    return form.beneficiaries.filter(b => isInBarangay(b, barangayFilter));
  }, [form.beneficiaries, barangayFilter]);

  // UI
  return (
    <Dialog
      open={open}
      onClose={successInfo ? undefined : onClose} // Prevent closing when success is shown
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: theme.background,
          borderRadius: 3,
          maxHeight: '92vh',
          width: { xs: '95vw', md: '80vw' }
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: theme.primary, color: 'white', display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
        <AssignmentIcon />
        <Typography variant="h6" fontWeight="600">Create New Subsidy Program</Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: theme.background }}>
        <Box sx={{ p: 3 }}>
          {successInfo && (
            <Card 
              sx={{ 
                mb: 3, 
                borderRadius: 2, 
                bgcolor: theme.successLight,
                border: `2px solid ${theme.success}`,
                boxShadow: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <CheckCircleIcon sx={{ color: theme.success, fontSize: 32, mr: 2 }} />
                  <Typography variant="h6" sx={{ color: theme.success, fontWeight: 700 }}>
                    🎉 Program Created Successfully!
                  </Typography>
                </Box>
                
                <Typography variant="body1" sx={{ mb: 2, color: theme.text }}>
                  <strong>{successInfo.program_title}</strong> has been created with <strong>{successInfo.beneficiaries_count}</strong> beneficiaries and a total of <strong>{successInfo.items_count}</strong> item allocations.
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 3, color: 'rgba(0,0,0,0.7)' }}>
                  💡 You can now print the official program document with beneficiary signatures for distribution.
                </Typography>
                
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => setShowProgramDocument(true)}
                    sx={{ 
                      bgcolor: theme.primary,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      minWidth: '200px',
                      fontSize: '16px',
                      '&:hover': { 
                        bgcolor: theme.primary + 'dd',
                        transform: 'translateY(-1px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    Print Program Document
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      onSubmit?.(createdProgram);
                      onClose();
                    }}
                    sx={{ 
                      borderColor: theme.success,
                      color: theme.success,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      minWidth: '160px',
                      fontSize: '16px',
                      '&:hover': { 
                        borderColor: theme.success,
                        bgcolor: theme.successLight,
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    Close & Continue
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
          
          <InventoryConflictAlert 
            conflicts={inventoryConflicts} 
            onClose={() => setInventoryConflicts([])}
          />

          {errors.general && !inventoryConflicts.length && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: theme.errorLight, '& .MuiAlert-icon': { color: theme.error } }}>
              {errors.general}
            </Alert>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((s, i) => (
              <Step key={i}>
                <StepLabel StepIconProps={{ sx: { '&.Mui-active': { color: theme.primary }, '&.Mui-completed': { color: theme.success } } }}>
                  {s.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

       {activeStep === 0 && (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Card sx={{ bgcolor: theme.surface, borderRadius: 3, border: `1px solid ${theme.outline}` }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom color={theme.primary} fontWeight="600" sx={{ mb: 3 }}>
          Program Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              required 
              label="Program Title" 
              name="title" 
              value={form.title} 
              onChange={handleChange}
              error={!!errors.title} 
              helperText={errors.title || 'Enter a descriptive title for the program'}
              variant="outlined" 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
            />
          </Grid>

          <Grid item xs={12}>
            <TextField 
              fullWidth 
              multiline 
              rows={3} 
              label="Description" 
              name="description" 
              value={form.description} 
              onChange={handleChange}
              helperText="Provide a detailed description of the program (optional)"
              variant="outlined" 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
            />
          </Grid>

          {/* ✅ NEW: Barangay field */}
          <Grid item xs={12}>
            <Autocomplete
              options={OPOL_BARANGAYS}
              value={form.barangay || null}
              onChange={(event, newValue) => {
                setForm(prev => ({ ...prev, barangay: newValue || '' }));
                setErrors(prev => ({ ...prev, barangay: '' }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Target Barangay"
                  placeholder="Select target barangay (optional)"
                  helperText="Specify the primary barangay this program will serve"
                  variant="outlined"
                  error={!!errors.barangay}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={6}>
            <DatePicker
              label="Start Date"
              value={form.start_date}
              onChange={(d) => handleDateChange('start_date', d)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  required 
                  error={!!errors.start_date} 
                  helperText={errors.start_date}
                  variant="outlined" 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                />
              )}
              minDate={new Date()}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={6}>
            <DatePicker
              label="End Date"
              value={form.end_date}
              onChange={(d) => handleDateChange('end_date', d)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  required 
                  error={!!errors.end_date} 
                  helperText={errors.end_date}
                  variant="outlined" 
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} 
                />
              )}
              minDate={form.start_date || new Date()}
              disabled={loading}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </LocalizationProvider>
)}

     {activeStep === 1 && (
  <Card sx={{ bgcolor: theme.surface, borderRadius: 3, border: `1px solid ${theme.outline}` }}>
    <CardContent sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" color={theme.primary} fontWeight="600">Program Items ({form.program_items.length})</Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />} 
            onClick={() => setShowMultiSelect(true)} 
            disabled={loading}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              borderColor: theme.primary, 
              color: theme.primary,
              '&:hover': { 
                borderColor: theme.primary, 
                bgcolor: theme.primaryLight 
              } 
            }}
          >
            Add Multiple Items
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={addProgramItem} 
            disabled={loading}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              bgcolor: theme.primary, 
              '&:hover': { bgcolor: theme.primary + 'dd' } 
            }}
          >
            Add Single Item
          </Button>
        </Stack>
      </Box>

      {errors.program_items && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: theme.errorLight }}>
          {errors.program_items}
        </Alert>
      )}

      {form.program_items.map((item, idx) => (
        <Card key={item.id} variant="outlined" sx={{ mb: 2, borderRadius: 2, border: `1px solid ${theme.outline}`, '&:hover': { boxShadow: 2 } }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="600" color={theme.primary}>Item {idx + 1}</Typography>
              <IconButton color="error" onClick={() => removeProgramItem(idx)} size="small" disabled={loading}
                sx={{ '&:hover': { bgcolor: theme.errorLight, color: theme.error } }}>
                <DeleteIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom fontWeight="600" color={theme.primary} sx={{ mb: 1 }}>
                  Select from Inventory (Optional)
                </Typography>
                <InventoryCardSelector
                  inventoryOptions={inventoryOptions}
                  selectedItem={item.inventory_id ? inventoryOptions.find(opt => opt.id === item.inventory_id) : null}
                  onSelect={(selectedItem) => handleInventorySelect(idx, selectedItem)}
                  loading={inventoryLoading}
                  disabled={loading || inventoryLoading}
                />
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5, fontStyle: 'italic' }}>
                  💡 Tip: Select an inventory item above, or manually enter custom item details below
                </Typography>
              </Grid>

          

      
            </Grid>
          </CardContent>
        </Card>
      ))}

      {form.program_items.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2, bgcolor: theme.primaryLight, '& .MuiAlert-icon': { color: theme.info } }}>
          No items added yet. Click "Add Item" to start building your program.
        </Alert>
      )}
    </CardContent>
  </Card>
)}

          {activeStep === 2 && (
            <Stack spacing={3}>
              <Card sx={{ bgcolor: theme.surface, borderRadius: 3, border: `1px solid ${theme.outline}` }}>
                <CardContent sx={{ pb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h6" color={theme.primary} fontWeight="600">Beneficiaries Management</Typography>
                      <Badge badgeContent={form.beneficiaries.length} color="primary" showZero><PeopleIcon color="action" /></Badge>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <FormControlLabel
                        control={<Switch checked={bulkMode} onChange={(e) => { setBulkMode(e.target.checked); if (!e.target.checked) { setSelectedBeneficiaries([]); setBulkAllocations({}); } }} color="primary" />}
                        label={<Box display="flex" alignItems="center" gap={1}><TuneIcon fontSize="small" /><Typography variant="body2" fontWeight="600">Bulk Mode</Typography></Box>}
                      />
                      <Divider orientation="vertical" flexItem />
                      <ButtonGroup variant="outlined" size="small">
                        <Button startIcon={<TableChartIcon />} variant={viewMode === 'table' ? 'contained' : 'outlined'} onClick={() => setViewMode('table')} sx={{ borderRadius: '4px 0 0 4px' }}>Table</Button>
                        <Button startIcon={<ViewListIcon />} variant={viewMode === 'cards' ? 'contained' : 'outlined'} onClick={() => setViewMode('cards')} sx={{ borderRadius: '0 4px 4px 0' }}>Cards</Button>
                      </ButtonGroup>
                    </Box>
                  </Box>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={getAvailableBeneficiaries()}
                        getOptionLabel={(o) => `${o.full_name} (${o.rsbsa_number})`}
                        onChange={(_, v) => { if (v) addBeneficiary(v); }}
                        value={null}
                        loading={beneficiariesLoading}
                        renderInput={(params) => (
                          <TextField {...params} label="Add Individual Beneficiary" placeholder="Search by name or RSBSA number..." size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            InputProps={{ ...params.InputProps, startAdornment: (<><AddIcon sx={{ mr: 1, color: 'action.active' }} />{params.InputProps.startAdornment}</>) }} />
                        )}
                        disabled={loading || beneficiariesLoading}
                      />
                    </Grid>

                    {/* Barangay Filter (replaces adding barangay as a beneficiary) */}
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={OPOL_BARANGAYS}
                        getOptionLabel={(o) => o}
                        onChange={(_, v) => setBarangayFilter(v || '')}
                        value={barangayFilter || null}
                        renderInput={(params) => (
                          <TextField {...params} label="Filter by Barangay" placeholder="Select Opol barangay..." size="small"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                        )}
                        disabled={loading}
                      />
                    </Grid>

                    {barangayFilter && (
                      <Grid item xs={12}>
                        <Chip
                          label={`Filtered by Barangay: ${barangayFilter}`}
                          onDelete={() => setBarangayFilter('')}
                          color="primary"
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<PlaylistAddIcon />} onClick={() => addMultipleBeneficiaries(10)} disabled={loading || getAvailableBeneficiaries().length === 0} size="small" sx={{ borderRadius: 2 }}>+10</Button>
                        <Button variant="outlined" startIcon={<PlaylistAddIcon />} onClick={() => addMultipleBeneficiaries(50)} disabled={loading || getAvailableBeneficiaries().length === 0} size="small" sx={{ borderRadius: 2 }}>+50</Button>
                        <Button variant="outlined" startIcon={<PlaylistAddIcon />} onClick={() => addMultipleBeneficiaries(100)} disabled={loading || getAvailableBeneficiaries().length === 0} size="small" sx={{ borderRadius: 2 }}>+100</Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {bulkMode && (
                <Card sx={{ bgcolor: theme.primaryLight, borderRadius: 3, border: `2px solid ${theme.primary}40` }}>
                  <CardContent>
                    <Accordion expanded={bulkToolsExpanded} onChange={() => setBulkToolsExpanded(!bulkToolsExpanded)} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AutoFixHighIcon color="primary" />
                          <Typography variant="h6" color={theme.primary} fontWeight="600">Bulk Allocation Tools</Typography>
                          <Badge badgeContent={selectedBeneficiaries.length} color="primary" showZero>
                            <Chip label="Selected" size="small" variant="outlined" color="primary" />
                          </Badge>
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails>
                        {errors.bulk && (
                          <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: theme.errorLight }}>
                            {errors.bulk}
                          </Alert>
                        )}

                        <Grid container spacing={3}>
                          <Grid item xs={12} lg={4}>
                            <Card variant="outlined" sx={{ p: 2, bgcolor: theme.surface }}>
                              <Typography variant="subtitle2" gutterBottom fontWeight="600">Selection Controls</Typography>
                              <Stack spacing={1}>
                                <Button fullWidth variant="outlined" startIcon={<SelectAllIcon />} onClick={handleSelectAllBeneficiaries} size="small" sx={{ borderRadius: 2, justifyContent: 'flex-start' }}>
                                  {selectedBeneficiaries.length === form.beneficiaries.length ? 'Deselect All' : 'Select All'}
                                </Button>
                                <Button fullWidth variant="outlined" startIcon={<ClearIcon />} onClick={() => setSelectedBeneficiaries([])} size="small" sx={{ borderRadius: 2, justifyContent: 'flex-start' }}>
                                  Clear Selection
                                </Button>
                              </Stack>
                            </Card>
                          </Grid>

                          <Grid item xs={12} lg={8}>
                            <Card variant="outlined" sx={{ p: 2, bgcolor: theme.surface }}>
                              <Typography variant="subtitle2" gutterBottom fontWeight="600">Quick Actions</Typography>
                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                                <Button fullWidth variant="outlined" color="error" startIcon={<ClearIcon />} onClick={clearAllAllocations} disabled={selectedBeneficiaries.length === 0} size="small" sx={{ borderRadius: 2 }}>
                                  Clear All
                                </Button>
                              </Stack>
                            </Card>
                          </Grid>

                          <Grid item xs={12}>
                            <Card variant="outlined" sx={{ p: 2, bgcolor: theme.surface }}>
                              <Typography variant="subtitle2" gutterBottom fontWeight="600" sx={{ mb: 2 }}>
                                Set quantities for {selectedBeneficiaries.length} selected beneficiaries:
                              </Typography>
                              <Grid container spacing={2}>
                                {form.program_items.map((item, idx) => (
                                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                                    <TextField
                                      size="small"
                                      type="number"
                                      label={item.item_name || 'Item'}
                                      placeholder="0"
                                      value={bulkAllocations[idx] || ''}
                                      onChange={(e) => setBulkAllocations(prev => ({ ...prev, [idx]: e.target.value }))}
                                      inputProps={{ min: 0, step: "any" }}
                                      fullWidth
                                      helperText={`Unit: ${item.unit || '-'}`}
                                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiFormHelperText-root': { fontSize: '0.75rem' } }}
                                    />
                                  </Grid>
                                ))}
                              </Grid>
                              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 2 }}>
                                <Button variant="contained" startIcon={<SpeedIcon />} onClick={handleBulkAllocationAll}
                                  disabled={selectedBeneficiaries.length === 0 || Object.keys(bulkAllocations).length === 0} size="small"
                                  sx={{ borderRadius: 2, bgcolor: theme.warning, color: 'white', '&:hover': { bgcolor: theme.warning + 'dd' } }}>
                                  Apply Values
                                </Button>
                                <Button variant="outlined" size="small" onClick={() => setBulkAllocations({})} sx={{ borderRadius: 2 }}>
                                  Reset Fields
                                </Button>
                              </Stack>
                            </Card>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              )}

             {form.program_items.some(item => item.is_from_inventory) && (
              <Card sx={{ bgcolor: theme.surfaceVariant, borderRadius: 3, border: `1px solid ${theme.outline}` }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color={theme.primary} fontWeight="600" sx={{ mb: 3 }}>
                    Inventory Stock Overview
                  </Typography>
                  <Grid container spacing={2}>
                    {form.program_items.filter(i => i.is_from_inventory && i.inventory_id).map(item => {
                      const stock = simulatedStock[item.inventory_id];
                      const status = getStockStatus(item.inventory_id);
                      const percentUsed = stock ? ((stock.allocated / (stock.original_stock || 1)) * 100) : 0;
                      return (
                        <Grid item xs={12} md={6} lg={4} key={item.inventory_id}>
                          <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: theme.surface, border: stock?.remaining_stock < 0 ? `2px solid ${theme.error}` : `1px solid ${theme.outline}` }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Typography variant="subtitle2" fontWeight="600">{item.item_name}</Typography>
                                <Chip label={status.text} color={status.color} size="small" sx={{ fontSize: '0.75rem', height: '24px' }} />
                              </Box>
                              {stock && (
                                <>
                                  <LinearProgress variant="determinate" value={Math.min(percentUsed, 100)} color={stock.remaining_stock < 0 ? 'error' : 'primary'}
                                    sx={{ mb: 1.5, height: 6, borderRadius: 3, bgcolor: theme.outline }} />
                                  <Grid container spacing={1}>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block" color="text.secondary">Allocated</Typography>
                                      <Typography variant="body2" fontWeight="600">{formatQuantity(stock.allocated)} {item.unit}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Typography variant="caption" display="block" color="text.secondary">Remaining</Typography>
                                      <Typography variant="body2" fontWeight="600" color={stock.remaining_stock < 0 ? theme.error : 'text.primary'}>
                                        {formatQuantity(stock.remaining_stock)} {item.unit}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            )}

              {form.beneficiaries.length > 0 && form.program_items.length > 0 && (
                <Card sx={{ bgcolor: theme.surface, borderRadius: 3, border: `1px solid ${theme.outline}` }}>
                  <CardContent sx={{ p: 0 }}>
                    {viewMode === 'table' ? (
                      <TableContainer>
                        <Table size="small" sx={{ minWidth: 800 }}>
                          <TableHead>
                            <TableRow sx={{ bgcolor: theme.surfaceVariant }}>
                              {bulkMode && (
                                <TableCell padding="checkbox" width="50">
                                  <Checkbox
                                    checked={selectedBeneficiaries.length === form.beneficiaries.length}
                                    indeterminate={selectedBeneficiaries.length > 0 && selectedBeneficiaries.length < form.beneficiaries.length}
                                    onChange={handleSelectAllBeneficiaries}
                                    color="primary"
                                  />
                                </TableCell>
                              )}
                              <TableCell sx={{ minWidth: 200 }}><Typography variant="subtitle2" fontWeight="600">Beneficiary</Typography></TableCell>
                              <TableCell sx={{ minWidth: 120 }}><Typography variant="subtitle2" fontWeight="600">RSBSA Number</Typography></TableCell>
                              {form.program_items.map((item, idx) => (
                                <TableCell key={item.id} align="center" sx={{ minWidth: 100 }}>
                                  <Box display="flex" flexDirection="column" alignItems="center">
                                    <Typography variant="subtitle2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                                      {item.item_name || `Item ${idx + 1}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ({item.unit || '-'})
                                    </Typography>
                                    {item.is_from_inventory && (
                                      <Chip 
                                        size="small" 
                                        label={getStockStatus(item.inventory_id).text} 
                                        color={getStockStatus(item.inventory_id).color} 
                                        sx={{ fontSize: '0.7rem', height: '18px', mt: 0.5 }} 
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                              ))}
                              <TableCell width="80" align="center">
                                <Typography variant="subtitle2" fontWeight="600">Actions</Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {visibleBeneficiaries.map((beneficiary, bIdx) => (
                              <TableRow key={beneficiary.id} hover sx={{ '&:hover': { bgcolor: theme.primaryLight } }}>
                                {bulkMode && (
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={selectedBeneficiaries.includes(Number(beneficiary.beneficiary_id))}
                                      onChange={() => handleBeneficiarySelect(beneficiary.beneficiary_id)}
                                      color="primary"
                                    />
                                  </TableCell>
                                )}
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight="600">
                                      {beneficiary.beneficiary_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {beneficiary.address}
                                    </Typography>
                                    {beneficiary.commodity && (
                                      <Typography variant="caption" display="block" color="text.secondary">
                                        Commodity: {beneficiary.commodity}
                                      </Typography>
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {beneficiary.rsbsa_number}
                                  </Typography>
                                </TableCell>
                                {form.program_items.map((item, itemIdx) => {
                                  const beneficiaryItem = beneficiary.items[itemIdx];
                                  const quantity = beneficiaryItem?.quantity ?? '';
                                  
                                  return (
                                    <TableCell key={item.id} align="center">
                                      <TextField
                                        type="number"
                                        size="small"
                                        value={quantity}
                                        onChange={(e) => handleItemChange(bIdx, itemIdx, 'quantity', e.target.value)}
                                        inputProps={{ min: 0, step: "any" }}
                                        sx={{ 
                                          width: '80px',
                                          '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                        }}
                                        disabled={loading}
                                      />
                                    </TableCell>
                                  );
                                })}
                                <TableCell align="center">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => removeBeneficiary(bIdx)}
                                    disabled={loading}
                                    sx={{ '&:hover': { bgcolor: theme.errorLight } }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          {visibleBeneficiaries.map((beneficiary, bIdx) => (
                            <Grid item xs={12} md={6} lg={4} key={beneficiary.id}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  borderRadius: 2, 
                                  border: bulkMode && selectedBeneficiaries.includes(Number(beneficiary.beneficiary_id)) 
                                    ? `2px solid ${theme.primary}` 
                                    : `1px solid ${theme.outline}`,
                                  '&:hover': { boxShadow: 2 }
                                }}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box flex="1">
                                      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                        {beneficiary.beneficiary_name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        RSBSA: {beneficiary.rsbsa_number}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {beneficiary.address}
                                      </Typography>
                                      {beneficiary.commodity && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Commodity: {beneficiary.commodity}
                                        </Typography>
                                      )}
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      {bulkMode && (
                                        <Checkbox
                                          size="small"
                                          checked={selectedBeneficiaries.includes(Number(beneficiary.beneficiary_id))}
                                          onChange={() => handleBeneficiarySelect(beneficiary.beneficiary_id)}
                                          color="primary"
                                        />
                                      )}
                                      <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => removeBeneficiary(bIdx)}
                                        disabled={loading}
                                        sx={{ '&:hover': { bgcolor: theme.errorLight } }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>

                                  <Divider sx={{ my: 1.5 }} />

                                  <Typography variant="subtitle2" fontWeight="600" gutterBottom sx={{ fontSize: '0.875rem' }}>
                                    Item Allocations:
                                  </Typography>
                                  
                                  <Stack spacing={1}>
                                    {form.program_items.map((item, itemIdx) => {
                                      const beneficiaryItem = beneficiary.items[itemIdx];
                                      const quantity = beneficiaryItem?.quantity ?? '';
                                      
                                      return (
                                        <Box key={item.id} display="flex" alignItems="center" justifyContent="space-between">
                                          <Box flex="1" mr={2}>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                              {item.item_name || `Item ${itemIdx + 1}`}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Unit: {item.unit || '-'}
                                            </Typography>
                                          </Box>
                                          <TextField
                                            type="number"
                                            size="small"
                                            value={quantity}
                                            onChange={(e) => handleItemChange(bIdx, itemIdx, 'quantity', e.target.value)}
                                            inputProps={{ min: 0, step: "any" }}
                                            sx={{ 
                                              width: '80px',
                                              '& .MuiOutlinedInput-root': { borderRadius: 2 }
                                            }}
                                            disabled={loading}
                                          />
                                        </Box>
                                      );
                                    })}
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {errors.beneficiaries && (
                <Alert severity="error" sx={{ borderRadius: 2, bgcolor: theme.errorLight }}>
                  {errors.beneficiaries}
                </Alert>
              )}

              {errors.stock_over && (
                <Alert severity="error" sx={{ borderRadius: 2, bgcolor: theme.errorLight, '& .MuiAlert-icon': { color: theme.error } }}>
                  <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                    <WarningIcon />
                    Stock Over-allocation Detected
                  </AlertTitle>
                  {errors.stock_over}
                </Alert>
              )}

              {errors.duplicate_beneficiary && (
                <Alert severity="warning" onClose={() => setErrors(prev => ({ ...prev, duplicate_beneficiary: '' }))} sx={{ borderRadius: 2, bgcolor: theme.warningLight }}>
                  {errors.duplicate_beneficiary}
                </Alert>
              )}

              {form.beneficiaries.length === 0 && (
                <Alert severity="info" sx={{ borderRadius: 2, bgcolor: theme.primaryLight, '& .MuiAlert-icon': { color: theme.info } }}>
                  <Typography variant="body2">
                    No beneficiaries added yet. Use the search field above to add individual beneficiaries, 
                    filter by barangay, or use the bulk add buttons to quickly populate your program.
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: theme.surfaceVariant, gap: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box display="flex" alignItems="center" gap={2}>
            {!successInfo && (
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1} of {steps.length}
              </Typography>
            )}
            {successInfo && (
              <Typography variant="body2" color="text.secondary">
                ✅ Program created successfully! Use the buttons above to print documents.
              </Typography>
            )}
          </Box>
          
          <Box display="flex" gap={2}>
            {!successInfo && (
              <>
                <Button 
                  onClick={handleBack} 
                  disabled={activeStep === 0 || loading}
                  sx={{ borderRadius: 2, minWidth: 100 }}
                >
                  Back
                </Button>
                
                {activeStep < steps.length - 1 ? (
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    disabled={loading}
                    sx={{ 
                      borderRadius: 2, 
                      minWidth: 100,
                      bgcolor: theme.primary, 
                      '&:hover': { bgcolor: theme.primary + 'dd' } 
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                    sx={{ 
                      borderRadius: 2, 
                      minWidth: 120,
                      bgcolor: theme.success, 
                      color: 'white',
                      '&:hover': { bgcolor: theme.success + 'dd' },
                      '&:disabled': { bgcolor: theme.outline }
                    }}
                  >
                    {loading ? 'Creating...' : 'Create Program'}
                  </Button>
                )}
              </>
            )}
            
            {successInfo && (
              <Button
                onClick={() => {
                  onSubmit?.(createdProgram);
                  onClose();
                }}
                variant="outlined"
                sx={{ 
                  borderColor: theme.success,
                  color: theme.success,
                  '&:hover': { 
                    borderColor: theme.success,
                    bgcolor: theme.successLight
                  }
                }}
              >
                Close Modal
              </Button>
            )}
            
            <Button 
              onClick={onClose} 
              disabled={loading}
              color={successInfo ? "primary" : "inherit"}
              variant={successInfo ? "contained" : "outlined"}
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              {successInfo ? 'Done' : 'Cancel'}
            </Button>
          </Box>
        </Box>
      </DialogActions>


      {/* Program Document Dialog */}
      <Dialog
        open={showProgramDocument}
        onClose={() => setShowProgramDocument(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <AssignmentIcon sx={{ fontSize: 32 }} />
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                Program Document
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {createdProgram?.title}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowProgramDocument(false)} size="small" sx={{ color: 'white' }}>
              <ClearIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {createdProgram && (
            <div id="program-document">
              <ProgramDocument
                program={createdProgram}
                beneficiaries={form.beneficiaries}
                formatDate={(dateString) => {
                  if (!dateString) return 'Not specified';
                  const date = new Date(dateString);
                  return date.toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });
                }}
                coordinatorName="Program Coordinator"
              />
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1.5, bgcolor: theme.background }}>
          <Button
            onClick={() => {
              const documentContent = document.getElementById('program-document');
              printElementContent(`Program Document - ${createdProgram?.title}`, documentContent, {
                stylesheets: ['/static/css/professional-print-styles.css'],
                inlineHeadCss: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body { font-family: 'Inter', Arial, sans-serif; }"
              });
            }}
            variant="contained"
            startIcon={<AssignmentIcon />}
            sx={{
              px: 3,
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.success} 0%, ${theme.primary} 100%)`
              }
            }}
          >
            Print Program Document
          </Button>
          <Button
            onClick={() => setShowProgramDocument(false)}
            variant="outlined"
            sx={{
              borderColor: theme.primary,
              color: theme.primary,
              '&:hover': {
                borderColor: theme.primary,
                bgcolor: theme.primaryLight
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Multi-Select Inventory Dialog */}
      <Dialog
        open={showMultiSelect}
        onClose={() => {
          setShowMultiSelect(false);
          setSelectedInventoryItems([]);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <InventoryIcon sx={{ fontSize: 32 }} />
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                Select Multiple Items
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Choose multiple items from your inventory to add to the program
              </Typography>
            </Box>
            <IconButton onClick={() => {
              setShowMultiSelect(false);
              setSelectedInventoryItems([]);
            }} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <MultiSelectInventorySelector
            inventoryOptions={inventoryOptions}
            selectedItems={selectedInventoryItems}
            onSelectItems={handleMultiSelectItems}
            loading={inventoryLoading}
            disabled={loading || inventoryLoading}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1.5, bgcolor: theme.background }}>
          <Button
            onClick={() => {
              setShowMultiSelect(false);
              setSelectedInventoryItems([]);
            }}
            variant="outlined"
            sx={{
              borderColor: theme.outline,
              color: theme.text,
              '&:hover': {
                borderColor: theme.outline,
                bgcolor: theme.surfaceVariant
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={addMultipleItems}
            variant="contained"
            disabled={selectedInventoryItems.length === 0}
            sx={{
              px: 3,
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.primary} 100%)`
              }
            }}
          >
            Add {selectedInventoryItems.length} Item{selectedInventoryItems.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddProgramModal;
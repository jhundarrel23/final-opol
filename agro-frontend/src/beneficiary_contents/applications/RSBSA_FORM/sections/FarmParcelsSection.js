/* eslint-disable consistent-return */
/* eslint-disable no-alert */
// src/beneficiary/contents/applications/FarmParcelsSection.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  FormHelperText,
  Chip,
  Button,
  IconButton,
  FormControlLabel,
  Switch,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Landscape as LandscapeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  AddCircle as AddCircleIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axiosInstance from '../../../../api/axiosInstance';

const FarmParcelsSection = ({ 
  farmParcels, 
  errors, 
  addFarmParcel, 
  updateFarmParcel, 
  removeFarmParcel, 
  onValidationChange,
  requiresFarmData = true,
  livelihoodCategory = null
}) => {
  // Commodities state
  const [commodities, setCommodities] = useState([]);
  const [loadingCommodities, setLoadingCommodities] = useState(false);
  const [commoditiesError, setCommoditiesError] = useState('');

  // Refs to track if data has been fetched
  const commoditiesDataFetched = useRef(false);
  const validationTimeoutRef = useRef(null);

  const commoditiesToUse = commodities;
  const parcels = Array.isArray(farmParcels) ? farmParcels : [];
  const errs = errors || {};

  // Helper function to get commodity by id
  const getCommodityById = useCallback((id) => {
    return commoditiesToUse.find(c => c.id === id);
  }, [commoditiesToUse]);

  // Enhanced validation function - considers whether farm data is required
  const validateFarmParcels = useCallback(() => {
    // If farm data is not required, consider it valid regardless of parcel data
    if (!requiresFarmData) {
      return true;
    }

    if (parcels.length === 0) return false;
    
    return parcels.every(parcel => {

      const parcelValid = (
        parcel.barangay &&
        parcel.total_farm_area > 0 &&
        parcel.tenure_type
      );
      
      // Check commodities
      const commoditiesValid = (
        parcel.commodities &&
        parcel.commodities.length > 0 &&
        parcel.commodities.every(commodity => {
          // Basic commodity validation
          const basicValid = commodity.commodity_id && commodity.size_hectares > 0;
          
          // Get commodity info for category check
          const commodityInfo = getCommodityById(commodity.commodity_id);
          const categoryName = commodityInfo?.category?.name || '';
          const isFisheries = categoryName.toLowerCase().includes('fisheries');
     
          const farmTypeValid = isFisheries ? true : !!commodity.farm_type;
          
          return basicValid && farmTypeValid;
        })
      );
      
      return parcelValid && commoditiesValid;
    });
  }, [parcels, requiresFarmData, getCommodityById]);

  // Debounced validation notification
  useEffect(() => {
    if (typeof onValidationChange === 'function') {
      // Clear existing timeout
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }

      // Set new timeout for validation
      validationTimeoutRef.current = setTimeout(() => {
        const isValid = validateFarmParcels();
        onValidationChange(isValid);
      }, 300); // 300ms debounce

      // Cleanup
      return () => {
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }
      };
    }
  }, [parcels, onValidationChange, validateFarmParcels]);

  // Fetch commodities from API
  const fetchCommodities = useCallback(async () => {
    if (commoditiesDataFetched.current) {
      return; // Already fetched, skip
    }

    setLoadingCommodities(true);
    setCommoditiesError('');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const res = await axiosInstance.get('/api/rsbsa/commodities', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setCommodities(res.data?.data || []);
      commoditiesDataFetched.current = true;
    } catch (e) {
      if (e.name === 'AbortError') {
        setCommoditiesError('Request timed out. Please try again.');
      } else {
        const status = e?.response?.status;
        setCommoditiesError(
          status
            ? `Failed to load commodities (HTTP ${status})`
            : 'Failed to load commodities'
        );
      }
      setCommodities([]);
    } finally {
      setLoadingCommodities(false);
    }
  }, []);

  // Single effect to fetch data on mount only
  useEffect(() => {
    // Only fetch data if farm data is actually required
    if (requiresFarmData) {
      fetchCommodities();
    }
  }, []); // Empty dependency array - only run once on mount

  const tenureTypeOptions = [
    { value: 'registered_owner', label: 'Registered Owner' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'lessee', label: 'Lessee' }
  ];

  const farmTypeOptions = [
    { value: 'irrigated', label: 'Irrigated' },
    { value: 'rainfed upland', label: 'Rainfed Upland' },
    { value: 'rainfed lowland', label: 'Rainfed Lowland' }
  ];

  const barangayOptions = [
    'Awang',
    'Bagocboc',
    'Barra', 
    'Bonbon',
    'Cauyonan',
    'Igpit',
    'Limonda',
    'Luyong Bonbon',
    'Malanang',
    'Nangcaon',
    'Patag',
    'Poblacion',
    'Taboc',
    'Tingalan'
  ];

  const ownershipDocumentTypes = [
    { value: 'certificate_of_land_transfer', label: 'Certificate of Land Transfer' },
    { value: 'emancipation_patent', label: 'Emancipation Patent' },
    { value: 'individual_cloa', label: 'Individual Certificate of Land Ownership Award (CLOA)' },
    { value: 'collective_cloa', label: 'Collective CLOA' },
    { value: 'co_ownership_cloa', label: 'Co-ownership CLOA' },
    { value: 'agricultural_sales_patent', label: 'Agricultural Sales Patent' },
    { value: 'homestead_patent', label: 'Homestead Patent' },
    { value: 'free_patent', label: 'Free Patent' },
    { value: 'certificate_of_title', label: 'Certificate of Title or Regular Title' },
    { value: 'certificate_ancestral_domain_title', label: 'Certificate of Ancestral Domain Title' },
    { value: 'certificate_ancestral_land_title', label: 'Certificate of Ancestral Land Title' },
    { value: 'tax_declaration', label: 'Tax Declaration' },
    { value: 'others', label: 'Others (e.g. Barangay Certification)' }
  ];

  // Helper function to group commodities by category
  const getCommoditiesByCategory = useCallback(() => {
    const grouped = {};
    commoditiesToUse.forEach(commodity => {
      const categoryName = commodity.category?.name || 'Other';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(commodity);
    });
    return grouped;
  }, [commoditiesToUse]);

  // Helper function to create commodity menu items
  const createCommodityMenuItems = useCallback(() => {
    const menuItems = [];
    
    // Add default option
    menuItems.push(
      <MenuItem key="empty" value="" disabled>
        Select Commodity *
      </MenuItem>
    );
    
    // Check if commodities are available
    if (commoditiesToUse.length === 0) {
      menuItems.push(
        <MenuItem key="no-data" disabled>
          No commodities available
        </MenuItem>
      );
      return menuItems;
    }
    
    // Add categorized commodities
    Object.entries(getCommoditiesByCategory()).forEach(([category, commodities]) => {
      // Add category header
      menuItems.push(
        <MenuItem 
          key={`${category}-header`} 
          disabled 
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          — {category} —
        </MenuItem>
      );
      
      // Add commodities in this category
      commodities.forEach((c) => {
        menuItems.push(
          <MenuItem key={c.id} value={c.id}>
            {c.display_name}
          </MenuItem>
        );
      });
    });
    
    return menuItems;
  }, [commoditiesToUse, getCommoditiesByCategory]);

  const handleParcelChange = useCallback((index, field, value) => {
    if (field !== 'ownership_document_number' && field !== 'remarks') {
      console.log("=== PARCEL CHANGE ===");
      console.log("Parcel Change:", { index, field, value });
      
      if (field === 'commodities') {
        console.log("Updated commodities for parcel", index, ":", value);
        value.forEach((commodity, idx) => {
          console.log(`  Commodity ${idx}:`, {
            commodity_id: commodity.commodity_id,
            size_hectares: commodity.size_hectares,
            number_of_heads: commodity.number_of_heads,
            farm_type: commodity.farm_type
          });
        });
      }
      console.log("=== END PARCEL CHANGE ===");
    }
    
    if (typeof updateFarmParcel === 'function') {
      updateFarmParcel(index, field, value);
    }
  }, [updateFarmParcel]);

  const handleCommodityChange = useCallback((parcelIndex, commodityIndex, field, value) => {
    console.log(`=== COMMODITY CHANGE ===`);
    console.log(`Parcel ${parcelIndex}, Commodity ${commodityIndex}, Field: ${field}, Value:`, value);
    
    if (field === 'commodity_id') {
      const commodityInfo = getCommodityById(value);
      const categoryName = commodityInfo?.category?.name || '';
      const isFisheries = categoryName.toLowerCase().includes('fisheries');
      
      console.log("Commodity Selected:", {
        commodityId: value,
        commodityInfo: commodityInfo,
        categoryName: categoryName,
        isFisheries: isFisheries
      });
      
      const parcel = parcels[parcelIndex];
      const updatedCommodities = [...(parcel?.commodities || [])];
      updatedCommodities[commodityIndex] = { 
        ...updatedCommodities[commodityIndex], 
        [field]: value,
        farm_type: isFisheries ? '' : updatedCommodities[commodityIndex]?.farm_type || ''
      };
      console.log("Updated commodity after selection:", updatedCommodities[commodityIndex]);
      handleParcelChange(parcelIndex, 'commodities', updatedCommodities);
    } else {
      const parcel = parcels[parcelIndex];
      const updatedCommodities = [...(parcel?.commodities || [])];
      updatedCommodities[commodityIndex] = { ...updatedCommodities[commodityIndex], [field]: value };
      
      if (field === 'number_of_heads') {
        console.log("LIVESTOCK HEADS UPDATE:", {
          parcelIndex,
          commodityIndex,
          oldValue: updatedCommodities[commodityIndex].number_of_heads,
          newValue: value,
          parsedValue: parseInt(value) || 0
        });
      }
      
      console.log("Updated commodity:", updatedCommodities[commodityIndex]);
      handleParcelChange(parcelIndex, 'commodities', updatedCommodities);
    }
    console.log(`=== END COMMODITY CHANGE ===`);
  }, [parcels, getCommodityById, handleParcelChange]);

  const addCommodity = useCallback((parcelIndex) => {
    const parcel = parcels[parcelIndex];
    const newCommodity = {
      commodity_id: '',
      size_hectares: '',
      number_of_heads: 0,
      farm_type: '',
      is_organic_practitioner: false,
      remarks: ''
    };
    const updatedCommodities = [...(parcel?.commodities || []), newCommodity];
    handleParcelChange(parcelIndex, 'commodities', updatedCommodities);
  }, [parcels, handleParcelChange]);

  const removeCommodity = useCallback((parcelIndex, commodityIndex) => {
    const parcel = parcels[parcelIndex];
    const updatedCommodities = [...(parcel?.commodities || [])];
    updatedCommodities.splice(commodityIndex, 1);
    handleParcelChange(parcelIndex, 'commodities', updatedCommodities);
  }, [parcels, handleParcelChange]);

  const handleAddParcel = useCallback(() => {
    if (typeof addFarmParcel === 'function') addFarmParcel();
  }, [addFarmParcel]);

  const handleRemoveParcel = useCallback((index) => {
    if (window.confirm('Are you sure you want to remove this farm parcel?')) {
      if (typeof removeFarmParcel === 'function') removeFarmParcel(index);
    }
  }, [removeFarmParcel]);

  const calculateTotalCommodityArea = useCallback((commodities) => {
    return (commodities || []).reduce((total, commodity) => {
      return total + (parseFloat(commodity.size_hectares) || 0);
    }, 0);
  }, []);

  const getValidationErrors = useCallback(() => {
    const errors = [];
    
    // If farm data is not required, don't show validation errors
    if (!requiresFarmData) {
      return errors;
    }
    
    if (parcels.length === 0) {
      errors.push('At least one farm parcel is required');
    }
    
    parcels.forEach((parcel, index) => {
      if (!parcel.barangay) errors.push(`Parcel ${index + 1}: Barangay is required`);
      if (!parcel.total_farm_area || parcel.total_farm_area <= 0) {
        errors.push(`Parcel ${index + 1}: Total farm area must be greater than 0`);
      }
      if (!parcel.tenure_type) errors.push(`Parcel ${index + 1}: Tenure type is required`);
      if (!parcel.commodities || parcel.commodities.length === 0) {
        errors.push(`Parcel ${index + 1}: At least one commodity is required`);
      } else {
        parcel.commodities.forEach((commodity, commodityIndex) => {
          if (!commodity.commodity_id) {
            errors.push(`Parcel ${index + 1}, Commodity ${commodityIndex + 1}: Commodity is required`);
          }
          if (!commodity.size_hectares || commodity.size_hectares <= 0) {
            errors.push(`Parcel ${index + 1}, Commodity ${commodityIndex + 1}: Size must be greater than 0`);
          }
          
          if (commodity.commodity_id) {
            const commodityInfo = getCommodityById(commodity.commodity_id);
            const categoryName = commodityInfo?.category?.name || '';
            const isFisheries = categoryName.toLowerCase().includes('fisheries');
            
            if (!isFisheries && !commodity.farm_type) {
              errors.push(`Parcel ${index + 1}, Commodity ${commodityIndex + 1}: Farm type is required for ${commodityInfo?.display_name || 'this commodity'}`);
            }
          }
        });
      }
    });
    
    return errors;
  }, [parcels, requiresFarmData, getCommodityById]);

  const validationErrors = getValidationErrors();
  const isValid = validationErrors.length === 0;

  // Show critical error if commodities fail to load (only if farm data is required)
  const hasCriticalError = requiresFarmData && commoditiesError;

  if (hasCriticalError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Unable to Load Required Data
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Commodities failed to load. Please check your internet connection and try again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />} 
              onClick={() => {
                commoditiesDataFetched.current = false;
                fetchCommodities();
              }}
            >
              Retry Loading Data
            </Button>
          </Box>
        </Alert>
      </Box>
    );
  }

  // If farm data is not required, show an optional section
  if (!requiresFarmData) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LandscapeIcon sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h2" fontWeight="bold" color="info.main">
              Farm Parcels (Optional)
            </Typography>
            <Typography variant="body1" color="text.secondary">
              As a {livelihoodCategory || 'farmworker/agri-youth'}, farm parcel information is optional
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }} icon={<InfoIcon />}>
          <Typography variant="body1" gutterBottom>
            <strong>Farm Parcels Not Required</strong>
          </Typography>
          <Typography variant="body2">
            Since you selected {livelihoodCategory || 'farmworker or agri-youth'} as your livelihood category, 
            you are not required to provide farm parcel information. You may skip this section or optionally 
            add farm information if you also own or manage farm land.
          </Typography>
        </Alert>

        {parcels.length > 0 ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                You have optionally provided {parcels.length} farm parcel{parcels.length !== 1 ? 's' : ''}.
              </Typography>
            </Alert>
            
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={handleAddParcel} 
              sx={{ mb: 3, borderRadius: 2 }}
              disabled={!requiresFarmData && commoditiesToUse.length === 0}
            >
              Add Another Parcel
            </Button>

            {/* Render existing parcels */}
            <Grid container spacing={3}>
              {parcels.map((parcel, index) => (
                <Grid item xs={12} key={parcel?.id || index}>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="info.main">
                          Optional Parcel #{index + 1}
                        </Typography>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveParcel(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {parcel.barangay ? `${parcel.barangay}, ` : ''}
                        {parcel.total_farm_area ? `${parcel.total_farm_area} hectares` : 'Area not specified'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 6, border: '2px dashed', borderColor: 'info.main' }}>
            <CardContent>
              <LocationIcon sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" color="info.main" gutterBottom>
                No Farm Parcels Added (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You can skip this section or optionally add farm information if you own or manage farm land.
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddParcel} 
                size="large" 
                color="info"
                disabled={commoditiesToUse.length === 0}
              >
                Add Optional Farm Parcel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Validation Status for Optional Section */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="info" />
          <Typography variant="body2" color="info.dark" sx={{ fontWeight: 'bold' }}>
            Farm Parcels Section (Optional) - You can proceed to the next section
          </Typography>
        </Box>
      </Box>
    );
  }

  // Required farm data section (original functionality for farmers and fisherfolk)
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <LandscapeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
            Farm Parcels
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Provide details about your farm land ownership and cultivation areas
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddParcel} 
          sx={{ borderRadius: 2 }}
          disabled={commoditiesToUse.length === 0}
        >
          Add Parcel
        </Button>
      </Box>

      {/* Data Loading Alerts */}
      {commoditiesError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />} 
              onClick={() => {
                commoditiesDataFetched.current = false;
                fetchCommodities();
              }}
              disabled={loadingCommodities}
            >
              Retry
            </Button>
          }
        >
          Commodities: {commoditiesError}
        </Alert>
      )}

      {/* Validation Error Alert */}
      {!isValid && (
        <Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Please complete the following required fields:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>
                <Typography variant="body2">{error}</Typography>
              </li>
            ))}
          </Box>
        </Alert>
      )}

      {errs.farmParcels && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errs.farmParcels}
        </Alert>
      )}

      {parcels.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 6, border: '2px dashed', borderColor: 'error.main' }}>
          <CardContent>
            <LocationIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" color="error.main" gutterBottom>
              No Farm Parcels Added - Required
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need to add at least one farm parcel to continue with your RSBSA registration.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleAddParcel} 
              size="large" 
              color="error"
              disabled={commoditiesToUse.length === 0}
            >
              Add Your First Farm Parcel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {parcels.map((parcel, index) => {
            const totalCommodityArea = calculateTotalCommodityArea(parcel?.commodities);

            return (
              <Grid item xs={12} key={parcel?.id || index}>
                <Accordion
                  defaultExpanded={index === parcels.length - 1}
                  sx={{ borderRadius: 2, '&:before': { display: 'none' }, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '8px 8px 0 0',
                      '&.Mui-expanded': { borderRadius: '8px 8px 0 0' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mr: 2 }}>
                      <Typography variant="h6" fontWeight="bold">
                        Farm Parcel #{index + 1}{parcel?.parcel_number && ` - ${parcel.parcel_number}`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${parcel?.total_farm_area || 0} hectares`}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'inherit' }}
                        />
                        <Chip
                          label={`${(parcel?.commodities || []).length} commodities`}
                          size="small"
                          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'inherit' }}
                        />
                        {parcels.length > 1 && (
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemoveParcel(index); }} sx={{ color: 'inherit' }}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Parcel Number/Name"
                          value={parcel?.parcel_number || ''}
                          onChange={(e) => handleParcelChange(index, 'parcel_number', e.target.value)}
                          error={!!errs[`farmParcels.${index}.parcel_number`]}
                          helperText={errs[`farmParcels.${index}.parcel_number`] || 'Optional identifier for this parcel'}
                          placeholder="e.g., Lot 1, Parcel A, North Field"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errs[`farmParcels.${index}.barangay`]} required>
                          <InputLabel>Barangay *</InputLabel>
                          <Select
                            value={parcel?.barangay || ''}
                            onChange={(e) => handleParcelChange(index, 'barangay', e.target.value)}
                            label="Barangay *"
                          >
                            {barangayOptions.map((barangay) => (
                              <MenuItem key={barangay} value={barangay}>{barangay}</MenuItem>
                            ))}
                          </Select>
                          {errs[`farmParcels.${index}.barangay`] && (
                            <FormHelperText>{errs[`farmParcels.${index}.barangay`]}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                       <TextField
                          fullWidth
                          label="Total Farm Area (hectares) *"
                          type="number"
                          step="0.01"
                          inputProps={{ min: 0 }}
                          value={parcel?.total_farm_area ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleParcelChange(index, 'total_farm_area', val === '' ? '' : parseFloat(val));
                          }}
                          error={!!errs[`farmParcels.${index}.total_farm_area`]}
                          helperText={errs[`farmParcels.${index}.total_farm_area`] || 'Enter the total area of this farm parcel'}
                          placeholder="0.00"
                          required
                        />
                      </Grid>

                      {/* Area comparison alert */}
                      {parcel?.total_farm_area > 0 && (
                        <Grid item xs={12}>
                          {totalCommodityArea > parcel.total_farm_area ? (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                              <Typography variant="body2">
                                <strong>Area Mismatch:</strong> Total commodity area ({totalCommodityArea.toFixed(2)} ha)
                                exceeds farm area ({parcel.total_farm_area} ha). Adjust values.
                              </Typography>
                            </Alert>
                          ) : totalCommodityArea === parcel.total_farm_area ? (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                              <Typography variant="body2">
                                <strong>Perfect Match:</strong> Commodity areas match farm area.
                              </Typography>
                            </Alert>
                          ) : totalCommodityArea > 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                              <Typography variant="body2">
                                <strong>Area Summary:</strong> Farm: {parcel.total_farm_area} ha • Commodities: {totalCommodityArea.toFixed(2)} ha • Remaining: {(parcel.total_farm_area - totalCommodityArea).toFixed(2)} ha
                              </Typography>
                            </Alert>
                          ) : (
                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                              <Typography variant="body2">
                                <strong>Next Step:</strong> Add commodities to allocate the area.
                              </Typography>
                            </Alert>
                          )}
                        </Grid>
                      )}

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!errs[`farmParcels.${index}.tenure_type`]} required>
                          <InputLabel>Tenure Type *</InputLabel>
                          <Select
                            value={parcel?.tenure_type || ''}
                            onChange={(e) => handleParcelChange(index, 'tenure_type', e.target.value)}
                            label="Tenure Type *"
                          >
                            {tenureTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                          </Select>
                          {errs[`farmParcels.${index}.tenure_type`] && (
                            <FormHelperText>{errs[`farmParcels.${index}.tenure_type`]}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Landowner Name"
                          value={parcel?.landowner_name || ''}
                          onChange={(e) => handleParcelChange(index, 'landowner_name', e.target.value)}
                          placeholder="Name of the landowner (if different from farmer)"
                          helperText="Required for tenants and lessees"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Ownership Document Type</InputLabel>
                          <Select
                            value={parcel?.ownership_document_type || ''}
                            onChange={(e) => handleParcelChange(index, 'ownership_document_type', e.target.value)}
                            label="Ownership Document Type"
                          >
                            {ownershipDocumentTypes.map((option) => (
                              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Ownership Document Number"
                          value={parcel?.ownership_document_number || ''}
                          onChange={(e) => handleParcelChange(index, 'ownership_document_number', e.target.value)}
                          placeholder="Title No., Tax Dec No., etc."
                          helperText="Enter document number if available"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                          <Typography variant="h6" gutterBottom color="primary">
                            CROP/COMMODITY Information *
                            {(!parcel?.commodities || parcel.commodities.length === 0) && (
                              <Chip label="Required" color="error" size="small" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<AddCircleIcon />} 
                            onClick={() => addCommodity(index)}
                            disabled={commoditiesToUse.length === 0}
                          >
                            Add Commodity
                          </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                      </Grid>

                      {Number(totalCommodityArea) === 0 && (
                        <Grid item xs={12}>
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>At least one commodity is required.</strong> Add commodities to allocate area.
                            </Typography>
                          </Alert>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        {!(parcel?.commodities && parcel.commodities.length > 0) ? (
                          <Card variant="outlined" sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'error.main' }}>
                            <Typography variant="body2" color="error.main" gutterBottom fontWeight="bold">
                              No commodities added yet - Required
                            </Typography>
                            <Button 
                              variant="contained" 
                              size="small" 
                              startIcon={<AddCircleIcon />} 
                              onClick={() => addCommodity(index)} 
                              color="error"
                              disabled={commoditiesToUse.length === 0}
                            >
                              Add First Commodity
                            </Button>
                          </Card>
                        ) : (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: 'background.default' }}>
                                  <TableCell><strong>Commodity *</strong></TableCell>
                                  <TableCell><strong>Category</strong></TableCell>
                                  <TableCell><strong>Size (ha) *</strong></TableCell>
                                  <TableCell><strong>No. of Heads</strong></TableCell>
                                  <TableCell><strong>Farm Type</strong></TableCell>
                                  <TableCell><strong>Organic</strong></TableCell>
                                  <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {parcel.commodities.map((commodity, commodityIndex) => {
                                  const selectedCommodity = getCommodityById(commodity.commodity_id);
                                  const categoryName = selectedCommodity?.category?.name || '-';
                                  const isLivestock = categoryName.toLowerCase().includes('livestock') || categoryName.toLowerCase().includes('poultry');
                                  const isFisheries = categoryName.toLowerCase().includes('fisheries');
                                  
                                  return (
                                    <TableRow key={commodityIndex} hover>
                                      <TableCell>
                                        <FormControl fullWidth size="small" error={!commodity.commodity_id} required>
                                          <Select
                                            value={commodity.commodity_id || ''}
                                            onChange={(e) => handleCommodityChange(index, commodityIndex, 'commodity_id', e.target.value)}
                                            displayEmpty
                                            disabled={loadingCommodities}
                                          >
                                            {loadingCommodities ? (
                                              <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Loading...
                                              </MenuItem>
                                            ) : commoditiesError ? (
                                              <MenuItem disabled>
                                                Error loading commodities
                                              </MenuItem>
                                            ) : (
                                              createCommodityMenuItems()
                                            )}
                                          </Select>
                                        </FormControl>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                          {categoryName}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          type="number"
                                          value={commodity.size_hectares || ''}
                                          onChange={(e) => handleCommodityChange(index, commodityIndex, 'size_hectares', parseFloat(e.target.value) || 0)}
                                          inputProps={{ min: 0, step: 0.01 }}
                                          sx={{ width: 80 }}
                                          error={!commodity.size_hectares || commodity.size_hectares <= 0}
                                          required
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {isLivestock ? (
                                          <TextField
                                            size="small"
                                            type="number"
                                            value={commodity.number_of_heads || ''}
                                            onChange={(e) => handleCommodityChange(index, commodityIndex, 'number_of_heads', parseInt(e.target.value) || 0)}
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 80 }}
                                          />
                                        ) : (
                                          <Typography variant="body2" color="text.secondary">-</Typography>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {isFisheries ? (
                                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            Not applicable
                                          </Typography>
                                        ) : (
                                          <FormControl size="small" sx={{ minWidth: 120 }} error={!commodity.farm_type}>
                                            <Select
                                              value={commodity.farm_type || ''}
                                              onChange={(e) => handleCommodityChange(index, commodityIndex, 'farm_type', e.target.value)}
                                              displayEmpty
                                            >
                                              <MenuItem value="" disabled>Select Type *</MenuItem>
                                              {farmTypeOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <FormControlLabel
                                          control={
                                            <Switch
                                              checked={commodity.is_organic_practitioner || false}
                                              onChange={(e) => handleCommodityChange(index, commodityIndex, 'is_organic_practitioner', e.target.checked)}
                                              size="small"
                                            />
                                          }
                                          label=""
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <IconButton size="small" color="error" onClick={() => removeCommodity(index, commodityIndex)}>
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Grid>

                      {parcel?.commodities && parcel.commodities.length > 0 && (
                        <Grid item xs={12}>
                          <Card variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              <strong>Total Farm Area:</strong> {totalCommodityArea.toFixed(2)} hectares {totalCommodityArea > 0 && <span>(100% utilized)</span>}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {(() => {
                                const breakdown = {};
                                parcel.commodities.forEach(commodity => {
                                  const selectedCommodity = getCommodityById(commodity.commodity_id);
                                  if (selectedCommodity) {
                                    const name = selectedCommodity.display_name;
                                    breakdown[name] = (breakdown[name] || 0) + (parseFloat(commodity.size_hectares) || 0);
                                  }
                                });
                                const items = Object.entries(breakdown)
                                  .filter(([, area]) => area > 0)
                                  .map(([type, area]) => `${type}: ${area.toFixed(2)} ha`);
                                if (items.length > 0) {
                                  return <Typography variant="caption" color="text.secondary"><strong>Breakdown:</strong> {items.join(', ')}</Typography>;
                                }
                                return null;
                              })()}
                            </Box>
                          </Card>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Special Classifications</Typography>
                        <Divider sx={{ mb: 2 }} />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={<Switch checked={parcel?.is_ancestral_domain || false} onChange={(e) => handleParcelChange(index, 'is_ancestral_domain', e.target.checked)} />}
                          label="Within Ancestral Domain"
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={<Switch checked={parcel?.is_agrarian_reform_beneficiary || false} onChange={(e) => handleParcelChange(index, 'is_agrarian_reform_beneficiary', e.target.checked)} />}
                          label="Agrarian Reform Beneficiary"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Remarks"
                          value={parcel?.remarks || ''}
                          onChange={(e) => handleParcelChange(index, 'remarks', e.target.value)}
                          placeholder="Additional notes about this farm parcel..."
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Validation Status Summary */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: isValid ? 'success.light' : 'error.light', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        {isValid ? (
          <>
            <Typography variant="body2" color="success.dark" sx={{ fontWeight: 'bold' }}>
              ✅ Farm Parcels Section Complete
            </Typography>
            <Typography variant="body2" color="success.dark">
              - You can proceed to the next section
            </Typography>
          </>
        ) : (
          <>
            <WarningIcon color="error" />
            <Typography variant="body2" color="error.dark" sx={{ fontWeight: 'bold' }}>
              ⚠️ Farm Parcels Section Incomplete
            </Typography>
            <Typography variant="body2" color="error.dark">
              - Complete all required fields above to proceed
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

// Updated validation function without sector_id
export const validateFarmParcelsData = (farmParcels, commoditiesData = [], requiresFarmData = true) => {
  const parcels = Array.isArray(farmParcels) ? farmParcels : [];
  
  // If farm data is not required, always return valid
  if (!requiresFarmData) {
    return { isValid: true, errors: [] };
  }
  
  if (parcels.length === 0) {
    return { isValid: false, errors: ['At least one farm parcel is required'] };
  }

  const errors = [];

  const getCommodityById = (id) => {
    return commoditiesData.find(c => c.id === id);
  };
  
  parcels.forEach((parcel, index) => {
    if (!parcel.barangay) errors.push(`Parcel ${index + 1}: Barangay is required`);
    if (!parcel.total_farm_area || parcel.total_farm_area <= 0) {
      errors.push(`Parcel ${index + 1}: Total farm area must be greater than 0`);
    }
    if (!parcel.tenure_type) errors.push(`Parcel ${index + 1}: Tenure type is required`);

    if (!parcel.commodities || parcel.commodities.length === 0) {
      errors.push(`Parcel ${index + 1}: At least one commodity is required`);
    } else {
      parcel.commodities.forEach((commodity, commodityIndex) => {
        if (!commodity.commodity_id) {
          errors.push(`Parcel ${index + 1}, Commodity ${commodityIndex + 1}: Commodity is required`);
        }
        if (!commodity.size_hectares || commodity.size_hectares <= 0) {
          errors.push(`Parcel ${index + 1}, Commodity ${commodityIndex + 1}: Size must be greater than 0`);
        }
        
        if (commodity.commodity_id) {
          const commodityInfo = getCommodityById(commodity.commodity_id);
          const categoryName = commodityInfo?.category?.name || '';
          const isFisheries = categoryName.toLowerCase().includes('fisheries');
          
          if (!isFisheries && !commodity.farm_type) {
            errors.push(`Parcel ${index + 1}, Commodity ${commodityIndex + 1}: Farm type is required for ${commodityInfo?.display_name || 'this commodity'}`);
          }
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default FarmParcelsSection;
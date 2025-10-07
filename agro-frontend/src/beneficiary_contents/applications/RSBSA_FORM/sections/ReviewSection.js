/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Paper,
  Avatar,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  BarChart,
  User,
  Settings,
  MapPin,
  Edit,
  CheckCircle,
  Package,
  Heart,
  Zap,
  Star,
  Droplets,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  Check,
  ChevronRight,
  Activity,
  TrendingUp
} from 'lucide-react';

const ReviewSection = ({ formData, errors, onEdit, getCommodityById, commoditiesToUse = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Safety checks
  if (!formData || !formData.beneficiaryDetails) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, textAlign: 'center' }}>
        <AlertTriangle size={isMobile ? 48 : 64} color="#f44336" style={{ marginBottom: 16 }} />
        <Typography variant={isMobile ? "h5" : "h6"} color="error" gutterBottom>
          Form Data Unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please refresh the page and try again.
        </Typography>
      </Box>
    );
  }

  const hasErrors = Object.keys(errors || {}).length > 0;

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEnum = (value) => {
    if (!value) return 'Not specified';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Enhanced commodity summary with better organization
  const getCommoditySummary = () => {
    const summary = {};
    const farmParcels = formData.farmParcels || [];

    farmParcels.forEach((parcel, parcelIndex) => {
      (parcel.commodities || []).forEach((commodity) => {
        const categoryName = commodity.category || 'Other';
        const categoryKey = categoryName.toLowerCase();
        
        if (!summary[categoryKey]) {
          summary[categoryKey] = {
            name: categoryName,
            count: 0,
            totalArea: 0,
            totalHeads: 0,
            commodities: [],
            parcels: []
          };
        }
        
        // Add commodity details
        summary[categoryKey].commodities.push({
          name: commodity.commodity_name || `ID: ${commodity.commodity_id}`,
          area: parseFloat(commodity.size_hectares) || 0,
          heads: commodity.number_of_heads || 0,
          parcelIndex: parcelIndex + 1,
          parcelNumber: parcel.parcel_number,
          barangay: parcel.barangay
        });
        
        summary[categoryKey].count++;
        summary[categoryKey].totalArea += parseFloat(commodity.size_hectares) || 0;
        summary[categoryKey].totalHeads += parseInt(commodity.number_of_heads) || 0;
        
        // Track unique parcels
        if (!summary[categoryKey].parcels.some(p => p.parcelId === parcel.id)) {
          summary[categoryKey].parcels.push({
            parcelId: parcel.id,
            parcelNumber: parcel.parcel_number,
            barangay: parcel.barangay,
            totalFarmArea: parcel.total_farm_area,
            tenureType: parcel.tenure_type,
            parcelIndex: parcelIndex + 1
          });
        }
      });
    });
    
    return summary;
  };

  const commoditySummary = getCommoditySummary();

  const getCommodityIcon = (commodity) => {
    const icons = {
      rice: <Zap size={isMobile ? 14 : 16} />,
      corn: <Zap size={isMobile ? 14 : 16} />,
      crops: <Zap size={isMobile ? 14 : 16} />,
      'high value crops': <Star size={isMobile ? 14 : 16} />,
      hvc: <Star size={isMobile ? 14 : 16} />,
      fisheries: <Droplets size={isMobile ? 14 : 16} />,
      livestock: <Heart size={isMobile ? 14 : 16} />,
      livestocks: <Heart size={isMobile ? 14 : 16} />,
      poultry: <Heart size={isMobile ? 14 : 16} />
    };
    return icons[commodity] || <Package size={isMobile ? 14 : 16} />;
  };

  // Calculate completion
  const completionPercentage = (() => {
    let completed = 0;
    if (formData.beneficiaryDetails) completed++;
    if (formData.farmProfile) completed++;
    if (formData.farmParcels?.length > 0) completed++;
    return (completed / 3) * 100;
  })();

  // Calculate totals
  const totalParcels = (formData.farmParcels || []).length;
  const totalFarmArea = (formData.farmParcels || []).reduce((sum, parcel) => sum + (parseFloat(parcel.total_farm_area) || 0), 0);
  const totalLivestockHeads = Object.entries(commoditySummary).reduce((total, [categoryKey, category]) => {
    return total + (category.totalHeads || 0);
  }, 0);

  return (
    <Stack spacing={isMobile ? 2 : 3}>
      {/* Header Section */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)',
          p: { xs: 2, md: 4 },
          textAlign: 'center'
        }}
      >
        <Avatar 
          sx={{ 
            width: { xs: 56, md: 72 }, 
            height: { xs: 56, md: 72 }, 
            mx: 'auto', 
            mb: 2,
            background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)'
          }}
        >
          <BarChart size={isMobile ? 28 : 36} />
        </Avatar>
        
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700" color="#1b5e20" gutterBottom>
          Review Your Application
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
          Please review all information carefully before submitting your RSBSA enrollment application.
        </Typography>
        
        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="600">Application Progress</Typography>
            <Typography variant="body2" fontWeight="700" color="primary">
              {Math.round(completionPercentage)}% Complete
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: alpha('#2e7d32', 0.1),
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #2e7d32 0%, #1976d2 100%)',
                borderRadius: 3
              }
            }} 
          />
        </Box>
      </Paper>

      {/* Validation Status */}
      {hasErrors ? (
        <Alert 
          severity="error" 
          icon={<AlertTriangle size={isMobile ? 16 : 20} />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="600" gutterBottom>
            Please Fix These Issues
          </Typography>
          <List dense>
            {Object.entries(errors).map(([field, error]) => (
              <ListItem key={field} sx={{ py: 0.5, px: 0 }}>
                <ListItemText 
                  primary={error} 
                  secondary={`Field: ${field}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      ) : (
        <Alert 
          severity="success" 
          icon={<Check size={isMobile ? 16 : 20} />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="600" gutterBottom>
            All Information Complete
          </Typography>
          <Typography variant="body2">
            Your application is ready for submission. Review the details below and proceed to the final step.
          </Typography>
        </Alert>
      )}

      {/* Personal Information Section */}
      <Paper elevation={2} sx={{ borderRadius: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#1976d2', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
                  <User size={isMobile ? 16 : 20} />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="600" color="#1976d2">
                    Personal Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Basic beneficiary details
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit size={14} />}
                onClick={() => onEdit?.(1)}
                sx={{ minWidth: 80, fontSize: '0.75rem' }}
              >
                Edit
              </Button>
            </Box>
            
            <Divider />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MapPin size={isMobile ? 16 : 20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        LOCATION
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {formData.beneficiaryDetails?.barangay || 'Not provided'}, Opol, Misamis Oriental
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Calendar size={isMobile ? 16 : 20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        BIRTH DATE
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {formatDate(formData.beneficiaryDetails?.birth_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Phone size={isMobile ? 16 : 20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        CONTACT NUMBER
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {formData.beneficiaryDetails?.contact_number || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Shield size={isMobile ? 16 : 20} color="#1976d2" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        CIVIL STATUS
                      </Typography>
                      <Typography variant="body2" fontWeight="500">
                        {formatEnum(formData.beneficiaryDetails?.civil_status)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Paper>

      {/* Farm Profile Section */}
      <Paper elevation={2} sx={{ borderRadius: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#2e7d32', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
                  <Settings size={isMobile ? 16 : 20} />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="600" color="#2e7d32">
                    Farm Profile & Livelihood
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Agricultural activities and livelihood
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit size={14} />}
                onClick={() => onEdit?.(2)}
                color="success"
                sx={{ minWidth: 80, fontSize: '0.75rem' }}
              >
                Edit
              </Button>
            </Box>
            
            <Divider />

            <Paper sx={{ p: 2, bgcolor: alpha('#2e7d32', 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" color="#2e7d32" gutterBottom>
                Primary Livelihood Category
              </Typography>
              <Typography variant="body2" fontWeight="500">
                {(() => {
                  const categoryId = formData.farmProfile?.livelihood_category_id;
                  const categoryNames = { 1: 'Farmer', 2: 'Farm Worker', 3: 'Fisherfolk', 4: 'Agri-Youth' };
                  return categoryNames[categoryId] || `Category ${categoryId}` || 'Not selected';
                })()}
              </Typography>
            </Paper>

            {/* Enhanced Activity Display with Better UI Organization */}
            {(() => {
              const categoryId = formData.farmProfile?.livelihood_category_id;
              
              // Activity configuration with icons and colors
              const activityConfigs = {
                1: {
                  title: 'Farmer Activities',
                  icon: <Activity size={20} />,
                  color: '#2e7d32',
                  bgColor: alpha('#2e7d32', 0.05),
                  activities: [
                    { key: 'rice', label: 'Rice Production', icon: <Zap size={16} /> },
                    { key: 'corn', label: 'Corn Production', icon: <Zap size={16} /> },
                    { key: 'other_crops', label: 'Other Crops', icon: <Star size={16} /> },
                    { key: 'livestock', label: 'Livestock', icon: <Heart size={16} /> },
                    { key: 'poultry', label: 'Poultry', icon: <Heart size={16} /> }
                  ],
                  data: formData.farmerActivities
                },
                2: {
                  title: 'Farm Worker Activities',
                  icon: <Settings size={20} />,
                  color: '#1976d2',
                  bgColor: alpha('#1976d2', 0.05),
                  activities: [
                    { key: 'land_preparation', label: 'Land Preparation', icon: <TrendingUp size={16} /> },
                    { key: 'planting', label: 'Planting', icon: <TrendingUp size={16} /> },
                    { key: 'cultivation', label: 'Cultivation', icon: <TrendingUp size={16} /> },
                    { key: 'harvesting', label: 'Harvesting', icon: <TrendingUp size={16} /> },
                    { key: 'others', label: 'Other Farm Work', icon: <Settings size={16} /> }
                  ],
                  data: formData.farmworkerActivities
                },
                3: {
                  title: 'Fisherfolk Activities',
                  icon: <Droplets size={20} />,
                  color: '#0288d1',
                  bgColor: alpha('#0288d1', 0.05),
                  activities: [
                    { key: 'fish_capture', label: 'Fish Capture', icon: <Droplets size={16} /> },
                    { key: 'aquaculture', label: 'Aquaculture', icon: <Droplets size={16} /> },
                    { key: 'seaweed_farming', label: 'Seaweed Farming', icon: <Droplets size={16} /> },
                    { key: 'gleaning', label: 'Gleaning', icon: <Droplets size={16} /> },
                    { key: 'fish_processing', label: 'Fish Processing', icon: <Package size={16} /> },
                    { key: 'fish_vending', label: 'Fish Vending', icon: <Package size={16} /> }
                  ],
                  data: formData.fisherfolkActivities
                },
                4: {
                  title: 'Agri-Youth Activities',
                  icon: <Star size={20} />,
                  color: '#f57c00',
                  bgColor: alpha('#f57c00', 0.05),
                  activities: [
                    { key: 'is_agri_youth', label: 'I am an Agri-Youth (18-30 years old)', icon: <Star size={16} /> },
                    { key: 'is_part_of_farming_household', label: 'Part of Farming Household', icon: <User size={16} /> },
                    { key: 'is_formal_agri_course', label: 'Formal Agricultural Course', icon: <Activity size={16} /> },
                    { key: 'is_nonformal_agri_course', label: 'Non-formal Agricultural Training', icon: <Activity size={16} /> },
                    { key: 'is_agri_program_participant', label: 'Agricultural Program Participant', icon: <CheckCircle size={16} /> }
                  ],
                  data: formData.agriYouthActivities
                }
              };

              const config = activityConfigs[categoryId];
              
              if (!config) {
                return (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="body2">
                      Please select a livelihood category to see the relevant activities.
                    </Typography>
                  </Alert>
                );
              }

              return (
                <Paper 
                  elevation={1}
                  sx={{ 
                    borderRadius: 3,
                    border: `2px solid ${alpha(config.color, 0.2)}`,
                    background: config.bgColor,
                    overflow: 'hidden'
                  }}
                >
                  {/* Header with Icon and Title */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      background: `linear-gradient(135deg, ${config.color} 0%, ${alpha(config.color, 0.8)} 100%)`,
                      color: 'white'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                        {config.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="700">
                          {config.title}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Selected livelihood activities
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Activities Grid */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {config.activities.map((activity) => {
                        const isActive = config.data?.[activity.key];
                        return (
                          <Grid item xs={12} sm={6} md={4} key={activity.key}>
                            <Card 
                              variant="outlined"
                              sx={{ 
                                height: '100%',
                                border: isActive ? `2px solid ${config.color}` : '1px solid #e0e0e0',
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                bgcolor: isActive ? alpha(config.color, 0.05) : 'background.paper',
                                '&:hover': {
                                  borderColor: config.color,
                                  boxShadow: 2
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                  <Box sx={{ color: isActive ? config.color : '#9e9e9e' }}>
                                    {activity.icon}
                                  </Box>
                                  <CheckCircle 
                                    size={16}
                                    color={isActive ? '#4caf50' : '#9e9e9e'} 
                                  />
                                </Box>
                                
                                <Typography 
                                  variant="body2" 
                                  fontWeight="600" 
                                  sx={{ 
                                    mb: 1,
                                    color: isActive ? config.color : 'text.primary'
                                  }}
                                >
                                  {activity.label}
                                </Typography>
                                
                                <Chip 
                                  size="small" 
                                  label={isActive ? 'Active' : 'Inactive'}
                                  color={isActive ? 'success' : 'default'}
                                  variant={isActive ? 'filled' : 'outlined'}
                                  sx={{ 
                                    height: 22, 
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>

                    {/* Summary Stats */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: alpha(config.color, 0.1), borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="600" color={config.color} gutterBottom>
                        Activity Summary
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle size={16} color="#4caf50" />
                          <Typography variant="body2" fontWeight="500">
                            Active: {config.activities.filter(a => config.data?.[a.key]).length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle size={16} color="#9e9e9e" />
                          <Typography variant="body2" fontWeight="500">
                            Inactive: {config.activities.filter(a => !config.data?.[a.key]).length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Activity size={16} color={config.color} />
                          <Typography variant="body2" fontWeight="500">
                            Total: {config.activities.length}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })()}
          </Stack>
        </CardContent>
      </Paper>

      {/* Farm Parcels & Commodities Section */}
      <Paper elevation={2} sx={{ borderRadius: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#f57c00', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
                  <MapPin size={isMobile ? 16 : 20} />
                </Avatar>
                <Box>
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="600" color="#f57c00">
                    Farm Parcels & Commodities
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Land ownership and commodity details
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit size={14} />}
                onClick={() => onEdit?.(3)}
                sx={{ minWidth: 80, fontSize: '0.75rem', color: '#f57c00', borderColor: '#f57c00' }}
              >
                Edit
              </Button>
            </Box>
            
            <Divider />

            {!formData.farmParcels?.length ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="500">
                  No farm parcels added
                </Typography>
                <Typography variant="caption">
                  At least one farm parcel is required for your application.
                </Typography>
              </Alert>
            ) : (
              <Stack spacing={2}>
                {/* Overall Summary */}
                <Paper 
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
                    color: 'white',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="600" gutterBottom>
                    Overall Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700">
                        {totalParcels}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Total Parcels
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700">
                        {totalFarmArea.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Total Area (ha)
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant={isMobile ? "h5" : "h4"} fontWeight="700">
                        {totalLivestockHeads}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Livestock Heads
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Commodity Summary Cards */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Commodity Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {Object.entries(commoditySummary).map(([commodity, data]) => {
                      if (data.count === 0) return null;
                      
                      return (
                        <Grid item xs={12} sm={6} md={4} key={commodity}>
                          <Paper 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: alpha('#f57c00', 0.3),
                              bgcolor: alpha('#f57c00', 0.02),
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: 2,
                                borderColor: '#f57c00'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                              <Box sx={{ color: '#f57c00' }}>
                                {getCommodityIcon(commodity)}
                              </Box>
                              <Typography variant="subtitle2" fontWeight="700" color="#f57c00">
                                {data.name}
                              </Typography>
                            </Box>
                            
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Count:
                                </Typography>
                                <Chip 
                                  label={data.count} 
                                  color="primary" 
                                  size="small" 
                                  sx={{ fontWeight: 600, height: 18, fontSize: '0.7rem' }}
                                />
                              </Box>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Area:
                                </Typography>
                                <Typography variant="caption" fontWeight="600" color="primary">
                                  {data.totalArea.toFixed(1)} ha
                                </Typography>
                              </Box>
                              
                              {data.totalHeads > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Heads:
                                  </Typography>
                                  <Chip 
                                    label={`${data.totalHeads}`}
                                    color="success" 
                                    size="small" 
                                    sx={{ 
                                      fontWeight: 600,
                                      height: 18,
                                      fontSize: '0.7rem',
                                      bgcolor: '#4caf50',
                                      color: 'white'
                                    }}
                                  />
                                </Box>
                              )}
                              
                              <Divider sx={{ my: 0.5 }} />
                              
                              {/* Commodity Details */}
                              <Box>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                  Details:
                                </Typography>
                                {data.commodities.slice(0, isMobile ? 2 : 3).map((comm, index) => (
                                  <Typography 
                                    key={index} 
                                    variant="caption" 
                                    display="block" 
                                    color="text.secondary"
                                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                  >
                                    • {comm.name} ({comm.area} ha)
                                    {comm.heads > 0 && (
                                      <span style={{ fontWeight: 600, color: '#4caf50' }}>
                                        {' '}- {comm.heads} heads
                                      </span>
                                    )}
                                  </Typography>
                                ))}
                                {data.commodities.length > (isMobile ? 2 : 3) && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    +{data.commodities.length - (isMobile ? 2 : 3)} more...
                                  </Typography>
                                )}
                              </Box>

                              {/* Parcel Information */}
                              <Box>
                                <Typography variant="caption" fontWeight="600" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                  Parcels:
                                </Typography>
                                {data.parcels.slice(0, isMobile ? 1 : 2).map((parcel, index) => (
                                  <Typography 
                                    key={index} 
                                    variant="caption" 
                                    display="block" 
                                    color="text.secondary"
                                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                                  >
                                    • Parcel {parcel.parcelIndex} {parcel.parcelNumber && `- ${parcel.parcelNumber}`}
                                    <br />
                                    &nbsp;&nbsp;{parcel.barangay}, {parcel.totalFarmArea}ha
                                  </Typography>
                                ))}
                                {data.parcels.length > (isMobile ? 1 : 2) && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    +{data.parcels.length - (isMobile ? 1 : 2)} more parcels...
                                  </Typography>
                                )}
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Paper>

      {/* Completion Card */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: { xs: 2, md: 3 },  
          background: 'linear-gradient(135deg, #2e7d32 0%, #1976d2 100%)',
          color: 'white',
          textAlign: 'center',
          p: { xs: 2, md: 4 }
        }}
      >
        <CheckCircle size={isMobile ? 40 : 48} style={{ marginBottom: 16 }} />
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom fontWeight="700">
          Review Complete
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
          All information has been verified and is ready for submission. Use the navigation buttons below to continue with your application.
        </Typography>
      </Paper>
    </Stack>
  );
};

export default ReviewSection;
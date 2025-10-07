/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  Stack,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  Paper
} from '@mui/material';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Sprout,
  CheckCircle,
  PhoneCall,
  UserCheck,
  FileText,
  Printer,
  X,
  Shield,
  Briefcase,
  AlertCircle,
  XCircle,
  Edit2,
  Save,
  XOctagon,
  Home,
  Calendar,
  Heart,
  Users,
  Milestone
} from 'lucide-react';
import Label from 'src/components/Label';
import PrintableRSBSAForm from './PrintableRSBSAForm';

const InterviewDetailsModal = ({ 
  open, 
  onClose, 
  interviewData,
  onCompleteInterview,
  onRejectApplication,
  onUpdateBeneficiaryData,
  user,
  onRefresh
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    if (interviewData) {
      setEditedData({
        beneficiary: { ...interviewData.beneficiary_detail },
        user: { ...interviewData.user }
      });
    }
  }, [interviewData]);

  const handleEditToggle = () => {
    if (isEditMode) {
      setEditedData({
        beneficiary: { ...interviewData.beneficiary_detail },
        user: { ...interviewData.user }
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleFieldChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveChanges = async () => {
    if (!onUpdateBeneficiaryData) {
      setSnackbar({
        open: true,
        message: 'Update function not available',
        severity: 'error'
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await onUpdateBeneficiaryData(interviewData.id, editedData);
      
      if (result?.success) {
        setSnackbar({
          open: true,
          message: 'Details updated successfully',
          severity: 'success'
        });
        setIsEditMode(false);
        
        if (onRefresh) {
          setTimeout(() => onRefresh(), 1000);
        }
      } else {
        throw new Error(result?.message || 'Failed to update details');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update details',
        severity: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy - hh:mm a') : null;
    } catch (error) {
      return null;
    }
  };

  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy') : null;
    } catch (error) {
      return null;
    }
  };

  const getLivelihoodInfo = (categoryId) => {
    const livelihoodTypes = {
      1: { label: 'Farmer', color: 'success' },
      2: { label: 'Farm Worker', color: 'info' },
      3: { label: 'Fisherfolk', color: 'primary' },
      4: { label: 'Agri-Youth', color: 'warning' }
    };
    
    return livelihoodTypes[categoryId] || { label: 'Unknown', color: 'default' };
  };

  const getFarmTypeFromCommodities = (parcelCommodities) => {
    if (!parcelCommodities || parcelCommodities.length === 0) return 'No commodities';
    
    const farmTypes = parcelCommodities
      .map(commodity => commodity.farm_type)
      .filter(Boolean)
      .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    
    const uniqueFarmTypes = [...new Set(farmTypes)];
    return uniqueFarmTypes.length > 0 ? uniqueFarmTypes.join(', ') : 'Not specified';
  };

  const handleCompleteInterview = async () => {
    if (!interviewData?.id || !onCompleteInterview) {
      setSnackbar({
        open: true,
        message: 'Interview ID or function not available',
        severity: 'error'
      });
      return;
    }
    
    setIsCompleting(true);
    try {
      const result = await onCompleteInterview(interviewData.id);
      
      if (result?.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Interview verified successfully!',
          severity: 'success'
        });
        
        setTimeout(() => {
          onClose();
          if (onRefresh) onRefresh();
        }, 1500);
      } else {
        throw new Error(result?.message || 'Failed to verify interview');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!interviewData?.id || !onRejectApplication) {
      setSnackbar({
        open: true,
        message: 'Interview ID or function not available',
        severity: 'error'
      });
      return;
    }

    setIsRejecting(true);
    try {
      const result = await onRejectApplication(interviewData.id, rejectionReason);
      
      if (result?.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Application rejected successfully',
          severity: 'success'
        });
        
        setShowRejectDialog(false);
        setRejectionReason('');
        
        setTimeout(() => {
          onClose();
          if (onRefresh) onRefresh();
        }, 1500);
      } else {
        throw new Error(result?.message || 'Failed to reject application');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An unexpected error occurred',
        severity: 'error'
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  const handlePrintForm = () => {
    setPrintModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const EditableField = ({ label, value, field, section, type = 'text', options = [] }) => {
    if (!isEditMode) {
      return (
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.primary">
            {value || 'Not provided'}
          </Typography>
        </Box>
      );
    }

    if (type === 'select') {
      return (
        <TextField
          fullWidth
          select
          size="small"
          label={label}
          value={editedData[section]?.[field] || ''}
          onChange={(e) => handleFieldChange(section, field, e.target.value)}
        >
          {options.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        label={label}
        type={type}
        value={editedData[section]?.[field] || ''}
        onChange={(e) => handleFieldChange(section, field, e.target.value)}
      />
    );
  };

  const SectionCard = ({ title, icon: Icon, children }) => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        bgcolor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <Box sx={{ 
          p: 1, 
          bgcolor: '#ecfdf5', 
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} style={{ color: '#059669' }} />
        </Box>
        <Typography variant="h6" fontWeight="600" color="text.primary">
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );

  if (!interviewData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error">
            Interview data not available. Please try refreshing the page.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const userInfo = editedData.user || interviewData.user || {};
  const beneficiaryDetails = editedData.beneficiary || interviewData.beneficiary_detail || {};
  const farmProfile = interviewData.farm_profile || {};
  const farmParcels = farmProfile.farm_parcels || [];
  
  const livelihoodCategoryId = farmProfile.livelihood_category_id;
  const livelihoodInfo = getLivelihoodInfo(livelihoodCategoryId);
  const isInterviewCompleted = !!interviewData.interview_completed_at;
  const canReject = ['pending'].includes(interviewData.application_status);
  const fullName = [userInfo.fname, userInfo.mname, userInfo.lname, userInfo.extension_name]
    .filter(Boolean)
    .join(' ') || 'Name not available';

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '95vh',
            bgcolor: '#ffffff'
          }
        }}
      >
        {/* Header with Green Gradient */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box display="flex" gap={2.5} flex={1}>
              <Avatar 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'white'
                }}
              >
                {userInfo.fname?.[0]}{userInfo.lname?.[0]}
              </Avatar>
              
              <Box flex={1}>
                <Typography variant="h4" fontWeight="700" color="white" gutterBottom>
                  {fullName}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1, mb: 1.5 }}>
                  <Chip 
                    icon={<Briefcase size={14} />}
                    label={livelihoodInfo.label}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.25)', 
                      color: 'white', 
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  <Chip 
                    label={interviewData.enrollment_type?.toUpperCase()}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.25)', 
                      color: 'white', 
                      fontWeight: 600,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  {isInterviewCompleted ? (
                    <Chip 
                      icon={<CheckCircle size={14} />}
                      label="Verified"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(34, 197, 94, 0.9)', 
                        color: 'white', 
                        fontWeight: 600
                      }}
                    />
                  ) : (
                    <Chip 
                      icon={<AlertCircle size={14} />}
                      label="Pending"
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(251, 191, 36, 0.9)', 
                        color: 'white', 
                        fontWeight: 600
                      }}
                    />
                  )}
                </Stack>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)">
                    <strong>Ref:</strong> {interviewData.application_reference_code || 'N/A'}
                  </Typography>
                  {beneficiaryDetails.system_generated_rsbsa_number && (
                    <Typography variant="body2" color="rgba(255,255,255,0.9)">
                      <strong>RSBSA:</strong> {beneficiaryDetails.system_generated_rsbsa_number}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              {!isInterviewCompleted && (
                <Tooltip title={isEditMode ? "Cancel editing" : "Edit details"}>
                  <IconButton 
                    onClick={handleEditToggle}
                    sx={{ 
                      color: 'white',
                      bgcolor: isEditMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                      '&:hover': { 
                        bgcolor: isEditMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.3)' 
                      }
                    }}
                  >
                    {isEditMode ? <XOctagon size={20} /> : <Edit2 size={20} />}
                  </IconButton>
                </Tooltip>
              )}
              
              <IconButton 
                onClick={onClose}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <X size={20} />
              </IconButton>
            </Box>
          </Box>

          {isEditMode && (
            <Alert 
              severity="info" 
              icon={<Edit2 size={18} />}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              Edit mode active. Make changes and save before verifying the interview.
            </Alert>
          )}
        </Box>

        <Divider />
        
        {/* Content - Clean White Background */}
        <DialogContent sx={{ p: 3, bgcolor: '#f9fafb' }}>
          <Grid container spacing={3}>
            
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Personal Information" icon={User}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Date of Birth"
                      value={formatDate(beneficiaryDetails.birth_date)}
                      field="birth_date"
                      section="beneficiary"
                      type="date"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Place of Birth"
                      value={beneficiaryDetails.place_of_birth}
                      field="place_of_birth"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <EditableField 
                      label="Sex"
                      value={beneficiaryDetails.sex?.charAt(0).toUpperCase() + beneficiaryDetails.sex?.slice(1)}
                      field="sex"
                      section="beneficiary"
                      type="select"
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' }
                      ]}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <EditableField 
                      label="Civil Status"
                      value={beneficiaryDetails.civil_status?.charAt(0).toUpperCase() + beneficiaryDetails.civil_status?.slice(1)}
                      field="civil_status"
                      section="beneficiary"
                      type="select"
                      options={[
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' },
                        { value: 'widowed', label: 'Widowed' },
                        { value: 'separated', label: 'Separated' }
                      ]}
                    />
                  </Grid>
                  {beneficiaryDetails.civil_status === 'married' && (
                    <Grid item xs={12}>
                      <EditableField 
                        label="Spouse Name"
                        value={beneficiaryDetails.name_of_spouse}
                        field="name_of_spouse"
                        section="beneficiary"
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Education"
                      value={beneficiaryDetails.highest_education}
                      field="highest_education"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Religion"
                      value={beneficiaryDetails.religion}
                      field="religion"
                      section="beneficiary"
                    />
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Contact Information" icon={Phone}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Phone Number"
                      value={userInfo.phone_number}
                      field="phone_number"
                      section="user"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Contact Number"
                      value={beneficiaryDetails.contact_number}
                      field="contact_number"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Emergency Contact"
                      value={beneficiaryDetails.emergency_contact_number}
                      field="emergency_contact_number"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Email"
                      value={userInfo.email}
                      field="email"
                      section="user"
                      type="email"
                    />
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Address */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Address Information" icon={MapPin}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Barangay"
                      value={beneficiaryDetails.barangay}
                      field="barangay"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Municipality"
                      value={beneficiaryDetails.municipality}
                      field="municipality"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Province"
                      value={beneficiaryDetails.province}
                      field="province"
                      section="beneficiary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <EditableField 
                      label="Region"
                      value={beneficiaryDetails.region}
                      field="region"
                      section="beneficiary"
                    />
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Status & Memberships */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Status & Memberships" icon={UserCheck}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight="600">
                      PWD
                    </Typography>
                    <Chip 
                      label={beneficiaryDetails.is_pwd ? 'Yes' : 'No'}
                      size="small"
                      color={beneficiaryDetails.is_pwd ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight="600">
                      HH Head
                    </Typography>
                    <Chip 
                      label={beneficiaryDetails.is_household_head ? 'Yes' : 'No'}
                      size="small"
                      color={beneficiaryDetails.is_household_head ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight="600">
                      Has Gov ID
                    </Typography>
                    <Chip 
                      label={beneficiaryDetails.has_government_id === 'yes' ? 'Yes' : 'No'}
                      size="small"
                      color={beneficiaryDetails.has_government_id === 'yes' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Grid>
                  {beneficiaryDetails.has_government_id === 'yes' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                          ID Type
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {beneficiaryDetails.gov_id_type || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                          ID Number
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {beneficiaryDetails.gov_id_number || 'Not specified'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5} fontWeight="600">
                      Association Member
                    </Typography>
                    <Chip 
                      label={beneficiaryDetails.is_association_member === 'yes' ? 'Yes' : 'No'}
                      size="small"
                      color={beneficiaryDetails.is_association_member === 'yes' ? 'success' : 'default'}
                      variant="outlined"
                    />
                    {beneficiaryDetails.is_association_member === 'yes' && beneficiaryDetails.association_name && (
                      <Typography variant="body2" color="text.primary" mt={1}>
                        <strong>Association:</strong> {beneficiaryDetails.association_name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Enrollment Details */}
            <Grid item xs={12} md={6}>
              <SectionCard title="Enrollment Details" icon={FileText}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      Enrollment Year
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {interviewData.enrollment_year || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      Application Date
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {formatDate(interviewData.created_at) || 'Not available'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      Interview Verified
                    </Typography>
                    <Typography variant="body2" color={interviewData.interview_completed_at ? 'success.main' : 'text.secondary'} fontWeight={interviewData.interview_completed_at ? 600 : 400}>
                      {formatDateTime(interviewData.interview_completed_at) || 'Not yet verified'}
                    </Typography>
                  </Grid>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Farm Profile */}
            <Grid item xs={12}>
              <SectionCard title="Farm Profile & Parcels" icon={Sprout}>
                <Grid container spacing={2} mb={2.5}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      Livelihood Category
                    </Typography>
                    <Chip 
                      label={livelihoodInfo.label}
                      size="small"
                      color={livelihoodInfo.color}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      Total Parcels
                    </Typography>
                    <Chip 
                      label={farmParcels.length}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" color="text.secondary" fontWeight="600" display="block" mb={0.5}>
                      Total Farm Area
                    </Typography>
                    <Chip 
                      label={`${farmParcels.reduce((sum, p) => sum + parseFloat(p.total_farm_area || 0), 0).toFixed(2)} ha`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                {(livelihoodCategoryId === 2 || livelihoodCategoryId === 4) ? (
                  <Alert 
                    severity="info" 
                    icon={<AlertCircle size={18} />}
                  >
                    {livelihoodInfo.label}s typically do not register farm parcels.
                  </Alert>
                ) : farmParcels.length === 0 ? (
                  <Alert 
                    severity="info" 
                    icon={<AlertCircle size={18} />}
                  >
                    No farm parcels registered.
                  </Alert>
                ) : (
                  <Stack spacing={3}>
                    {farmParcels.map((parcel, index) => (
                      <Box 
                        key={parcel.id || index}
                        sx={{ 
                          p: 3, 
                          bgcolor: '#ffffff', 
                          borderRadius: 2,
                          border: '2px solid #e5e7eb',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6" fontWeight="600" color="text.primary">
                              Parcel #{parcel.parcel_number || index + 1}
                            </Typography>
                            <Chip 
                              label={`${parcel.total_farm_area || 0} ha`} 
                              size="small"
                              color="success"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {parcel.barangay || 'Location not specified'}
                          </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Ownership Information */}
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="600" color="text.primary" mb={1.5}>
                            Ownership Details
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Tenure Type
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {parcel.tenure_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Ownership Document Type
                              </Typography>
                              <Typography variant="body2" color="text.primary">
                                {parcel.ownership_document_type?.replace(/_/g, ' ').toUpperCase() || 'Not specified'}
                              </Typography>
                            </Grid>
                            {parcel.ownership_document_number && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                  Document Number
                                </Typography>
                                <Typography variant="body2" color="text.primary">
                                  {parcel.ownership_document_number}
                                </Typography>
                              </Grid>
                            )}
                            {parcel.landowner_name && (
                              <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                  Landowner Name
                                </Typography>
                                <Typography variant="body2" color="text.primary">
                                  {parcel.landowner_name}
                                </Typography>
                              </Grid>
                            )}
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Agrarian Reform Beneficiary
                              </Typography>
                              <Chip 
                                label={parcel.is_agrarian_reform_beneficiary ? 'Yes' : 'No'}
                                size="small"
                                color={parcel.is_agrarian_reform_beneficiary ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                                Ancestral Domain
                              </Typography>
                              <Chip 
                                label={parcel.is_ancestral_domain ? 'Yes' : 'No'}
                                size="small"
                                color={parcel.is_ancestral_domain ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Commodities/Crops Information */}
                        {parcel.parcel_commodities && parcel.parcel_commodities.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600" color="text.primary" mb={1.5}>
                              Commodities/Livestock
                            </Typography>
                            <Stack spacing={2}>
                              {parcel.parcel_commodities.map((commodity, idx) => (
                                <Box 
                                  key={commodity.id || idx}
                                  sx={{ 
                                    p: 2, 
                                    bgcolor: '#f9fafb', 
                                    borderRadius: 1.5,
                                    border: '1px solid #e5e7eb'
                                  }}
                                >
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                      <Typography variant="body2" fontWeight="600" color="text.primary">
                                        {commodity.commodity?.commodity_name || 'Unknown Commodity'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {commodity.farm_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Type not specified'}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Area
                                      </Typography>
                                      <Typography variant="body2" color="text.primary">
                                        {commodity.size_hectares || 0} ha
                                      </Typography>
                                    </Grid>
                                    {commodity.number_of_heads && (
                                      <Grid item xs={6} sm={3}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          No. of Heads
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                          {commodity.number_of_heads}
                                        </Typography>
                                      </Grid>
                                    )}
                                    <Grid item xs={6} sm={2}>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Organic
                                      </Typography>
                                      <Chip 
                                        label={commodity.is_organic_practitioner ? 'Yes' : 'No'}
                                        size="small"
                                        color={commodity.is_organic_practitioner ? 'success' : 'default'}
                                        variant="outlined"
                                      />
                                    </Grid>
                                    {commodity.remarks && (
                                      <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                          Remarks
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" fontStyle="italic">
                                          {commodity.remarks}
                                        </Typography>
                                      </Grid>
                                    )}
                                  </Grid>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {parcel.remarks && (
                          <Box mt={2}>
                            <Alert severity="info" icon={<AlertCircle size={18} />}>
                              <Typography variant="body2">
                                <strong>Parcel Remarks:</strong> {parcel.remarks}
                              </Typography>
                            </Alert>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </DialogContent>
        
        {/* Actions */}
        <Divider />
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between', bgcolor: '#ffffff' }}>
          <Box display="flex" gap={1}>
            <Button 
              onClick={onClose} 
              variant="outlined"
              color="inherit"
              disabled={isCompleting || isRejecting || isSaving}
            >
              Close
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Printer size={18} />}
              onClick={handlePrintForm}
              color="inherit"
              disabled={isCompleting || isRejecting || isSaving}
            >
              Print Form
            </Button>
          </Box>
          
          <Box display="flex" gap={1}>
            {isEditMode && (
              <Button
                variant="contained"
                startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
                onClick={handleSaveChanges}
                color="success"
                disabled={isSaving || isCompleting || isRejecting}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            
            {!isEditMode && canReject && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<XCircle size={18} />}
                onClick={handleRejectClick}
                disabled={isCompleting || isRejecting || isSaving}
              >
                Reject Application
              </Button>
            )}
            
            {!isEditMode && !isInterviewCompleted && (
              <Button
                variant="contained"
                color="success"
                startIcon={isCompleting ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={18} />}
                onClick={handleCompleteInterview}
                disabled={isCompleting || isRejecting || isSaving}
              >
                {isCompleting ? 'Verifying...' : 'Verify Interview'}
              </Button>
            )}
            
            {!isEditMode && isInterviewCompleted && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Shield size={18} />}
                disabled
              >
                Interview Verified
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={handleRejectCancel}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <XCircle size={24} style={{ color: '#d32f2f' }} />
            <Typography variant="h6" fontWeight="600">
              Reject Application
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Are you sure you want to reject this application? This action cannot be undone.
          </Alert>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason (Optional)"
            placeholder="Provide a reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleRejectCancel}
            variant="outlined"
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            startIcon={isRejecting ? <CircularProgress size={16} color="inherit" /> : <XCircle size={18} />}
            disabled={isRejecting}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </DialogActions>
      </Dialog>

      <PrintableRSBSAForm
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        interviewData={interviewData}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

InterviewDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  interviewData: PropTypes.object,
  onCompleteInterview: PropTypes.func.isRequired,
  onRejectApplication: PropTypes.func,
  onUpdateBeneficiaryData: PropTypes.func,
  user: PropTypes.object,
  onRefresh: PropTypes.func
};

InterviewDetailsModal.defaultProps = {
  interviewData: null,
  onRejectApplication: null,
  onUpdateBeneficiaryData: null,
  user: null,
  onRefresh: null
};

export default InterviewDetailsModal;
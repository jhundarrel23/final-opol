/* eslint-disable no-unused-vars */
/* eslint-disable no-unsafe-optional-chaining */
import React, { useState } from 'react';
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
  Paper,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Stack,
  Tooltip,
  Fade,
  Container
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Agriculture as AgricultureIcon,
  CheckCircle as CheckCircleIcon,
  ContactPhone as ContactPhoneIcon,
  AccountBox as AccountBoxIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Verified as VerifiedIcon,
  Work as WorkIcon,
  Landscape as LandscapeIcon,
  PersonOutline as PersonOutlineIcon
} from '@mui/icons-material';

// ==================== CONSTANTS ====================
const STATUS_CONFIG = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'PENDING' },
  approved: { bg: '#D1FAE5', text: '#065F46', label: 'APPROVED' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'REJECTED' },
  cancelled: { bg: '#F3F4F6', text: '#374151', label: 'CANCELLED' },
  for_interview: { bg: '#DBEAFE', text: '#1E3A8A', label: 'FOR INTERVIEW' }
};

const ENROLLMENT_TYPES = {
  new: { bg: '#EFF6FF', text: '#1E3A8A', label: 'NEW' },
  renewal: { bg: '#D1FAE5', text: '#065F46', label: 'RENEWAL' },
  update: { bg: '#FEF3C7', text: '#92400E', label: 'UPDATE' }
};

const LIVELIHOOD_CATEGORIES = {
  1: { label: 'Farmer', bg: '#DCFCE7', text: '#14532D' },
  2: { label: 'Farm Worker', bg: '#DBEAFE', text: '#1E3A8A' },
  3: { label: 'Fisherfolk', bg: '#CFFAFE', text: '#164E63' },
  4: { label: 'Agri-Youth', bg: '#FEF3C7', text: '#92400E' }
};

// ==================== UTILITY FUNCTIONS ====================
const formatDate = (dateString) => {
  if (!dateString) return 'Not provided';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'Not verified';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy - hh:mm a');
  } catch (error) {
    return 'Invalid date';
  }
};

const getFullName = (user) => {
  if (!user) return 'Name not available';
  const parts = [user.fname, user.mname, user.lname, user.extension_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Name not available';
};

const getInitials = (user) => {
  if (!user) return '??';
  return `${user.fname?.[0] || '?'}${user.lname?.[0] || '?'}`;
};

// ==================== REUSABLE COMPONENTS ====================
const SectionCard = ({ title, icon: IconComponent, children, chipCount }) => (
  <Card sx={{ height: '100%', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconComponent sx={{ fontSize: 22, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.05rem' }}>
            {title}
          </Typography>
        </Box>
        {chipCount !== undefined && (
          <Chip 
            label={`${chipCount}`}
            size="small" 
            sx={{ 
              bgcolor: 'primary.50',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </CardContent>
  </Card>
);

const DetailRow = ({ label, value, highlight = false }) => (
  <Box mb={2}>
    <Typography 
      variant="caption" 
      sx={{ 
        fontSize: '0.75rem', 
        color: 'text.secondary',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        mb: 0.5,
        display: 'block'
      }}
    >
      {label}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        fontSize: highlight ? '0.95rem' : '0.875rem',
        fontWeight: highlight ? 600 : 400,
        color: highlight ? 'primary.main' : 'text.primary'
      }}
    >
      {value || 'Not provided'}
    </Typography>
  </Box>
);

const StatusChip = ({ config, label }) => (
  <Chip
    label={label}
    size="small"
    sx={{
      backgroundColor: config.bg,
      color: config.text,
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 22,
      '& .MuiChip-label': { px: 1.5 }
    }}
  />
);

const CommodityItem = ({ commodity }) => (
  <Box 
    sx={{ 
      p: 1.5, 
      mb: 1.5,
      bgcolor: 'grey.50',
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'grey.200'
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
        {commodity.commodity?.commodity_name || 'Unknown'}
      </Typography>
      <Chip 
        label={`${commodity.size_hectares || 0} ha`}
        size="small"
        sx={{ 
          height: 20, 
          fontSize: '0.65rem',
          bgcolor: 'primary.50',
          color: 'primary.main'
        }}
      />
    </Box>
    <Stack direction="row" spacing={0.5}>
      <Chip 
        label={commodity.farm_type?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
        size="small"
        variant="outlined"
        sx={{ height: 18, fontSize: '0.6rem' }}
      />
      {commodity.is_organic_practitioner && (
        <Chip 
          label="ORGANIC"
          size="small"
          sx={{ 
            height: 18, 
            fontSize: '0.6rem',
            bgcolor: '#DCFCE7',
            color: '#14532D'
          }}
        />
      )}
    </Stack>
  </Box>
);

// ==================== MAIN COMPONENT ====================
const InterviewDetailsModal = ({
  open,
  onClose,
  interviewData,
  onCompleteInterview,
  user,
  onRefresh
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCompleteInterview = async () => {
    if (!interviewData?.id) {
      setSnackbar({ open: true, message: 'Interview ID not available', severity: 'error' });
      return;
    }

    setIsCompleting(true);
    try {
      const result = await onCompleteInterview(interviewData.id);
      
      if (result?.success) {
        setSnackbar({ open: true, message: result.message || 'Interview verified successfully!', severity: 'success' });
        setTimeout(() => {
          onClose();
          onRefresh?.();
        }, 1500);
      } else {
        throw new Error(result?.message || 'Failed to verify interview');
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'An unexpected error occurred', severity: 'error' });
    } finally {
      setIsCompleting(false);
    }
  };

  if (!interviewData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm">
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error">Interview data not available. Please try refreshing the page.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const userInfo = interviewData.user || {};
  const beneficiaryDetails = interviewData.beneficiary_detail || {};
  const farmProfile = interviewData.farm_profile || {};
  const farmParcels = farmProfile.farm_parcels || [];
  const isInterviewCompleted = !!interviewData.interview_completed_at;
  const interviewedBy = interviewData.interviewed_by_user || null;

  const applicationStatus = STATUS_CONFIG[interviewData.application_status] || STATUS_CONFIG.cancelled;
  const enrollmentType = ENROLLMENT_TYPES[interviewData.enrollment_type] || ENROLLMENT_TYPES.new;
  const livelihoodCategory = LIVELIHOOD_CATEGORIES[farmProfile.livelihood_category_id] || null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            height: '90vh',
            maxHeight: '90vh',
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
        TransitionComponent={Fade}
      >
        {/* Header */}
        <DialogTitle sx={{ 
          px: 4, 
          py: 3, 
          background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
          color: 'white'
        }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1.35rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {getInitials(userInfo)}
            </Avatar>
            
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                {getFullName(userInfo)}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, mb: 1.5, fontFamily: 'monospace', fontWeight: 500 }}>
                {interviewData.application_reference_code || 'No reference code'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <StatusChip config={enrollmentType} label={enrollmentType.label} />
                {livelihoodCategory && (
                  <StatusChip config={livelihoodCategory} label={livelihoodCategory.label} />
                )}
                <Chip
                  label={isInterviewCompleted ? 'VERIFIED' : 'PENDING'}
                  size="small"
                  sx={{ 
                    bgcolor: isInterviewCompleted ? '#059669' : '#f59e0b',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22
                  }}
                />
              </Stack>
            </Box>
            
            <Tooltip title="Close">
              <Button
                onClick={onClose}
                sx={{ 
                  color: 'white',
                  minWidth: 'auto',
                  p: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                }}
              >
                <CloseIcon />
              </Button>
            </Tooltip>
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 0, bgcolor: '#f9fafb', overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={3}>
              
              {/* Row 1: Enrollment Details & Interview Status */}
              <Grid item xs={12} md={6}>
                <SectionCard title="Enrollment Details" icon={AssignmentIcon}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <DetailRow 
                        label="Reference Code"
                        value={interviewData.application_reference_code}
                        highlight
                      />
                      <DetailRow 
                        label="RSBSA Number"
                        value={beneficiaryDetails.system_generated_rsbsa_number}
                      />
                      <DetailRow 
                        label="Enrollment Year"
                        value={interviewData.enrollment_year}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Box mb={2}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.75rem', 
                            color: 'text.secondary',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 0.5,
                            display: 'block'
                          }}
                        >
                          Application Status
                        </Typography>
                        <StatusChip config={applicationStatus} label={applicationStatus.label} />
                      </Box>
                      <Box mb={2}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.75rem', 
                            color: 'text.secondary',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 0.5,
                            display: 'block'
                          }}
                        >
                          Livelihood Type
                        </Typography>
                        {livelihoodCategory ? (
                          <StatusChip config={livelihoodCategory} label={livelihoodCategory.label} />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            Not specified
                          </Typography>
                        )}
                      </Box>
                      <DetailRow 
                        label="Applied On"
                        value={formatDate(interviewData.created_at)}
                      />
                    </Grid>
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <SectionCard title="Interview Information" icon={VerifiedIcon}>
                  <Box mb={2}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 0.5,
                        display: 'block'
                      }}
                    >
                      Verification Status
                    </Typography>
                    <Chip
                      label={isInterviewCompleted ? 'INTERVIEW COMPLETED' : 'PENDING VERIFICATION'}
                      size="small"
                      sx={{
                        bgcolor: isInterviewCompleted ? '#D1FAE5' : '#FEF3C7',
                        color: isInterviewCompleted ? '#065F46' : '#92400E',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22
                      }}
                    />
                  </Box>
                  
                  <DetailRow 
                    label="Verified At"
                    value={formatDateTime(interviewData.interview_completed_at)}
                  />
                  
                  {interviewedBy && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: '0.75rem', 
                            color: 'text.secondary',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 1,
                            display: 'block'
                          }}
                        >
                          Interviewed By
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.100', color: 'primary.main' }}>
                            <PersonOutlineIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                              {getFullName(interviewedBy)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {interviewedBy.email || 'No email available'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </>
                  )}
                </SectionCard>
              </Grid>

              {/* Row 2: Personal Information & Contact */}
              <Grid item xs={12} md={6}>
                <SectionCard title="Personal Information" icon={PersonIcon}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <DetailRow label="Date of Birth" value={formatDate(beneficiaryDetails.birth_date)} />
                      <DetailRow label="Place of Birth" value={beneficiaryDetails.place_of_birth} />
                      <DetailRow 
                        label="Sex" 
                        value={beneficiaryDetails.sex?.charAt(0).toUpperCase() + beneficiaryDetails.sex?.slice(1)} 
                      />
                      <DetailRow 
                        label="Civil Status" 
                        value={beneficiaryDetails.civil_status?.charAt(0).toUpperCase() + beneficiaryDetails.civil_status?.slice(1)} 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DetailRow label="Religion" value={beneficiaryDetails.religion} />
                      <DetailRow label="Highest Education" value={beneficiaryDetails.highest_education} />
                      <DetailRow label="Mother's Maiden Name" value={beneficiaryDetails.mothers_maiden_name} />
                      {beneficiaryDetails.name_of_spouse && (
                        <DetailRow label="Spouse Name" value={beneficiaryDetails.name_of_spouse} />
                      )}
                    </Grid>
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <SectionCard title="Contact Information" icon={PhoneIcon}>
                  <DetailRow label="Phone Number" value={userInfo.phone_number} />
                  <DetailRow label="Contact Number" value={beneficiaryDetails.contact_number} />
                  <DetailRow label="Emergency Contact" value={beneficiaryDetails.emergency_contact_number} />
                  <DetailRow label="Email Address" value={userInfo.email} />
                  
                  <Divider sx={{ my: 2.5 }} />
                  
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.75rem', 
                        color: 'text.secondary',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        mb: 1.5,
                        display: 'block'
                      }}
                    >
                      Status Indicators
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip 
                        label={`PWD: ${beneficiaryDetails.is_pwd ? 'Yes' : 'No'}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                      <Chip 
                        label={`Household Head: ${beneficiaryDetails.is_household_head ? 'Yes' : 'No'}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                      <Chip 
                        label={`Gov ID: ${beneficiaryDetails.has_government_id === 'yes' ? 'Yes' : 'No'}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    </Stack>
                  </Box>
                </SectionCard>
              </Grid>

              {/* Row 3: Address */}
              <Grid item xs={12}>
                <SectionCard title="Address Information" icon={LocationIcon}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3}>
                      <DetailRow label="Region" value={beneficiaryDetails.region} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <DetailRow label="Province" value={beneficiaryDetails.province} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <DetailRow label="Municipality" value={beneficiaryDetails.municipality} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <DetailRow label="Barangay" value={beneficiaryDetails.barangay} />
                    </Grid>
                  </Grid>
                </SectionCard>
              </Grid>

              {/* Row 4: Farm Profile */}
              <Grid item xs={12}>
                <SectionCard 
                  title="Farm Profile" 
                  icon={AgricultureIcon}
                  chipCount={farmParcels.length}
                >
                  {farmParcels.length === 0 ? (
                    <Alert severity="info" icon={<AgricultureIcon />}>
                      No farm parcels registered.
                      {livelihoodCategory && (livelihoodCategory.label === 'Farm Worker' || livelihoodCategory.label === 'Agri-Youth') && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {livelihoodCategory.label}s typically work on others' farms and may not own parcels.
                        </Typography>
                      )}
                    </Alert>
                  ) : (
                    <Grid container spacing={3}>
                      {farmParcels.map((parcel, index) => (
                        <Grid item xs={12} md={6} key={parcel.id || index}>
                          <Paper sx={{ 
                            p: 2.5, 
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 2,
                            bgcolor: 'white'
                          }}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                              <LandscapeIcon color="primary" sx={{ fontSize: 20 }} />
                              <Typography variant="subtitle1" fontWeight={600}>
                                Parcel {index + 1}
                              </Typography>
                              <Chip 
                                label={`${parcel.total_farm_area || 0} ha`}
                                size="small"
                                sx={{ 
                                  bgcolor: 'primary.50',
                                  color: 'primary.main',
                                  fontWeight: 600
                                }}
                              />
                            </Box>

                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <DetailRow label="Location" value={parcel.barangay} />
                                <DetailRow 
                                  label="Tenure" 
                                  value={parcel.tenure_type?.replace(/_/g, ' ').toUpperCase()} 
                                />
                                {parcel.landowner_name && (
                                  <DetailRow label="Landowner" value={parcel.landowner_name} />
                                )}
                              </Grid>

                              <Grid item xs={6}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontSize: '0.75rem', 
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    mb: 1.5,
                                    display: 'block'
                                  }}
                                >
                                  Commodities ({parcel.parcel_commodities?.length || 0})
                                </Typography>
                                {parcel.parcel_commodities && parcel.parcel_commodities.length > 0 ? (
                                  <Box>
                                    {parcel.parcel_commodities.map((commodity, idx) => (
                                      <CommodityItem key={commodity.id || idx} commodity={commodity} />
                                    ))}
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No commodities registered
                                  </Typography>
                                )}
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </SectionCard>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ 
          px: 4, 
          py: 2.5, 
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'white'
        }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Close
          </Button>
          
          {!isInterviewCompleted ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={isCompleting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
              onClick={handleCompleteInterview}
              disabled={isCompleting}
              sx={{ minWidth: 200, fontWeight: 600 }}
            >
              {isCompleting ? 'Verifying...' : 'Verify Interview'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<VerifiedIcon />}
              disabled
              sx={{ minWidth: 200, fontWeight: 600 }}
            >
              Interview Verified
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
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
  user: PropTypes.object,
  onRefresh: PropTypes.func
};

export default InterviewDetailsModal;
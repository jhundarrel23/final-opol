/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable react/jsx-no-undef */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fade,
  Snackbar,
  Alert,
  useTheme,
  alpha,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Landscape as LandscapeIcon,
  Assessment as AssessmentIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Star as StarIcon,
  CloudUpload as CloudUploadIcon,
  Assignment as AssignmentIcon,
  LocalShipping as LocalShippingIcon,
  Celebration as CelebrationIcon,
  Cancel as CancelIcon,
  Replay as ReplayIcon
} from '@mui/icons-material';
import axiosInstance from '../../../api/axiosInstance';

// Hooks
import { useRSBSAForm } from './useRSBSAForm';
import useBeneficiaryData from '../../../hooks-auth/hooks-auth-beneficiary/useBeneficiaryData';

// Sections
import BeneficiaryProfileSection from './sections/BeneficiaryProfileSection';
import FarmProfileSection from './sections/FarmProfileSection';
import FarmParcelsSection from './sections/FarmParcelsSection';
import ReviewSection from './sections/ReviewSection';
import SubmissionSection from './sections/SubmissionSection';

// Brand gradient (matches TopBar: green -> teal -> blue)
const brandGradient = 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #2563eb 100%)';

// Status normalization
const normalizeStatus = (statusMessage, explicitStatus) => {
  const s = String(explicitStatus || statusMessage || '').toLowerCase();
  if (!s) return 'info';
  if (/(^|\W)approved(\W|$)/.test(s)) return 'approved';
  if (/(^|\W)rejected|denied|declined(\W|$)/.test(s)) return 'rejected';
  if (/(^|\W)cancelled|canceled|void(\W|$)/.test(s)) return 'cancelled';
  if (/(^|\W)pending|review|processing|queued(\W|$)/.test(s)) return 'pending';
  return 'info';
};

// Helper to check if farm parcels are required based on livelihood category
const requiresFarmParcels = (livelihoodCategoryId) => {
  // Category IDs: 1=Farmer, 2=Farm Worker, 3=Fisherfolk, 4=Agri-Youth
  // Farm Worker (2) and Agri-Youth (4) don't require parcels
  const noParcelCategories = [2, 4];
  return !noParcelCategories.includes(Number(livelihoodCategoryId));
};

const RSBSAForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Auth user
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    storedUser = {};
  }
  const userId = storedUser?.id ?? storedUser?.user_id ?? null;

  const { beneficiaryId: hookBeneficiaryId, getBeneficiaryId } = useBeneficiaryData();
  const effectiveBeneficiaryId = hookBeneficiaryId ||
    (getBeneficiaryId ? getBeneficiaryId() : null) || userId;

  // Main form hook
  const {
    formData,
    errors,
    backendErrors,
    isSubmitting,
    isSavingDraft,
    currentStep,
    totalSteps,
    submissionResult,
    updateField,
    addFarmParcel,
    updateFarmParcel,
    removeFarmParcel,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    saveDraft,
    resetForm,
    loadExistingEnrollment,
    formProgress,
    canSubmit
  } = useRSBSAForm();

  // Application status
  const [applicationStatus, setApplicationStatus] = useState({
    isCheckingStatus: true,
    hasActiveEnrollment: false,
    status: null,
    statusMessage: '',
    reference_number: null,
    enrollment_id: null // Added to store enrollment ID for cancellation
  });
  const [shouldHideForm, setShouldHideForm] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Notifications
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });
  const openSnack = (severity, message) => setSnack({ open: true, severity, message });

  const steps = useMemo(() => ([
    {
      label: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Basic personal details',
      shortLabel: 'Personal'
    },
    {
      label: 'Farm Profile',
      icon: <AgricultureIcon />,
      description: 'Farm and agricultural details',
      shortLabel: 'Farm'
    },
    {
      label: 'Land Parcels',
      icon: <LandscapeIcon />,
      description: 'Land ownership information',
      shortLabel: 'Parcels'
    },
    {
      label: 'Review Application',
      icon: <AssessmentIcon />,
      description: 'Review all information',
      shortLabel: 'Review'
    },
    {
      label: 'Submit',
      icon: <SendIcon />,
      description: 'Complete your application',
      shortLabel: 'Submit'
    }
  ]), []);

  const currentStepIndex = Math.max(0, Math.min(steps.length - 1, (Number(currentStep) || 1) - 1));
  const currentStepInfo = steps[currentStepIndex] || steps[0];

  // Get livelihood category name for display
  const getLivelihoodCategoryName = useCallback(() => {
    const categoryId = formData?.farmProfile?.livelihood_category_id;
    const categoryNames = {
      1: 'Farmer',
      2: 'Farm Worker',
      3: 'Fisherfolk',
      4: 'Agri-Youth'
    };
    return categoryNames[categoryId] || '';
  }, [formData?.farmProfile?.livelihood_category_id]);

  // Smart navigation that skips parcels for farm workers and agri youth
  const handleNextStep = useCallback(() => {
    const livelihoodCategoryId = formData?.farmProfile?.livelihood_category_id;
    const currentStepNum = Number(currentStep);
    
    // If on step 2 (Farm Profile) and user is farm worker/agri youth, skip to step 4 (Review)
    if (currentStepNum === 2 && !requiresFarmParcels(livelihoodCategoryId)) {
      goToStep(4);
    } else {
      nextStep();
    }
  }, [formData?.farmProfile?.livelihood_category_id, currentStep, goToStep, nextStep]);

  const handlePrevStep = useCallback(() => {
    const livelihoodCategoryId = formData?.farmProfile?.livelihood_category_id;
    const currentStepNum = Number(currentStep);
    
    // If on step 4 (Review) and user is farm worker/agri youth, go back to step 2 (Farm Profile)
    if (currentStepNum === 4 && !requiresFarmParcels(livelihoodCategoryId)) {
      goToStep(2);
    } else {
      prevStep();
    }
  }, [formData?.farmProfile?.livelihood_category_id, currentStep, goToStep, prevStep]);

  // Check application status
  const checkApplicationStatus = useCallback(async (uid) => {
    if (!uid) {
      setApplicationStatus(prev => ({ ...prev, isCheckingStatus: false }));
      return;
    }

    setApplicationStatus(prev => ({ ...prev, isCheckingStatus: true }));

    try {
      const res = await axiosInstance.get(`api/rsbsa/enrollments/user/${uid}/application_status`);
      const data = res.data || {};

      if (data.success) {
        const status = data.status ?? null;
        const message = data.message ?? '';
        const hasActive = !!data.has_active_enrollment;
        const reference_number = data.reference_number ?? null;

        // Also get enrollment ID for cancellation
        let enrollment_id = null;
        if (hasActive || status) {
          try {
            const enrollmentRes = await axiosInstance.get(`api/rsbsa/enrollments/user/${uid}`);
            if (enrollmentRes.data.success && enrollmentRes.data.data?.id) {
              enrollment_id = enrollmentRes.data.data.id;
            }
          } catch (err) {
            console.error('Error fetching enrollment ID:', err);
          }
        }

        setApplicationStatus({
          isCheckingStatus: false,
          hasActiveEnrollment: hasActive,
          status,
          statusMessage: message,
          reference_number,
          enrollment_id
        });

        setShouldHideForm(!!status || hasActive);
      } else {
        setApplicationStatus(prev => ({ ...prev, isCheckingStatus: false }));
      }
    } catch (error) {
      setApplicationStatus(prev => ({ ...prev, isCheckingStatus: false }));
      openSnack('error', 'Unable to check application status. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (userId && typeof loadExistingEnrollment === 'function') {
      loadExistingEnrollment(userId);
    }
    checkApplicationStatus(userId);
  }, [userId, loadExistingEnrollment, checkApplicationStatus]);

  const handleSubmit = async () => {
    try {
      const result = await submitForm(userId);
      if (result?.success) {
        const ref = result?.data?.enrollment?.application_reference_code || 
                   result?.data?.application_reference_code ||
                   result?.enrollment?.application_reference_code ||
                   null;
        
        if (ref) {
          setApplicationStatus(prev => ({ ...prev, reference_number: ref }));
          openSnack('success', `Application submitted successfully! Reference: ${ref}`);
        } else {
          openSnack('success', 'Application submitted successfully! Redirecting to next steps...');
        }
        
        setTimeout(() => checkApplicationStatus(userId), 1200);
      } else {
        openSnack('error', result?.error || 'Submission failed. Please check your information and try again.');
      }
      return result;
    } catch (error) {
      openSnack('error', 'An unexpected error occurred. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const handleSaveDraft = async () => {
    try {
      const result = await saveDraft(userId);
      if (result?.success) {
        openSnack('success', 'Your progress has been saved successfully.');
      } else {
        openSnack('error', 'Unable to save progress. Please try again.');
      }
      return result;
    } catch (error) {
      openSnack('error', 'Error saving progress. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const handleReset = () => {
    resetForm();
    setShowResetDialog(false);
    openSnack('info', 'Form has been reset.');
  };

  const handleViewDistribution = () => {
    navigate('/beneficiary/upcoming-distribution');
  };

  // Handle Reapply - Reset form and allow new submission
  const handleReapply = () => {
    resetForm();
    setShouldHideForm(false);
    setApplicationStatus({
      isCheckingStatus: false,
      hasActiveEnrollment: false,
      status: null,
      statusMessage: '',
      reference_number: null,
      enrollment_id: null
    });
    openSnack('info', 'You can now submit a new application.');
  };

  // Handle Cancel Application
  const handleCancelApplication = async () => {
    if (!applicationStatus.enrollment_id) {
      openSnack('error', 'Unable to cancel: Enrollment ID not found.');
      setShowCancelDialog(false);
      return;
    }

    setIsCancelling(true);

    try {
      const response = await axiosInstance.post(`api/rsbsa/enrollments/${applicationStatus.enrollment_id}/cancel`);
      
      if (response.data.success) {
        openSnack('success', 'Your application has been cancelled successfully.');
        setShowCancelDialog(false);
        
        // Refresh application status after 1 second
        setTimeout(() => {
          checkApplicationStatus(userId);
        }, 1000);
      } else {
        openSnack('error', response.data.message || 'Failed to cancel application.');
      }
    } catch (error) {
      console.error('Error cancelling application:', error);
      openSnack('error', error.response?.data?.message || 'An error occurred while cancelling your application.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading screen
  if (applicationStatus.isCheckingStatus) {
    return (
      <>
        <Helmet><title>RSBSA Enrollment - Checking Status</title></Helmet>
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
          >
            <CircularProgress size={64} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h5" fontWeight="600" color="primary" gutterBottom>
              Checking Application Status
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we verify your enrollment information...
            </Typography>
          </Paper>
        </Container>
      </>
    );
  }

  // Status screen
  if (shouldHideForm) {
    const kind = normalizeStatus(applicationStatus.statusMessage, applicationStatus.status);

    const statusConfig = {
      pending: {
        color: '#2563eb',
        bgGradient: brandGradient,
        title: 'Proceed to the Municipal Agriculture Office',
        subtitle: 'Bring your requirements for interview and verification',
        message: 'Visit the Municipal Agriculture Office during business hours.',
        icon: <ScheduleIcon sx={{ fontSize: 64, color: '#2563eb' }} />,
        requirements: [
          'Your reference number for tracking',
          'Valid government-issued ID',
          'Supporting agricultural documents',
          'Recent 2x2 ID photo (plain/white background)',
          'Proof of land ownership/tenancy (if applicable)'
        ]
      },
      approved: {
        color: '#16a34a',
        bgGradient: brandGradient,
        title: 'Congratulations!',
        subtitle: 'Your RSBSA application has been approved',
        message: 'You are now officially enrolled in the Registry System for Basic Sectors in Agriculture. Welcome to the RSBSA community!',
        icon: <CelebrationIcon sx={{ fontSize: 64, color: '#16a34a' }} />
      },
      rejected: {
        color: '#d32f2f',
        bgGradient: brandGradient,
        title: 'Application Not Approved',
        subtitle: 'Please review and resubmit',
        message: 'Contact the office for assistance and requirements.',
        icon: <BlockIcon sx={{ fontSize: 64, color: '#d32f2f' }} />,
        requirements: [
          'Your reference number for tracking',
          'Contact the Municipal Agriculture Office',
          'Review application requirements',
          'Provide additional documentation',
          'Resubmit when ready'
        ]
      },
      cancelled: {
        color: '#059669',
        bgGradient: brandGradient,
        title: 'Application Cancelled',
        subtitle: 'Application has been withdrawn',
        message: 'If this was done in error, please contact support.',
        icon: <InfoIcon sx={{ fontSize: 64, color: '#059669' }} />,
        requirements: [
          'Your reference number for tracking',
          'Contact support if needed',
          'Submit a new application',
          'Verify your information',
          'Follow proper procedures'
        ]
      },
      info: {
        color: '#2563eb',
        bgGradient: brandGradient,
        title: 'Application on Record',
        subtitle: 'Your enrollment is being processed',
        message: 'You have an existing application being processed.',
        icon: <AssignmentIcon sx={{ fontSize: 64, color: '#2563eb' }} />,
        requirements: [
          'Your reference number for tracking',
          'Check application status regularly',
          'Wait for further instructions',
          'Keep contact information updated',
          'Visit office if requested'
        ]
      }
    }[kind];

    return (
      <>
        <Helmet><title>RSBSA Enrollment - Application Status</title></Helmet>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper
            elevation={2}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: statusConfig.bgGradient,
              color: 'white',
              border: '1px solid rgba(255,255,255,0.25)'
            }}
          >
            <Box sx={{ p: 6 }}>
              <Stack spacing={4} alignItems="center" textAlign="center">
                <Box>{statusConfig.icon}</Box>

                <Stack spacing={1} alignItems="center">
                  <Typography variant="h3" fontWeight="700" sx={{ color: 'white' }}>
                    {statusConfig.title}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {statusConfig.subtitle}
                  </Typography>
                </Stack>

                {applicationStatus.reference_number && (
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '2px dashed rgba(255,255,255,0.85)',
                      backgroundColor: 'rgba(255,255,255,0.10)',
                      color: 'white'
                    }}
                  >
                    <Typography
                      variant="overline"
                      fontWeight="bold"
                      sx={{ color: 'white' }}
                    >
                      Reference Number
                    </Typography>
                    <Typography variant="h5" fontWeight="700" sx={{ letterSpacing: 2, mt: 1, color: 'white' }}>
                      {applicationStatus.reference_number}
                    </Typography>
                  </Paper>
                )}

                {kind !== 'approved' && statusConfig.requirements && (
                  <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 640, width: '100%', background: 'rgba(255,255,255,0.95)', color: 'text.primary' }}>
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      gutterBottom
                      sx={{
                        background: brandGradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      What to bring:
                    </Typography>
                    <Stack spacing={1}>
                      {statusConfig.requirements.map((req, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            size="small"
                            label={index + 1}
                            sx={{
                              minWidth: 24,
                              height: 24,
                              fontSize: '0.75rem',
                              background: brandGradient,
                              color: 'white'
                            }}
                          />
                          <Typography variant="body2">{req}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}

                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', maxWidth: 560 }}>
                  {statusConfig.message}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {kind === 'approved' ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<LocalShippingIcon />}
                      onClick={handleViewDistribution}
                      sx={{
                        minWidth: 280,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: 'white',
                        background: 'linear-gradient(135deg, #059669 0%, #16a34a 50%, #15803d 100%)',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #047857 0%, #15803d 50%, #14532d 100%)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 30px rgba(5,150,105,0.5)'
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(5,150,105,0.4)',
                        borderRadius: 3
                      }}
                    >
                      View Subsidy Programs
                    </Button>
                  ) : kind === 'rejected' ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<ReplayIcon />}
                        onClick={handleReapply}
                        sx={{
                          minWidth: 180,
                          color: 'white',
                          background: brandGradient,
                          '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #1d4ed8 100%)' }
                        }}
                      >
                        Reapply Now
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<RefreshIcon />}
                        onClick={() => checkApplicationStatus(userId)}
                        sx={{
                          minWidth: 180,
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        Refresh Status
                      </Button>
                    </>
                  ) : kind === 'pending' ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<RefreshIcon />}
                        onClick={() => checkApplicationStatus(userId)}
                        sx={{
                          minWidth: 180,
                          color: 'white',
                          background: brandGradient,
                          '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #1d4ed8 100%)' }
                        }}
                      >
                        Refresh Status
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setShowCancelDialog(true)}
                        sx={{
                          minWidth: 180,
                          color: 'white',
                          borderColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239,68,68,0.1)'
                          }
                        }}
                      >
                        Cancel Application
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<RefreshIcon />}
                      onClick={() => checkApplicationStatus(userId)}
                      sx={{
                        minWidth: 180,
                        color: 'white',
                        background: brandGradient,
                        '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #1d4ed8 100%)' }
                      }}
                    >
                      Refresh Status
                    </Button>
                  )}

                  {kind === 'approved' && (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<RefreshIcon />}
                      onClick={() => checkApplicationStatus(userId)}
                      sx={{
                        minWidth: 180,
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Refresh Status
                    </Button>
                  )}

                  {kind === 'cancelled' && (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ReplayIcon />}
                      onClick={handleReapply}
                      sx={{
                        minWidth: 180,
                        color: 'white',
                        background: brandGradient,
                        '&:hover': { background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #1d4ed8 100%)' }
                      }}
                    >
                      Submit New Application
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Container>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight="600">
              Cancel Application?
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone
            </Alert>
            <Typography>
              Are you sure you want to cancel your RSBSA enrollment application?
              You will be able to submit a new application after cancellation.
            </Typography>
            {applicationStatus.reference_number && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Reference Number
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {applicationStatus.reference_number}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Keep Application
            </Button>
            <Button
              onClick={handleCancelApplication}
              variant="contained"
              color="error"
              startIcon={isCancelling ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Login required
  if (!userId) {
    return (
      <>
        <Helmet><title>RSBSA Enrollment - Sign In Required</title></Helmet>
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)'
            }}
          >
            <SecurityIcon sx={{ fontSize: 64, color: '#f57c00', mb: 3 }} />
            <Typography variant="h4" fontWeight="700" color="#e65100" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please sign in to your account to access the RSBSA enrollment form.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                minWidth: 180,
                backgroundColor: '#f57c00',
                '&:hover': { backgroundColor: '#ef6c00' }
              }}
            >
              Sign In
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  const renderStepContent = () => {
    switch (Number(currentStep)) {
      case 1:
        return (
          <BeneficiaryProfileSection
            formData={formData?.beneficiaryDetails}
            errors={errors}
            onEdit={goToStep}
            updateField={(field, value) => updateField('beneficiaryDetails', field, value)}
          />
        );
      case 2:
        return (
          <FarmProfileSection
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        );
      case 3:
        return (
          <FarmParcelsSection
            farmParcels={formData?.farmParcels}
            errors={errors}
            addFarmParcel={addFarmParcel}
            updateFarmParcel={updateFarmParcel}
            removeFarmParcel={removeFarmParcel}
            requiresFarmData={requiresFarmParcels(formData?.farmProfile?.livelihood_category_id)}
            livelihoodCategory={getLivelihoodCategoryName()}
          />
        );
      case 4:
        return (
          <ReviewSection
            formData={formData}
            errors={errors}
            onEdit={goToStep}
          />
        );
      case 5:
        return (
          <SubmissionSection
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
            errors={errors}
            backendErrors={backendErrors}
            submissionResult={submissionResult}
            referenceNumber={applicationStatus.reference_number}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet><title>RSBSA Enrollment Application</title></Helmet>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Stack spacing={3}>
            {!shouldHideForm && applicationStatus.reference_number && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: brandGradient,
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}
              >
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
                  Reference Number
                </Typography>
                <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 1 }}>
                  {applicationStatus.reference_number}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
                  Bring your reference number, valid ID, supporting documents, and a recent 2x2 photo (plain background) to the Municipal Agriculture Office.
                </Typography>
              </Paper>
            )}

            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(22,163,74,0.08) 0%, rgba(5,150,105,0.08) 45%, rgba(37,99,235,0.08) 100%)',
                border: '1px solid',
                borderColor: alpha('#16a34a', 0.12)
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: brandGradient,
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
                          animation: 'pulse 2s infinite'
                        }
                      }}
                    >
                      {currentStepInfo.icon}
                    </Box>
                    <Box flex={1}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h4" fontWeight="700" color="#1b5e20">
                          {currentStepInfo.label}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${currentStep}/${totalSteps}`}
                          sx={{
                            background: brandGradient,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </Stack>
                      <Typography variant="body1" color="text.secondary">
                        {currentStepInfo.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Paper>

            <Paper elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 4, pb: 2 }}>
                  <Stepper
                    activeStep={currentStepIndex}
                    alternativeLabel
                    sx={{
                      '& .MuiStepLabel-root': {
                        cursor: 'pointer'
                      },
                      '& .MuiStepConnector-line': {
                        borderTopWidth: 3,
                        borderColor: alpha('#16a34a', 0.2)
                      },
                      '& .Mui-active .MuiStepConnector-line': {
                        borderColor: '#16a34a'
                      },
                      '& .Mui-completed .MuiStepConnector-line': {
                        borderColor: '#16a34a'
                      }
                    }}
                  >
                    {steps.map((step, idx) => (
                      <Step key={step.label} completed={idx < currentStepIndex}>
                        <StepLabel
                          icon={
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: idx < currentStepIndex 
                                  ? brandGradient
                                  : idx === currentStepIndex
                                    ? brandGradient
                                    : alpha('#16a34a', 0.1),
                                color: idx <= currentStepIndex ? 'white' : '#666',
                                transition: 'all 0.3s ease',
                                ...(idx === currentStepIndex && {
                                  animation: 'pulse 2s infinite',
                                  boxShadow: '0 0 20px rgba(22,163,74,0.4)'
                                })
                              }}
                            >
                              {idx < currentStepIndex ? (
                                <CheckCircleIcon />
                              ) : (
                                step.icon
                              )}
                            </Box>
                          }
                          onClick={() => goToStep(idx + 1)}
                        >
                          <Typography 
                            variant="subtitle2" 
                            fontWeight="600"
                            sx={{
                              color: idx <= currentStepIndex ? '#16a34a' : '#666',
                              ...(idx === currentStepIndex && {
                                fontWeight: 'bold'
                              })
                            }}
                          >
                            {step.shortLabel}
                          </Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>

                <Divider />

                <Fade in key={currentStep} timeout={600}>
                  <Box sx={{ p: 4, minHeight: '500px' }}>
                    {renderStepContent()}
                  </Box>
                </Fade>

                <Divider />

                <Box sx={{ p: 4, pt: 3 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    spacing={2}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveDraft}
                      disabled={isSubmitting || isSavingDraft}
                      sx={{ minWidth: 160 }}
                    >
                      {isSavingDraft ? 'Saving...' : 'Save Progress'}
                    </Button>

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<ArrowBackIcon />}
                        onClick={handlePrevStep}
                        disabled={Number(currentStep) === 1 || isSubmitting}
                        sx={{ minWidth: 120 }}
                      >
                        Back
                      </Button>

                      {Number(currentStep) < Number(totalSteps) ? (
                        <Button
                          variant="contained"
                          size="large"
                          endIcon={<ArrowForwardIcon />}
                          onClick={handleNextStep}
                          disabled={isSubmitting}
                          sx={{
                            minWidth: 140,
                            color: 'white',
                            background: brandGradient,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #1d4ed8 100%)'
                            }
                          }}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          size="large"
                          endIcon={
                            isSubmitting ?
                              <CircularProgress size={20} color="inherit" /> :
                              <CloudUploadIcon />
                          }
                          onClick={handleSubmit}
                          disabled={isSubmitting || !canSubmit}
                          sx={{
                            minWidth: 160,
                            color: 'white',
                            background: brandGradient,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #15803d 0%, #047857 50%, #1d4ed8 100%)'
                            }
                          }}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Paper>
          </Stack>
        </Fade>
      </Container>

      <Dialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            Reset Application Form?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone
          </Alert>
          <Typography>
            All your progress and entered information will be permanently lost.
            Are you sure you want to start over?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            variant="contained"
            color="error"
            startIcon={<RefreshIcon />}
          >
            Reset Form
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(prev => ({ ...prev, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>

      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(22, 163, 74, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
            }
          }
        `}
      </style>
    </>
  );
};

export default RSBSAForm;
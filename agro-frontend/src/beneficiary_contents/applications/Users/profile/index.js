import { useEffect, useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from 'src/components/Footer';
import { 
  Grid, 
  Container, 
  Typography, 
  Alert, 
  CircularProgress, 
  Box,
  Button,
  Chip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  PersonOff as PersonOffIcon
} from '@mui/icons-material';
import axiosInstance from '../../../../api/axiosInstance';

// Import existing components
import ProfileCover from './ProfileCover';
import PersonalDetails from './PersonalDetails';

function ManagementUserProfile() {
  // State management
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized user data retrieval with error handling
  const { storedUser, profileData } = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const profile = JSON.parse(
        localStorage.getItem(`personal_details_${user?.id}`) || '{}'
      );
      return { storedUser: user, profileData: profile };
    } catch (err) {
      console.error('Error parsing localStorage data:', err);
      return { storedUser: {}, profileData: {} };
    }
  }, []);

  // Memoized computed values
  const computedData = useMemo(() => {
    const fullName = [
      profileData.fname || storedUser.fname || '',
      profileData.mname ? `${profileData.mname.charAt(0)}.` : '',
      profileData.lname || storedUser.lname || '',
      profileData.extension_name || ''
    ]
      .filter((part) => part.trim())
      .join(' ')
      .trim() || 'Name not available';

    const rsbsaNumber =
      profileData.system_generated_rsbsa_number ||
      profileData.manual_rsbsa_number ||
      null;

    const location =
      profileData.municipality && profileData.province
        ? `${profileData.municipality}, ${profileData.province}`
        : storedUser.location || 'Opol, Misamis Oriental';

    return { fullName, rsbsaNumber, location };
  }, [profileData, storedUser]);

  // Enrollment status fetch with improved error handling
  const fetchEnrollmentStatus = useCallback(async (isRefresh = false) => {
    const userId = profileData?.id || storedUser?.id;
    
    if (!userId) {
      setEnrollmentStatus('not_enrolled');
      setLoadingStatus(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      }

      console.log(`Fetching enrollment status for user ID: ${userId}`);
      
      const response = await axiosInstance.get(
        `api/rsbsa/beneficiary-details/${userId}/enrollment-status`
      );

      console.log('Enrollment status response:', response.data);

      if (response.data?.success) {
        const status = response.data.data?.application_status || 'not_enrolled';
        setEnrollmentStatus(status);
        setEnrollmentData(response.data.data);
        
        if (isRefresh) {
          // Show success feedback for manual refresh
          console.log('Status refreshed successfully:', status);
        }
      } else {
        setEnrollmentStatus('not_enrolled');
        console.warn('API returned success: false');
      }
    } catch (err) {
      console.error('Error fetching enrollment status:', err);
      
      const isNotFound = err.response?.status === 404;
      const isUnauthorized = err.response?.status === 401;
      const isServerError = err.response?.status >= 500;
      
      if (isNotFound) {
        setEnrollmentStatus('not_enrolled');
      } else if (isUnauthorized) {
        setEnrollmentStatus('unauthorized');
        setError('Access denied. Please log in again.');
      } else if (isServerError) {
        setEnrollmentStatus('error');
        setError('Server error. Please try again later.');
      } else {
        setEnrollmentStatus('error');
        setError(err.response?.data?.message || 'Unable to fetch enrollment status');
      }
    } finally {
      setLoadingStatus(false);
      setRefreshing(false);
    }
  }, [profileData?.id, storedUser?.id]);

  // Initial fetch
  useEffect(() => {
    fetchEnrollmentStatus();
  }, [fetchEnrollmentStatus]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchEnrollmentStatus(true);
  };

  // Status display functions with improved handling
  const getStatusDisplay = () => {
    if (loadingStatus) return 'Loading...';
    if (refreshing) return 'Refreshing...';
    
    switch (enrollmentStatus) {
      case 'approved':
        return 'Approved - RSBSA Verified';
      case 'pending':
        return 'Pending RSBSA Verification';
      case 'not_enrolled':
        return 'Not Yet Enrolled in RSBSA';
      case 'unauthorized':
        return 'Access Denied';
      case 'error':
        return 'Status Unavailable';
      default:
        return 'Not Yet Enrolled in RSBSA';
    }
  };

  const getJobTitle = () => {
    if (loadingStatus) return 'Loading Status...';
    if (refreshing) return 'Refreshing Status...';
    
    switch (enrollmentStatus) {
      case 'approved':
        return 'Verified RSBSA Beneficiary';
      case 'pending':
        return 'Pending Verification';
      case 'not_enrolled':
        return 'Unregistered User';
      case 'unauthorized':
        return 'Access Restricted';
      case 'error':
        return 'RSBSA User';
      default:
        return 'RSBSA User';
    }
  };

  const getVerificationStatus = () => {
    if (loadingStatus) return 'Checking...';
    if (refreshing) return 'Refreshing...';
    
    switch (enrollmentStatus) {
      case 'approved':
        return 'Verified';
      case 'not_enrolled':
        return 'Not Enrolled';
      case 'pending':
        return 'Pending';
      case 'unauthorized':
        return 'Restricted';
      case 'error':
        return 'Unknown';
      default:
        return 'Unverified';
    }
  };

  // Status chip component
  const getStatusChip = () => {
    const baseProps = {
      size: "small",
      sx: { ml: 1, fontWeight: 'bold' }
    };

    switch (enrollmentStatus) {
      case 'approved':
        return (
          <Chip 
            {...baseProps}
            icon={<CheckCircleIcon />}
            label="Verified" 
            color="success" 
            variant="filled"
          />
        );
      case 'pending':
        return (
          <Chip 
            {...baseProps}
            icon={<ScheduleIcon />}
            label="Pending" 
            color="warning" 
            variant="filled"
          />
        );
      case 'not_enrolled':
        return (
          <Chip 
            {...baseProps}
            icon={<PersonOffIcon />}
            label="Not Enrolled" 
            color="default" 
            variant="outlined"
          />
        );
      case 'unauthorized':
        return (
          <Chip 
            {...baseProps}
            icon={<CancelIcon />}
            label="Access Denied" 
            color="error" 
            variant="filled"
          />
        );
      case 'error':
        return (
          <Chip 
            {...baseProps}
            icon={<HelpIcon />}
            label="Unknown" 
            color="error" 
            variant="outlined"
          />
        );
      default:
        return null;
    }
  };

  // User object for ProfileCover with enhanced status display
  const user = {
    name: computedData.fullName,
    email: storedUser.email || 'No email available',
    coverImg: '/static/images/placeholders/covers/5.jpg',
    avatar: '/static/images/avatars/profile.png',
    description: (
      <Box sx={{ fontSize: '16px', lineHeight: '1.6', color: '#333333' }}>
        <Box sx={{ fontSize: '16px', mb: 1, color: '#1a1a1a' }}>
          <strong>Email:</strong> {storedUser.email || 'Not provided'}
        </Box>
        
        <Box sx={{ fontSize: '16px', color: '#1a1a1a', display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <strong>Status:</strong> 
          <span style={{ marginLeft: '8px' }}>{getStatusDisplay()}</span>
          {getStatusChip()}
        </Box>

        {computedData.rsbsaNumber && (
          <Box sx={{ fontSize: '14px', color: '#666', mb: 1 }}>
            <strong>RSBSA Number:</strong> {computedData.rsbsaNumber}
          </Box>
        )}

        {enrollmentData?.application_reference_code && (
          <Box sx={{ fontSize: '14px', color: '#666', mb: 1 }}>
            <strong>Reference Code:</strong> {enrollmentData.application_reference_code}
          </Box>
        )}
        
        {enrollmentData?.approved_at && (
          <Box sx={{ fontSize: '14px', color: '#4caf50', mb: 1 }}>
            <strong>Approved:</strong> {' '}
            {new Date(enrollmentData.approved_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Box>
        )}

        {/* Refresh Button */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loadingStatus || refreshing}
            sx={{ fontSize: '12px' }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </Box>
        
        {error && (
          <Alert 
            severity={enrollmentStatus === 'unauthorized' ? 'error' : 'warning'} 
            sx={{ mt: 1, fontSize: '14px' }}
          >
            {error}
          </Alert>
        )}
      </Box>
    ),
    jobtitle: getJobTitle(),
    location: computedData.location,
    followers: getVerificationStatus()
  };

  // Enhanced loading state
  if (loadingStatus && !storedUser?.id && !profileData?.id) {
    return (
      <Container sx={{ mt: 3, textAlign: 'center' }} maxWidth="lg">
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
          Loading profile information...
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Profile - {computedData.fullName} | RSBSA Management</title>
        <meta
          name="description"
          content={`Manage ${computedData.fullName}'s personal details and beneficiary profile information`}
        />
      </Helmet>

      <Container sx={{ mt: 3 }} maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <ProfileCover user={user} />
          </Grid>

          <Grid item xs={12}>
            <PersonalDetails />
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}

export default ManagementUserProfile;
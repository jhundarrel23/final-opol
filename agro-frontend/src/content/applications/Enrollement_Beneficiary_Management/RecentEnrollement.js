/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CircularProgress, Box, Alert, Typography, Snackbar } from '@mui/material';
import RSBSAEnrollmentTable from './RSBSAEnrollementTable'; // Updated import
import InterviewDetailsModal from './InterviewDetailsModal';
import PropTypes from 'prop-types';
import { useNotifications } from '../../../contexts/NotificationContext';

function RecentEnrollement({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Add notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  
  // Add notification system hook
  const { addNotification } = useNotifications();

  // Show notification helper
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  // Close notification
  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // ✅ Always fetch admin enrollments
  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching enrollments...');
      console.log('📅 Request timestamp:', new Date().toISOString());

      const { data } = await axiosInstance.get('/api/rsbsa/enrollments/display');
      
      // 🆕 Console log all response data
      console.log('📥 FETCH ENROLLMENTS - Full Response Data:', {
        timestamp: new Date().toISOString(),
        fullResponse: data,
        dataStructure: typeof data,
        hasData: !!data?.data,
        dataArray: data?.data || data,
        dataLength: (data?.data || data || []).length
      });

      const enrollmentData = data?.data || data || [];
      console.log('✅ Processed enrollment data:', enrollmentData);
      
      // Check for new enrollments (first time loading or new ones added)
      const previousCount = enrollments.length;
      const currentCount = enrollmentData.length;
      
      if (previousCount > 0 && currentCount > previousCount) {
        const newEnrollmentsCount = currentCount - previousCount;
        addNotification({
          type: 'interview_request',
          title: 'New Enrollment Applications',
          message: `${newEnrollmentsCount} new enrollment application${newEnrollmentsCount > 1 ? 's' : ''} received and waiting for interview`,
          priority: 'high',
          data: {
            new_count: newEnrollmentsCount,
            total_count: currentCount,
            updated_at: new Date().toISOString()
          }
        });
      }
      
      setEnrollments(enrollmentData);
    } catch (err) {
      console.error('❌ Error fetching enrollments:', err);
      console.log('📅 Error timestamp:', new Date().toISOString());
      console.log('🔍 Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      const errorMessage =
        err.response?.data?.message || 'Unable to load enrollment data.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Fetch enrollments completed at:', new Date().toISOString());
    }
  }, []);

  // ✅ Complete interview (COORDINATORS ONLY)
  const handleCompleteInterview = useCallback(
    async (enrollmentId) => {
      if (!enrollmentId) {
        showNotification('No enrollment ID provided', 'error');
        return { success: false, message: 'No enrollment ID provided' };
      }

      // Check if user is coordinator
      if (user?.role !== 'coordinator') {
        showNotification('Only coordinators can complete interviews', 'error');
        return { success: false, message: 'Unauthorized: Coordinator access required' };
      }

      try {
        console.log('🎯 COMPLETE INTERVIEW - Starting...');
        console.log('📅 Request timestamp:', new Date().toISOString());
        console.log('🆔 Enrollment ID:', enrollmentId);
        console.log('👤 User:', user);

        const response = await axiosInstance.post(
          `/api/rsbsa/enrollments/${enrollmentId}/interview/complete`
        );

        // 🆕 Console log all response data
        console.log('📥 COMPLETE INTERVIEW - Full Response Data:', {
          timestamp: new Date().toISOString(),
          enrollmentId,
          fullResponse: response,
          responseData: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });

        // Update local state immediately for better UX
        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.id === enrollmentId
              ? {
                  ...enrollment,
                  interview_completed_at: new Date().toISOString(),
                  reviewed_by: user?.id,
                  reviewer: user // Add reviewer object
                }
              : enrollment
          )
        );

        if (selectedInterview?.id === enrollmentId) {
          setSelectedInterview((prev) => ({
            ...prev,
            interview_completed_at: new Date().toISOString(),
            reviewed_by: user?.id,
            reviewer: user
          }));
        }

        const successMessage = response.data?.message || 'Interview completed successfully!';
        showNotification(successMessage, 'success');

        // Add notification to the notification system
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        const beneficiaryName = enrollment?.beneficiary_detail?.user 
          ? `${enrollment.beneficiary_detail.user.fname} ${enrollment.beneficiary_detail.user.lname}`.trim()
          : 'Unknown Beneficiary';
        
        const completedBy = user?.fname && user?.lname 
          ? `${user.fname} ${user.lname}`.trim()
          : 'Unknown Coordinator';
        
        addNotification({
          type: 'interview_completed',
          title: 'Interview Completed',
          message: `Successfully completed enrollment interview for ${beneficiaryName}`,
          priority: 'medium',
          data: {
            enrollment_id: enrollmentId,
            beneficiary_name: beneficiaryName,
            completed_by: completedBy,
            completed_at: new Date().toISOString()
          }
        });

        // Refresh data from server after a short delay
        setTimeout(() => {
          fetchEnrollments();
        }, 1000);

        return {
          success: true,
          message: successMessage,
        };
      } catch (error) {
        console.error('❌ COMPLETE INTERVIEW - Error:', error);
        console.log('📅 Error timestamp:', new Date().toISOString());
        console.log('🔍 Complete interview error details:', {
          enrollmentId,
          message: error.message,
          response: error.response,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to complete interview.';
        
        showNotification(errorMessage, 'error');
        return { success: false, message: errorMessage };
      }
    },
    [user, selectedInterview, showNotification, fetchEnrollments]
  );

  // ✅ Approve enrollment - Enhanced with better error handling
  const handleApproveEnrollment = useCallback(
    async (enrollmentId) => {
      if (!enrollmentId) {
        showNotification('No enrollment ID provided', 'error');
        return { success: false, message: 'No enrollment ID provided' };
      }

      // Check if user is admin
      if (user?.role !== 'admin') {
        showNotification('Only administrators can approve enrollments', 'error');
        return { success: false, message: 'Unauthorized: Admin access required' };
      }

      try {
        console.log('✅ APPROVE ENROLLMENT - Starting...');
        console.log('📅 Request timestamp:', new Date().toISOString());
        console.log('🆔 Enrollment ID:', enrollmentId);
        console.log('👤 User:', user);
        
        const response = await axiosInstance.post(
          `/api/rsbsa/enrollments/${enrollmentId}/approve`,
          {}, // Empty body for POST request
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        // 🆕 Console log all response data
        console.log('📥 APPROVE ENROLLMENT - Full Response Data:', {
          timestamp: new Date().toISOString(),
          enrollmentId,
          fullResponse: response,
          responseData: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: response.config
        });

        // Update local state immediately for better UX
        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.id === enrollmentId
              ? {
                  ...enrollment,
                  application_status: 'approved',
                  approved_by: user?.id,
                  approved_at: new Date().toISOString(),
                }
              : enrollment
          )
        );

        // Update modal data if it's the same enrollment
        if (selectedInterview?.id === enrollmentId) {
          setSelectedInterview((prev) => ({
            ...prev,
            application_status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          }));
        }

        const successMessage = response.data?.message || 'Enrollment approved successfully!';
        showNotification(successMessage, 'success');

        // Add notification for enrollment approval (only for batch approvals)
        const approvedEnrollment = enrollments.find(e => e.id === enrollmentId);
        if (approvedEnrollment) {
          // Only notify for batch approvals or important enrollments
          const isBatchApproval = approvedEnrollment.batch_approval || false;
          if (isBatchApproval) {
            const beneficiaryName = approvedEnrollment.user?.fname && approvedEnrollment.user?.lname 
              ? `${approvedEnrollment.user.fname} ${approvedEnrollment.user.lname}`.trim()
              : 'Unknown Beneficiary';
            
            addNotification({
              type: 'enrollment_approved',
              title: 'Batch Enrollment Approved',
              message: `Multiple enrollments have been approved`,
              priority: 'medium',
              data: {
                enrollment_id: enrollmentId,
                beneficiary_name: beneficiaryName,
                approved_by: user?.fname && user?.lname ? `${user.fname} ${user.lname}` : 'Admin',
                approved_at: new Date().toISOString()
              }
            });
          }
        }

        // Refresh data from server after a short delay
        setTimeout(() => {
          fetchEnrollments();
        }, 1000);

        return {
          success: true,
          message: successMessage,
        };
      } catch (error) {
        console.error('❌ APPROVE ENROLLMENT - Error:', error);
        console.log('📅 Error timestamp:', new Date().toISOString());
        console.log('🔍 Approve enrollment error details:', {
          enrollmentId,
          message: error.message,
          response: error.response,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to approve enrollment.';
        
        showNotification(errorMessage, 'error');
        return { success: false, message: errorMessage };
      }
    },
    [user, selectedInterview, showNotification, fetchEnrollments]
  );

  // ✅ Reject enrollment - Enhanced with better error handling
  const handleRejectEnrollment = useCallback(
    async (enrollmentId, reason = null) => {
      if (!enrollmentId) {
        showNotification('No enrollment ID provided', 'error');
        return { success: false, message: 'No enrollment ID provided' };
      }

      // Check if user is admin
      if (user?.role !== 'admin') {
        showNotification('Only administrators can reject enrollments', 'error');
        return { success: false, message: 'Unauthorized: Admin access required' };
      }

      try {
        console.log('❌ REJECT ENROLLMENT - Starting...');
        console.log('📅 Request timestamp:', new Date().toISOString());
        console.log('🆔 Enrollment ID:', enrollmentId);
        console.log('📝 Reason:', reason);
        console.log('👤 User:', user);
        
        const response = await axiosInstance.post(
          `/api/rsbsa/enrollments/${enrollmentId}/reject`,
          { 
            reason: reason || null 
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        // 🆕 Console log all response data
        console.log('📥 REJECT ENROLLMENT - Full Response Data:', {
          timestamp: new Date().toISOString(),
          enrollmentId,
          reason,
          fullResponse: response,
          responseData: response.data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: response.config
        });

        // Update local state immediately for better UX
        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.id === enrollmentId
              ? {
                  ...enrollment,
                  application_status: 'rejected',
                  rejected_by: user?.id,
                  rejected_at: new Date().toISOString(),
                  rejection_reason: reason,
                }
              : enrollment
          )
        );

        // Update modal data if it's the same enrollment
        if (selectedInterview?.id === enrollmentId) {
          setSelectedInterview((prev) => ({
            ...prev,
            application_status: 'rejected',
            rejected_by: user?.id,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason,
          }));
        }

        const successMessage = response.data?.message || 'Enrollment rejected successfully!';
        showNotification(successMessage, 'success');

        // Refresh data from server after a short delay
        setTimeout(() => {
          fetchEnrollments();
        }, 1000);

        return {
          success: true,
          message: successMessage,
        };
      } catch (error) {
        console.error('❌ REJECT ENROLLMENT - Error:', error);
        console.log('📅 Error timestamp:', new Date().toISOString());
        console.log('🔍 Reject enrollment error details:', {
          enrollmentId,
          reason,
          message: error.message,
          response: error.response,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to reject enrollment.';
        
        showNotification(errorMessage, 'error');
        return { success: false, message: errorMessage };
      }
    },
    [user, selectedInterview, showNotification, fetchEnrollments]
  );

  // ✅ View & modal handlers
  const handleViewInterview = useCallback((interview) => {
    console.log('👁️ VIEW INTERVIEW - Data:', {
      timestamp: new Date().toISOString(),
      interviewData: interview,
      interviewId: interview?.id,
      enrollmentId: interview?.enrollment_id || interview?.id
    });
    setSelectedInterview(interview);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log('🔒 MODAL CLOSED at:', new Date().toISOString());
    setIsModalOpen(false);
    setSelectedInterview(null);
  }, []);

  const handleRefreshAfterModal = useCallback(() => {
    console.log('🔄 REFRESH AFTER MODAL at:', new Date().toISOString());
    fetchEnrollments();
  }, [fetchEnrollments]);

  // ✅ Load enrollments on mount
  useEffect(() => {
    console.log('🚀 COMPONENT MOUNTED - Initial fetch at:', new Date().toISOString());
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    const handleEnrollmentUpdated = () => {
      console.log('📡 ENROLLMENT UPDATED EVENT - Received at:', new Date().toISOString());
      
      // Add notification for new enrollment
      addNotification({
        type: 'interview_request',
        title: 'New Enrollment Request',
        message: 'A new beneficiary has submitted an enrollment application and is waiting for interview',
        priority: 'high',
        data: {
          updated_at: new Date().toISOString(),
          action: 'enrollment_updated'
        }
      });
      
      fetchEnrollments();
    };
    window.addEventListener('enrollmentUpdated', handleEnrollmentUpdated);
    return () => {
      console.log('🧹 CLEANUP - Removing event listener at:', new Date().toISOString());
      window.removeEventListener('enrollmentUpdated', handleEnrollmentUpdated);
    };
  }, [fetchEnrollments, addNotification]);

  // Loading state
  if (loading) {
    console.log('⏳ LOADING STATE - Rendered at:', new Date().toISOString());
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading enrollment data...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    console.log('🚫 ERROR STATE - Rendered at:', new Date().toISOString(), 'Error:', error);
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2,
          '& .MuiAlert-message': { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1 
          }
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {error}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </Alert>
    );
  }

  // No user state
  if (!user) {
    console.log('👤 NO USER STATE - Rendered at:', new Date().toISOString());
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Authentication Required
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Enrollment management is only available for logged in users.
        </Typography>
      </Alert>
    );
  }

  console.log('✨ MAIN COMPONENT - Rendered at:', new Date().toISOString(), {
    enrollmentsCount: enrollments.length,
    user: user,
    modalOpen: isModalOpen,
    selectedInterview: selectedInterview
  });

  return (
    <>
      {/* Table Component - No Card wrapper to allow full width */}
      <RSBSAEnrollmentTable
        enrollments={enrollments}
        loading={loading}
        error={error}
        onViewInterview={handleViewInterview}
        onApproveEnrollment={handleApproveEnrollment}
        onRejectEnrollment={handleRejectEnrollment}
        user={user}
      />

      {/* Modal for interview details */}
      <InterviewDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        interviewData={selectedInterview}
        onCompleteInterview={handleCompleteInterview}
        onApproveEnrollment={handleApproveEnrollment}
        onRejectEnrollment={handleRejectEnrollment}
        user={user}
        onRefresh={handleRefreshAfterModal}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

RecentEnrollement.propTypes = {
  user: PropTypes.object.isRequired,
};

export default RecentEnrollement;
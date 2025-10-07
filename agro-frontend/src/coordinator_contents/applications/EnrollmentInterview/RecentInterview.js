  /* eslint-disable no-unused-vars */
  import { useEffect, useState, useCallback } from 'react';
  import axiosInstance from '../../../api/axiosInstance';
  import { Card, CircularProgress, Box, Alert, Typography } from '@mui/material';
  import RSBSAInterviewTable from './RSBSAInterviewTable';
  import InterviewDetailsModal from './InterviewDetailsModal';
  import PropTypes from 'prop-types';

  function RecentInterview({ user }) {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ Fetch enrollments function
    const fetchEnrollments = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching RSBSA enrollments...');

        const { data } = await axiosInstance.get('/api/rsbsa/enrollments');
        const enrollmentData = data?.data || data || [];

        console.log('📋 Fetched enrollments:', enrollmentData);
        setEnrollments(enrollmentData);
      } catch (err) {
        console.error('❌ Failed to fetch RSBSA enrollments:', err);
        const errorMessage = err.response?.data?.message || 'Unable to load interview data.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, []);

    // ✅ Complete interview function
    const handleCompleteInterview = useCallback(
      async (enrollmentId) => {
        console.log('🎯 Starting interview completion for ID:', enrollmentId);
        
        if (!enrollmentId) {
          console.error('❌ No enrollment ID provided');
          return { success: false, message: 'No enrollment ID provided' };
        }

        try {
          console.log('🚀 Making API call to complete interview...');
          const response = await axiosInstance.post(
            `/api/rsbsa/enrollments/${enrollmentId}/interview/complete`
          );

          console.log('✅ API response:', response.data);

          // Update local state to reflect the completion
          setEnrollments((prev) =>
            prev.map((enrollment) =>
              enrollment.id === enrollmentId
                ? {
                    ...enrollment,
                    interview_completed_at: new Date().toISOString(),
                    reviewed_by: user?.id,
                  }
                : enrollment
            )
          );

          // Update selected interview if it's currently displayed
          if (selectedInterview && selectedInterview.id === enrollmentId) {
            setSelectedInterview((prev) => ({
              ...prev,
              interview_completed_at: new Date().toISOString(),
              reviewed_by: user?.id,
            }));
          }

          const successMessage = response.data?.message || 'Interview verified successfully!';
          console.log('🎉 Interview completion successful:', successMessage);

          return {
            success: true,
            message: successMessage,
          };
        } catch (error) {
          console.error('💥 Complete interview error:', error);
          console.error('📍 Error response:', error.response?.data);
          
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              'Failed to complete interview. Please try again.';
          
          return { 
            success: false, 
            message: errorMessage 
          };
        }
      },
      [user?.id, selectedInterview]
    );

    // ✅ Reject application function
   // ✅ Reject application function
const handleRejectApplication = useCallback(
  async (enrollmentId) => {
    console.log('🚫 Starting application rejection for ID:', enrollmentId);

    if (!enrollmentId) {
      console.error('❌ No enrollment ID provided');
      return { success: false, message: 'No enrollment ID provided' };
    }

    try {
      console.log('🚀 Making API call to reject application...');
      const response = await axiosInstance.post(
        `/api/rsbsa/enrollments/${enrollmentId}/reject`
      );

      console.log('✅ API response:', response.data);

      // Update local state to reflect the rejection
      setEnrollments((prev) =>
        prev.map((enrollment) =>
          enrollment.id === enrollmentId
            ? {
                ...enrollment,
                application_status: 'rejected',
                rejected_at: new Date().toISOString(),
              }
            : enrollment
        )
      );

      // Update selected interview if it's currently displayed
      if (selectedInterview && selectedInterview.id === enrollmentId) {
        setSelectedInterview((prev) => ({
          ...prev,
          application_status: 'rejected',
          rejected_at: new Date().toISOString(),
        }));
      }

      const successMessage = response.data?.message || 'Application rejected successfully';
      console.log('🎉 Application rejection successful:', successMessage);

      return {
        success: true,
        message: successMessage,
      };
    } catch (error) {
      console.error('💥 Reject application error:', error);
      console.error('📍 Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to reject application. Please try again.';
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  },
  [selectedInterview]
);


    const handleViewInterview = useCallback((interview) => {
      console.log('👁️ Opening interview details for:', interview);
      setSelectedInterview(interview);
      setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
      console.log('🚪 Closing interview details modal');
      setIsModalOpen(false);
      setSelectedInterview(null);
    }, []);

    const handleRefreshAfterModal = useCallback(() => {
      console.log('🔄 Refreshing data after modal operation');
      fetchEnrollments();
    }, [fetchEnrollments]);

    useEffect(() => {
      if (user?.role === 'coordinator') {
        fetchEnrollments();
      }
    }, [fetchEnrollments, user]);

    useEffect(() => {
      const handleEnrollmentUpdated = (event) => {
        console.log('📡 Received enrollmentUpdated event:', event);
        fetchEnrollments();
      };

      window.addEventListener('enrollmentUpdated', handleEnrollmentUpdated);

      return () => {
        window.removeEventListener('enrollmentUpdated', handleEnrollmentUpdated);
      };
    }, [fetchEnrollments]);

    // ✅ Authorization check
    if (!user || user.role !== 'coordinator') {
      return (
        <Card>
          <Box p={3}>
            <Alert severity="warning">
              Interview management is only available for coordinators.
            </Alert>
          </Box>
        </Card>
      );
    }

    // ✅ Loading state
    if (loading) {
      return (
        <Card>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
            flexDirection="column"
            gap={2}
          >
            <CircularProgress />
            <Typography variant="body2" color="textSecondary">
              Loading interview data...
            </Typography>
          </Box>
        </Card>
      );
    }

    // ✅ Error state
    if (error) {
      return (
        <Card>
          <Box p={3}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="textSecondary">
              Please try refreshing the page or contact support if the problem persists.
            </Typography>
          </Box>
        </Card>
      );
    }

    return (
      <>
        <Card>
          <RSBSAInterviewTable
            enrollments={enrollments}
            loading={loading}
            error={error}
            onCompleteInterview={handleCompleteInterview}
            onViewInterview={handleViewInterview}
            user={user}
            onRefresh={fetchEnrollments}
          />
        </Card>

        {/* Interview Details Modal */}
        <InterviewDetailsModal
          open={isModalOpen}
          onClose={handleCloseModal}
          interviewData={selectedInterview}
          onCompleteInterview={handleCompleteInterview}
          onRejectApplication={handleRejectApplication}
          user={user}
          onRefresh={handleRefreshAfterModal}
        />
      </>
    );
  }

  RecentInterview.propTypes = {
    user: PropTypes.object.isRequired,
  };

  export default RecentInterview;
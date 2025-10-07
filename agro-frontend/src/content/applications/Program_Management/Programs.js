/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { CircularProgress, Box, Alert, Typography, Snackbar } from '@mui/material';
import ProgramTable from './ProgramTable';
import ProgramDetailsModal from './ProgramDetailsModal';
import { useNotifications } from '../../../contexts/NotificationContext';
import PropTypes from 'prop-types';

function Program({ user }) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Notification context
  const { addNotification } = useNotifications();

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Show notification helper
  const showNotification = useCallback((message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  // Fetch subsidy programs
  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axiosInstance.get('/api/subsidy-programs');
      const programData = data?.data || data || [];
      setPrograms(programData);
    } catch (err) {
      console.error('Error fetching programs:', err);
      const errorMessage =
        err.response?.data?.message || 'Unable to load subsidy programs.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve program
  const handleApproveProgram = useCallback(
    async (programId) => {
      if (!programId) {
        showNotification('No program ID provided', 'error');
        return;
      }
      if (user?.role !== 'admin') {
        showNotification('Only admins can approve programs', 'error');
        return;
      }

      try {
        const response = await axiosInstance.post(`/api/subsidy-programs/${programId}/approve`);
        showNotification(response.data?.message || 'Program approved successfully!', 'success');

        // Add notification for program approval (only for important programs)
        const approvedProgram = programs.find(p => p.id === programId);
        if (approvedProgram && approvedProgram.beneficiaries_count > 10) {
          addNotification({
            type: 'program_approval',
            title: 'Program Approved',
            message: `"${approvedProgram.title}" has been approved and is now ongoing`,
            priority: 'medium',
            data: {
              program_id: programId,
              program_title: approvedProgram.title,
              approved_by: user?.fname && user?.lname ? `${user.fname} ${user.lname}` : 'Admin',
              approved_at: new Date().toISOString()
            }
          });
        }

        // Update local state
        setPrograms(prev =>
          prev.map(p => (p.id === programId ? { ...p, approval_status: 'approved', status: 'ongoing' } : p))
        );

        if (selectedProgram?.id === programId) {
          setSelectedProgram(prev => ({ ...prev, approval_status: 'approved', status: 'ongoing' }));
        }
      } catch (error) {
        console.error('Error approving program:', error);
        const errorMessage =
          error.response?.data?.message || error.response?.data?.error || 'Failed to approve program.';
        showNotification(errorMessage, 'error');
      }
    },
    [user, programs, selectedProgram, showNotification, addNotification]
  );

  // Cancel program - UPDATED LOGIC: Only pending programs can be cancelled
  const handleCancelProgram = useCallback(
    async (programId) => {
      if (!programId) {
        showNotification('No program ID provided', 'error');
        return;
      }
      if (user?.role !== 'admin' && user?.role !== 'coordinator') {
        showNotification('Only admins and coordinators can cancel programs', 'error');
        return;
      }

      // Check if program is already approved
      const programToCancel = programs.find(p => p.id === programId);
      if (programToCancel?.approval_status === 'approved') {
        showNotification('Cannot cancel an approved program. Please complete it instead.', 'error');
        return;
      }

      try {
        const response = await axiosInstance.post(`/api/subsidy-programs/${programId}/cancel`);
        showNotification(response.data?.message || 'Program cancelled successfully!', 'success');

        // Update local state
        setPrograms(prev =>
          prev.map(p => (p.id === programId ? { ...p, status: 'cancelled' } : p))
        );

        if (selectedProgram?.id === programId) {
          setSelectedProgram(prev => ({ ...prev, status: 'cancelled' }));
        }
      } catch (error) {
        console.error('Error cancelling program:', error);
        const errorMessage =
          error.response?.data?.message || error.response?.data?.error || 'Failed to cancel program.';
        showNotification(errorMessage, 'error');
      }
    },
    [user, programs, selectedProgram, showNotification]
  );

  // Complete program (coordinator only)
  const handleCompleteProgram = useCallback(
    async (programId) => {
      if (!programId) {
        showNotification('No program ID provided', 'error');
        return;
      }
      if (user?.role !== 'coordinator') {
        showNotification('Only coordinators can complete programs', 'error');
        return;
      }

      try {
        const response = await axiosInstance.post(`/api/subsidy-programs/${programId}/complete`);
        showNotification(response.data?.message || 'Program marked as completed!', 'success');

        // Update local state
        setPrograms(prev =>
          prev.map(p => (p.id === programId ? { ...p, status: 'completed' } : p))
        );

        if (selectedProgram?.id === programId) {
          setSelectedProgram(prev => ({ ...prev, status: 'completed' }));
        }
      } catch (error) {
        console.error('Error completing program:', error);
        const errorMessage =
          error.response?.data?.message || error.response?.data?.error || 'Failed to complete program.';
        showNotification(errorMessage, 'error');
      }
    },
    [user, selectedProgram, showNotification]
  );

  // Modal handlers
  const handleViewProgram = useCallback((program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  }, []);

  // Load programs on mount
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px" flexDirection="column" gap={2}>
        <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading subsidy programs...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {error}
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </Alert>
    );
  }

  return (
    <>
      <ProgramTable
        programs={programs}
        onViewProgram={handleViewProgram}
      />

      <ProgramDetailsModal
        open={isModalOpen}
        onClose={handleCloseModal}
        program={selectedProgram}
        onApproveProgram={handleApproveProgram}
        onCancelProgram={handleCancelProgram}
        onCompleteProgram={handleCompleteProgram}
        user={user}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

Program.propTypes = {
  user: PropTypes.object.isRequired,
};

export default Program;
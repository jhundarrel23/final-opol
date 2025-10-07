import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Alert, Snackbar } from '@mui/material';
import Footer from 'src/components/Footer';
import BeneficiaryList from './BeneficiaryList';
import UpdateBeneficiaryModal from './UpdateBeneficiaryModal';
import axiosInstance from '../../../api/axiosInstance';

function BeneficiaryManagement() {
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    beneficiaries: 0,
    coordinators: 0,
    completionRate: 0
  });
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch dashboard statistics from the new API endpoint
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use the updated stats endpoint that excludes admin users
      const response = await axiosInstance.get('/api/admin/stats');
      
      if (response.data.success && response.data.data) {
        const stats = response.data.data.overview;
        
        setStatistics({
          total: stats.total_users || 0,
          active: stats.active_users || 0,
          inactive: stats.inactive_users || 0,
          suspended: stats.suspended_users || 0,
          beneficiaries: stats.total_beneficiaries || 0,
          coordinators: stats.total_coordinators || 0,
          completionRate: stats.completion_rate || 0
        });
        
        console.log('Updated statistics:', stats);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch dashboard statistics';
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: `Failed to load statistics: ${errorMessage}`,
        severity: 'warning'
      });
      
      // Set default values on error
      setStatistics({ 
        total: 0, 
        active: 0, 
        inactive: 0, 
        suspended: 0, 
        beneficiaries: 0, 
        coordinators: 0, 
        completionRate: 0 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Handle opening edit modal
  const handleEditBeneficiary = (beneficiary) => {
    console.log('Opening edit modal for:', beneficiary);
    setSelectedBeneficiary(beneficiary);
    setEditModalOpen(true);
  };

  // Handle closing edit modal
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedBeneficiary(null);
  };

  // Handle successful update
  const handleUpdateSuccess = (result) => {
    if (result?.success) {
      setSnackbar({
        open: true,
        message: 'User updated successfully!',
        severity: 'success'
      });
      
      // Refresh statistics after successful update
      fetchStatistics();
      
      // Close modal
      handleCloseEditModal();
    } else {
      setSnackbar({
        open: true,
        message: 'Update completed but there may have been issues',
        severity: 'warning'
      });
    }
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Manual refresh handler
  const handleRefreshStats = () => {
    console.log('Manual statistics refresh requested');
    fetchStatistics();
  };

  return (
    <>
      <Helmet>
        <title>User Management - Admin Dashboard</title>
      </Helmet>
      
      <PageTitleWrapper>
        <PageHeader 
          beneficiariesCount={statistics.total}
          activeCount={statistics.active}
          inactiveCount={statistics.inactive + statistics.suspended}
          coordinatorsCount={statistics.coordinators}
          beneficiariesOnlyCount={statistics.beneficiaries}
          completionRate={statistics.completionRate}
          loading={loading}
          onRefresh={handleRefreshStats}
        />
      </PageTitleWrapper>
      
      <Container maxWidth="lg">
        {/* Show error alert if statistics failed to load */}
        {error && (
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Alert 
              severity="warning" 
              variant="outlined"
              onClose={() => setError('')}
            >
              Statistics Error: {error}
            </Alert>
          </Grid>
        )}
        
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <BeneficiaryList 
              onDataUpdate={fetchStatistics}
              onEditBeneficiary={handleEditBeneficiary}
            />
          </Grid>
        </Grid>
      </Container>
      
      {/* Update Beneficiary Modal */}
      <UpdateBeneficiaryModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateSuccess}
        beneficiary={selectedBeneficiary}
      />
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Footer />
    </>
  );
}

export default BeneficiaryManagement;
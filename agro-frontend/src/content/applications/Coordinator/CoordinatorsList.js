/* eslint-disable no-alert */
import { useState, useEffect } from 'react';
import { 
  Card, 
  CircularProgress, 
  Box, 
  Typography, 
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axiosInstance from '../../../api/axiosInstance'; // adjust path as needed
import CoordinatorTable from './RecentCoordinatorTable'; // ✅ Fixed import name
import EditCoordinatorModal from './EditCoordinatorModal'; // ✅ Adjust path as needed
import TransferBeneficiariesModal from './TransferBeneficiariesModal'; // ✅ New import
import { useNotifications } from '../../../contexts/NotificationContext';

function CoordinatorList() {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Notification context
  const { addNotification } = useNotifications();
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [sectorOptions, setSectorOptions] = useState([]);
  
  // Transfer modal state
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const fetchCoordinators = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.get('/api/coordinators');
      
      console.log('Full API Response:', response.data); // Debug log
      console.log('Coordinators Data:', response.data.data); // Debug log
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setCoordinators(response.data.data);
        console.log('Sample coordinator object:', response.data.data[0]); // Debug log
      } else {
        console.error('Invalid data structure:', response.data);
        setError('Invalid data structure received from server');
      }
    } catch (err) {
      console.error('Error fetching coordinators:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      let errorMessage = 'An error occurred while fetching coordinators';
      
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${
          err.response.data?.message || 'Unknown error'
        }`;
      } else if (err.request) {
        errorMessage = 'No response received from server. Please check your connection.';
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorOptions = async () => {
    try {
      console.log('🔄 Fetching sectors...'); // Debug log
      const response = await axiosInstance.get('/api/sectors'); // Adjust endpoint as needed
      
      console.log('📊 Sectors API Response:', response.data); // Debug log
      
      if (response.data.data && Array.isArray(response.data.data)) {
        const options = response.data.data.map(sector => ({
          value: sector.id,
          label: sector.name || sector.sector_name || sector.title
        }));
        console.log('✅ Formatted sector options:', options); // Debug log
        setSectorOptions(options);
      } else if (Array.isArray(response.data)) {
        const options = response.data.map(sector => ({
          value: sector.id,
          label: sector.name || sector.sector_name || sector.title
        }));
        console.log('✅ Formatted sector options (direct array):', options);
        setSectorOptions(options);
      } else {
        console.error('❌ Invalid sectors data structure:', response.data);
        setSectorOptions([]);
      }
    } catch (err) {
      console.error('❌ Error fetching sectors:', err);
      setSectorOptions([]);
    }
  };

  useEffect(() => {
    fetchCoordinators();
    fetchSectorOptions();
  }, []);

  const handleRefresh = () => {
    fetchCoordinators();
  };

  const handleEdit = (coordinator) => {
    console.log('Edit coordinator:', coordinator);
    setSelectedCoordinator(coordinator);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedCoordinator(null);
  };

  const handleEditSubmit = (updatedCoordinator) => {
    console.log('Coordinator updated:', updatedCoordinator);
    
    // Add notification for coordinator update (only for new registrations, not updates)
    const isNewRegistration = updatedCoordinator.data?.is_new_registration || false;
    if (isNewRegistration) {
      addNotification({
        type: 'coordinator_registration',
        title: 'New Coordinator Registered',
        message: `New coordinator ${updatedCoordinator.data?.full_name || 'profile'} has been registered`,
        priority: 'medium',
        data: {
          coordinator_id: updatedCoordinator.data?.id,
          coordinator_name: updatedCoordinator.data?.full_name,
          updated_at: new Date().toISOString()
        }
      });
    }
    
    setSnackbar({
      open: true,
      message: `${updatedCoordinator.data?.full_name || 'Coordinator'} has been updated successfully`,
      severity: 'success'
    });
    
    fetchCoordinators();
  };

  const handleDelete = async (coordinator) => {
    console.log('Delete coordinator:', coordinator);
    
    const confirmDelete = window.confirm(
      `Are you sure you want to deactivate ${coordinator.full_name || coordinator.fname}?`
    );
    
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/api/coordinators/${coordinator.id}`);
      
      setSnackbar({
        open: true,
        message: `${coordinator.full_name || coordinator.fname} has been deactivated successfully`,
        severity: 'success'
      });
      
      fetchCoordinators();
    } catch (err) {
      console.error('Error deactivating coordinator:', err);
      setSnackbar({
        open: true,
        message: `Failed to deactivate coordinator: ${err.response?.data?.message || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleOpenTransferModal = () => {
    setTransferModalOpen(true);
  };

  const handleTransferSuccess = (result) => {
    console.log('Transfer completed:', result);
    
    setSnackbar({
      open: true,
      message: `Successfully transferred ${result.data?.transferred_count || 0} beneficiaries`,
      severity: 'success'
    });
    
    fetchCoordinators();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Card sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading coordinators...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Error loading coordinators:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        </Alert>
      </Card>
    );
  }

  return (
    <>
      {/* Coordinator Table with Transfer Button */}
      <CoordinatorTable 
        coordinators={coordinators}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTransfer={handleOpenTransferModal}
      />
      
      {/* Edit Modal */}
      <EditCoordinatorModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditSubmit}
        coordinator={selectedCoordinator}
        sectorOptions={sectorOptions}
      />

      {/* Transfer Modal */}
      <TransferBeneficiariesModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
        coordinators={coordinators}
      />
      
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
    </>
  );
}

export default CoordinatorList;
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Alert,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../../api/axiosInstance';
import { SwapHoriz, CheckCircle, Warning } from '@mui/icons-material';

const TransferBeneficiariesModal = ({ open, onClose, onSuccess, coordinators }) => {
  const [form, setForm] = useState({
    from_coordinator_id: '',
    to_coordinator_id: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);

  const activeCoordinators = coordinators.filter(c => c.status === 'active');
  const inactiveCoordinators = coordinators.filter(c => c.status === 'inactive');

  const resetForm = () => {
    setForm({
      from_coordinator_id: '',
      to_coordinator_id: ''
    });
    setErrors({});
    setSuccessInfo(null);
    setBeneficiaryCount(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));

    // Check beneficiary count when from_coordinator is selected
    if (name === 'from_coordinator_id' && value) {
      checkBeneficiaryCount(value);
    }
  };

  const checkBeneficiaryCount = async (coordinatorId) => {
    try {
      // You'll need to create this endpoint or get the count from your existing data
      const coordinator = coordinators.find(c => c.id === parseInt(coordinatorId));
      setBeneficiaryCount(coordinator?.beneficiary_count || 0);
    } catch (error) {
      console.error('Error checking beneficiary count:', error);
      setBeneficiaryCount(0);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.from_coordinator_id) newErrors.from_coordinator_id = 'Source coordinator is required';
    if (!form.to_coordinator_id) newErrors.to_coordinator_id = 'Target coordinator is required';
    if (form.from_coordinator_id === form.to_coordinator_id) {
      newErrors.to_coordinator_id = 'Target coordinator must be different from source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/rsbsa/coordinator-beneficiaries/transfer', {
        from_coordinator_id: parseInt(form.from_coordinator_id),
        to_coordinator_id: parseInt(form.to_coordinator_id)
      });

      const fromCoord = coordinators.find(c => c.id === parseInt(form.from_coordinator_id));
      const toCoord = coordinators.find(c => c.id === parseInt(form.to_coordinator_id));

      setSuccessInfo({
        transferred_count: response.data.data?.transferred_count || 0,
        from_coordinator: fromCoord ? `${fromCoord.fname} ${fromCoord.lname}` : 'Unknown',
        to_coordinator: toCoord ? `${toCoord.fname} ${toCoord.lname}` : 'Unknown',
        from_sector: fromCoord?.sector_name || 'Unknown',
        to_sector: toCoord?.sector_name || 'Unknown',
        transferredAt: new Date().toLocaleString()
      });

      if (onSuccess) onSuccess(response.data);

    } catch (error) {
      console.error('Transfer error:', error);

      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'An error occurred during the transfer. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getCoordinatorDisplay = (coordinator) => {
    return `${coordinator.fname} ${coordinator.lname} (${coordinator.sector_name || 'No Sector'})`;
  };

  const fromCoordinator = coordinators.find(c => c.id === parseInt(form.from_coordinator_id));
  const toCoordinator = coordinators.find(c => c.id === parseInt(form.to_coordinator_id));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SwapHoriz color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {successInfo ? 'Transfer Completed Successfully!' : 'Transfer Beneficiaries'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        {successInfo && (
          <Box sx={{ mb: 2 }}>
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Beneficiaries Transferred Successfully!
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h6" color="primary">
                      {successInfo.transferred_count} beneficiaries transferred
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">From:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {successInfo.from_coordinator}
                    </Typography>
                    <Chip label={successInfo.from_sector} size="small" color="default" />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">To:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {successInfo.to_coordinator}
                    </Typography>
                    <Chip label={successInfo.to_sector} size="small" color="primary" />
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="caption" color="text.secondary" display="block">
                Transfer completed on: {successInfo.transferredAt}
              </Typography>
            </Alert>
          </Box>
        )}

        {!successInfo && (
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12}>
              <Alert severity="info" icon={<Warning />}>
                This will transfer ALL beneficiaries from the source coordinator to the target coordinator. 
                Both coordinators must be in the same sector.
              </Alert>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.from_coordinator_id}>
                <InputLabel id="from-coordinator-label">From Coordinator</InputLabel>
                <Select
                  labelId="from-coordinator-label"
                  label="From Coordinator"
                  name="from_coordinator_id"
                  value={form.from_coordinator_id}
                  onChange={handleChange}
                >
                  {inactiveCoordinators.length > 0 && [
                    <MenuItem key="inactive-header" disabled>
                      <Typography variant="body2" color="text.secondary">
                        Inactive Coordinators
                      </Typography>
                    </MenuItem>,
                    ...inactiveCoordinators.map((coordinator) => (
                      <MenuItem key={coordinator.id} value={coordinator.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getCoordinatorDisplay(coordinator)}
                          <Chip label="Inactive" size="small" color="error" />
                        </Box>
                      </MenuItem>
                    )),
                    <Divider key="divider" />
                  ]}
                  
                  {activeCoordinators.length > 0 && [
                    <MenuItem key="active-header" disabled>
                      <Typography variant="body2" color="text.secondary">
                        Active Coordinators
                      </Typography>
                    </MenuItem>,
                    ...activeCoordinators.map((coordinator) => (
                      <MenuItem key={coordinator.id} value={coordinator.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getCoordinatorDisplay(coordinator)}
                          <Chip label="Active" size="small" color="success" />
                        </Box>
                      </MenuItem>
                    ))
                  ]}
                </Select>
                {errors.from_coordinator_id && (
                  <Typography variant="caption" color="error">
                    {errors.from_coordinator_id}
                  </Typography>
                )}
                {beneficiaryCount > 0 && form.from_coordinator_id && (
                  <Typography variant="caption" color="primary" sx={{ mt: 1 }}>
                    This coordinator has {beneficiaryCount} beneficiaries to transfer
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.to_coordinator_id}>
                <InputLabel id="to-coordinator-label">To Coordinator</InputLabel>
                <Select
                  labelId="to-coordinator-label"
                  label="To Coordinator"
                  name="to_coordinator_id"
                  value={form.to_coordinator_id}
                  onChange={handleChange}
                >
                  {activeCoordinators
                    .filter(c => fromCoordinator ? c.sector_id === fromCoordinator.sector_id : true)
                    .filter(c => c.id !== parseInt(form.from_coordinator_id))
                    .map((coordinator) => (
                    <MenuItem key={coordinator.id} value={coordinator.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getCoordinatorDisplay(coordinator)}
                        <Chip label="Active" size="small" color="success" />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.to_coordinator_id && (
                  <Typography variant="caption" color="error">
                    {errors.to_coordinator_id}
                  </Typography>
                )}
                {fromCoordinator && toCoordinator && fromCoordinator.sector_id !== toCoordinator.sector_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    Warning: Coordinators are in different sectors
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {fromCoordinator && toCoordinator && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>Transfer Summary:</Typography>
                  <Typography variant="body2">
                    Transfer {beneficiaryCount || '?'} beneficiaries from{' '}
                    <strong>{fromCoordinator.fname} {fromCoordinator.lname}</strong>{' '}
                    ({fromCoordinator.sector_name}) to{' '}
                    <strong>{toCoordinator.fname} {toCoordinator.lname}</strong>{' '}
                    ({toCoordinator.sector_name})
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        {successInfo ? (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading || !form.from_coordinator_id || !form.to_coordinator_id}
              startIcon={loading ? <CircularProgress size={20} /> : <SwapHoriz />}
            >
              {loading ? 'Transferring...' : `Transfer ${beneficiaryCount || ''} Beneficiaries`}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

TransferBeneficiariesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  coordinators: PropTypes.array.isRequired
};

export default TransferBeneficiariesModal;
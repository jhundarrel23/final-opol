import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../../api/axiosInstance';
import { CheckCircle, Email, Person, Edit, VpnKey } from '@mui/icons-material';

const EditCoordinatorModal = ({ open, onClose, onSubmit, coordinator, sectorOptions }) => {
  // Debug log to check sectorOptions
  console.log('🎯 EditModal sectorOptions received:', sectorOptions);
  console.log('📋 Modal open state:', open);
  console.log('👤 Coordinator data:', coordinator);

  const [form, setForm] = useState({
    fname: '',
    mname: '',
    lname: '',
    username: '',
    email: '',
    sector_id: '',
    force_password_reset: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  // Populate form when coordinator prop changes
  useEffect(() => {
    if (coordinator) {
      setForm({
        fname: coordinator.fname || '',
        mname: coordinator.mname || '',
        lname: coordinator.lname || '',
        username: coordinator.username || '',
        email: coordinator.email || '',
        sector_id: coordinator.sector_id || '',
        force_password_reset: false // Reset this to false for edits
      });
    }
  }, [coordinator]);

  const resetForm = () => {
    setForm({
      fname: '',
      mname: '',
      lname: '',
      username: '',
      email: '',
      sector_id: '',
      force_password_reset: false
    });
    setErrors({});
    setSuccessInfo(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fname.trim()) newErrors.fname = 'First name is required';
    if (!form.lname.trim()) newErrors.lname = 'Last name is required';
    // Username and email validation removed since they're read-only
    // Sector is optional - coordinators can be unassigned

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleSubmit = async () => {
    if (!validate() || !coordinator) return;

    setLoading(true);

    try {
      const payload = {
        fname: form.fname,
        mname: form.mname,
        lname: form.lname,
        username: form.username,
        email: form.email,
        sector_id: form.sector_id || null, 
        force_password_reset: form.force_password_reset
      };

      if (form.force_password_reset) {
        payload.password = generatePassword();
      }

      const response = await axiosInstance.put(`/api/coordinators/${coordinator.id}`, payload);

      // Enhanced success info with more details
      setSuccessInfo({
        coordinatorId: coordinator.id,
        email: form.email,
        username: form.username,
        fullName: `${form.fname} ${form.mname ? form.mname + ' ' : ''}${form.lname}`,
        sectorName: form.sector_id ? 
          sectorOptions.find(s => s.value === form.sector_id)?.label : 
          'No sector assignment',
        sectorAction: form.sector_id ? 'assigned' : 'removed',
        force_password_reset: form.force_password_reset,
        updatedAt: new Date().toLocaleString()
      });

      if (onSubmit) onSubmit(response.data);

      // Don't reset form immediately - let user see success message
    } catch (error) {
      console.error('API submission error:', error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getCurrentSectorName = () => {
    if (!coordinator?.sector_id) return 'No sector assigned';
    const sector = sectorOptions.find(s => s.value === coordinator.sector_id);
    return sector?.label || 'Unknown sector';
  };

  const getFullName = () => {
    if (!coordinator) return '';
    return `${coordinator.fname || ''} ${coordinator.mname ? coordinator.mname + ' ' : ''}${coordinator.lname || ''}`.trim();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Edit color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {successInfo ? 'Coordinator Updated Successfully!' : `Edit Coordinator: ${getFullName()}`}
          </Typography>
        </Box>
        {!successInfo && coordinator && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current Sector: {getCurrentSectorName()}
          </Typography>
        )}
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
                Coordinator Account Updated Successfully!
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person fontSize="small" />
                    <Typography variant="body2">
                      <strong>Name:</strong> {successInfo.fullName}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="body2">
                      <strong>Username:</strong> {successInfo.username}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Email fontSize="small" />
                    <Typography variant="body2">
                      <strong>Email:</strong> {successInfo.email}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="body2">
                      <strong>Sector:</strong> {successInfo.sectorName}
                    </Typography>
                    <Chip
                      label={successInfo.sectorAction === 'assigned' ? 'Assigned' : 'Removed'}
                      color={successInfo.sectorAction === 'assigned' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
                
                {successInfo.force_password_reset && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <VpnKey fontSize="small" />
                      <Typography variant="body2">
                        <strong>Password:</strong>
                      </Typography>
                      <Chip
                        label="Reset Required"
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 1 }} />
              
              {successInfo.force_password_reset && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    📧 A new temporary password has been sent to <strong>{successInfo.email}</strong>
                  </Typography>
                  
                  <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                    ⚠️ The coordinator will be required to reset their password on next login.
                  </Typography>
                </>
              )}
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Updated on: {successInfo.updatedAt}
              </Typography>
            </Alert>
          </Box>
        )}

        {!successInfo && (
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="fname"
                value={form.fname}
                onChange={handleChange}
                error={!!errors.fname}
                helperText={errors.fname}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="mname"
                value={form.mname}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="lname"
                value={form.lname}
                onChange={handleChange}
                error={!!errors.lname}
                helperText={errors.lname}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Username"
                name="username"
                value={form.username}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    cursor: 'not-allowed'
                  }
                }}
                helperText="Username cannot be changed after account creation"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={form.email}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    cursor: 'not-allowed'
                  }
                }}
                helperText="Email cannot be changed after account creation"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.sector_id}>
                <InputLabel id="sector-label">Sector Assignment</InputLabel>
                <Select
                  labelId="sector-label"
                  label="Sector Assignment"
                  name="sector_id"
                  value={form.sector_id}
                  onChange={handleChange}
                >
                  {/* Option to remove from sector */}
                  <MenuItem value="">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography color="text.secondary">No Sector (Remove Assignment)</Typography>
                    </Box>
                  </MenuItem>
                  
                  <Divider />
                  
                  {/* Available sectors */}
                  {sectorOptions.map((sector) => (
                    <MenuItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </MenuItem>
                  ))}
                </Select>
                
                {/* Helper text */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  {form.sector_id ? 
                    `Coordinator will be assigned to: ${sectorOptions.find(s => s.value === form.sector_id)?.label || 'Selected sector'}` :
                    'Coordinator will be removed from all sector assignments'
                  }
                </Typography>
                
                {errors.sector_id && (
                  <Typography variant="caption" color="error">
                    {errors.sector_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.force_password_reset}
                    onChange={handleChange}
                    name="force_password_reset"
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">
                      Reset password and require new login
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Check this to generate a new temporary password and force the coordinator to reset it on next login.
                    </Typography>
                  </Box>
                }
              />
            </Grid>
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
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Updating...' : 'Update Coordinator'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

EditCoordinatorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  coordinator: PropTypes.object, // The coordinator to edit
  sectorOptions: PropTypes.array.isRequired
};

// Ensure proper default export
export default EditCoordinatorModal;
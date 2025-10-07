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
import { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../../api/axiosInstance';
import { CheckCircle, Email, Person, VpnKey } from '@mui/icons-material';

const AddCoordinatorModal = ({ open, onClose, onSubmit, sectorOptions }) => {
  const [form, setForm] = useState({
    fname: '',
    mname: '',
    lname: '',
    username: '',
    email: '',
    sector_id: '',
    force_password_reset: true // Default to true for security
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const resetForm = () => {
    setForm({
      fname: '',
      mname: '',
      lname: '',
      username: '',
      email: '',
      sector_id: '',
      force_password_reset: true
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
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.sector_id) newErrors.sector_id = 'Sector is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const generatedPassword = generatePassword();
    setLoading(true);

    try {
      const payload = {
        fname: form.fname,
        mname: form.mname,
        lname: form.lname,
        username: form.username,
        email: form.email,
        password: generatedPassword,
        sector_id: form.sector_id,
        force_password_reset: form.force_password_reset
      };

      const response = await axiosInstance.post('/api/coordinators', payload);

      // Enhanced success info with more details
      setSuccessInfo({
        coordinatorId: response.data.data?.id,
        email: form.email,
        username: form.username,
        fullName: `${form.fname} ${form.mname ? form.mname + ' ' : ''}${form.lname}`,
        sectorName: sectorOptions.find(s => s.value === form.sector_id)?.label,
        force_password_reset: form.force_password_reset,
        createdAt: new Date().toLocaleString()
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

  const handleCreateAnother = () => {
    resetForm();
    // Keep modal open for creating another coordinator
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Person color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {successInfo ? 'Coordinator Created Successfully!' : 'Add New Coordinator'}
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
                Coordinator Account Created Successfully!
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
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <VpnKey fontSize="small" />
                    <Typography variant="body2">
                      <strong>Password Status:</strong>
                    </Typography>
                    <Chip
                      label={successInfo.force_password_reset ? "Reset Required" : "Active"}
                      color={successInfo.force_password_reset ? "warning" : "success"}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="body2" color="text.secondary">
                📧 A temporary password has been sent to <strong>{successInfo.email}</strong>
              </Typography>
              
              {successInfo.force_password_reset && (
                <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                  ⚠️ The coordinator will be required to reset their password on first login.
                </Typography>
              )}
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Created on: {successInfo.createdAt}
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
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
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
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.sector_id}>
                <InputLabel id="sector-label">Sector</InputLabel>
                <Select
                  labelId="sector-label"
                  label="Sector"
                  name="sector_id"
                  value={form.sector_id}
                  onChange={handleChange}
                >
                  {sectorOptions.map((sector) => (
                    <MenuItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </MenuItem>
                  ))}
                </Select>
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
                      Require password reset on first login
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recommended for security. Coordinator will be prompted to create a new password.
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
          <>
            <Button onClick={handleCreateAnother} variant="outlined" color="primary">
              Create Another
            </Button>
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coordinator'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

AddCoordinatorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  sectorOptions: PropTypes.array.isRequired
};

export default AddCoordinatorModal;
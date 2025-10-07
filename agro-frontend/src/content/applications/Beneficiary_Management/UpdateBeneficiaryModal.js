/* eslint-disable no-unused-vars */
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
  Box,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../../api/axiosInstance';
import { Person, Email, VpnKey, Security, LocationOn } from '@mui/icons-material';

const UpdateBeneficiaryModal = ({ open, onClose, onSubmit, beneficiary }) => {
  const [form, setForm] = useState({
    // User account fields
    fname: '',
    mname: '',
    lname: '',
    extension_name: '',
    username: '',
    email: '',
    role: 'beneficiary',
    status: 'active',
    
    // Password fields
    password: '',
    password_confirmation: '',
    
    // Beneficiary detail fields
    barangay: '',
    municipality: '',
    province: '',
    contact_number: '',
    birth_date: '',
    sex: '',
    civil_status: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatePassword, setUpdatePassword] = useState(false);

  // Initialize form with beneficiary data when modal opens
  useEffect(() => {
    if (beneficiary && open) {
      // Handle both camelCase and snake_case property names from API
      const beneficiaryDetail = beneficiary.beneficiary_detail || beneficiary.beneficiaryDetail;
      
      setForm({
        // User fields
        fname: beneficiary.fname || '',
        mname: beneficiary.mname || '',
        lname: beneficiary.lname || '',
        extension_name: beneficiary.extension_name || '',
        username: beneficiary.username || '',
        email: beneficiary.email || '',
        role: beneficiary.role || 'beneficiary',
        status: beneficiary.status || 'active',
        
        // Reset password fields
        password: '',
        password_confirmation: '',
        
        // Beneficiary detail fields
        barangay: beneficiaryDetail?.barangay || '',
        municipality: beneficiaryDetail?.municipality || '',
        province: beneficiaryDetail?.province || '',
        contact_number: beneficiaryDetail?.contact_number || '',
        birth_date: beneficiaryDetail?.birth_date || '',
        sex: beneficiaryDetail?.sex || '',
        civil_status: beneficiaryDetail?.civil_status || ''
      });
      setErrors({});
      setUpdatePassword(false);
    }
  }, [beneficiary, open]);

  const resetForm = () => {
    setForm({
      fname: '',
      mname: '',
      lname: '',
      extension_name: '',
      username: '',
      email: '',
      role: 'beneficiary',
      status: 'active',
      password: '',
      password_confirmation: '',
      barangay: '',
      municipality: '',
      province: '',
      contact_number: '',
      birth_date: '',
      sex: '',
      civil_status: ''
    });
    setErrors({});
    setUpdatePassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fname.trim()) newErrors.fname = 'First name is required';
    if (!form.lname.trim()) newErrors.lname = 'Last name is required';
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only if updating password)
    if (updatePassword) {
      if (!form.password || form.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (form.password !== form.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Prepare user account payload
      const userPayload = {
        fname: form.fname,
        mname: form.mname,
        lname: form.lname,
        extension_name: form.extension_name,
        username: form.username,
        email: form.email,
        role: form.role,
        status: form.status
      };

      // Add password only if updating
      if (updatePassword && form.password) {
        userPayload.password = form.password;
        userPayload.password_confirmation = form.password_confirmation;
      }

      console.log('Updating user with payload:', userPayload);

      // Update user account using the new API endpoint
      const userResponse = await axiosInstance.put(`/api/admin/users/${beneficiary.id}`, userPayload);
      
      if (!userResponse.data.success) {
        throw new Error(userResponse.data.message || 'Failed to update user');
      }

      console.log('User update successful:', userResponse.data);

      // Update beneficiary details if any beneficiary info exists and user has beneficiary details
      const beneficiaryDetail = beneficiary.beneficiary_detail || beneficiary.beneficiaryDetail;
      const hasBeneficiaryFields = form.barangay || form.municipality || form.contact_number || 
                                   form.birth_date || form.sex || form.civil_status;
      
      if (beneficiaryDetail && hasBeneficiaryFields) {
        const beneficiaryPayload = {
          barangay: form.barangay,
          municipality: form.municipality,
          province: form.province,
          contact_number: form.contact_number,
          birth_date: form.birth_date,
          sex: form.sex,
          civil_status: form.civil_status
        };
        
        console.log('Updating beneficiary details with payload:', beneficiaryPayload);
        
        const beneficiaryResponse = await axiosInstance.put(
          `/api/admin/users/${beneficiary.id}/beneficiary`, 
          beneficiaryPayload
        );
        
        if (!beneficiaryResponse.data.success) {
          console.warn('Beneficiary details update failed:', beneficiaryResponse.data.message);
          // Don't throw error here as user account was updated successfully
        } else {
          console.log('Beneficiary details update successful:', beneficiaryResponse.data);
        }
      }

      // Call success callback
      if (onSubmit) onSubmit({ success: true });
      handleClose();

    } catch (error) {
      console.error('API submission error:', error);

      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response?.data?.errors) {
 
        setErrors(error.response.data.errors);
        return; 
      } if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!beneficiary) return null;

  const beneficiaryName = `${beneficiary.fname || ''} ${beneficiary.lname || ''}`.trim();
  
  // Handle both possible property names for beneficiary details
  const beneficiaryDetail = beneficiary.beneficiary_detail || beneficiary.beneficiaryDetail;
  const rsbsaNumber = beneficiaryDetail?.system_generated_rsbsa_number || 
                     beneficiaryDetail?.manual_rsbsa_number || 'N/A';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Person color="primary" />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Update User Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {beneficiaryName} ({beneficiary.role?.toUpperCase()})
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {errors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.general}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Account Information Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Person color="primary" />
                  <Typography variant="h6">Account Information</Typography>
                </Box>
                
                <Grid container spacing={2}>
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
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Extension Name"
                      name="extension_name"
                      value={form.extension_name}
                      onChange={handleChange}
                      placeholder="Jr., Sr., III, etc."
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.role}>
                      <InputLabel>Role</InputLabel>
                      <Select
                        label="Role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                      >
                        <MenuItem value="beneficiary">Beneficiary</MenuItem>
                        <MenuItem value="coordinator">Coordinator</MenuItem>
                      </Select>
                      {errors.role && (
                        <Typography variant="caption" color="error">
                          {errors.role}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth required error={!!errors.status}>
                      <InputLabel>Account Status</InputLabel>
                      <Select
                        label="Account Status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                     \
                      </Select>
                      {errors.status && (
                        <Typography variant="caption" color="error">
                          {errors.status}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Login Credentials Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Security color="primary" />
                  <Typography variant="h6">Login Credentials</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  <Grid item xs={12} sm={6}>
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
                    <FormControlLabel
                      control={
                        <Switch
                          checked={updatePassword}
                          onChange={(e) => setUpdatePassword(e.target.checked)}
                        />
                      }
                      label="Update Password"
                    />
                  </Grid>
                  {updatePassword && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          label="New Password"
                          name="password"
                          type="password"
                          value={form.password}
                          onChange={handleChange}
                          error={!!errors.password}
                          helperText={errors.password}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          required
                          label="Confirm Password"
                          name="password_confirmation"
                          type="password"
                          value={form.password_confirmation}
                          onChange={handleChange}
                          error={!!errors.password_confirmation}
                          helperText={errors.password_confirmation}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Beneficiary Details Card - Only show if user has beneficiary details */}
          {beneficiaryDetail && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <LocationOn color="primary" />
                    <Typography variant="h6">Beneficiary Information</Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Barangay"
                        name="barangay"
                        value={form.barangay}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Municipality"
                        name="municipality"
                        value={form.municipality}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Province"
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Contact Number"
                        name="contact_number"
                        value={form.contact_number}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Birth Date"
                        name="birth_date"
                        type="date"
                        value={form.birth_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Sex</InputLabel>
                        <Select
                          label="Sex"
                          name="sex"
                          value={form.sex}
                          onChange={handleChange}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Civil Status</InputLabel>
                        <Select
                          label="Civil Status"
                          name="civil_status"
                          value={form.civil_status}
                          onChange={handleChange}
                        >
                          <MenuItem value="single">Single</MenuItem>
                          <MenuItem value="married">Married</MenuItem>
                          <MenuItem value="widowed">Widowed</MenuItem>
                          <MenuItem value="separated">Separated</MenuItem>
                          <MenuItem value="divorced">Divorced</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Updating...' : 'Update User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UpdateBeneficiaryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  beneficiary: PropTypes.object
};

export default UpdateBeneficiaryModal;
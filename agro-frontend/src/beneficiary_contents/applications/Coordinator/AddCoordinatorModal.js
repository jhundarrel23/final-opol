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
  Alert
} from '@mui/material';
import { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../../api/axiosInstance';

const AddCoordinatorModal = ({ open, onClose, onSubmit, sectorOptions }) => {
  const [form, setForm] = useState({
    fname: '',
    mname: '',
    lname: '',
    username: '',
    email: '',
    sector_id: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

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
    if (!form.sector_id) newErrors.sector_id = 'Sector is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
        sector_id: form.sector_id
      };

      const response = await axiosInstance.post('/api/coordinators', payload);

      if (onSubmit) onSubmit(response.data);

      setSuccessInfo({
        email: form.email,
        username: form.username
      });

      setForm({
        fname: '',
        mname: '',
        lname: '',
        username: '',
        email: '',
        sector_id: ''
      });
      setErrors({});
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      fname: '',
      mname: '',
      lname: '',
      username: '',
      email: '',
      sector_id: ''
    });
    setErrors({});
    setSuccessInfo(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" fontWeight="bold">
          Add New Coordinator
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {successInfo && (
          <Alert severity="success" sx={{ mb: 2 }}>
                Coordinator created successfully!
                <br />
                <strong>Username:</strong> {successInfo.username}
                <br />
                <strong>Email:</strong> {successInfo.email}
                <br />
                Temporary password has been sent to the provided email.
            </Alert>

        )}

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
              <InputLabel>S1ector</InputLabel>
              <Select
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
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {successInfo ? 'Close' : 'Cancel'}
        </Button>
        {!successInfo && (
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
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

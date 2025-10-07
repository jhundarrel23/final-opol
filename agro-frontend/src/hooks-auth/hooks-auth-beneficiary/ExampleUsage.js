import React from 'react';
import { Box, Typography, Paper, Button, TextField, Alert } from '@mui/material';
import useLoginBeneficiary from './useLoginBeneficiary';
import useBeneficiaryData from './useBeneficiaryData';

// Example component showing how to use both hooks
const ExampleUsage = () => {
  const {
    formData,
    handleChange,
    handleLogin,
    error,
    success,
    isLoading
  } = useLoginBeneficiary();

  const {
    beneficiaryId,
    rsbsaNumber,
    beneficiaryDetails,
    hasBeneficiaryData,
    getRSBSANumber,
    refreshBeneficiaryData
  } = useBeneficiaryData();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Beneficiary Authentication Example
      </Typography>

      {/* Login Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Login Form
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username or Email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ mt: 2 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>

      {/* Beneficiary Data Display */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Beneficiary Data
        </Typography>
        
        {hasBeneficiaryData() ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>Beneficiary ID:</strong> {beneficiaryId}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              <strong>RSBSA Number:</strong> {getRSBSANumber()}
            </Typography>
            
            {beneficiaryDetails && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Personal Details:</strong>
                </Typography>
                <Typography variant="body2">
                  Name: {beneficiaryDetails.fname} {beneficiaryDetails.lname}
                </Typography>
                <Typography variant="body2">
                  Contact: {beneficiaryDetails.contact_number || 'Not provided'}
                </Typography>
                <Typography variant="body2">
                  Barangay: {beneficiaryDetails.barangay || 'Not provided'}
                </Typography>
                <Typography variant="body2">
                  Municipality: {beneficiaryDetails.municipality || 'Not provided'}
                </Typography>
              </Box>
            )}
            
            <Button
              variant="outlined"
              onClick={refreshBeneficiaryData}
              sx={{ mt: 2 }}
            >
              Refresh Data
            </Button>
          </Box>
        ) : (
          <Alert severity="info">
            No beneficiary data available. Please log in to see your information.
          </Alert>
        )}
      </Paper>

      {/* Data Storage Information */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Storage Information
        </Typography>
        
        <Typography variant="body2" paragraph>
          After successful login, the following data is automatically stored in localStorage:
        </Typography>
        
        <Box component="ul" sx={{ pl: 2 }}>
          <li><strong>beneficiaryId:</strong> Unique identifier for the beneficiary</li>
          <li><strong>rsbsaNumber:</strong> RSBSA number (system generated or manual)</li>
          <li><strong>beneficiaryDetails:</strong> Complete beneficiary profile</li>
          <li><strong>token:</strong> Authentication token</li>
          <li><strong>user:</strong> User authentication data</li>
          <li><strong>userRole:</strong> User role (beneficiary)</li>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          This data is automatically cleared on logout to ensure security.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ExampleUsage;


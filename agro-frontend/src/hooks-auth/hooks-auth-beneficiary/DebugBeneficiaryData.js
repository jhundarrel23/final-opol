import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import useBeneficiaryData from './useBeneficiaryData';

const DebugBeneficiaryData = () => {
  const {
    beneficiaryId,
    rsbsaNumber,
    beneficiaryDetails,
    hasBeneficiaryData,
    getRSBSANumber,
    getBeneficiaryId,
    refreshBeneficiaryData
  } = useBeneficiaryData();

  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const beneficiaryIdStorage = localStorage.getItem('beneficiaryId');
    const beneficiaryDetailsStorage = localStorage.getItem('beneficiaryDetails');
    const rsbsaNumberStorage = localStorage.getItem('rsbsaNumber');

    return {
      token: token ? 'Present' : 'Missing',
      user: user ? 'Present' : 'Missing',
      beneficiaryId: beneficiaryIdStorage || 'Missing',
      beneficiaryDetails: beneficiaryDetailsStorage ? 'Present' : 'Missing',
      rsbsaNumber: rsbsaNumberStorage || 'Missing'
    };
  };

  const localStorageData = checkLocalStorage();

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Debug: Beneficiary Data State
      </Typography>

      {/* Current Hook State */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hook State
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>beneficiaryId:</strong> {beneficiaryId || 'null'}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>rsbsaNumber:</strong> {rsbsaNumber || 'null'}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>hasBeneficiaryData():</strong> {hasBeneficiaryData() ? 'true' : 'false'}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>getBeneficiaryId():</strong> {getBeneficiaryId() || 'null'}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>getRSBSANumber():</strong> {getRSBSANumber()}
        </Typography>
        
        <Button
          variant="outlined"
          onClick={refreshBeneficiaryData}
          sx={{ mt: 2 }}
        >
          Refresh Data
        </Button>
      </Paper>

      {/* LocalStorage State */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          LocalStorage State
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Token:</strong> {localStorageData.token}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>User:</strong> {localStorageData.user}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Beneficiary ID:</strong> {localStorageData.beneficiaryId}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>Beneficiary Details:</strong> {localStorageData.beneficiaryDetails}
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          <strong>RSBSA Number:</strong> {localStorageData.rsbsaNumber}
        </Typography>
      </Paper>

      {/* Raw Data Display */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Raw Data
        </Typography>
        
        <Typography variant="body2" component="pre"
sx={{ 
          backgroundColor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
          {JSON.stringify({
            beneficiaryId,
            rsbsaNumber,
            beneficiaryDetails,
            localStorage: localStorageData
          }, null, 2)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default DebugBeneficiaryData;


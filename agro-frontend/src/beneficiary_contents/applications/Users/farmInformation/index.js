/* eslint-disable no-unused-vars */
import React from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import useFarmInformation from './useFarmInformation';
import FarmInformationView from './FarmInformationView'; // ✅ Fixed import

export default function FarmInformationPage() {
  // Get user ID from localStorage
  let storedUser = {};
  try { 
    storedUser = JSON.parse(localStorage.getItem('user')) || {}; 
  } catch { 
    storedUser = {}; 
  }
  const userId = storedUser?.id || storedUser?.user_id;

  const {
    farmParcels,
    totalArea,
    totalCommodities,
    hasData,
    loading,
    error,
    refreshing,
    refresh,
   
  } = useFarmInformation(userId);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <FarmInformationView 
        farmParcels={farmParcels}
        totalArea={totalArea}
        totalCommodities={totalCommodities}
        hasData={hasData}
        onRefresh={refresh}
        refreshing={refreshing}
      />
    </Box>
  );
}
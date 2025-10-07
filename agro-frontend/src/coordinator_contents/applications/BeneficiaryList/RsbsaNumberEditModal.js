import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axiosInstance from '../../../api/axiosInstance';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: '500px',
    maxWidth: '600px'
  }
}));

const StatusCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  border: `2px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(2),
  '&.assigned': {
    borderColor: theme.palette.success.main,
    backgroundColor: theme.palette.success.light + '10'
  },
  '&.pending': {
    borderColor: theme.palette.warning.main,
    backgroundColor: theme.palette.warning.light + '10'
  }
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  width: '100%'
}));

function RsbsaNumberEditModal({ 
  open, 
  onClose, 
  beneficiary, 
  onSuccess,
  onError 
}) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [rsbsaNumber, setRsbsaNumber] = useState('');
  const [isValidNumber, setIsValidNumber] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [error, setError] = useState('');
  const [showOverwritePrompt, setShowOverwritePrompt] = useState(false);

  useEffect(() => {
    if (open && beneficiary) {
      // Initialize with existing RSBSA number
      setRsbsaNumber(beneficiary.rsbsaNumber || '');
      setError('');
      setIsValidNumber(null);
      setValidationMessage('');
      setShowOverwritePrompt(false);
    }
  }, [open, beneficiary]);

  // Check RSBSA number availability
  const checkRsbsaAvailability = async (number) => {
    const cleaned = (number || '').trim();
    if (!cleaned || cleaned.length < 3) {
      setIsValidNumber(null);
      setValidationMessage('');
      setError('');
      setShowOverwritePrompt(false);
      return;
    }

    // If it's the same as current number, skip check
    if (beneficiary?.rsbsaNumber && cleaned === beneficiary.rsbsaNumber) {
      setIsValidNumber(true);
      setValidationMessage('✅ Current RSBSA number');
      return;
    }

    setChecking(true);
    try {
      const encoded = encodeURIComponent(cleaned);
      const response = await axiosInstance.get(`/api/admin/rsbsa-numbers/check/${encoded}`);
      
      if (response.data.success) {
        setIsValidNumber(response.data.available);
        setValidationMessage(
          response.data.available 
            ? `✅ RSBSA number is available` 
            : `❌ RSBSA number is already assigned`
        );
      }
    } catch (err) {
      setIsValidNumber(false);
      setValidationMessage('❌ Error checking RSBSA number availability');
    } finally {
      setChecking(false);
    }
  };

  // Debounced check
  useEffect(() => {
    const timer = setTimeout(() => {
      checkRsbsaAvailability(rsbsaNumber);
    }, 800);

    return () => clearTimeout(timer);
  }, [rsbsaNumber]);

  const handleSubmit = async (forceOverwrite = false) => {
    const trimmed = rsbsaNumber.trim();
    
    if (!trimmed) {
      setError('RSBSA number is required');
      return;
    }

    if (isValidNumber === false && !forceOverwrite) {
      setError('Please use an available RSBSA number or click overwrite');
      setShowOverwritePrompt(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const hasExisting = !!beneficiary?.rsbsaNumber;
      const endpoint = hasExisting
        ? `/api/admin/rsbsa-numbers/beneficiaries/${beneficiary.id}/update`
        : `/api/admin/rsbsa-numbers/beneficiaries/${beneficiary.id}/assign`;

      const response = await axiosInstance({
        method: hasExisting ? 'put' : 'post',
        url: endpoint,
        data: {
          rsbsa_number: trimmed,
          overwrite: forceOverwrite
        }
      });

      if (response.data?.success) {
        onSuccess?.({
          ...beneficiary,
          rsbsaNumber: trimmed
        });
        onClose();
      } else {
        setError(response.data?.message || 'Failed to save RSBSA number');
      }
    } catch (err) {
      const resp = err.response?.data;
      const code = resp?.code;
      
      if (code === 'ALREADY_HAS_RSBSA' || code === 'NUMBER_TAKEN') {
        setShowOverwritePrompt(true);
        setError(resp?.message || 'RSBSA number conflict. Overwrite?');
      } else {
        const message = resp?.message || 'An error occurred while saving the RSBSA number';
        setError(message);
        onError?.(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverwrite = () => {
    handleSubmit(true);
  };

  const handleCancel = () => {
    setShowOverwritePrompt(false);
    setError('');
  };

  const formatBeneficiaryName = (benef) => {
    const parts = [benef?.lastName, benef?.firstName, benef?.middleName].filter(Boolean);
    return parts.join(', ') || benef?.name || 'Unknown Beneficiary';
  };

  const hasRsbsa = !!beneficiary?.rsbsaNumber;

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <EditIcon color="primary" />
          <Typography variant="h6" color="text.primary">
            {hasRsbsa ? 'Edit' : 'Assign'} RSBSA Number
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {beneficiary && (
          <>
            {/* Beneficiary Info */}
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Beneficiary Details
              </Typography>
              <StatusCard className={hasRsbsa ? 'assigned' : 'pending'}>
                <Typography variant="h6" gutterBottom>
                  {formatBeneficiaryName(beneficiary)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reference Code: <strong>{beneficiary.systemGeneratedRsbaNumber || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Barangay: {beneficiary.streetPurokBarangay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact: {beneficiary.contactNo || 'N/A'}
                </Typography>
              </StatusCard>
            </Box>

            {/* Current Status */}
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current RSBSA Status
              </Typography>
              <Box display="flex" gap={1} mb={2}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={hasRsbsa ? 'Has RSBSA Number' : 'No RSBSA Number'}
                  color={hasRsbsa ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>
              
              {hasRsbsa && (
                <Typography variant="body2">
                  <strong>Current RSBSA:</strong> {beneficiary.rsbsaNumber}
                </Typography>
              )}
            </Box>

            {/* RSBSA Number Input */}
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                DA Official RSBSA Number
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter official DA RSBSA number (e.g., 01-02-030-004567-0001)"
                value={rsbsaNumber}
                onChange={(e) => setRsbsaNumber(e.target.value)}
                error={isValidNumber === false}
                helperText={validationMessage}
                InputProps={{
                  endAdornment: checking && (
                    <CircularProgress size={20} />
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: isValidNumber === true ? 'success.main' : undefined
                    }
                  }
                }}
              />
            </Box>

            {/* Guidelines */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Guidelines:</strong>
              </Typography>
              <Typography variant="body2" component="div">
                • Enter the official RSBSA number from DA's master list
              </Typography>
              <Typography variant="body2" component="div">
                • Format: Region-Province-Municipality-Barangay-Sequence
              </Typography>
              <Typography variant="body2" component="div">
                • This number will be used in all official reports
              </Typography>
            </Alert>

            {/* Error / Overwrite Prompt */}
            {error && (
              <Alert severity={showOverwritePrompt ? 'warning' : 'error'} sx={{ mb: 2 }}>
                {error}
                {showOverwritePrompt && (
                  <Box mt={1} display="flex" gap={1}>
                    <Button 
                      size="small" 
                      color="warning" 
                      variant="contained" 
                      onClick={handleOverwrite}
                      disabled={loading}
                    >
                      Overwrite
                    </Button>
                    <Button 
                      size="small" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <ActionButtons>
          <Button 
            onClick={onClose} 
            disabled={loading}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          
          <Button
            onClick={() => handleSubmit(false)}
            variant="contained"
            disabled={loading || !rsbsaNumber.trim() || (isValidNumber === false && !showOverwritePrompt)}
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Saving...' : (hasRsbsa ? 'Update' : 'Assign')}
          </Button>
        </ActionButtons>
      </DialogActions>
    </StyledDialog>
  );
}

RsbsaNumberEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  beneficiary: PropTypes.object,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default RsbsaNumberEditModal;
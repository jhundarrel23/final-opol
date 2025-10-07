import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Container,
  Stack,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle,
  Agriculture,
  Security
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import custom hook
import { useForcePasswordReset } from '../../hooks-auth/hooks-auth-coordinator/useForcePasswordReset';

/* ---------------------- Styled Components ---------------------- */
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 8,
  boxShadow: theme.shadows[3],
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: '2px solid #2e7d32',
}));

/* ---------------------- Password Strength Indicator ---------------------- */
const PasswordStrengthBar = ({ strength }) => {
  const getStrengthColor = () => {
    if (strength < 30) return '#f44336';
    if (strength < 60) return '#ff9800';
    if (strength < 85) return '#2196f3';
    return '#4caf50';
  };

  const getStrengthText = () => {
    if (strength < 30) return 'Weak';
    if (strength < 60) return 'Fair';
    if (strength < 85) return 'Good';
    return 'Strong';
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="caption" color="text.secondary">
          Password Strength: {getStrengthText()}
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          height: 4,
          backgroundColor: '#e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${strength}%`,
            height: '100%',
            backgroundColor: getStrengthColor(),
            transition: 'all 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
};

/* ---------------------- Success Component ---------------------- */
const SuccessView = () => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
    }}
  >
    <Container maxWidth="sm">
      <StyledPaper>
        <HeaderSection>
          <Avatar
            sx={{
              bgcolor: '#2e7d32',
              width: 80,
              height: 80,
              margin: '0 auto 16px',
            }}
          >
            <Agriculture sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="600" color="#2e7d32" gutterBottom>
            Municipal Agriculture Office
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Password Management System
          </Typography>
        </HeaderSection>

        <Box textAlign="center" py={3}>
          <CheckCircle sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="600" color="#4caf50">
            Password Reset Successful
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Your password has been updated successfully. You will be redirected to the dashboard shortly.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Redirecting...
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  </Box>
);

/* ---------------------- Form Component ---------------------- */
const FormView = ({
  formData,
  showPassword,
  loading,
  errors,
  passwordStrength,
  passwordsMatch,
  handleInputChange,
  handleSubmit,
  togglePasswordVisibility,
}) => (
  <Box
    sx={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
    }}
  >
    <Container maxWidth="sm">
      <StyledPaper>
        <HeaderSection>
          <Avatar
            sx={{
              bgcolor: '#2e7d32',
              width: 80,
              height: 80,
              margin: '0 auto 16px',
            }}
          >
            <Agriculture sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="600" color="#2e7d32" gutterBottom>
            Municipal Agriculture Office
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Password Reset Required
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For security reasons, please reset your password before continuing.
          </Typography>
        </HeaderSection>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* New Password Field */}
            <Box>
              <TextField
                fullWidth
                name="new_password"
                label="New Password"
                type={showPassword.new_password ? 'text' : 'password'}
                value={formData.new_password}
                onChange={handleInputChange}
                error={!!errors.new_password}
                helperText={errors.new_password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility('new_password')}>
                        {showPassword.new_password ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
              {formData.new_password && (
                <PasswordStrengthBar strength={passwordStrength} />
              )}
            </Box>

            {/* Confirm Password Field */}
            <Box>
              <TextField
                fullWidth
                name="new_password_confirmation"
                label="Confirm New Password"
                type={showPassword.confirmation ? 'text' : 'password'}
                value={formData.new_password_confirmation}
                onChange={handleInputChange}
                error={!!errors.new_password_confirmation}
                helperText={errors.new_password_confirmation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility('confirmation')}>
                        {showPassword.confirmation ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
              
              {formData.new_password_confirmation && (
                <Box display="flex" alignItems="center" mt={1}>
                  <CheckCircle
                    sx={{
                      fontSize: 16,
                      color: passwordsMatch ? '#4caf50' : '#f44336',
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={passwordsMatch ? 'success.main' : 'error.main'}
                  >
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#2e7d32',
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#1b5e20',
                },
                '&:disabled': {
                  backgroundColor: '#9e9e9e',
                },
              }}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </Button>

            {/* Security Information */}
            <Card
              sx={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #e9ecef',
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Box display="flex" alignItems="flex-start" gap={1.5}>
                  <Security sx={{ color: '#2e7d32', fontSize: 20, mt: 0.2 }} />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="#2e7d32"
                      fontWeight="600"
                      gutterBottom
                    >
                      Password Requirements:
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      • Minimum 8 characters long<br />
                      • Include uppercase and lowercase letters<br />
                      • Include at least one number<br />
                      • Use a unique password you haven't used before
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </StyledPaper>
    </Container>
  </Box>
);

/* ---------------------- Main Component ---------------------- */
const ForcePasswordReset = () => {
  const {
    // State
    formData,
    showPassword,
    loading,
    errors,
    success,
    
    // Derived values
    passwordStrength,
    passwordsMatch,
    
    // Handlers
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
  } = useForcePasswordReset();

  // Render success view if password reset was successful
  if (success) {
    return <SuccessView />;
  }

  // Render form view
  return (
    <FormView
      formData={formData}
      showPassword={showPassword}
      loading={loading}
      errors={errors}
      passwordStrength={passwordStrength}
      passwordsMatch={passwordsMatch}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      togglePasswordVisibility={togglePasswordVisibility}
    />
  );
};

export default ForcePasswordReset;
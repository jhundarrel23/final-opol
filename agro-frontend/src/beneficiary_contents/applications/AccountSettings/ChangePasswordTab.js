/* eslint-disable no-unused-vars */
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Alert,
  CardHeader,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
  LinearProgress,
  styled,
  Snackbar,
  Fade,
  Grow,
  Tooltip,
  Paper,
  AlertTitle,
  Collapse
} from '@mui/material';

import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockTwoTone as LockTwoToneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import useChangePasswordTab from './useChangePasswordTab';

// Styled Components
const ButtonPrimary = styled(Button)(
  ({ theme }) => `
    background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
    color: ${theme.palette.primary.contrastText};
    padding: ${theme.spacing(1.5, 3)};
    font-weight: 600;
    text-transform: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px ${theme.palette.primary.main}25;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    &:hover {
      background: linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px ${theme.palette.primary.main}35;

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      background: ${theme.palette.grey[300]};
      color: ${theme.palette.grey[500]};
      box-shadow: none;
      transform: none;

      &::before {
        display: none;
      }
    }
`
);

const ButtonSecondary = styled(Button)(
  ({ theme }) => `
    background: transparent;
    color: ${theme.palette.text.secondary};
    border: 2px solid ${theme.palette.grey[300]};
    padding: ${theme.spacing(1.5, 3)};
    font-weight: 600;
    text-transform: none;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: ${theme.palette.grey[50]};
      border-color: ${theme.palette.primary.main};
      color: ${theme.palette.primary.main};
      transform: translateY(-1px);
    }

    &:disabled {
      background: transparent;
      color: ${theme.palette.grey[400]};
      border-color: ${theme.palette.grey[200]};
      transform: none;
    }
`
);

const StyledCard = styled(Card)(
  ({ theme }) => `
    border-radius: 16px;
    box-shadow: 0 8px 32px ${theme.palette.grey[100]};
    border: 1px solid ${theme.palette.grey[100]};
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main});
    }

    &:hover {
      box-shadow: 0 12px 40px ${theme.palette.grey[150]};
      transform: translateY(-2px);
    }
`
);

const PasswordStrengthBar = styled(LinearProgress)(
  ({ theme, strengthcolor }) => `
    height: 8px;
    border-radius: 4px;
    background-color: ${theme.palette.grey[200]};
    
    & .MuiLinearProgress-bar {
      background: ${strengthcolor};
      border-radius: 4px;
      transition: all 0.3s ease;
    }
`
);

const GradientHeader = styled(Box)(
  ({ theme }) => `
    background: linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%);
    padding: ${theme.spacing(3)};
    border-radius: 16px 16px 0 0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, ${theme.palette.primary.main}50, transparent);
    }
`
);

function ChangePasswordTab({ userId }) {
  const {
    formData,
    showPasswords,
    loading,
    error,
    success,
    validationErrors,
    notification,
    handleInputChange,
    togglePasswordVisibility,
    changePassword,

    getPasswordStrength,
    isFormValid,
    hasFormData,
    hideNotification,
    clearMessages
  } = useChangePasswordTab();

  const strength = getPasswordStrength(formData.newPassword);

  const handleSubmit = (event) => {
    event.preventDefault();
    changePassword(userId);
  };

  const handleReset = () => {

    clearMessages();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleOutlineIcon />;
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={4}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Fade in timeout={800}>
            <Box mb={4}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 0.5 }}>
                    Change Password
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Keep your account secure with a strong, unique password
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Grid>

        {/* Main Form Card */}
        <Grid item xs={12} lg={8}>
          <Grow in timeout={1000}>
            <StyledCard>
              <GradientHeader>
                <Box display="flex" alignItems="center" gap={2}>
                  <ShieldIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Password Security Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your password to maintain account security
                    </Typography>
                  </Box>
                </Box>
              </GradientHeader>
              
              <Box p={4}>
                <Collapse in={!!error}>
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    icon={<ErrorIcon />}
                  >
                    <AlertTitle>Error</AlertTitle>
                    {error}
                  </Alert>
                </Collapse>
                
                <Collapse in={!!success}>
                  <Alert 
                    severity="success" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    icon={<CheckCircleIcon />}
                  >
                    <AlertTitle>Success!</AlertTitle>
                    {success}
                  </Alert>
                </Collapse>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Current Password */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleInputChange('currentPassword')}
                        error={!!validationErrors.currentPassword}
                        helperText={validationErrors.currentPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showPasswords.current ? 'Hide password' : 'Show password'}>
                                <IconButton
                                  onClick={() => togglePasswordVisibility('current')}
                                  edge="end"
                                  sx={{ 
                                    transition: 'all 0.2s ease',
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                >
                                  {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                        required
                      />
                    </Grid>
                    
                    {/* New Password */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange('newPassword')}
                        error={!!validationErrors.newPassword}
                        helperText={validationErrors.newPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showPasswords.new ? 'Hide password' : 'Show password'}>
                                <IconButton
                                  onClick={() => togglePasswordVisibility('new')}
                                  edge="end"
                                  sx={{ 
                                    transition: 'all 0.2s ease',
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                >
                                  {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                        required
                      />
                      
                      {/* Password Strength Indicator */}
                      <Fade in={!!formData.newPassword}>
                        <Box mt={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Password Strength
                            </Typography>
                            <Paper
                              sx={{
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: strength.color,
                                backgroundColor: `${strength.color}20`
                              }}
                            >
                              {strength.label}
                            </Paper>
                          </Box>
                          <PasswordStrengthBar
                            variant="determinate"
                            value={strength.percentage}
                            strengthcolor={strength.color}
                          />
                        </Box>
                      </Fade>
                    </Grid>
                    
                    {/* Confirm New Password */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        error={!!validationErrors.confirmPassword}
                        helperText={validationErrors.confirmPassword}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showPasswords.confirm ? 'Hide password' : 'Show password'}>
                                <IconButton
                                  onClick={() => togglePasswordVisibility('confirm')}
                                  edge="end"
                                  sx={{ 
                                    transition: 'all 0.2s ease',
                                    '&:hover': { transform: 'scale(1.1)' }
                                  }}
                                >
                                  {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          )
                        }}
                        required
                      />

                      {/* Password Match Indicator */}
                      <Fade in={!!(formData.newPassword && formData.confirmPassword)}>
                        <Box mt={2} display="flex" alignItems="center" gap={1}>
                          {formData.confirmPassword === formData.newPassword ? (
                            <>
                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                              <Typography variant="caption" color="success.main" fontWeight={600}>
                                Passwords match
                              </Typography>
                            </>
                          ) : (
                            <>
                              <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
                              <Typography variant="caption" color="error.main" fontWeight={600}>
                                Passwords don't match
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Fade>
                    </Grid>
                    
                    {/* Action Buttons */}
                    <Grid item xs={12}>
                      <Box 
                        display="flex" 
                        gap={2}
                        justifyContent={{ xs: 'stretch', sm: 'flex-end' }}
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        mt={2}
                      >
                       
                        <ButtonPrimary
                          type="submit"
                          disabled={loading || !isFormValid()}
                          startIcon={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <LockTwoToneIcon />
                            )
                          }
                          sx={{ minWidth: { xs: '100%', sm: 180 } }}
                        >
                          {loading ? 'Updating Password...' : 'Change Password'}
                        </ButtonPrimary>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </StyledCard>
          </Grow>
        </Grid>

        {/* Additional Security Info */}
        <Grid item xs={12}>
          <Fade in timeout={1400}>
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'info.light',
                backgroundColor: 'info.lighter'
              }}
              icon={<SecurityIcon />}
            >
              <AlertTitle>Security Notice</AlertTitle>
              After changing your password, you may be logged out of other devices for security. 
              You'll need to log in again with your new password.
            </Alert>
          </Fade>
        </Grid>
      </Grid>

      {/* Enhanced Notification System */}
      <Snackbar
        open={notification?.open || false}
        autoHideDuration={notification?.autoHide ? 6000 : null}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Grow}
      >
        <Alert 
          onClose={hideNotification} 
          severity={notification?.type || 'info'} 
          variant="filled" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem',
              fontWeight: 500
            }
          }}
          icon={getNotificationIcon(notification?.type || 'info')}
        >
          {notification?.message || ''}
        </Alert>
      </Snackbar>

      {/* Loading Overlay for Better UX */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(2px)'
          }}
        >
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              minWidth: 280,
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
            }}
          >
            <CircularProgress 
              size={50} 
              sx={{ mb: 2, color: 'primary.main' }} 
            />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Updating Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we secure your account...
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default ChangePasswordTab;

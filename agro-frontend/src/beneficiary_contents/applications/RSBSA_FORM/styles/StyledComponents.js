import { styled } from '@mui/material/styles';
import { Card, Stepper, Box } from '@mui/material';

// Styled components for modern design
export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)'
  }
}));

export const StyledStepper = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(3, 0),
  '& .MuiStepLabel-root': {
    '& .MuiStepLabel-iconContainer': {
      '& .MuiSvgIcon-root': {
        fontSize: '1.8rem',
        color: theme.palette.primary.main,
        '&.Mui-active': {
          color: theme.palette.primary.main,
        },
        '&.Mui-completed': {
          color: theme.palette.success.main,
        }
      }
    }
  }
}));

export const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${theme.palette.divider}`
}));

export const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`
}));

export const HeaderPaper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
  color: 'white',
  borderRadius: theme.spacing(2),
  elevation: 0
}));

export const InfoCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  elevation: 0
}));
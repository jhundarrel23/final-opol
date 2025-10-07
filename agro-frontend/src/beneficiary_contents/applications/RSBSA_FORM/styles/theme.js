// Theme constants and styles for RSBSA Form
export const formStyles = {
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    '& .MuiLinearProgress-bar': {
      borderRadius: 4
    }
  },
  
  submitButton: {
    minWidth: 200,
    py: 1.5,
    borderRadius: 2,
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },

  accordionHeader: {
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: '8px 8px 0 0',
    '&.Mui-expanded': {
      borderRadius: '8px 8px 0 0'
    }
  },

  sectionCard: {
    borderRadius: 2,
    '&:before': { display: 'none' },
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  },

  tabContainer: {
    borderBottom: 1,
    borderColor: 'divider',
    '& .MuiTab-root': {
      minHeight: 72,
      textTransform: 'none',
      fontSize: '0.95rem',
      fontWeight: 'medium'
    }
  }
};

export const colorScheme = {
  primary: '#2E7D32',
  secondary: '#4CAF50',
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
  info: '#42A5F5'
};

export const spacing = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6
};
import { useRoutes, useLocation } from 'react-router-dom';
import router from 'src/router';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { CssBaseline } from '@mui/material';
import ThemeProvider from './theme/ThemeProvider';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const content = useRoutes(router);
  const location = useLocation();
  
 
  const getUserRole = () => {
    if (location.pathname.includes('/dashboards/Admin') || 
        location.pathname.includes('/management/')) {
      return 'admin';
    }
    if (location.pathname.includes('/coordinator/')) {
      return 'coordinator';
    }
    if (location.pathname.includes('/beneficiary/')) {
      return 'beneficiary';
    }
    return 'coordinator'; // Default fallback
  };

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <NotificationProvider userRole={getUserRole()}>
          {content}
        </NotificationProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;

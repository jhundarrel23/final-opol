import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

const ROLE_DASHBOARDS = {
  admin: '/dashboards/Admin',
  coordinator: '/coordinator/dashboard',
  beneficiary: '/beneficiary/dashboard',
};

const AUTH_PAGES = [
  '/',
  '/admin-login',
  '/coordinator-login',
  '/coordinator/force-reset-password',
  '/beneficiary-login',
  '/register',
  '/beneficiary-register',
];

const EXCLUDED_PATHS = [
  ...AUTH_PAGES,
  '/status/404',
  '/status/500',
  '/status/maintenance',
  '/status/coming-soon'
];

const BaseLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip redirect logic for auth pages and excluded paths
    if (EXCLUDED_PATHS.includes(location.pathname)) {
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = user.role;
                
        if (role && ROLE_DASHBOARDS[role]) {
          // ✅ Check for password reset (handle both possible flags)
          const needsPasswordReset = user.must_reset_password || user.force_password_reset;
          
          if (role === 'coordinator' && needsPasswordReset) {
            navigate('/coordinator/force-reset-password', { replace: true });
            return;
          }

          // Only redirect if we're not already on the correct dashboard route
          const targetDashboard = ROLE_DASHBOARDS[role];
          const currentSection = '/' + location.pathname.split('/')[1];
          const targetSection = '/' + targetDashboard.split('/')[1];
                    
          if (currentSection !== targetSection) {
            navigate(targetDashboard, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error parsing user data in BaseLayout:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
  }, [navigate, location.pathname]);

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
      }}
    >
      {children || <Outlet />}
    </Box>
  );
};

BaseLayout.propTypes = {
  children: PropTypes.node,
};

export default BaseLayout;
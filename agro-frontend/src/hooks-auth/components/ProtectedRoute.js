// ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();

  // Check localStorage first, fallback to sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  console.log('ProtectedRoute - Debug:', {
    currentPath: location.pathname,
    hasToken: !!token,
    hasUserData: !!userData,
    allowedRoles
  });
  
  let user = null;
  try {
    user = userData ? JSON.parse(userData) : null;
    console.log('ProtectedRoute - Parsed user:', user);
  } catch (error) {
    console.error('Error parsing user data in ProtectedRoute:', error);
    // Clear corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
  }

  // Not logged in - redirect to appropriate login page
  if (!token || !user?.role) {
    console.log('ProtectedRoute - No auth, redirecting to login');
    
    // Determine login page based on current URL path
    let loginRoute = '/beneficiary-login'; // default fallback
    
    if (location.pathname.includes('/dashboards') || location.pathname.includes('/management')) {
      loginRoute = '/admin-login';
    } else if (location.pathname.includes('/coordinator')) {
      loginRoute = '/coordinator-login';
    } else if (location.pathname.includes('/beneficiary')) {
      loginRoute = '/beneficiary-login';
    }
    
    console.log('ProtectedRoute - Redirecting to:', loginRoute);
    return <Navigate to={loginRoute} replace state={{ from: location }} />;
  }

  // Role not allowed for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - Role not allowed:', user.role, 'allowed:', allowedRoles);
    
    // Redirect to appropriate dashboard based on user's actual role
    const dashboardRoute = (() => {
      switch (user.role) {
        case 'beneficiary':
          return '/beneficiary/dashboard';
        case 'coordinator':
          return '/coordinator/dashboard';
        case 'admin':
          return '/dashboards/Admin'; // Based on your router config
        default:
          console.warn('Unknown user role:', user.role);
          return '/status/404';
      }
    })();

    console.log('ProtectedRoute - Redirecting to dashboard:', dashboardRoute);
    return <Navigate to={dashboardRoute} replace />;
  }

  console.log('ProtectedRoute - Access granted for:', user.role);
  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './ProgramPageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, CircularProgress, Box, Alert } from '@mui/material';
import Footer from 'src/components/Footer';
import Programs from './Programs';

// Custom hook for user management
const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('Logged-in user:', parsedUser);
        } else {
          console.log('No user found in localStorage');
          setError('Please log in to access this page');
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        setError('Failed to load user data. Please log in again.');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for storage changes (e.g., login/logout in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { user, loading, error, setUser };
};

function EnrollmentInterviewManagement() {
  const { user, loading, error } = useUser();

  // Show loading spinner while checking user authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="70vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
        <Box sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
          Loading user data...
        </Box>
      </Box>
    );
  }

  // Show error if user data couldn't be loaded
  if (error && !user) {
    return (
      <Container maxWidth="lg">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
        >
          <Alert 
            severity="warning" 
            sx={{ 
              maxWidth: 400,
              '& .MuiAlert-message': { fontSize: '0.875rem' }
            }}
          >
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Program Management</title>
      </Helmet>
      
      <PageTitleWrapper>
        <PageHeader user={user} />
      </PageTitleWrapper>
      
      <Container maxWidth="xl"> {/* Changed to xl for better table display */}
        {error && user && (
          <Box mb={2}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          </Box>
        )}
        
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
          sx={{ mb: 4 }}
        >
          <Grid item xs={12}>
            <Programs user={user} />
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
    </>
  );
}

export default EnrollmentInterviewManagement;
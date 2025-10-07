// /src/pages/interviews/EnrollmentInterviewManagement.js
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './InterviewPageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, CircularProgress, Box, Alert } from '@mui/material';
import Footer from 'src/components/Footer';
import RecentInterview from './RecentInterview';

// Helper: get user from sessionStorage first, then localStorage
const getStoredUser = () => {
  try {
    const sessionUser = sessionStorage.getItem('user');
    if (sessionUser) return JSON.parse(sessionUser);

    const localUser = localStorage.getItem('user');
    if (localUser) return JSON.parse(localUser);

    return null;
  } catch (error) {
    console.error('Failed to parse user from storage', error);
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    return null;
  }
};

// Custom hook for user management
const useUser = () => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const u = getStoredUser();
      if (u) {
        setUser(u);
        setError(null);
        console.log('Logged-in user:', u);
      } else {
        console.log('No user found in storage');
        setUser(null);
        setError('Unauthenticated. Please log in.');
      }
      setLoading(false);
    };

    loadUser();

    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Unauthenticated. Please log in.'}</Alert>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Enrollment Interview</title>
      </Helmet>

      <PageTitleWrapper>
        <PageHeader user={user} />
      </PageTitleWrapper>

      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <RecentInterview user={user} />
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </>
  );
}

export default EnrollmentInterviewManagement;

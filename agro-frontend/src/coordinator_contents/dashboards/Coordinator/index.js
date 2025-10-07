/* eslint-disable no-unused-vars */
// src/components/CoordinatorDashboard.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';

import CoordinatorOverview from './CoordinatorOverview';



function CoordinatorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr =
      localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token) {
      navigate('/coordinator-login', { replace: true });
      return;
    }

    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);

        if (parsedUser.must_reset_password) {
          navigate('/coordinator/force-reset-password', { replace: true });
          return;
        }

        if (parsedUser.role !== 'coordinator') {
          navigate('/coordinator-login', { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/coordinator-login', { replace: true });
      }
    } else {
      navigate('/coordinator-login', { replace: true });
    }
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data available</div>;

  return (
    <>
      <Helmet>
        <title>Coordinator Dashboard</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader user={user} />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={4}>
          {/* Use the updated Overview */}
          <Grid item xs={12}>
            <CoordinatorOverview />
          
       
        
      
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default CoordinatorDashboard;
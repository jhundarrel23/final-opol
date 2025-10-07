// BeneficiaryDashboard.js - Updated imports and component usage
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';

import SubsidyStatus from './SubsidyStatus';           


function BeneficiaryDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!token || !userStr) {
      navigate('/beneficiary-login', { replace: true });
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user?.role !== 'beneficiary') {
        navigate('/beneficiary-login', { replace: true });
      }
    } catch (_) {
      navigate('/beneficiary-login', { replace: true });
    }
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>AGRICULTURAL BENEFICIARY DASHBOARD</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={4}
        >
          <Grid item xs={12}>
            <SubsidyStatus />
          </Grid>
        
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default BeneficiaryDashboard;
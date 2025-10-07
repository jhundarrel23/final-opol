import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';

import SectorBeneficiariesCard from './SectorBeneficiariesCard';
import SectorPrograms from './SectorPrograms';
import ProgramProgressTracker from './ProgramProgressTracker';
import PerformanceTracker from './PerformanceTracker';
import useAdminDashboard from './hooks/useAdminDashboard';

function AdminDashboard() {
  const navigate = useNavigate();
  const {
    loading,
    distributionSummary,
    ongoingProgramsProgress,
    refreshData
  } = useAdminDashboard();

  useEffect(() => {
    // Check both storages
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  const handleRefreshProgram = (programId) => {
    // Individual program refresh - could be implemented later
    console.log('Refreshing program:', programId);
    refreshData();
  };

  const handleRefreshAll = () => {
    refreshData();
  };

  return (
    <>
      <Helmet>
        <title>ADMIN DASHBOARD</title>
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
            <SectorBeneficiariesCard />
          </Grid>
          <Grid item lg={8} xs={12}>
            <SectorPrograms />
          </Grid>
          <Grid item xs={12}>
            <ProgramProgressTracker
              ongoingProgramsProgress={ongoingProgramsProgress}
              loading={loading}
              onRefreshProgram={handleRefreshProgram}
              onRefreshAll={handleRefreshAll}
            />
          </Grid>
          <Grid item xs={12}>
            <PerformanceTracker distributionSummary={distributionSummary} />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default AdminDashboard;
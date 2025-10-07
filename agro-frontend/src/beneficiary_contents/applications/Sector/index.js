import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './SectorPageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';
import RecentOrders from './RecentCat';

function SectorManagement() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Logged-in user:', parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>RSBSA APPLICATION</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader user={user} /> {/* optional: pass user as prop */}
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
          <Grid item xs={12}>
            <RecentOrders />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default SectorManagement;

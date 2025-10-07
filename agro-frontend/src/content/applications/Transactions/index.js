import { Helmet } from 'react-helmet-async';
import PageHeaderAdmin from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';

import RecentOrders from './RecentOrders';

function ApplicationsTransactions() {
  return (
    <>
      <Helmet>
        <title> Scholarship Applications</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeaderAdmin />
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
            <RecentOrders />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default ApplicationsTransactions;

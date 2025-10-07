import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';

import RecentSubsidyPrograms from './RecentSubsidyPrograms';
import { useState } from 'react';

function SubsidyPrograms() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>My Subsidy Programs</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader onRefresh={handleRefresh} />
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
            <RecentSubsidyPrograms key={refreshTrigger} />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default SubsidyPrograms;
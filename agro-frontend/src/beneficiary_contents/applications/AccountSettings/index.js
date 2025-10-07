import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Container, Tabs, Tab, Grid, styled } from '@mui/material';
import Footer from 'src/components/Footer';

import ChangePasswordTab from './ChangePasswordTab';


const TabsWrapper = styled(Tabs)(
  () => `
    .MuiTabs-scrollableX {
      overflow-x: auto !important;
    }
`
);

function AccountSettings() {
  const [currentTab, setCurrentTab] = useState('change_password');

  const tabs = [
    { value: 'change_password', label: 'Change Password' },
  ];

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  return (
    <>
      <Helmet>
        <title>Account Settings - Beneficiary</title>
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
          spacing={3}
        >
          <Grid item xs={12}>
            <TabsWrapper
              onChange={handleTabsChange}
              value={currentTab}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </TabsWrapper>
          </Grid>
          <Grid item xs={12}>
            {currentTab === 'change_password' && <ChangePasswordTab />}

          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default AccountSettings;

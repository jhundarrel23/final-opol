/* eslint-disable no-unused-vars */
// SectorManagement.jsx
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './SectorPageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Container, Card, Box, Tabs, Tab } from '@mui/material';
import { ListChecks, BarChart3 } from 'lucide-react';
import Footer from 'src/components/Footer';
import useSectors from './useSectors';
import SectorList from './SectorList';
import SectorAnalytics from './SectorAnalytics';

function SectorManagement() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [sectorSummary, setSectorSummary] = useState([]);

  const {
    sectors,
    getSectorSummary,
  } = useSectors();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
  }, []);

  useEffect(() => {
    loadSectorSummary();
  }, []);

  const loadSectorSummary = async () => {
    const { data } = await getSectorSummary();
    if (data) {
      setSectorSummary(data);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <Helmet>
        <title>Sector Management</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader user={user} />
      </PageTitleWrapper>
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Main Content Card */}
        <Card sx={{ boxShadow: 3 }}>
   
        


          <Box sx={{ p: 4 }}>
            {currentTab === 0 && (
              <SectorList sectorSummary={sectorSummary} onRefresh={loadSectorSummary} />
            )}
            {currentTab === 1 && (
              <SectorAnalytics sectorSummary={sectorSummary} />
            )}
          </Box>
        </Card>
      </Container>
      <Footer />
    </>
  );
}

export default SectorManagement;
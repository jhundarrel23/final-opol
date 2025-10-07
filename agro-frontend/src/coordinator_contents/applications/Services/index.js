/* eslint-disable default-case */
import { Helmet } from 'react-helmet-async';
import { useState, useRef } from 'react';
import { Snackbar, Alert, Box, Tabs, Tab, Stack } from '@mui/material';
import { Calendar, Users, Package, Boxes, History } from 'lucide-react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';
import PageHeader from './PageHeader';
import ServiceEventList from './ServiceEventList';
import ServiceBeneficiaries from './ServiceBeneficiaries';
import ServiceCatalogManagement from './ServiceCatalogManagement';
import ServiceEventStocks from './ServiceEventStocks'; // Placeholder for inventory tab
import ServiceHistory from './ServiceHistory'; // Placeholder for history tab

function ServicesProgramManagement() {
  const serviceEventListRef = useRef();
  const serviceBeneficiariesRef = useRef();
  const serviceCatalogRef = useRef();
  const serviceStocksRef = useRef();
  const serviceHistoryRef = useRef();
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState('events');

  const handleEventAdded = (newEvent) => {
    setSnackbar({
      open: true,
      message: `Service event created! ${newEvent.beneficiariesCount || 0} beneficiaries, ${newEvent.inventoryCount || 0} items.`,
      severity: 'success'
    });
    // Refresh lists
    serviceEventListRef.current?.refreshEvents?.();
    serviceBeneficiariesRef.current?.refreshBeneficiaries?.();
    serviceHistoryRef.current?.refreshHistory?.();
  };

  const handleOperation = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    // Refresh active tab
    switch (activeTab) {
      case 'events': serviceEventListRef.current?.refreshEvents?.(); break;
      case 'beneficiaries': serviceBeneficiariesRef.current?.refreshBeneficiaries?.(); break;
      case 'catalogs': serviceCatalogRef.current?.refreshCatalogs?.(); break;
      case 'stocks': serviceStocksRef.current?.refreshStocks?.(); break;
      case 'history': serviceHistoryRef.current?.refreshHistory?.(); break;
    }
  };

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'events': return <ServiceEventList ref={serviceEventListRef} onOperation={handleOperation} />;
      case 'beneficiaries': return <ServiceBeneficiaries ref={serviceBeneficiariesRef} onOperation={handleOperation} />;
      case 'catalogs': return <ServiceCatalogManagement ref={serviceCatalogRef} onOperation={handleOperation} />;
      case 'stocks': return <ServiceEventStocks ref={serviceStocksRef} onOperation={handleOperation} />;
      case 'history': return <ServiceHistory ref={serviceHistoryRef} onOperation={handleOperation} />;
      default: return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Services Management - Coordinator Dashboard</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader onEventAdded={handleEventAdded} />
      </PageTitleWrapper>
      
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontWeight: 600 }, '& .Mui-selected': { color: '#2d5016' }, '& .MuiTabs-indicator': { backgroundColor: '#2d5016' } }}>
                <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Calendar size={18} /><span>Events</span></Stack>} value="events" />
                <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Users size={18} /><span>Beneficiaries</span></Stack>} value="beneficiaries" />
                <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Package size={18} /><span>Catalogs</span></Stack>} value="catalogs" />
                <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Boxes size={18} /><span>Inventory</span></Stack>} value="stocks" />
                <Tab label={<Stack direction="row" alignItems="center" spacing={1}><History size={18} /><span>History</span></Stack>} value="history" />
              </Tabs>
            </Box>
            {renderActiveComponent()}
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ServicesProgramManagement;
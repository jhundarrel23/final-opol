import { Helmet } from 'react-helmet-async';
import { useState, useRef } from 'react';
import { Snackbar, Alert, Box, Tabs, Tab, Stack } from '@mui/material';
import { Calendar, Package } from 'lucide-react';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';
import PageHeader from './PageHeader';
import ServiceList from './ServiceList';
import ServiceCatalogList from './ServiceCatalogList';

function ServicesProgramManagement() {
  const serviceListRef = useRef();
  const serviceCatalogRef = useRef();
  
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [activeTab, setActiveTab] = useState('events');

  const handleEventAdded = (newEvent) => {
    setSnackbar({
      open: true,
      message: `Service event created! ${newEvent.beneficiariesCount || 0} beneficiaries, ${newEvent.inventoryCount || 0} items.`,
      severity: 'success'
    });
    // Refresh lists
    serviceListRef.current?.refreshEvents?.();
  };

  const handleOperation = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
    // Refresh active tab
    if (activeTab === 'events') {
      serviceListRef.current?.refreshEvents?.();
    } else if (activeTab === 'catalogs') {
      serviceCatalogRef.current?.refreshCatalogs?.();
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{ 
                  '& .MuiTab-root': { 
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }, 
                  '& .Mui-selected': { 
                    color: '#2d5016' 
                  }, 
                  '& .MuiTabs-indicator': { 
                    backgroundColor: '#2d5016' 
                  } 
                }}
              >
                <Tab 
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Calendar size={18} />
                      <span>Service Events</span>
                    </Stack>
                  } 
                  value="events" 
                />
                <Tab 
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Package size={18} />
                      <span>Service Catalogs</span>
                    </Stack>
                  } 
                  value="catalogs" 
                />
              </Tabs>
            </Box>
            
            {activeTab === 'events' && (
              <ServiceList 
                ref={serviceListRef} 
                onOperation={handleOperation}
              />
            )}
            
            {activeTab === 'catalogs' && (
              <ServiceCatalogList 
                ref={serviceCatalogRef}
                onOperation={handleOperation}
              />
            )}
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ServicesProgramManagement;

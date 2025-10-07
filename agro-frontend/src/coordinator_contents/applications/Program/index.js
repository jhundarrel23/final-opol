import { Helmet } from 'react-helmet-async';
import { useState, useRef } from 'react';
import { Snackbar, Alert } from '@mui/material';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';
import ProgramList from './ProgramList';
import GeneralDistributions from './GeneralDistributions';

function ProgramManagement() {
  // ✅ Create refs to access component methods for refreshing data
  const programListRef = useRef();
  const generalDistributionsRef = useRef();
  
  // ✅ State for global notifications (success/error messages)
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // ✅ State for active tab - now includes 'distributions'
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'distributions', or 'history'

  // ✅ Handle program added - refresh the list and show success message
  const handleProgramAdded = (newProgram) => {
    console.log('New program added, refreshing list...', newProgram);
    
    // ✅ Show success notification
    setSnackbar({
      open: true,
      message: `Program "${newProgram.title}" created successfully!`,
      severity: 'success'
    });
    
    // ✅ Refresh the program list to show new data
    if (programListRef.current?.refreshPrograms) {
      programListRef.current.refreshPrograms();
    }
  };

  // ✅ Handle program operations (edit, delete) with notifications
  const handleProgramOperation = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
    
    // ✅ Refresh appropriate list after any operation
    if (activeTab === 'distributions' && generalDistributionsRef.current?.refreshDistributions) {
      generalDistributionsRef.current.refreshDistributions();
    } else if (programListRef.current?.refreshPrograms) {
      programListRef.current.refreshPrograms();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Helmet>
        <title>Subsidy Program Management</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader onProgramAdded={handleProgramAdded} />
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
            {/* ✅ Pass activeTab and setActiveTab to ProgramList */}
            <ProgramList 
              ref={programListRef} 
              onOperation={handleProgramOperation}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            
            {/* ✅ Conditionally render GeneralDistributions when activeTab is 'distributions' */}
            {activeTab === 'distributions' && (
              <GeneralDistributions 
                ref={generalDistributionsRef}
                onOperation={handleProgramOperation}
              />
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
      
      {/* ✅ Global notification system */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default ProgramManagement;
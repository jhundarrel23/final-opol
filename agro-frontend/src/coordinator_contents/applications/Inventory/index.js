/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import Footer from 'src/components/Footer';
import AnalyticsIcon from '@mui/icons-material/Analytics';

import ItemList from './ItemList';
import StockList from './stockList';
import TransactionHistoryTable from './TransactionHistoryTable';
import useHistoryList from './useHistoryList';

// Reports & Analytics component placeholder
const ReportsAnalytics = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <Card sx={{ maxWidth: 600, textAlign: 'center' }}>
      <CardContent sx={{ py: 6 }}>
        <Box sx={{ mb: 3 }}>
          <AnalyticsIcon sx={{ fontSize: 64, color: '#4285f4', opacity: 0.7 }} />
        </Box>
        <Typography variant="h4" component="h2" sx={{ mb: 2, fontWeight: 500 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Generate comprehensive reports and gain insights into inventory trends, usage patterns, and distribution metrics.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This feature will be available in a future update.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

// Transaction History component with hook integration
const TransactionHistory = () => {
  const { historyData, loading, error, refreshHistory } = useHistoryList();

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error loading transaction history
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button onClick={refreshHistory} variant="outlined">
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <TransactionHistoryTable 
      stocks={historyData}
      loading={loading}
      onRefresh={refreshHistory}
    />
  );
};

function InventoryManagement() {
  const [activeTab, setActiveTab] = useState(0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <ItemList />;
      case 1:
        return <StockList />;
      case 2:
        return <TransactionHistory />;
      case 3:
        return <ReportsAnalytics />;
      default:
        return <ItemList />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Agricultural Inventory Management</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader activeTab={activeTab} onTabChange={setActiveTab} />
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderTabContent()}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default InventoryManagement;
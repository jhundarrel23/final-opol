/* eslint-disable no-alert */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import {
  Grid,
  Container,
  Card,
  Tab,
  Tabs,
  Box,
  Typography,
  Chip,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import Footer from 'src/components/Footer';
import AddStockModal from '../../../coordinator_contents/applications/Inventory/AddStockModal';
import axiosInstance from '../../../api/axiosInstance';
import { Snackbar, Alert } from '@mui/material';
import {
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

import PageHeader from './PageHeader';
import InventoriesList from './InventoriesList';
import StockTransactionsList from './StockTransactionsList';
import AnalyticsDashboard from './AnalyticsDashboard';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AdminInventories() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const theme = useTheme();
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue !== 1) {
      setSelectedInventory(null);
    }
  };

  const handleViewTransactions = (inventory) => {
    setSelectedInventory(inventory);
    setActiveTab(1);
  };

  const handleEdit = (inventory) => {
    setSnackbar({ open: true, message: 'Edit item coming soon', severity: 'info' });
  };

  const handleDelete = async (inventory) => {
    if (!inventory?.id) return;
    const confirmed = window.confirm(`Delete item "${inventory.item_name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      try {
        await axiosInstance.delete(`/api/inventory/items/${inventory.id}`);
      } catch (e1) {
        await axiosInstance.delete(`/api/inventories/${inventory.id}`);
      }
      setSnackbar({ open: true, message: 'Item deleted', severity: 'success' });
      // Best-effort UI refresh: if currently viewing transactions for this item, clear selection
      if (selectedInventory?.id === inventory.id) setSelectedInventory(null);
    } catch (error) {
      setSnackbar({ open: true, message: (error.response?.data?.message) || 'Failed to delete item', severity: 'error' });
    }
  };

  const handleAddStock = (inventory) => {
    setSelectedInventory(inventory || null);
    setAddStockOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Inventory Management - Admin Dashboard</title>
      </Helmet>
      <PageTitleWrapper>
        <PageHeader />
      </PageTitleWrapper>
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card 
              sx={{ 
                overflow: 'visible',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              {/* Modern Tab Bar Design */}
              <Box 
                sx={{ 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  position: 'relative'
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="inventory management tabs"
                  sx={{ 
                    px: 3, 
                    pt: 2,
                    minHeight: 64,
                    '& .MuiTabs-indicator': {
                      display: 'none'
                    },
                    '& .MuiTabs-flexContainer': {
                      gap: 0.5
                    },
                    '& .MuiTab-root': {
                      minHeight: 64,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      backgroundColor: 'transparent',
                      borderRadius: 1,
                      minWidth: 'auto',
                      padding: '8px 16px',
                      '&:hover': {
                        color: theme.palette.text.primary,
                        backgroundColor: 'transparent'
                      },
                      '&.Mui-selected': {
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                        backgroundColor: 'transparent',
                        '&:hover': {
                          color: theme.palette.text.primary,
                          backgroundColor: 'transparent'
                        }
                      }
                    }
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    icon={<InventoryIcon />}
                    label="Inventory Items"
                    iconPosition="start"
                  />
                  <Tab
                    icon={<HistoryIcon />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        Stock Transactions
                        {selectedInventory && (
                          <Chip
                            label={selectedInventory.item_name}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{
                              fontSize: '0.75rem',
                              height: 20,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        )}
                      </Box>
                    }
                    iconPosition="start"
                  />
                  <Tab
                    icon={<AnalyticsIcon />}
                    label="Analytics"
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <InventoriesList
                  onViewTransactions={handleViewTransactions}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddStock={handleAddStock}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <StockTransactionsList
                  selectedInventory={selectedInventory}
                  onClearSelection={() => setSelectedInventory(null)}
                />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Box sx={{ p: 3, minHeight: 400 }}>
                  <AnalyticsDashboard />
                </Box>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </Container>
      {/* Add Stock modal reused from coordinator */}
      <AddStockModal
        open={addStockOpen}
        onClose={() => setAddStockOpen(false)}
        onStockAdded={() => setSnackbar({ open: true, message: 'Stock transaction submitted for approval', severity: 'success' })}
        onSubmit={async (data) => {
          try {
            await axiosInstance.post('/api/inventory-stocks', { ...data, inventory_id: data.inventory_id || selectedInventory?.id });
            setSnackbar({ open: true, message: 'Stock transaction submitted for approval', severity: 'success' });
            setAddStockOpen(false);
          } catch (error) {
            try {
              await axiosInstance.post('/api/inventory/stocks', { ...data, inventory_id: data.inventory_id || selectedInventory?.id });
              setSnackbar({ open: true, message: 'Stock transaction submitted for approval', severity: 'success' });
              setAddStockOpen(false);
            } catch (e2) {
              setSnackbar({ open: true, message: (error.response?.data?.message) || 'Failed to submit stock transaction', severity: 'error' });
            }
          }
        }}
        userRole="admin"
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Footer />
    </>
  );
}

export default AdminInventories;
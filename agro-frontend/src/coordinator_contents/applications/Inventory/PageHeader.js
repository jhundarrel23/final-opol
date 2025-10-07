/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Grid,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import StorageIcon from '@mui/icons-material/Storage';
import HistoryIcon from '@mui/icons-material/History';
import AnalyticsIcon from '@mui/icons-material/Analytics';

function PageHeader({ activeTab = 0, onTabChange }) {
  const navigationTabs = [
    {
      label: 'Item Management',
      icon: <InventoryIcon fontSize="small" />,
      value: 0
    },
    {
      label: 'Stock Management',
      icon: <StorageIcon fontSize="small" />,
      value: 1
    },
    {
      label: 'Transaction History',
      icon: <HistoryIcon fontSize="small" />,
      value: 2
    },
    {
      label: 'Reports & Analytics',
      icon: <AnalyticsIcon fontSize="small" />,
      value: 3
    }
  ];

  const handleTabChange = (event, newValue) => {
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  return (
    <>
      {/* Title Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Grid item>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="600"
              sx={{ mb: 1, color: '#1a1a1a' }}
            >
              Agricultural Inventory Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage agricultural assistance items, stock levels, and distribution tracking
            </Typography>
          </Grid>
        </Grid>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="inventory management tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                py: 1.5,
                px: 3,
                minWidth: 0,
                mr: 2,
                borderRadius: '4px 4px 0 0',
                '&.Mui-selected': {
                  backgroundColor: '#4285f4',
                  color: 'white',
                  fontWeight: 600
                },
                '&:not(.Mui-selected)': {
                  color: '#666',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            {navigationTabs.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>
      </Box>
    </>
  );
}

export default PageHeader;
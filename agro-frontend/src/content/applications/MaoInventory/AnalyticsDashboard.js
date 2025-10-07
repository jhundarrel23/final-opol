/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Warning,
  Refresh,
  Download,
  Timeline,
  Assessment,
  Inventory2,
  PieChart,
  LocalShipping,
  Category,
  SwapVert,
  Savings,
  ErrorOutline,
  CheckCircle,
  Info,
  People,
  BusinessCenter,
  Schedule,
  Analytics
} from '@mui/icons-material';

import useAdminAnalytics from './hooks/useInventoryAnalytics';

function AdminAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState(30);
  const [itemType, setItemType] = useState(null);
  const [status, setStatus] = useState(null);

  // Use the corrected admin analytics hook
  const {
    overview,
    inventory,
    programs,
    beneficiaries,
    financials,
    loading,
    error,
    refresh,
    getInventorySummary,
    getProgramSummary,
    getBeneficiarySummary,
    getFinancialSummary,
    getRecentActivity,
    getStockLevels,
    getLowStockAlerts,
    getCriticalStockItems,
    getExpiringSoonCount,
    getTotalInventoryValue,
    lastUpdated
  } = useAdminAnalytics(timeRange, itemType, status);

  // Helper functions
  const formatCurrency = (value) => {
    if (!value || value === 0) return '₱0.00';
    return `₱${parseFloat(value).toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatNumber = (value) => {
    if (!value || value === 0) return '0';
    return parseFloat(value).toLocaleString('en-PH');
  };

  // Get data from hooks
  const overviewData = getInventorySummary();
  const programData = getProgramSummary();
  const beneficiaryData = getBeneficiarySummary();
  const financialData = getFinancialSummary();
  const recentActivity = getRecentActivity();
  const stockLevels = getStockLevels();
  const lowStockAlerts = getLowStockAlerts();

  // Simple chart data representations (without external chart library)
  const stockStatusData = useMemo(() => {
    if (!stockLevels || stockLevels.length === 0) return [];
    
    const statusCounts = stockLevels.reduce((acc, item) => {
      const status = item.stock_status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / stockLevels.length) * 100).toFixed(1)
    }));
  }, [stockLevels]);

  const stockQuantityData = useMemo(() => {
    if (!stockLevels || stockLevels.length === 0) return [];
    
    const typeGroups = stockLevels.reduce((acc, item) => {
      const type = item.item_type || 'Unknown';
      if (!acc[type]) {
        acc[type] = { type, totalStock: 0, itemCount: 0 };
      }
      acc[type].totalStock += item.current_stock || 0;
      acc[type].itemCount += 1;
      return acc;
    }, {});
    
    return Object.values(typeGroups);
  }, [stockLevels]);

  // Activity timeline data - group by day and type
  const activityTimelineData = useMemo(() => {
    if (!recentActivity || recentActivity.length === 0) return [];
    
    const grouped = recentActivity.reduce((acc, activity) => {
      const date = activity.date?.split(' ')[0] || 'Unknown'; // Get just the date part
      if (!acc[date]) {
        acc[date] = { date, stock_movements: 0, program_activities: 0, total: 0 };
      }
      
      if (activity.type === 'stock_movement') {
        acc[date].stock_movements += 1;
      } else if (activity.type === 'program_activity') {
        acc[date].program_activities += 1;
      }
      acc[date].total += 1;
      
      return acc;
    }, {});
    
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);
  }, [recentActivity]);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={8}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="text.secondary">
            Loading Admin Analytics Dashboard...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching comprehensive system analytics
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error && !overview) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refresh} startIcon={<Refresh />}>
              Retry
            </Button>
          }
        >
          <Typography variant="subtitle2">Failed to Load Admin Analytics</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Admin Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive system overview with inventory, programs, beneficiaries, and financial analytics
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Item Type</InputLabel>
              <Select
                value={itemType || ''}
                onChange={(e) => setItemType(e.target.value || null)}
                label="Item Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="seeds">Seeds</MenuItem>
                <MenuItem value="fertilizer">Fertilizer</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="supplies">Supplies</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status || ''}
                onChange={(e) => setStatus(e.target.value || null)}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Period"
              >
                <MenuItem value={7}>Last 7 Days</MenuItem>
                <MenuItem value={30}>Last 30 Days</MenuItem>
                <MenuItem value={90}>Last 3 Months</MenuItem>
                <MenuItem value={180}>Last 6 Months</MenuItem>
                <MenuItem value={365}>Last Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refresh}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => {
                const data = JSON.stringify({ overview, inventory, programs, beneficiaries, financials }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `admin-analytics-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Data
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} mb={4}>
        {/* Inventory Summary */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Inventory2 sx={{ fontSize: 32, color: 'primary.dark' }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {overviewData?.total_items || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Inventory Items
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(overviewData?.total_stock_value || 0)} value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Programs Summary */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BusinessCenter sx={{ fontSize: 32, color: 'success.dark' }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {programData?.active_programs || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Programs
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {programData?.completion_rate || 0}% completion rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Beneficiaries Summary */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <People sx={{ fontSize: 32, color: 'info.dark' }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {beneficiaryData?.active_beneficiaries || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Beneficiaries
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {beneficiaryData?.barangays_covered || 0} barangays covered
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Alerts */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: lowStockAlerts.length > 10 ? 'warning.light' : 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Warning sx={{ 
                    fontSize: 32, 
                    color: lowStockAlerts.length > 10 ? 'warning.dark' : 'success.dark' 
                  }} />
                </Box>
                <Box flex={1}>
                  <Typography 
                    variant="h4" 
                    color={lowStockAlerts.length > 10 ? 'warning.main' : 'success.main'}
                    fontWeight="bold"
                  >
                    {lowStockAlerts.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Stock Alerts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getCriticalStockItems().length} critical items
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Simple Visual Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Stock Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <PieChart color="primary" />
                Stock Status Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {stockStatusData.length > 0 ? (
                  stockStatusData.map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 1,
                          bgcolor: item.name === 'Good' ? 'success.main' : 
                                   item.name === 'Medium' ? 'warning.main' :
                                   item.name === 'Low' ? 'error.main' : 'grey.main'
                        }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        {item.name}
                      </Typography>
                      <Box sx={{ flex: 1, mx: 2, bgcolor: 'grey.100', borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: 8,
                            width: `${item.percentage}%`,
                            bgcolor: item.name === 'Good' ? 'success.main' : 
                                    item.name === 'Medium' ? 'warning.main' :
                                    item.name === 'Low' ? 'error.main' : 'grey.main'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.value} ({item.percentage}%)
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      No stock status data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Quantity by Type */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400, borderRadius: 2 }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Inventory2 color="primary" />
                Stock Quantity by Type
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {stockQuantityData.length > 0 ? (
                  stockQuantityData.map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: 1,
                          bgcolor: ['primary.main', 'secondary.main', 'success.main', 'warning.main', 'error.main'][index % 5]
                        }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {item.type}
                      </Typography>
                      <Box sx={{ flex: 1, mx: 2, bgcolor: 'grey.100', borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: 8,
                            width: `${Math.min(100, (item.totalStock / Math.max(...stockQuantityData.map(d => d.totalStock))) * 100)}%`,
                            bgcolor: ['primary.main', 'secondary.main', 'success.main', 'warning.main', 'error.main'][index % 5]
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        {formatNumber(item.totalStock)} units
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({item.itemCount} items)
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      No stock quantity data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Timeline and Program Overview */}
      <Grid container spacing={3} mb={4}>
        {/* Activity Timeline Chart */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Timeline color="primary" />
                Daily Activity Overview (Last 7 Days)
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {activityTimelineData.length > 0 ? (
                  <Box sx={{ height: '100%' }}>
                    {/* Chart Header */}
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" color="text.secondary">Date</Typography>
                      <Typography variant="body2" color="text.secondary">Stock Movements</Typography>
                      <Typography variant="body2" color="text.secondary">Program Activities</Typography>
                      <Typography variant="body2" color="text.secondary">Total Activities</Typography>
                    </Box>
                    
                    {/* Chart Bars */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 240, overflow: 'auto' }}>
                      {activityTimelineData.map((day, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={3}>
                          {/* Date */}
                          <Typography variant="body2" sx={{ minWidth: 80, fontSize: '0.75rem' }}>
                            {day.date}
                          </Typography>
                          
                          {/* Stock Movements Bar */}
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 20, 
                              bgcolor: 'grey.100', 
                              borderRadius: 1, 
                              overflow: 'hidden',
                              position: 'relative'
                            }}>
                              <Box sx={{
                                height: '100%',
                                width: `${Math.min(100, (day.stock_movements / Math.max(...activityTimelineData.map(d => d.total))) * 100)}%`,
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {day.stock_movements > 0 && (
                                  <Typography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                                    {day.stock_movements}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          
                          {/* Program Activities Bar */}
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 20, 
                              bgcolor: 'grey.100', 
                              borderRadius: 1, 
                              overflow: 'hidden',
                              position: 'relative'
                            }}>
                              <Box sx={{
                                height: '100%',
                                width: `${Math.min(100, (day.program_activities / Math.max(...activityTimelineData.map(d => d.total))) * 100)}%`,
                                bgcolor: 'success.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {day.program_activities > 0 && (
                                  <Typography variant="caption" color="white" sx={{ fontSize: '0.7rem' }}>
                                    {day.program_activities}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          
                          {/* Total Activities */}
                          <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 'bold' }}>
                            {day.total}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    
                    {/* Legend */}
                    <Box display="flex" justifyContent="center" gap={4} mt={2} pt={2} borderTop="1px solid" borderColor="divider">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'primary.main', borderRadius: 0.5 }} />
                        <Typography variant="caption">Stock Movements</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 0.5 }} />
                        <Typography variant="caption">Program Activities</Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      No activity data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} mb={4}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Schedule color="primary" />
                Recent Activity
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Activity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivity.length > 0 ? (
                      recentActivity.slice(0, 10).map((activity, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {activity.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {activity.user}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {activity.date}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No recent activity found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <Warning color="warning" />
                Low Stock Alerts
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockAlerts.length > 0 ? (
                      lowStockAlerts.slice(0, 10).map((item, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.item_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.unit}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatNumber(item.current_stock)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={item.alert_level} 
                              color={item.alert_level === 'critical' ? 'error' : 'warning'} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                            <CheckCircle color="success" />
                            <Typography variant="body2" color="text.secondary">
                              All items have adequate stock
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: 'success.light' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.dark" gutterBottom>
                Total Distributed Value
              </Typography>
              <Typography variant="h4" color="success.dark" fontWeight="bold">
                {formatCurrency(financialData?.total_distributed_value || 0)}
              </Typography>
              <Typography variant="body2" color="success.dark">
                Across all programs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: 'info.light' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="info.dark" gutterBottom>
                Average per Beneficiary
              </Typography>
              <Typography variant="h4" color="info.dark" fontWeight="bold">
                {formatCurrency(financialData?.average_per_beneficiary || 0)}
              </Typography>
              <Typography variant="body2" color="info.dark">
                Distribution value
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, bgcolor: 'warning.light' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning.dark" gutterBottom>
                Pending Distribution
              </Typography>
              <Typography variant="h4" color="warning.dark" fontWeight="bold">
                {formatCurrency(financialData?.pending_distribution_value || 0)}
              </Typography>
              <Typography variant="body2" color="warning.dark">
                Awaiting processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Summary */}
      {(lowStockAlerts.length > 0 || getExpiringSoonCount() > 0) && (
        <Box mt={4}>
          <Alert 
            severity="warning" 
            sx={{ borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.href = '/admin/inventory/alerts'}
              >
                View Details
              </Button>
            }
          >
            <Typography variant="subtitle2" gutterBottom>
              System Alerts
            </Typography>
            <Stack direction="row" spacing={3}>
              {lowStockAlerts.length > 0 && (
                <Typography variant="body2">
                  <strong>{lowStockAlerts.length}</strong> low stock items
                </Typography>
              )}
              {getExpiringSoonCount() > 0 && (
                <Typography variant="body2">
                  <strong>{getExpiringSoonCount()}</strong> items expiring soon
                </Typography>
              )}
            </Stack>
          </Alert>
        </Box>
      )}

      {/* Footer Info */}
      <Box mt={4} p={3} bgcolor="action.hover" borderRadius={2}>
        <Typography variant="body2" color="text.secondary" align="center">
          Data Period: Last {timeRange} days
          {itemType && ` • Item Type: ${itemType}`}
          {status && ` • Status: ${status}`} • 
          Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleString('en-PH') : 'Just now'} • 
          Total Items: {overviewData?.total_items || 0} • 
          Active Programs: {programData?.active_programs || 0} • 
          Active Beneficiaries: {beneficiaryData?.active_beneficiaries || 0}
        </Typography>
      </Box>
    </Box>
  );
}

export default AdminAnalyticsDashboard;
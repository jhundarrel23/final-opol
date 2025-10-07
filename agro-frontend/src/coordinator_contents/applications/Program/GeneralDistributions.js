/* eslint-disable no-unused-vars */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import {
  Search,
  Visibility,
  FilterList,
  GetApp,
  Refresh,
  Person,
  Inventory2,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../../../api/axiosInstance';

const GeneralDistributions = forwardRef(({ onOperation }, ref) => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalValue: 0
  });

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refreshDistributions: fetchDistributions
  }));

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch inventory stocks where movement_type = 'distribution' and beneficiary_id is not null
      const response = await axiosInstance.get('/api/inventory/stocks', {
        params: {
          movement_type: 'distribution',
          has_beneficiary: true
        }
      });

      const data = response.data.data || response.data || [];
      
      // Calculate statistics
      const stats = {
        total: data.length,
        pending: data.filter(d => d.status === 'pending').length,
        approved: data.filter(d => d.status === 'approved').length,
        totalValue: data.reduce((sum, d) => sum + (parseFloat(d.total_value) || 0), 0)
      };

      setDistributions(data);
      setStats(stats);
    } catch (error) {
      console.error('Error fetching distributions:', error);
      setError('Failed to load walk-in distributions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Filter and search logic
  const filteredDistributions = distributions.filter((dist) => {
    const matchesSearch = 
      dist.beneficiary?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.inventory?.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dist.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      dist.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const paginatedDistributions = filteredDistributions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchDistributions}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Inventory2 />
            </Avatar>
            <Box>
              <Typography variant="h4" color="white" fontWeight={700}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)">
                Total Distributions
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <CalendarToday />
            </Avatar>
            <Box>
              <Typography variant="h4" color="white" fontWeight={700}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)">
                Pending Approval
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h4" color="white" fontWeight={700}>
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)">
                Approved
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            }}
          >
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <TrendingUp />
            </Avatar>
            <Box>
              <Typography variant="h4" color="white" fontWeight={700}>
                ₱{stats.totalValue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.8)">
                Total Value
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by beneficiary, item, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status Filter"
                  onChange={handleFilterChange}
                  startAdornment={<FilterList sx={{ ml: 1, mr: -0.5 }} />}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchDistributions} color="primary">
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton color="primary">
                    <GetApp />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Distributions Table */}
      <Card>
        {filteredDistributions.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Inventory2 sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Walk-in Distributions Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Walk-in distributions will appear here when recorded.'}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Beneficiary</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDistributions.map((dist) => (
                    <TableRow key={dist.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {format(new Date(dist.transaction_date), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(dist.created_at), 'hh:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {dist.reference || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {dist.beneficiary?.full_name || dist.destination || 'Unknown'}
                          </Typography>
                          {dist.beneficiary?.barangay && (
                            <Typography variant="caption" color="text.secondary">
                              {dist.beneficiary.barangay}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {dist.inventory?.item_name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Batch: {dist.batch_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {Math.abs(parseFloat(dist.quantity || 0))} {dist.inventory?.unit || 'units'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          ₱{parseFloat(dist.total_value || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dist.status || 'Pending'}
                          color={getStatusColor(dist.status)}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredDistributions.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Card>
    </Box>
  );
});

GeneralDistributions.displayName = 'GeneralDistributions';

export default GeneralDistributions;
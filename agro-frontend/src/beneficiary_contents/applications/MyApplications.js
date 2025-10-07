import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Grid,
  Alert,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3),
  boxShadow: theme.shadows[10],
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: theme.palette.warning.light, color: theme.palette.warning.contrastText };
      case 'approved':
        return { bg: theme.palette.success.light, color: theme.palette.success.contrastText };
      case 'rejected':
        return { bg: theme.palette.error.light, color: theme.palette.error.contrastText };
      case 'under_review':
        return { bg: theme.palette.info.light, color: theme.palette.info.contrastText };
      case 'completed':
        return { bg: theme.palette.success.main, color: theme.palette.success.contrastText };
      default:
        return { bg: theme.palette.grey[300], color: theme.palette.text.primary };
    }
  };

  const colors = getStatusColor(status);
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    fontWeight: 'bold'
  };
});

// Mock data for applications
const mockApplications = [
  {
    id: 'APP-2024-001',
    programType: 'Fertilizer Subsidy Program',
    dateSubmitted: '2024-01-15',
    status: 'approved',
    amount: '₱5,000.00',
    farmSize: '2.5 hectares',
    cropType: 'Rice',
    coordinator: 'John Santos',
    remarks: 'Application approved. Fertilizers ready for distribution.'
  },
  {
    id: 'APP-2024-002',
    programType: 'High-Quality Seed Distribution',
    dateSubmitted: '2024-01-20',
    status: 'under_review',
    amount: '₱3,500.00',
    farmSize: '1.8 hectares',
    cropType: 'Corn',
    coordinator: 'Maria Cruz',
    remarks: 'Documents under verification by coordinator.'
  },
  {
    id: 'APP-2024-003',
    programType: 'Farm Equipment Assistance',
    dateSubmitted: '2024-02-01',
    status: 'pending',
    amount: '₱15,000.00',
    farmSize: '3.2 hectares',
    cropType: 'Rice',
    coordinator: 'Pedro Garcia',
    remarks: 'Waiting for coordinator assignment.'
  },
  {
    id: 'APP-2024-004',
    programType: 'Crop Insurance Program',
    dateSubmitted: '2024-01-10',
    status: 'completed',
    amount: '₱8,000.00',
    farmSize: '2.0 hectares',
    cropType: 'Vegetables',
    coordinator: 'Ana Reyes',
    remarks: 'Insurance coverage activated successfully.'
  },
  {
    id: 'APP-2024-005',
    programType: 'Agricultural Training Program',
    dateSubmitted: '2024-01-25',
    status: 'rejected',
    amount: 'N/A',
    farmSize: '1.5 hectares',
    cropType: 'Rice',
    coordinator: 'Jose Martinez',
    remarks: 'Incomplete documentation. Please resubmit with required documents.'
  }
];

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchApplications = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setApplications(mockApplications);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pending Review',
      'under_review': 'Under Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  };

  const getApplicationStats = () => {
    const stats = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: applications.length,
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
      completed: stats.completed || 0
    };
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StyledCard>
          <CardContent>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading applications...</Typography>
          </CardContent>
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledCard>
        <CardHeader
          avatar={<HistoryIcon />}
          title="My Applications"
          subheader="Track your application status and history"
          action={
            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filter">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          {/* Statistics Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                <Typography variant="h4" color="primary.contrastText">{stats.total}</Typography>
                <Typography variant="caption" color="primary.contrastText">Total</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                <Typography variant="h4" color="warning.contrastText">{stats.pending}</Typography>
                <Typography variant="caption" color="warning.contrastText">Pending</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                <Typography variant="h4" color="info.contrastText">{mockApplications.filter(app => app.status === 'under_review').length}</Typography>
                <Typography variant="caption" color="info.contrastText">Under Review</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                <Typography variant="h4" color="success.contrastText">{stats.approved}</Typography>
                <Typography variant="caption" color="success.contrastText">Approved</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main' }}>
                <Typography variant="h4" color="success.contrastText">{stats.completed}</Typography>
                <Typography variant="caption" color="success.contrastText">Completed</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                <Typography variant="h4" color="error.contrastText">{stats.rejected}</Typography>
                <Typography variant="caption" color="error.contrastText">Rejected</Typography>
              </Paper>
            </Grid>
          </Grid>

          {applications.length === 0 ? (
            <Alert severity="info">
              No applications found. <Button href="/beneficiary/applications/new">Submit your first application</Button>
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Application ID</strong></TableCell>
                    <TableCell><strong>Program Type</strong></TableCell>
                    <TableCell><strong>Date Submitted</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {application.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {application.programType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(application.dateSubmitted).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusChip
                          label={getStatusText(application.status)}
                          status={application.status}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {application.amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(application)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {application.status === 'rejected' && (
                            <Tooltip title="Edit & Resubmit">
                              <IconButton size="small" color="primary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </StyledCard>

      {/* Application Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Application Details - {selectedApplication?.id}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Program Information</Typography>
                <Typography variant="body2"><strong>Program:</strong> {selectedApplication.programType}</Typography>
                <Typography variant="body2"><strong>Amount:</strong> {selectedApplication.amount}</Typography>
                <Typography variant="body2"><strong>Date Submitted:</strong> {new Date(selectedApplication.dateSubmitted).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Farm Details</Typography>
                <Typography variant="body2"><strong>Farm Size:</strong> {selectedApplication.farmSize}</Typography>
                <Typography variant="body2"><strong>Crop Type:</strong> {selectedApplication.cropType}</Typography>
                <Typography variant="body2"><strong>Coordinator:</strong> {selectedApplication.coordinator}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                <StatusChip
                  label={getStatusText(selectedApplication.status)}
                  status={selectedApplication.status}
                  sx={{ mb: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Remarks</Typography>
                <Typography variant="body2">{selectedApplication.remarks}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedApplication?.status === 'rejected' && (
            <Button variant="contained" color="primary">
              Edit & Resubmit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyApplications;
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3),
  boxShadow: theme.shadows[10],
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const BenefitCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  const colors = {
    'received': { bg: theme.palette.success.main, color: theme.palette.success.contrastText },
    'pending': { bg: theme.palette.warning.main, color: theme.palette.warning.contrastText },
    'processing': { bg: theme.palette.info.main, color: theme.palette.info.contrastText },
    'cancelled': { bg: theme.palette.error.main, color: theme.palette.error.contrastText },
  };
  
  const statusColors = colors[status] || colors['pending'];
  return {
    backgroundColor: statusColors.bg,
    color: statusColors.color,
    fontWeight: 'bold'
  };
});

// Mock data
const mockBenefits = {
  totalReceived: 31500,
  activeBenefits: 3,
  completedPrograms: 2,
  pendingPayments: 8000,
  benefits: [
    {
      id: 'BEN-2024-001',
      programName: 'Fertilizer Subsidy Program',
      benefitType: 'Financial Assistance',
      totalAmount: 5000,
      receivedAmount: 5000,
      status: 'received',
      dateReceived: '2024-01-20',
      referenceNumber: 'REF-001-2024',
      description: 'Fertilizer subsidy for 2.5 hectares rice farm',
      coordinator: 'John Santos'
    },
    {
      id: 'BEN-2024-002',
      programName: 'High-Quality Seed Distribution',
      benefitType: 'In-Kind Assistance',
      totalAmount: 3500,
      receivedAmount: 3500,
      status: 'received',
      dateReceived: '2024-02-15',
      referenceNumber: 'REF-002-2024',
      description: 'Certified rice seeds - 25kg hybrid variety',
      coordinator: 'Maria Cruz'
    },
    {
      id: 'BEN-2024-003',
      programName: 'Crop Insurance Program',
      benefitType: 'Insurance Coverage',
      totalAmount: 8000,
      receivedAmount: 0,
      status: 'processing',
      dateReceived: null,
      referenceNumber: 'REF-003-2024',
      description: 'Crop insurance coverage for 2 hectares',
      coordinator: 'Ana Reyes'
    },
    {
      id: 'BEN-2024-004',
      programName: 'Farm Equipment Assistance',
      benefitType: 'Equipment Support',
      totalAmount: 15000,
      receivedAmount: 0,
      status: 'pending',
      dateReceived: null,
      referenceNumber: 'REF-004-2024',
      description: 'Water pump and irrigation equipment',
      coordinator: 'Pedro Garcia'
    },
    {
      id: 'BEN-2024-005',
      programName: 'Agricultural Training Program',
      benefitType: 'Training & Education',
      totalAmount: 2000,
      receivedAmount: 2000,
      status: 'received',
      dateReceived: '2024-03-01',
      referenceNumber: 'REF-005-2024',
      description: 'Training completion allowance',
      coordinator: 'Jose Martinez'
    }
  ],
  paymentHistory: [
    { date: '2024-03-01', amount: 2000, program: 'Agricultural Training Program', type: 'Training Allowance' },
    { date: '2024-02-15', amount: 3500, program: 'Seed Distribution', type: 'In-Kind Value' },
    { date: '2024-01-20', amount: 5000, program: 'Fertilizer Subsidy', type: 'Direct Payment' },
    { date: '2023-12-10', amount: 4000, program: 'Fertilizer Subsidy', type: 'Direct Payment' },
    { date: '2023-11-25', amount: 2500, program: 'Seed Distribution', type: 'In-Kind Value' }
  ]
};

function MyBenefits() {
  const [benefits, setBenefits] = useState(mockBenefits);
  const [loading, setLoading] = useState(true);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchBenefits = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBenefits(mockBenefits);
      } catch (error) {
        console.error('Error fetching benefits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenefits();
  }, []);

  const handleViewDetails = (benefit) => {
    setSelectedBenefit(benefit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBenefit(null);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'received': 'Received',
      'pending': 'Pending',
      'processing': 'Processing',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StyledCard>
          <CardContent>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading your benefits...</Typography>
          </CardContent>
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledCard>
        <CardHeader
          avatar={<MonetizationOnIcon />}
          title="My Benefits"
          subheader="Track your received benefits and payment history"
        />
        <CardContent>
          {/* Statistics Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <StatsCard sx={{ bgcolor: 'success.main' }}>
                <Typography variant="h4">₱{benefits.totalReceived.toLocaleString()}</Typography>
                <Typography variant="body2">Total Received</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard sx={{ bgcolor: 'primary.main' }}>
                <Typography variant="h4">{benefits.activeBenefits}</Typography>
                <Typography variant="body2">Active Benefits</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard sx={{ bgcolor: 'info.main' }}>
                <Typography variant="h4">{benefits.completedPrograms}</Typography>
                <Typography variant="body2">Completed Programs</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard sx={{ bgcolor: 'warning.main' }}>
                <Typography variant="h4">₱{benefits.pendingPayments.toLocaleString()}</Typography>
                <Typography variant="body2">Pending Payments</Typography>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Current Benefits */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            Current Benefits
          </Typography>
          
          {benefits.benefits.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              You haven't received any benefits yet. <Button href="/beneficiary/programs/available">Browse available programs</Button>
            </Alert>
          ) : (
            <Box sx={{ mb: 4 }}>
              {benefits.benefits.map((benefit) => (
                <BenefitCard key={benefit.id} elevation={2}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        {benefit.programName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {benefit.description}
                      </Typography>
                      <Chip
                        label={benefit.benefitType}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Coordinator: {benefit.coordinator}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₱{benefit.totalAmount.toLocaleString()}
                      </Typography>
                      {benefit.receivedAmount > 0 && (
                        <Typography variant="body2" color="success.main">
                          Received: ₱{benefit.receivedAmount.toLocaleString()}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <StatusChip
                          label={getStatusText(benefit.status)}
                          status={benefit.status}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        {benefit.dateReceived && (
                          <Typography variant="body2" color="text.secondary">
                            {new Date(benefit.dateReceived).toLocaleDateString()}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewDetails(benefit)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          {benefit.status === 'received' && (
                            <Tooltip title="Download Receipt">
                              <IconButton size="small" color="primary">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </BenefitCard>
              ))}
            </Box>
          )}

          {/* Payment History */}
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1 }} />
            Payment History
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Program</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {benefits.paymentHistory.map((payment, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        {new Date(payment.date).toLocaleDateString()}
                      </Box>
                    </TableCell>
                    <TableCell>{payment.program}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.type}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        ₱{payment.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </StyledCard>

      {/* Benefit Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Benefit Details - {selectedBenefit?.id}
        </DialogTitle>
        <DialogContent>
          {selectedBenefit && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{selectedBenefit.programName}</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedBenefit.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Benefit Type</Typography>
                <Typography variant="body2">{selectedBenefit.benefitType}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Total Amount</Typography>
                <Typography variant="body2">₱{selectedBenefit.totalAmount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Received Amount</Typography>
                <Typography variant="body2">₱{selectedBenefit.receivedAmount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Status</Typography>
                <StatusChip
                  label={getStatusText(selectedBenefit.status)}
                  status={selectedBenefit.status}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Reference Number</Typography>
                <Typography variant="body2">{selectedBenefit.referenceNumber}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Coordinator</Typography>
                <Typography variant="body2">{selectedBenefit.coordinator}</Typography>
              </Grid>
              {selectedBenefit.dateReceived && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Date Received</Typography>
                  <Typography variant="body2">
                    {new Date(selectedBenefit.dateReceived).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedBenefit?.status === 'received' && (
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Download Receipt
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyBenefits;
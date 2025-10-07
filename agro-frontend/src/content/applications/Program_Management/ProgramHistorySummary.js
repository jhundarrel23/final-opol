/* eslint-disable react/jsx-boolean-value */
/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-unused-vars */
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Divider,
  Alert
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { format } from 'date-fns';
import { 
  ArrowBack, 
  People, 
  Inventory, 
  AccountBalance, 
  Timeline,
  CheckCircle,
  Schedule,
  TrendingUp
} from '@mui/icons-material';

// Utility: format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Utility: format currency
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '₱0';
  return `₱${amount.toLocaleString()}`;
};

// Summary Metric Card
const MetricCard = ({ icon: Icon, title, value, subtitle, color = '#3B82F6', progress }) => (
  <Card sx={{ 
    border: '1px solid #E5E7EB', 
    borderRadius: 2, 
    boxShadow: 'none',
    height: '100%'
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color, fontWeight: 600, mb: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {Icon && (
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color
          }}>
            <Icon sx={{ fontSize: 24 }} />
          </Box>
        )}
      </Box>
      
      {progress !== undefined && (
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#F3F4F6',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}
    </CardContent>
  </Card>
);

// Timeline Status Card
const TimelineCard = ({ title, date, status, isCompleted }) => (
  <Card sx={{ 
    border: '1px solid #E5E7EB', 
    borderRadius: 2, 
    boxShadow: 'none',
    backgroundColor: isCompleted ? '#F0F9FF' : '#FAFAFA'
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {isCompleted ? (
          <CheckCircle sx={{ color: '#059669', fontSize: 20 }} />
        ) : (
          <Schedule sx={{ color: '#6B7280', fontSize: 20 }} />
        )}
        <Typography variant="body1" fontWeight={600} color={isCompleted ? '#059669' : '#6B7280'}>
          {title}
        </Typography>
      </Box>
      
      <Typography variant="h6" fontWeight={500} mb={1}>
        {formatDate(date)}
      </Typography>
      
      {status && (
        <Typography variant="caption" sx={{
          px: 1,
          py: 0.5,
          borderRadius: 1,
          backgroundColor: isCompleted ? '#DCFCE7' : '#F3F4F6',
          color: isCompleted ? '#166534' : '#6B7280',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          fontWeight: 600
        }}>
          {status}
        </Typography>
      )}
    </CardContent>
  </Card>
);

function ProgramHistorySummary() {
  const { id: programId } = useParams();
  const navigate = useNavigate();
  
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/api/subsidy-programs/${programId}/history-summary`);
        setSummaryData(response.data);
      } catch (err) {
        console.error('Error fetching program summary:', err);
        setError(err.response?.data?.message || 'Failed to load program summary');
      } finally {
        setLoading(false);
      }
    };
    
    if (programId) {
      fetchSummary();
    }
  }, [programId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading program summary...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (!summaryData) {
    return (
      <Container maxWidth="xl">
        <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
          <Typography variant="body1">
            No summary data available for this program.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const { statistics, timeline, status_flow } = summaryData;
  const distributionProgress = statistics?.distribution_percentage || 0;

  return (
    <>
      <PageTitleWrapper>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: '#6B7280' }}
          >
            Back to Programs
          </Button>
        </Box>
        
        <Typography variant="h3">Program Summary</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {summaryData.program_title}
        </Typography>
      </PageTitleWrapper>

      <Container maxWidth="xl">
        {/* Key Metrics */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={3}>
            <MetricCard
              icon={People}
              title="Total Beneficiaries"
              value={statistics?.total_beneficiaries || 0}
              subtitle="Registered recipients"
              color="#059669"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <MetricCard
              icon={Inventory}
              title="Item Distribution"
              value={`${statistics?.total_items_distributed || 0}/${statistics?.total_items_planned || 0}`}
              subtitle="Items distributed"
              color="#7C3AED"
              progress={distributionProgress}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <MetricCard
              icon={AccountBalance}
              title="Total Program Value"
              value={formatCurrency(statistics?.total_program_value)}
              subtitle={`${formatCurrency(statistics?.distributed_value)} distributed`}
              color="#DC2626"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <MetricCard
              icon={TrendingUp}
              title="Program Duration"
              value={`${timeline?.duration_days || 0} days`}
              subtitle="From creation to current"
              color="#0EA5E9"
            />
          </Grid>
        </Grid>

        {/* Program Timeline */}
        <Card sx={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: 2, 
          boxShadow: 'none',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Timeline sx={{ color: '#3B82F6' }} />
              <Typography variant="h5" fontWeight={600}>
                Program Timeline
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TimelineCard
                  title="Program Created"
                  date={timeline?.created_at}
                  status="Completed"
                  isCompleted={true}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TimelineCard
                  title="Program Approved"
                  date={timeline?.approved_at}
                  status={timeline?.approved_at ? "Completed" : "Pending"}
                  isCompleted={!!timeline?.approved_at}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TimelineCard
                  title="Program Completed"
                  date={status_flow?.completed}
                  status={status_flow?.completed ? "Completed" : "In Progress"}
                  isCompleted={!!status_flow?.completed}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Distribution Progress Details */}
        <Card sx={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: 2, 
          boxShadow: 'none'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Distribution Progress Details
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Items Progress
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">
                      {statistics?.total_items_distributed || 0} of {statistics?.total_items_planned || 0} items distributed
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {distributionProgress.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={distributionProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#F3F4F6',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#059669',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Financial Progress
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body1">
                      {formatCurrency(statistics?.distributed_value)} of {formatCurrency(statistics?.total_program_value)} distributed
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {statistics?.total_program_value ? 
                        ((statistics?.distributed_value / statistics?.total_program_value) * 100).toFixed(1) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={statistics?.total_program_value ? 
                      (statistics?.distributed_value / statistics?.total_program_value) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#F3F4F6',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#DC2626',
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Quick Stats
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Total Beneficiaries</Typography>
                  <Typography variant="h6" fontWeight={600}>{statistics?.total_beneficiaries || 0}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Items Planned</Typography>
                  <Typography variant="h6" fontWeight={600}>{statistics?.total_items_planned || 0}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Items Distributed</Typography>
                  <Typography variant="h6" fontWeight={600}>{statistics?.total_items_distributed || 0}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">Completion Rate</Typography>
                  <Typography variant="h6" fontWeight={600} color={distributionProgress >= 100 ? '#059669' : '#F59E0B'}>
                    {distributionProgress.toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Distribution Transactions */}
        <Card sx={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: 2, 
          boxShadow: 'none',
          mt: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Distribution Transactions
            </Typography>

            {Array.isArray(summaryData?.distributions) && summaryData.distributions.length > 0 ? (
              <Box>
                <Grid container spacing={2} sx={{ mb: 1, px: 1 }}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="caption" color="text.secondary">Date</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="caption" color="text.secondary">Item</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="caption" color="text.secondary">Quantity</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="caption" color="text.secondary">Total Value</Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="caption" color="text.secondary">Reference</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2 }} />

                {summaryData.distributions.map((row) => {
                  const isCash = row?.inventory?.assistance_category === 'monetary';
                  const qty = row?.quantity ?? 0;
                  const displayQty = isCash ? `₱${Math.abs(qty).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${Math.abs(qty)} ${row?.inventory?.unit || ''}`;
                  const value = row?.total_value ?? 0;
                  return (
                    <Box key={row.id} sx={{ px: 1, py: 1.5, borderRadius: 1, '&:hover': { backgroundColor: '#F9FAFB' } }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <Typography variant="body2">{formatDate(row.transaction_date)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{row?.inventory?.item_name || '—'}</Typography>
                            {row?.remarks && (
                              <Typography variant="caption" color="text.secondary">{row.remarks}</Typography>
                            )}
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" color={isCash ? 'primary.main' : 'text.primary'} fontWeight={600}>
                            {displayQty}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" fontWeight={600}>{formatCurrency(value)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Typography variant="caption" color="text.secondary">{row.reference || '—'}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">No distribution transactions recorded yet.</Typography>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box display="flex" gap={2} mt={4} mb={2}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/programs/${programId}/history`)}
            startIcon={<Timeline />}
          >
            View Full History
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate(`/programs/${programId}`)}
          >
            View Program Details
          </Button>
        </Box>
      </Container>

      <Footer />
    </>
  );
}

export default ProgramHistorySummary;
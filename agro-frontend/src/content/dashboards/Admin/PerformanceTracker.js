import { useState } from 'react';
import {
  Button,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  Typography,
  styled,
  // eslint-disable-next-line no-unused-vars
  CircularProgress,
  alpha
} from '@mui/material';
import { Grid, BarChart3, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import PerformanceTrackerColumn from './PerformanceTrackerColumn';
import PerformanceTrackerRow from './PerformanceTrackerRow';
import useAdminDashboard from './hooks/useAdminDashboard';

const EmptyResultsWrapper = styled('img')(
  ({ theme }) => `
      max-width: 100%;
      width: ${theme.spacing(66)};
      height: ${theme.spacing(34)};
      opacity: 0.7;
      transition: opacity 0.3s ease;
      
      &:hover {
        opacity: 1;
      }
`
);

const StyledCard = styled(Card)(
  ({ theme }) => `
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid ${alpha(theme.colors.primary.main, 0.1)};
    box-shadow: 0 20px 60px ${alpha(theme.colors.primary.main, 0.1)};
    border-radius: 24px;
    padding: ${theme.spacing(6)};
    text-align: center;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.success.main}, ${theme.colors.info.main});
    }
  `
);

const HeaderBox = styled(Box)(
  ({ theme }) => `
    background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.05)} 0%, ${alpha(theme.colors.success.main, 0.05)} 100%);
    backdrop-filter: blur(10px);
    border: 1px solid ${alpha(theme.colors.primary.main, 0.1)};
    border-radius: 20px;
    padding: ${theme.spacing(3)};
    margin-bottom: ${theme.spacing(4)};
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.success.main});
      border-radius: 20px 20px 0 0;
    }
  `
);

const LoadingBox = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.02)} 0%, ${alpha(theme.colors.success.main, 0.02)} 100%);
    border-radius: 20px;
    border: 1px solid ${alpha(theme.colors.primary.main, 0.1)};
    backdrop-filter: blur(10px);
  `
);

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(
  ({ theme }) => `
    background: ${alpha(theme.colors.primary.main, 0.05)};
    border-radius: 16px;
    border: 1px solid ${alpha(theme.colors.primary.main, 0.2)};
    backdrop-filter: blur(10px);
    
    .MuiToggleButton-root {
      border: none;
      border-radius: 12px !important;
      margin: 4px;
      padding: ${theme.spacing(1, 2)};
      color: ${theme.colors.primary.main};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &.Mui-selected {
        background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main});
        color: white;
        box-shadow: 0 4px 12px ${alpha(theme.colors.primary.main, 0.3)};
        transform: translateY(-1px);
        
        &:hover {
          background: linear-gradient(135deg, ${theme.colors.primary.dark}, ${theme.colors.success.dark});
        }
      }
      
      &:hover:not(.Mui-selected) {
        background: ${alpha(theme.colors.primary.main, 0.1)};
        transform: translateY(-1px);
      }
    }
  `
);

const MetricCard = styled(Box)(
  ({ theme }) => `
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
    backdrop-filter: blur(15px);
    border: 1px solid ${alpha(theme.colors.primary.main, 0.1)};
    border-radius: 16px;
    padding: ${theme.spacing(3)};
    text-align: center;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px ${alpha(theme.colors.primary.main, 0.15)};
      border-color: ${alpha(theme.colors.primary.main, 0.2)};
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gradient);
      border-radius: 16px 16px 0 0;
    }
  `
);

function PerformanceTracker({ distributionSummary }) {
  const [tabs, setTab] = useState('performance_columns');
  const { coordinatorPerformanceData, loading, refreshData, lastFetch } = useAdminDashboard();

  const handleViewOrientation = (event, newValue) => {
    if (newValue !== null) {
      setTab(newValue);
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  // Calculate summary metrics
  const totalPrograms = coordinatorPerformanceData?.reduce((sum, c) => sum + (c.metrics?.total_programs || 0), 0) || 0;
  const totalBeneficiaries = coordinatorPerformanceData?.reduce((sum, c) => sum + (c.metrics?.total_beneficiaries || 0), 0) || 0;
  const avgEfficiency = coordinatorPerformanceData?.length > 0 
    ? (coordinatorPerformanceData.reduce((sum, c) => sum + (c.metrics?.efficiency_score || 0), 0) / coordinatorPerformanceData.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <Box>
        <HeaderBox>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography 
                variant="h3" 
                fontWeight={700}
                sx={{
                  background: 'linear-gradient(135deg, #1976d2, #4caf50)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Coordinator Performance
              </Typography>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Real-time performance metrics and analytics
              </Typography>
            </Box>
          </Box>
        </HeaderBox>

        <LoadingBox>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              border: '4px solid rgba(25, 118, 210, 0.2)',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <Box>
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                Loading coordinator performance data...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzing metrics and generating insights
              </Typography>
            </Box>
          </Box>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </LoadingBox>
      </Box>
    );
  }

  return (
    <Box>
      <HeaderBox>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Coordinator Performance Dashboard
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                Real-time performance metrics and analytics
              </Typography>
              {lastFetch && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Clock size={14} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Updated: {lastFetch.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Button
              size="large"
              variant="outlined"
              startIcon={<RefreshCw size={18} />}
              onClick={handleRefresh}
              disabled={loading}
            sx={{
              borderRadius: '16px',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'success.main',
              color: 'success.main',
              backgroundColor: alpha('#4CAF50', 0.05),
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: 'success.dark',
                  backgroundColor: alpha('#4CAF50', 0.1),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(76, 175, 80, 0.2)'
                },
                '&:disabled': {
                  opacity: 0.6
                }
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            
            <StyledToggleButtonGroup
              value={tabs}
              exclusive
              onChange={handleViewOrientation}
              size="small"
            >
              <ToggleButton value="performance_columns">
                <Grid size={18} style={{ marginRight: '8px' }} />
                Grid View
              </ToggleButton>
              <ToggleButton value="performance_rows">
                <BarChart3 size={18} style={{ marginRight: '8px' }} />
                Chart View
              </ToggleButton>
            </StyledToggleButtonGroup>
          </Box>
        </Box>
      </HeaderBox>

      {/* Performance Metrics Summary */}
      {coordinatorPerformanceData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mb: 4
            }}
          >
            <MetricCard sx={{ '--gradient': 'linear-gradient(90deg, #4CAF50, #66BB6A)' }}>
              <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                {coordinatorPerformanceData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Active Coordinators
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 0.5 }}>
                <TrendingUp size={14} color="#4CAF50" />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  Online
                </Typography>
              </Box>
            </MetricCard>

            <MetricCard sx={{ '--gradient': 'linear-gradient(90deg, #4caf50, #66bb6a)' }}>
              <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mb: 1 }}>
                {totalPrograms}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Total Programs
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 0.5 }}>
                <TrendingUp size={14} color="#4caf50" />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  Active
                </Typography>
              </Box>
            </MetricCard>

            <MetricCard sx={{ '--gradient': 'linear-gradient(90deg, #2196f3, #64b5f6)' }}>
              <Typography variant="h4" fontWeight={700} color="info.main" sx={{ mb: 1 }}>
                {totalBeneficiaries.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Beneficiaries Served
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 0.5 }}>
                <TrendingUp size={14} color="#2196f3" />
                <Typography variant="caption" color="info.main" fontWeight={600}>
                  Growing
                </Typography>
              </Box>
            </MetricCard>

            <MetricCard sx={{ '--gradient': 'linear-gradient(90deg, #ff9800, #ffb74d)' }}>
              <Typography variant="h4" fontWeight={700} color="warning.main" sx={{ mb: 1 }}>
                {avgEfficiency}%
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Avg Efficiency Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 0.5 }}>
                <TrendingUp size={14} color="#ff9800" />
                <Typography variant="caption" color="warning.main" fontWeight={600}>
                  Optimized
                </Typography>
              </Box>
            </MetricCard>
          </Box>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        background: alpha('#ffffff', 0.6),
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: `1px solid ${alpha('#1976d2', 0.1)}`,
        overflow: 'hidden'
      }}>
        {tabs === 'performance_columns' && (
          <PerformanceTrackerColumn 
            data={coordinatorPerformanceData} 
            distributionSummary={distributionSummary}
          />
        )}

        {tabs === 'performance_rows' && (
          <PerformanceTrackerRow data={coordinatorPerformanceData} />
        )}
      </Box>

      {/* Empty State */}
      {coordinatorPerformanceData.length === 0 && !loading && (
        <StyledCard>
          <EmptyResultsWrapper src="/static/images/placeholders/illustrations/1.svg" />

          <Typography
            align="center"
            variant="h4"
            fontWeight={600}
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(135deg, #1976d2, #4caf50)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            gutterBottom
          >
            No Performance Data Available
          </Typography>
          <Typography
            align="center"
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}
          >
            Coordinator performance metrics will appear here once there are active programs and coordinators in the system.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshCw size={20} />}
            onClick={handleRefresh}
            sx={{
              borderRadius: '16px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #1976d2, #4caf50)',
              boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0, #388e3c)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)'
              }
            }}
          >
            Refresh Data
          </Button>
        </StyledCard>
      )}
    </Box>
  );
}

export default PerformanceTracker;
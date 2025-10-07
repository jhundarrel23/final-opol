import {
  Card,
  Box,
  Typography,
  Avatar,
  Stack,
  Divider,
  styled,
  useTheme,
  Chip,
  Button,
  CardActions
} from '@mui/material';
import { TrendingDown, TrendingUp, Minus, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

import Text from 'src/components/Text';
import Chart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    margin: ${theme.spacing(0, 2, 1, 0)};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    height: ${theme.spacing(7)};
    width: ${theme.spacing(7)};
    background: linear-gradient(135deg, ${theme.colors.primary.main}15 0%, ${theme.colors.success.main}15 100%);
    backdrop-filter: blur(10px);
    border: 2px solid ${theme.colors.primary.main}20;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 18px;
      background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main});
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px ${theme.colors.primary.main}30;
      
      &::before {
        opacity: 0.1;
      }
    }
`
);

const StyledCard = styled(Card)(
  ({ theme }) => `
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid ${theme.colors.primary.main}20;
    box-shadow: 0 20px 60px ${theme.colors.primary.main}15;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    
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

const MetricBadge = styled(Box)(({ theme, variant = 'success' }) => {
  const variants = {
    success: {
      bg: theme.colors.success.main,
      color: 'white'
    },
    warning: {
      bg: theme.colors.warning.main,
      color: 'white'
    },
    error: {
      bg: theme.colors.error.main,
      color: 'white'
    },
    info: {
      bg: theme.colors.info.main,
      color: 'white'
    }
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1.5),
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 700,
    background: `linear-gradient(135deg, ${variants[variant].bg}, ${variants[variant].bg}dd)`,
    color: variants[variant].color,
    boxShadow: `0 4px 12px ${variants[variant].bg}40`,
    border: `1px solid ${variants[variant].bg}30`
  };
});

function PerformanceTrackerRow({ data }) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Sector icon mapping with Lucide icons
  const getSectorIcon = (sectorName) => {
    const sector = sectorName.toLowerCase();
    
    if (sector.includes('rice') || sector.includes('palay')) {
      return '🌾';
    }
    if (sector.includes('hvc') || sector.includes('high value') || sector.includes('fruit') || sector.includes('vegetable')) {
      return '🍎';
    }
    if (sector.includes('agriculture') || sector.includes('crop') || sector.includes('corn')) {
      return '🌽';
    }
    if (sector.includes('livestock') || sector.includes('cattle') || sector.includes('animal')) {
      return '🐄';
    }
    if (sector.includes('fishery') || sector.includes('fish') || sector.includes('aqua')) {
      return '🐟';
    }
    return '🌾'; // Default fallback
  };

  const chartOptions = {
    chart: {
      animations: { enabled: true },
      background: 'transparent',
      toolbar: { show: false },
      sparkline: { enabled: true },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      colors: [theme.colors.primary.main],
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: [theme.colors.success.main],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    yaxis: { show: false },
    colors: [theme.colors.primary.main],
    grid: {
      padding: { top: 10, right: 5, bottom: 10, left: 5 }
    },
    theme: { mode: theme.palette.mode },
    tooltip: {
      enabled: true,
      theme: theme.palette.mode,
      style: {
        fontSize: '12px'
      },
      x: { show: false },
      y: {
        title: {
          formatter: () => 'Programs: '
        }
      },
      marker: { show: true }
    }
  };

  // Take top 3 performers for row view
  const topPerformers = data.slice(0, 3);

  const getTrendIcon = (percentage) => {
    if (percentage > 0) return TrendingUp;
    if (percentage < 0) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (percentage) => {
    if (percentage > 0) return theme.colors.success.main;
    if (percentage < 0) return theme.colors.error.main;
    return theme.colors.warning.main;
  };

  const getSuccessRateVariant = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  return (
    <StyledCard>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-evenly"
        alignItems="stretch"
        divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' } }} />}
        spacing={0}
      >
        {topPerformers.map((coordinator, index) => {
          const chartData = [{
            name: 'Program Activity',
            data: coordinator.recent_activity?.length > 0 
              ? coordinator.recent_activity.map(item => item.programs_created)
              : [0, 2, 1, 4, 3, 5, 3] // Enhanced fallback data
          }];

          const TrendIcon = getTrendIcon(coordinator.metrics.trend_percentage);
          const trendColor = getTrendColor(coordinator.metrics.trend_percentage);
          const trendText = coordinator.metrics.trend_percentage >= 0 ? 'success' : 'error';
          const successRateVariant = getSuccessRateVariant(coordinator.metrics.success_rate);

          return (
            <Box
              key={coordinator.coordinator_id}
              sx={{ 
                width: '100%', 
                p: { xs: 3, lg: 4 },
                position: 'relative',
                '&::after': index < topPerformers.length - 1 ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '10%',
                  right: '10%',
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${theme.colors.primary.main}20, transparent)`,
                  display: { xs: 'block', lg: 'none' }
                } : {}
              }}
            >
              {/* Header Section */}
              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
                mb={3}
              >
                <Box display="flex" alignItems="center" flex={1}>
                  <AvatarWrapper>
                    <Typography variant="h4" sx={{ filter: 'grayscale(0)' }}>
                      {getSectorIcon(coordinator.sector)}
                    </Typography>
                  </AvatarWrapper>
                  <Box>
                    <Typography 
                      variant="h5" 
                      fontWeight={700}
                      color="text.primary"
                      sx={{ mb: 0.5 }}
                    >
                      {coordinator.coordinator_name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {coordinator.sector} Sector
                    </Typography>
                  </Box>
                </Box>
                
                <MetricBadge variant={successRateVariant}>
                  <CheckCircle size={12} />
                  {coordinator.metrics.success_rate}%
                </MetricBadge>
              </Box>

              {/* Main Metrics */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography 
                    variant="h1" 
                    fontWeight={800}
                    sx={{
                      fontSize: '3.5rem',
                      background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1
                    }}
                  >
                    {coordinator.metrics.total_programs}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendIcon size={20} style={{ color: trendColor }} />
                    <Text color={trendText} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                      {coordinator.metrics.trend_percentage >= 0 ? '+' : ''}
                      {coordinator.metrics.trend_percentage}%
                    </Text>
                  </Box>
                </Box>
              </Box>

              {/* Beneficiaries & Status */}
              <Box mb={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Users size={18} color={theme.colors.info.main} />
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    {coordinator.metrics.total_beneficiaries.toLocaleString()} beneficiaries served
                  </Typography>
                </Box>
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<Clock size={14} />}
                    label={`${coordinator.status_breakdown.ongoing} Ongoing`}
                    size="small"
                    variant="filled"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.colors.info.main}, ${theme.colors.info.main}dd)`,
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                  <Chip
                    icon={<CheckCircle size={14} />}
                    label={`${coordinator.status_breakdown.completed} Completed`}
                    size="small"
                    variant="filled"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.main}dd)`,
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                  {coordinator.status_breakdown.pending > 0 && (
                    <Chip
                      icon={<AlertCircle size={14} />}
                      label={`${coordinator.status_breakdown.pending} Pending`}
                      size="small"
                      variant="filled"
                      sx={{
                        background: `linear-gradient(135deg, ${theme.colors.warning.main}, ${theme.colors.warning.main}dd)`,
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Performance Chart */}
              <Box 
                sx={{ 
                  pt: 2,
                  borderTop: `2px solid ${theme.colors.primary.main}10`,
                  borderRadius: '8px 8px 0 0',
                  background: `linear-gradient(135deg, ${theme.colors.primary.main}05, ${theme.colors.success.main}05)`
                }}
              >
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={600}
                  sx={{ mb: 1, display: 'block', textAlign: 'center' }}
                >
                  Recent Activity Trend
                </Typography>
                <Chart
                  options={chartOptions}
                  series={chartData}
                  type="area"
                  height={100}
                />
              </Box>
            </Box>
          );
        })}
      </Stack>
      
      <Divider sx={{ background: `linear-gradient(90deg, transparent, ${theme.colors.primary.main}30, transparent)` }} />
      
      <CardActions
        disableSpacing
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.colors.primary.main}05, ${theme.colors.success.main}05)`
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/management/Coordinator')}
          sx={{
            background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main})`,
            borderRadius: '16px',
            px: 4,
            py: 1.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: `0 8px 32px ${theme.colors.primary.main}30`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.colors.primary.dark}, ${theme.colors.success.dark})`,
              transform: 'translateY(-2px)',
              boxShadow: `0 12px 40px ${theme.colors.primary.main}40`
            }
          }}
        >
          <Users size={20} style={{ marginRight: '8px' }} />
          View All Coordinators
        </Button>
      </CardActions>
    </StyledCard>
  );
}

export default PerformanceTrackerRow;
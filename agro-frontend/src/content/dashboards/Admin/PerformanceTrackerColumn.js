/* eslint-disable no-unused-vars */
import {
  Card,
  Box,
  Typography,
  Avatar,
  Grid,
  alpha,
  useTheme,
  styled,
  Chip,
  LinearProgress,
  Tooltip
} from '@mui/material';
import Label from 'src/components/Label';
import Text from 'src/components/Text';
import Chart from 'react-apexcharts';

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    margin: ${theme.spacing(0, 0, 1, -0.5)};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(1)};
    padding: ${theme.spacing(0.5)};
    border-radius: 60px;
    height: ${theme.spacing(5.5)};
    width: ${theme.spacing(5.5)};
    background: ${theme.palette.mode === 'dark'
      ? theme.colors.alpha.trueWhite[30]
      : alpha(theme.colors.alpha.black[100], 0.07)
    };
  
    img {
      background: ${theme.colors.alpha.trueWhite[100]};
      padding: ${theme.spacing(0.5)};
      display: block;
      border-radius: inherit;
      height: ${theme.spacing(4.5)};
      width: ${theme.spacing(4.5)};
    }
`
);

function PerformanceTrackerColumn({ data, distributionSummary }) {
  const theme = useTheme();

  // Function to get sector image
  const getSectorImage = (sectorName) => {
    const sector = sectorName.toLowerCase();
    
    if (sector.includes('rice') || sector.includes('palay')) {
      return '/static/sectorImage/wheat.gif';
    } if (sector.includes('hvc') || sector.includes('high value') || sector.includes('fruit') || sector.includes('vegetable')) {
      return '/static/sectorImage/fruit.gif';
    } if (sector.includes('agriculture') || sector.includes('crop') || sector.includes('corn')) {
      return '/static/sectorImage/corn.gif';
    } if (sector.includes('livestock') || sector.includes('cattle') || sector.includes('animal')) {
      return '/static/sectorImage/cow.gif';
    } if (sector.includes('fishery') || sector.includes('fish') || sector.includes('aqua')) {
      return '/static/sectorImage/fishing.gif';
    } 
      return '/static/sectorImage/corn.gif';
    
  };

  const chartOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: true
      },
      zoom: {
        enabled: false
      }
    },
    fill: {
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.1,
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0,
        stops: [0, 100]
      }
    },
    colors: [theme.colors.primary.main],
    dataLabels: {
      enabled: false
    },
    theme: {
      mode: theme.palette.mode
    },
    stroke: {
      show: true,
      colors: [theme.colors.primary.main],
      width: 3
    },
    legend: {
      show: false
    },
    xaxis: {
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false,
      tickAmount: 5
    },
    tooltip: {
      x: {
        show: true
      },
      y: {
        title: {
          formatter() {
            return 'Programs: ';
          }
        }
      },
      marker: {
        show: false
      }
    }
  };

  // Take top 3 performers for column view
  const topPerformers = data.slice(0, 3);

  return (
    <Grid
      container
      direction="row"
      justifyContent="center"
      alignItems="stretch"
      spacing={3}
    >
      {topPerformers.map((coordinator, index) => {
        // Prepare chart data from recent activity
        const chartData = [{
          name: 'Program Creation',
          data: coordinator.recent_activity?.length > 0 
            ? coordinator.recent_activity.map(item => item.programs_created)
            : [0, 0, 0, 0, 0, 0] // fallback data
        }];

        const trendColor = coordinator.metrics.trend_percentage >= 0 ? 'success' : 'error';
        const trendIcon = coordinator.metrics.trend_percentage >= 0 ? '+' : '';

        return (
          <Grid item md={4} xs={12} key={coordinator.coordinator_id}>
            <Card
              sx={{
                overflow: 'visible'
              }}
            >
              <Box
                sx={{
                  p: 3
                }}
              >
                <Box display="flex" alignItems="center">
                  <AvatarWrapper>
                    <img
                      alt={coordinator.sector}
                      src={getSectorImage(coordinator.sector)}
                    />
                  </AvatarWrapper>
                  <Box>
                    <Typography variant="h4" noWrap>
                      {coordinator.coordinator_name}
                    </Typography>
                    <Typography variant="subtitle1" noWrap>
                      {coordinator.sector}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    pt: 3
                  }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      pr: 1,
                      mb: 1
                    }}
                  >
                    {coordinator.metrics.total_programs}
                  </Typography>
                  <Text color={trendColor}>
                    <b>{trendIcon}{coordinator.metrics.trend_percentage}%</b>
                  </Text>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    mb: 2
                  }}
                >
                  <Label color="info">{coordinator.metrics.success_rate}% Success</Label>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ pl: 1 }}
                  >
                    {coordinator.metrics.total_beneficiaries} beneficiaries
                  </Typography>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  <Chip
                    label={`${coordinator.status_breakdown.ongoing} Ongoing`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${coordinator.status_breakdown.completed} Done`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>

                {/* Distribution Progress Section */}
                {distributionSummary && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight={600} color="primary">
                        Distribution Progress
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {Math.round(distributionSummary.completionRate)}%
                      </Typography>
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={distributionSummary.completionRate}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: theme.palette.primary.main
                        }
                      }}
                    />
                    
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        {distributionSummary.distributedItems} distributed
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {distributionSummary.pendingItems} pending
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              
              <Chart
                options={chartOptions}
                series={chartData}
                type="area"
                height={200}
              />
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export default PerformanceTrackerColumn;
/* eslint-disable no-unused-vars */
import {
  Card,
  Box,
  Grid,
  Typography,
  useTheme,
  styled,
  Avatar,
  Divider,
  alpha,
  ListItem,
  ListItemText,
  List,
  ListItemAvatar
} from '@mui/material';
import { Users, Wheat, Fish, Apple, Beef, TrendingUp } from 'lucide-react';
import Text from 'src/components/Text';
import Chart from 'react-apexcharts';
import useAdminDashboard from './hooks/useAdminDashboard';

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
      background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${alpha(theme.colors.primary.main, 0.8)} 100%);
      color: ${theme.palette.primary.contrastText};
      width: ${theme.spacing(10)};
      height: ${theme.spacing(10)};
      box-shadow: 0 8px 32px ${alpha(theme.colors.primary.main, 0.3)};
      border: 3px solid ${alpha(theme.colors.primary.main, 0.1)};
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main});
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask-composite: xor;
        -webkit-mask-composite: xor;
        animation: rotate 3s linear infinite;
      }

      @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
`
);

const ListItemAvatarWrapper = styled(ListItemAvatar)(
  ({ theme }) => `
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing(2)};
  padding: ${theme.spacing(1)};
  border-radius: 16px;
  background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.1)} 0%, ${alpha(theme.colors.success.main, 0.1)} 100%);
  backdrop-filter: blur(10px);
  border: 1px solid ${alpha(theme.colors.primary.main, 0.2)};
  width: 56px;
  height: 56px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 12px 40px ${alpha(theme.colors.primary.main, 0.2)};
  }
`
);

const StyledCard = styled(Card)(
  ({ theme }) => `
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid ${alpha(theme.colors.primary.main, 0.1)};
    box-shadow: 0 20px 60px ${alpha(theme.colors.primary.main, 0.1)};
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

// sector → Lucide icon mapping
const sectorIcons = {
  RICE: <Wheat size={24} />,
  CORN: <Wheat size={24} />,
  HVC: <Apple size={24} />,
  LIVESTOCK: <Beef size={24} />,
  FISHERIES: <Fish size={24} />
};

// sector → color mapping
const sectorColors = {
  RICE: '#4CAF50',
  CORN: '#FF9800',
  HVC: '#F44336',
  LIVESTOCK: '#9C27B0',
  FISHERIES: '#2196F3'
};

function SectorBeneficiariesCard() {
  const theme = useTheme();
  const { sectorData, loading, error } = useAdminDashboard();

  if (loading) {
    return (
      <StyledCard sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            border: `4px solid ${alpha(theme.colors.primary.main, 0.2)}`,
            borderTop: `4px solid ${theme.colors.primary.main}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <Typography variant="h6" color="text.secondary">Loading sector data...</Typography>
        </Box>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </StyledCard>
    );
  }

  if (error) {
    return (
      <StyledCard sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error" variant="h6">Error loading data</Typography>
      </StyledCard>
    );
  }

  const chartOptions = {
    chart: {
      background: 'transparent',
      toolbar: { show: false }
    },
    plotOptions: {
      pie: {
        donut: { 
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '18px',
              fontWeight: 600,
              color: theme.palette.text.primary
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        colors: ['#ffffff'],
        fontSize: '14px',
        fontWeight: 'bold'
      },
      dropShadow: {
        enabled: true,
        color: '#000000',
        blur: 2
      }
    },
    labels: sectorData.map((s) => s.sector),
    legend: {
      labels: { 
        colors: theme.palette.text.primary,
        useSeriesColors: true
      },
      show: true,
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 500
    },
    colors: sectorData.map(s => sectorColors[s.sector.toUpperCase()] || theme.colors.primary.main),
    stroke: { 
      width: 3,
      colors: [theme.palette.background.paper]
    },
    theme: { mode: theme.palette.mode },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const chartSeries = sectorData.map((s) => s.beneficiaries);
  const totalBeneficiaries = chartSeries.reduce((a, b) => a + b, 0);

  return (
    <StyledCard>
      <Grid spacing={0} container>
        {/* LEFT SIDE SUMMARY */}
        <Grid item xs={12} md={6}>
          <Box p={4} sx={{ position: 'relative' }}>
            {/* Decorative background element */}
            <Box
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 100,
                height: 100,
                background: `linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.1)}, ${alpha(theme.colors.success.main, 0.1)})`,
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0
              }}
            />
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                sx={{ pb: 3 }} 
                variant="h3"
                fontWeight={700}
                color="primary.main"
              >
                Beneficiaries Overview
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h1" 
                  gutterBottom
                  sx={{
                    background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: '3.5rem'
                  }}
                >
                  {totalBeneficiaries.toLocaleString()}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="medium"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Total Registered Farmers
                </Typography>
              </Box>

              <Box 
                display="flex" 
                sx={{ py: 3 }} 
                alignItems="center"
                gap={2}
              >
                <AvatarSuccess variant="rounded">
                  <Users size={32} />
                </AvatarSuccess>
                <Box>
                  <Typography 
                    variant="h4"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    {sectorData.length} Agricultural Sectors
                    <TrendingUp size={20} color={theme.colors.success.main} />
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Coordinated by Municipal Agriculture Office
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT SIDE DONUT + LIST */}
        <Grid
          sx={{ position: 'relative' }}
          display="flex"
          alignItems="center"
          item
          xs={12}
          md={6}
        >
          <Box
            component="span"
            sx={{ display: { xs: 'none', md: 'inline-block' } }}
          >
            <Divider 
              absolute 
              orientation="vertical"
              sx={{
                height: '80%',
                background: `linear-gradient(to bottom, transparent, ${alpha(theme.colors.primary.main, 0.3)}, transparent)`,
                width: 2
              }}
            />
          </Box>
          
          <Box py={4} pr={4} flex={1}>
            <Grid container spacing={3}>
              <Grid
                xs={12}
                sm={5}
                item
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Box sx={{ position: 'relative' }}>
                  <Chart
                    height={280}
                    options={chartOptions}
                    series={chartSeries}
                    type="donut"
                  />
                </Box>
              </Grid>
              
              <Grid xs={12} sm={7} item display="flex" alignItems="center">
                <List disablePadding sx={{ width: '100%' }}>
                  {sectorData.map((sector, idx) => {
                    const sectorKey = sector.sector.toUpperCase();
                    const icon = sectorIcons[sectorKey] || sectorIcons.RICE;
                    const color = sectorColors[sectorKey] || theme.colors.primary.main;
                    const percentage = ((sector.beneficiaries / totalBeneficiaries) * 100).toFixed(1);
                    
                    return (
                      <ListItem 
                        key={idx} 
                        disableGutters
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(color, 0.05),
                            transform: 'translateX(8px)'
                          }
                        }}
                      >
                        <ListItemAvatarWrapper>
                          <div style={{ color: color }}>
                            {icon}
                          </div>
                        </ListItemAvatarWrapper>
                        
                        <ListItemText
                          primary={
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              color="text.primary"
                              noWrap
                            >
                              {sector.sector}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Agricultural Sector
                            </Typography>
                          }
                        />
                        
                        <Box textAlign="right">
                          <Typography 
                            variant="h5" 
                            fontWeight={700}
                            color="text.primary"
                            noWrap
                          >
                            {sector.beneficiaries.toLocaleString()}
                          </Typography>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 1,
                              py: 0.5,
                              borderRadius: 2,
                              backgroundColor: alpha(color, 0.1),
                              border: `1px solid ${alpha(color, 0.2)}`
                            }}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{ color: color }}
                            >
                              {percentage}%
                            </Typography>
                            <TrendingUp size={12} style={{ color: color }} />
                          </Box>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </StyledCard>
  );
}

export default SectorBeneficiariesCard;
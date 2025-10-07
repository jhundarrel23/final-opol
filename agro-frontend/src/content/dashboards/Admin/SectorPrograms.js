/* eslint-disable no-restricted-syntax */
import {
  Button,
  Card,
  Grid,
  Box,
  CardContent,
  Typography,
  Avatar,
  alpha,
  Tooltip,
  CardActionArea,
  styled
} from '@mui/material';
import { Plus, Wheat, Apple, Fish, Beef, Users, TrendingUp, Eye } from 'lucide-react';
import useAdminDashboard from './hooks/useAdminDashboard';
import { Link } from 'react-router-dom';

const AvatarWrapper = styled(Avatar)(
  ({ theme }) => `
    margin: ${theme.spacing(2, 0, 2, 0)};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    height: ${theme.spacing(8)};
    width: ${theme.spacing(8)};
    background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.1)} 0%, ${alpha(theme.colors.success.main, 0.1)} 100%);
    backdrop-filter: blur(10px);
    border: 2px solid ${alpha(theme.colors.primary.main, 0.2)};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: visible;
    
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 22px;
      background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.success.main});
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-8px) scale(1.1);
      box-shadow: 0 20px 40px ${alpha(theme.colors.primary.main, 0.3)};
      
      &::before {
        opacity: 0.2;
      }
    }
`
);

const AvatarAddWrapper = styled(Avatar)(
  ({ theme }) => `
    background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.1)} 0%, ${alpha(theme.colors.success.main, 0.1)} 100%);
    color: ${theme.colors.primary.main};
    width: ${theme.spacing(10)};
    height: ${theme.spacing(10)};
    border: 2px dashed ${alpha(theme.colors.primary.main, 0.3)};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.2)} 0%, ${alpha(theme.colors.success.main, 0.2)} 100%);
      border-color: ${theme.colors.primary.main};
      transform: scale(1.1);
    }
`
);

const StyledCard = styled(Card)(
  ({ theme }) => `
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid ${alpha(theme.colors.primary.main, 0.1)};
    box-shadow: 0 8px 32px ${alpha(theme.colors.primary.main, 0.1)};
    border-radius: 20px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.success.main}, ${theme.colors.info.main});
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 60px ${alpha(theme.colors.primary.main, 0.2)};
      
      &::before {
        opacity: 1;
      }
    }
`
);

const CardAddAction = styled(Card)(
  ({ theme }) => `
    border: 2px dashed ${alpha(theme.colors.primary.main, 0.3)};
    height: 100%;
    background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.05)} 0%, ${alpha(theme.colors.success.main, 0.05)} 100%);
    backdrop-filter: blur(10px);
    color: ${theme.colors.primary.main};
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
    
    .MuiCardActionArea-root {
      height: 100%;
      justify-content: center;
      align-items: center;
      display: flex;
      padding: ${theme.spacing(3)};
    }
    
    .MuiTouchRipple-root {
      opacity: .3;
    }
    
    &:hover {
      border-color: ${theme.colors.primary.main};
      background: linear-gradient(135deg, ${alpha(theme.colors.primary.main, 0.1)} 0%, ${alpha(theme.colors.success.main, 0.1)} 100%);
      transform: translateY(-4px);
      box-shadow: 0 12px 40px ${alpha(theme.colors.primary.main, 0.2)};
    }
`
);

const StatsBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 1),
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: alpha(theme.colors.success.main, 0.1),
  color: theme.colors.success.main,
  border: `1px solid ${alpha(theme.colors.success.main, 0.2)}`,
  marginTop: theme.spacing(1)
}));

// Sector icon mapping
const sectorIcons = {
  rice: <Wheat size={28} />,
  corn: <Wheat size={28} />,
  hvc: <Apple size={28} />,
  'high value': <Apple size={28} />,
  fruit: <Apple size={28} />,
  vegetable: <Apple size={28} />,
  livestock: <Beef size={28} />,
  cattle: <Beef size={28} />,
  animal: <Beef size={28} />,
  fishery: <Fish size={28} />,
  fish: <Fish size={28} />,
  aqua: <Fish size={28} />
};

 // Sector color mapping - Forest/Nature Inspired Palette
const sectorColors = {
  rice: '#4CAF50',          // Fresh Green (Rice fields)
  corn: '#FF9800',          // Golden Harvest (Corn)
  hvc: '#8BC34A',           // Forest Green (High Value Crops)
  'high value': '#8BC34A',  // Forest Green
  fruit: '#66BB6A',         // Rich Apple Green (Fruits)
  vegetable: '#7CB342',     // Nature Vegetable Green (Vegetables)
  livestock: '#5D4037',     // Earth Brown (Livestock)
  cattle: '#5D4037',        // Earth Brown
  animal: '#5D4037',        // Earth Brown  
  fishery: '#2E7D32',       // Deep Forest Green (Fisheries)
  fish: '#2E7D32',          // Deep Forest Green
  aqua: '#388E3C'           // Aquatic Forest Green (Aquaculture)
};

function SectorPrograms() {
  const { programsData, loading, error } = useAdminDashboard();

  // Function to get sector icon and color based on sector name
  const getSectorIcon = (sectorName) => {
    const sector = sectorName.toLowerCase();
    
    for (const [key, icon] of Object.entries(sectorIcons)) {
      if (sector.includes(key)) {
        return icon;
      }
    }
    return <Wheat size={28} />; // Default fallback
  };

  const getSectorColor = (sectorName) => {
    const sector = sectorName.toLowerCase();
    
    for (const [key, color] of Object.entries(sectorColors)) {
      if (sector.includes(key)) {
        return color;
      }
    }
    return '#4CAF50'; // Default fallback
  };

  if (loading) {
    return (
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pb: 3 }}
        >
          <Typography variant="h3" fontWeight={700} color="primary.main">
            Sector Programs
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              border: '4px solid rgba(25, 118, 210, 0.2)',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <Typography variant="h6" color="text.secondary">
              Loading sector programs data...
            </Typography>
          </Box>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pb: 3 }}
        >
          <Typography variant="h3" fontWeight={700} color="primary.main">
            Sector Programs
          </Typography>
        </Box>
        
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <Typography color="error" variant="h6">Error loading sector programs data</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pb: 4 }}
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
            Sector Programs Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Agricultural program distribution across different sectors
          </Typography>
        </Box>
        
     <Button
          component={Link}
          to="/management/program"
          size="large"
          variant="contained"
          startIcon={<Eye size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            borderRadius: '16px',
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1B5E20 0%, #66BB6A 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(25, 118, 210, 0.4)'
            }
          }}
        >
          View All Programs
</Button>
      </Box>
      
      <Grid container spacing={3}>
        {programsData.map((sector, index) => {
          const sectorColor = getSectorColor(sector.sector);
          const sectorIcon = getSectorIcon(sector.sector);
          
          return (
            <Grid xs={12} sm={6} md={4} lg={3} item key={index}>
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AvatarWrapper sx={{ mr: 2 }}>
                      <div style={{ color: sectorColor }}>
                        {sectorIcon}
                      </div>
                    </AvatarWrapper>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        color="text.primary"
                        noWrap
                        sx={{ mb: 0.5 }}
                      >
                        {sector.sector}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Users size={16} color="#666" />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          fontWeight={500}
                        >
                          {sector.total_coordinators} Coordinators
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography 
                      variant="h2" 
                      gutterBottom 
                      fontWeight={800}
                      sx={{
                        color: sectorColor,
                        fontSize: '3rem',
                        lineHeight: 1,
                        mb: 1
                      }}
                    >
                      {sector.sector_totals.total_programs}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ mb: 2 }}
                    >
                      Total Programs
                    </Typography>
                    
                    <StatsBadge>
                      <TrendingUp size={14} />
                      Active Sector
                    </StatsBadge>
                  </Box>

                  {/* Progress indicator */}
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: alpha(sectorColor, 0.1),
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${sectorColor}, ${alpha(sectorColor, 0.8)})`,
                          borderRadius: 3,
                          width: `${Math.min((sector.sector_totals.total_programs / 20) * 100, 100)}%`,
                          transition: 'width 1s ease-in-out'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          );
        })}
        
        <Grid xs={12} sm={6} md={4} lg={3} item>
          <Tooltip arrow title="View detailed program breakdown and analytics">
            <CardAddAction>
              <CardActionArea>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AvatarAddWrapper sx={{ mb: 2, mx: 'auto' }}>
                    <Plus size={32} />
                  </AvatarAddWrapper>
                  <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>
                    View Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Explore comprehensive program analytics
                  </Typography>
                </CardContent>
              </CardActionArea>
            </CardAddAction>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SectorPrograms;
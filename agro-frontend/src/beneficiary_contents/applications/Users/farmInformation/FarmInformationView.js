/* eslint-disable no-unused-vars */
import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Avatar,
  Stack,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

// ✅ All icons must be imported as default exports with `...Icon`
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2)
  }
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #2563eb 100%)',
  borderRadius: theme.spacing(3),
  padding: theme.spacing(5),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2316a34a" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3)
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderRadius: theme.spacing(2.5),
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 25px rgba(0,0,0,0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #16a34a, #059669, #2563eb)'
  }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: theme.spacing(2.5),
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
  overflow: 'hidden',
  '& .MuiCardHeader-root': {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderBottom: '1px solid #e2e8f0'
  }
}));

const ModernTable = styled(TableContainer)(({ theme }) => ({
  overflow: 'visible',
  '& .MuiTable-root': {
    width: '100%'
  },
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
  },
  '& .MuiTableCell-head': {
    fontWeight: 700,
    fontSize: '0.875rem',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottom: '2px solid #e2e8f0',
    padding: theme.spacing(2)
  },
  '& .MuiTableCell-body': {
    fontSize: '0.875rem',
    padding: theme.spacing(1.5, 2),
    borderBottom: '1px solid #f1f5f9'
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f8fafc'
    },
    '&:last-child .MuiTableCell-body': {
      borderBottom: 0
    }
  }
}));

const ParcelSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f0fdf4 0%, #f7fee7 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  border: '1px solid #bbf7d0',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: 'linear-gradient(135deg, #16a34a, #059669)',
    borderRadius: '0 4px 4px 0'
  }
}));

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatters = {
  area: (value) => Number(value || 0).toFixed(2),
  tenureType: (tenureType) => {
    if (!tenureType) return '—';
    return tenureType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  },
  farmType: (farmType) => {
    if (!farmType) return '—';
    return farmType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

const helpers = {
  getSectorName: (parcel) => parcel.sector?.name || parcel.sector_name || '—',
  getCommodityName: (commodity) =>
    commodity.name || commodity.commodity_name || commodity.display_name || 'Unknown Commodity',
  getCommodityType: (commodity) => {
    // Check sector_id or category_id to determine type
    // Sector IDs: 1=Rice/Corn, 2=High Value Crops, 3=Coconut/Other Permanent, 4=Poultry, 5=Livestock
    const sectorId = commodity.sector_id || commodity.category_id;
    if (sectorId === 5) return 'livestock';
    if (sectorId === 4) return 'poultry';
    return commodity.commodity_type || commodity.type || 'crops';
  },
  isLivestock: (commodity) => {
    const sectorId = commodity.sector_id || commodity.category_id;
    const type = helpers.getCommodityType(commodity);
    return sectorId === 5 || sectorId === 4 || type === 'livestock' || type === 'poultry';
  },
  getParcelFarmTypes: (parcel) => {
    if (!parcel.commodities?.length) return '—';
    const farmTypes = parcel.commodities
      .map((c) => c.pivot?.farm_type || c.farm_type)
      .filter(Boolean);
    if (!farmTypes.length) return '—';
    const uniqueTypes = [...new Set(farmTypes)];
    return uniqueTypes.map(formatters.farmType).join(', ');
  },
  getCommodityChipColor: (type) => {
    const colorMap = { crops: 'success', livestock: 'warning', poultry: 'info', default: 'primary' };
    return colorMap[type] || colorMap.default;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function FarmInformationView({ farmParcels = [], beneficiary = null }) {
  const statistics = useMemo(() => {
    const parcels = farmParcels || [];
    return {
      totalParcels: parcels.length,
      totalArea: parcels.reduce((sum, p) => sum + (Number(p.total_farm_area) || 0), 0),
      totalCommodities: parcels.reduce((sum, p) => sum + (p.commodities?.length || 0), 0),
      organicParcels: parcels.filter((p) =>
        p.commodities?.some(
          (c) => (c.pivot?.is_organic_practitioner ?? c.is_organic_practitioner) === true || 
                 (c.pivot?.is_organic_practitioner ?? c.is_organic_practitioner) === 1
        )
      ).length
    };
  }, [farmParcels]);

  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <Grid container alignItems="center" spacing={3}>
          <Grid item>
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <AgricultureIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: 'white' }}>
              Farm Profile
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400 }}>
              Complete overview of your agricultural holdings and registered commodities
            </Typography>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#dbeafe', color: '#2563eb' }}>
                  <LocationOnIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {statistics.totalParcels}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Total Parcels
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#dcfce7', color: '#16a34a' }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {formatters.area(statistics.totalArea)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Total Area (ha)
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#fef3c7', color: '#f59e0b' }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {statistics.totalCommodities}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Commodities
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatsCard>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#d1fae5', color: '#10b981' }}>
                  <LocalFloristIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {statistics.organicParcels}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Organic Parcels
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Parcels Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SectionCard>
            <CardHeader
              avatar={<LocationOnIcon sx={{ color: '#16a34a' }} />}
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Farm Parcels Overview
                </Typography>
              }
              subheader="Detailed breakdown of all registered farm parcels"
            />
            <CardContent sx={{ p: 0 }}>
              {!farmParcels?.length ? (
                <Box sx={{ p: 4 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      No parcels registered
                    </Typography>
                    <Typography>
                      Please visit your local Municipal Agriculture Office to register your farm
                      parcels and commodities.
                    </Typography>
                  </Alert>
                </Box>
              ) : (
                <ModernTable>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell>Farm Types</TableCell>
                        <TableCell align="right">Area (Hectares)</TableCell>
                        <TableCell>Tenure Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {farmParcels.map((parcel, index) => (
                        <TableRow key={parcel.id || `parcel-${index}`}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {parcel.barangay || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>{helpers.getParcelFarmTypes(parcel)}</TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: '#16a34a' }}
                            >
                              {formatters.area(parcel.total_farm_area)}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatters.tenureType(parcel.tenure_type)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ModernTable>
              )}
            </CardContent>
          </SectionCard>
        </Grid>

        {/* Commodities Details */}
        <Grid item xs={12}>
          <SectionCard>
            <CardHeader
              avatar={<CategoryIcon sx={{ color: '#16a34a' }} />}
              title={
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Commodity Portfolio
                </Typography>
              }
              subheader="Comprehensive details of all registered commodities by parcel"
            />
            <CardContent>
              {!farmParcels?.length ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography>
                    No commodity data available. Register your farm parcels to view commodity
                    information.
                  </Typography>
                </Alert>
              ) : (
                <Box>
                  {farmParcels.map((parcel, index) => (
                    <Box key={parcel.id || `parcel-detail-${index}`} sx={{ mb: 4 }}>
                      <ParcelSection>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Avatar sx={{ bgcolor: '#16a34a', width: 32, height: 32 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {index + 1}
                            </Typography>
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {parcel.barangay || 'Unknown Location'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatters.area(parcel.total_farm_area)} hectares •{' '}
                              {parcel.commodities?.length || 0} commodities
                            </Typography>
                          </Box>
                        </Stack>
                      </ParcelSection>

                      {!parcel.commodities?.length ? (
                        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                          No commodities registered for this parcel.
                        </Alert>
                      ) : (
                        <ModernTable>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Commodity Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Area (ha)</TableCell>
                                <TableCell align="right">Head Count</TableCell>
                                <TableCell>Farm Type</TableCell>
                                <TableCell align="center">Organic Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {parcel.commodities.map((commodity, commodityIndex) => {
                                const commodityType = helpers.getCommodityType(commodity);
                                const isLivestockType = helpers.isLivestock(commodity);
                                const pivotData = commodity.pivot || {};

                                // Get organic status - convert 1/0 to boolean
                                const isOrganicRaw = pivotData.is_organic_practitioner ?? 
                                                     commodity.is_organic_practitioner;
                                const isOrganic = isOrganicRaw === true || isOrganicRaw === 1;
                                const hasOrganicData = isOrganicRaw !== null && isOrganicRaw !== undefined;

                                // Get area
                                const areaValue = pivotData.size_hectares || commodity.size_hectares;
                                const hasArea = areaValue && Number(areaValue) > 0;

                                // Get livestock count
                                const headCount = pivotData.number_of_heads ?? commodity.number_of_heads;
                                const hasHeadCount = headCount !== null && headCount !== undefined && Number(headCount) > 0;

                                return (
                                  <TableRow key={commodity.id || `commodity-${commodityIndex}`}>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {helpers.getCommodityName(commodity)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        label={formatters.farmType(commodityType)}
                                        color={helpers.getCommodityChipColor(commodityType)}
                                        variant="outlined"
                                        sx={{ fontWeight: 500 }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          fontWeight: 500,
                                          color: hasArea ? '#16a34a' : 'text.disabled'
                                        }}
                                      >
                                        {hasArea ? formatters.area(areaValue) : '—'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: 600,
                                          color: isLivestockType && hasHeadCount ? '#f59e0b' : 'text.disabled'
                                        }}
                                      >
                                        {isLivestockType && hasHeadCount ? headCount : '—'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {formatters.farmType(pivotData.farm_type || commodity.farm_type)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                      {hasOrganicData ? (
                                        isOrganic ? (
                                          <Chip
                                            label="Organic"
                                            size="small"
                                            color="success"
                                            sx={{ fontWeight: 600 }}
                                          />
                                        ) : (
                                          <Chip
                                            label="Conventional"
                                            size="small"
                                            color="default"
                                            variant="outlined"
                                          />
                                        )
                                      ) : (
                                        <Typography variant="body2" color="text.disabled">
                                          —
                                        </Typography>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </ModernTable>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </SectionCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

export default FarmInformationView;
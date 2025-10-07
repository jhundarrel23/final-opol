/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Alert,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  Users,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import ProgramProgressCard from './ProgramProgressCard';
import ProgramDetailsModal from './ProgramDetailsModal.js';

const ProgramProgressTracker = ({ 
  ongoingProgramsProgress, 
  loading, 
  onRefreshProgram,
  onRefreshAll 
}) => {
  const theme = useTheme();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleViewDetails = async (program) => {
    setSelectedProgram(program);
    setModalOpen(true);
    
    // The program already contains beneficiaries data from the API
    // No need to fetch additional data if beneficiaries array exists
    if (program.beneficiaries && program.beneficiaries.length > 0) {
      setLoadingProgramDetails(false);
      return;
    }

    setLoadingProgramDetails(true);
    
    try {

      const response = await fetch(`/api/analytics/programs/${program.id}`);
      if (response.ok) {
        const fullProgramData = await response.json();
        setSelectedProgram({
          ...program,
          beneficiaries: fullProgramData.analytics?.beneficiaries || [],
          creator: fullProgramData.program?.creator,
          sector: fullProgramData.program?.creator?.sector
        });
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
    } finally {
      setLoadingProgramDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProgram(null);
  };

  const getOverallProgress = () => {
    if (!ongoingProgramsProgress || ongoingProgramsProgress.length === 0) {
      return { averageCompletion: 0, totalPrograms: 0, totalItems: 0, distributedItems: 0 };
    }

    const totalPrograms = ongoingProgramsProgress.length;
    const averageCompletion = ongoingProgramsProgress.reduce(
      (sum, program) => sum + program.progress.completionRate, 0
    ) / totalPrograms;

    const totalItems = ongoingProgramsProgress.reduce(
      (sum, program) => sum + program.progress.totalItems, 0
    );

    const distributedItems = ongoingProgramsProgress.reduce(
      (sum, program) => sum + program.progress.distributedItems, 0
    );

    return {
      averageCompletion: Math.round(averageCompletion),
      totalPrograms,
      totalItems,
      distributedItems
    };
  };

  const getProgressColor = (completionRate) => {
    if (completionRate >= 80) return theme.palette.success.main;
    if (completionRate >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const overallProgress = getOverallProgress();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Program Distribution Progress
          </Typography>
          <Grid container spacing={3}>
            {[1, 2, 3].map((index) => (
              <Grid item xs={12} md={4} key={index}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (!ongoingProgramsProgress || ongoingProgramsProgress.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <BarChart3 size={48} color={theme.palette.text.secondary} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Ongoing Programs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are currently no ongoing programs to track.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Program Distribution Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time tracking of ongoing subsidy program distributions
              </Typography>
            </Box>
            {onRefreshAll && (
              <Tooltip title="Refresh All Programs">
                <IconButton onClick={onRefreshAll} color="primary">
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Overall Progress Summary */}
          <Box
            sx={{
              p: 4,
              mb: 3,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.03)}, ${alpha(theme.palette.primary.main, 0.05)})`
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Overall Distribution Progress
              </Typography>
              <Chip
                label={`${overallProgress.totalPrograms} Active Program${overallProgress.totalPrograms !== 1 ? 's' : ''}`}
                color="success"
                variant="outlined"
                size="small"
                icon={<BarChart3 size={16} />}
              />
            </Box>
            
            {/* Main Progress Display */}
            <Box display="flex" alignItems="center" gap={4} mb={3}>
              <Box textAlign="center">
                <Typography 
                  variant="h2" 
                  fontWeight={800} 
                  color={getProgressColor(overallProgress.averageCompletion)}
                  sx={{ lineHeight: 1 }}
                >
                  {overallProgress.averageCompletion}%
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Average Completion
                </Typography>
              </Box>
              
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" fontWeight={600}>
                    Items Distribution Progress
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight={700}
                    color={theme.palette.success.main}
                  >
                    {overallProgress.distributedItems} of {overallProgress.totalItems}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={overallProgress.averageCompletion}
                  sx={{
                    height: 12,
                    borderRadius: 6,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`
                    }
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    {overallProgress.totalItems - overallProgress.distributedItems} items pending
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {overallProgress.distributedItems} distributed
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Quick Stats */}
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box textAlign="center" sx={{ minWidth: 80 }}>
                <Typography variant="h6" fontWeight={700} color={theme.palette.success.main}>
                  {overallProgress.totalPrograms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Programs
                </Typography>
              </Box>
              <Box textAlign="center" sx={{ minWidth: 80 }}>
                <Typography variant="h6" fontWeight={700} color={theme.palette.primary.main}>
                  {overallProgress.totalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Items
                </Typography>
              </Box>
              <Box textAlign="center" sx={{ minWidth: 80 }}>
                <Typography variant="h6" fontWeight={700} color={theme.palette.warning.main}>
                  {overallProgress.totalItems - overallProgress.distributedItems}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Programs Grid */}
          <Grid container spacing={3}>
            {ongoingProgramsProgress.map((program) => (
              <Grid item xs={12} md={6} lg={4} key={program.id}>
                <ProgramProgressCard
                  program={program}
                  onRefresh={onRefreshProgram}
                  onViewDetails={handleViewDetails}
                />
              </Grid>
            ))}
          </Grid>

          {/* Program Status Overview */}
          <Box mt={4}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Program Status Overview
            </Typography>
            
            <Grid container spacing={2}>
              {/* Status Cards */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 48, height: 48, mx: 'auto', mb: 1 }}>
                    <CheckCircle size={24} color={theme.palette.success.main} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {ongoingProgramsProgress.filter(p => p.progress.completionRate >= 80).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Nearly Complete
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), width: 48, height: 48, mx: 'auto', mb: 1 }}>
                    <Package size={24} color={theme.palette.warning.main} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {ongoingProgramsProgress.filter(p => p.progress.completionRate >= 50 && p.progress.completionRate < 80).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    In Progress
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), width: 48, height: 48, mx: 'auto', mb: 1 }}>
                    <Clock size={24} color={theme.palette.info.main} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {ongoingProgramsProgress.filter(p => p.progress.completionRate < 50).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Starting Soon
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 48, height: 48, mx: 'auto', mb: 1 }}>
                    <Users size={24} color={theme.palette.primary.main} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {ongoingProgramsProgress.reduce((sum, p) => sum + (p.beneficiaryProgress?.totalBeneficiaries || 0), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Total Beneficiaries
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Alerts for Programs Needing Attention */}
          {ongoingProgramsProgress.filter(p => p.progress.completionRate < 50 || p.daysRemaining <= 7).length > 0 && (
            <Box mt={3}>
              <Alert severity="warning" icon={<AlertTriangle size={20} />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Programs Requiring Attention
                </Typography>
                <Typography variant="body2">
                  {ongoingProgramsProgress.filter(p => p.progress.completionRate < 50 || p.daysRemaining <= 7).length} program(s) 
                  have low completion rates or are ending soon. Consider reviewing their progress.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Program Details Modal */}
      <ProgramDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        program={selectedProgram}
        loading={loadingProgramDetails}
      />
    </>
  );
};

export default ProgramProgressTracker;
/* eslint-disable no-unused-vars */
/* eslint-disable no-else-return */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Grid,
  Avatar,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  TrendingUp,
  Users,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const ProgramProgressCard = ({ program, onRefresh, onViewDetails }) => {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getProgressColor = (completionRate) => {
    if (completionRate >= 80) return theme.palette.success.main;
    if (completionRate >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStatusChip = (daysRemaining) => {
    if (daysRemaining <= 0) {
      return <Chip label="Overdue" color="error" size="small" icon={<AlertTriangle size={12} />} />;
    } else if (daysRemaining <= 1) {
      return <Chip label="Ending Soon" color="warning" size="small" icon={<Clock size={12} />} />;
    } else if (daysRemaining <= 7) {
      return <Chip label="Ending Soon" color="warning" size="small" icon={<Clock size={12} />} />;
    } else {
      return <Chip label="On Track" color="success" size="small" icon={<CheckCircle size={12} />} />;
    }
  };

  const getDaysRemainingText = (daysRemaining) => {
    if (daysRemaining <= 0) {
      return 'Overdue';
    } else if (daysRemaining < 1) {
      // Convert to hours for better readability
      const hours = Math.round(daysRemaining * 24);
      return hours <= 1 ? `${hours} hour remaining` : `${hours} hours remaining`;
    } else if (daysRemaining === 1) {
      return '1 day remaining';
    } else {
      return `${Math.round(daysRemaining)} days remaining`;
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ flex: 1, p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
              {program.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Calendar size={14} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(program.startDate)} - {formatDate(program.endDate)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {getStatusChip(program.daysRemaining)}
              <Typography variant="caption" color="text.secondary">
                {getDaysRemainingText(program.daysRemaining)}
              </Typography>
            </Box>
          </Box>
          {onRefresh && (
            <Tooltip title="Refresh Program Data">
              <IconButton size="small" onClick={() => onRefresh(program.id)}>
                <RefreshCw size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Progress Section */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Distribution Progress
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={getProgressColor(program.progress.completionRate)}
            >
              {Math.round(program.progress.completionRate)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={program.progress.completionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.grey[300], 0.3),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                bgcolor: getProgressColor(program.progress.completionRate)
              }
            }}
          />

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              {program.progress.distributedItems} of {program.progress.totalItems} items distributed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {program.progress.pendingItems} pending
            </Typography>
          </Box>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={2}>
          {/* Items Progress */}
          <Grid item xs={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                  mx: 'auto',
                  mb: 1
                }}
              >
                <Package size={16} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="primary">
                {program.progress.distributedItems}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Items Distributed
              </Typography>
            </Box>
          </Grid>

          {/* Beneficiaries Progress */}
          <Grid item xs={6}>
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.success.main,
                  width: 32,
                  height: 32,
                  mx: 'auto',
                  mb: 1
                }}
              >
                <Users size={16} />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="success.main">
                {program.beneficiaryProgress.completedBeneficiaries}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Beneficiaries Served
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Beneficiary Progress Bar */}
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Beneficiary Completion
            </Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">
              {Math.round(program.beneficiaryProgress.beneficiaryCompletionRate)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={program.beneficiaryProgress.beneficiaryCompletionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: theme.palette.success.main
              }
            }}
          />

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {program.beneficiaryProgress.completedBeneficiaries} of{' '}
            {program.beneficiaryProgress.totalBeneficiaries} beneficiaries completed
          </Typography>
        </Box>

        {/* Program Creator */}
        {program.creator && (
          <Box
            mt={2}
            p={1.5}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="caption" fontWeight={600} color="info.main">
                Created by: {typeof program.creator === 'string' ? program.creator : program.creator.name || 'Unknown'}
              </Typography>
            </Box>
          </Box>
        )}

        {/* View Details Button */}
        {onViewDetails && (
          <Button
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
            onClick={() => onViewDetails(program)}
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgramProgressCard;
/* eslint-disable no-unused-vars */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
  LinearProgress,
  alpha,
  useTheme,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  Users, 
  UserCircle, 
  Layers, 
  Calendar, 
  Package,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ProgramDetailsModal = ({ open, onClose, program, loading = false }) => {
  const theme = useTheme();

  if (!program) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getProgressColor = (completionRate) => {
    if (completionRate >= 80) return theme.palette.success.main;
    if (completionRate >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getStatusInfo = (program) => {
    if (program.status === 'pending') {
      return { 
        label: "Upcoming", 
        color: "info", 
        icon: <Calendar size={16} />,
        description: "Scheduled"
      };
    }

    const days = program.daysRemaining;
    if (days <= 0) {
      return { label: "Overdue", color: "error", icon: <AlertTriangle size={16} />, description: "Past deadline" };
    } if (days <= 3) {
      return { label: "Urgent", color: "error", icon: <AlertTriangle size={16} />, description: "Ending very soon" };
    } if (days <= 7) {
      return { label: "Ending Soon", color: "warning", icon: <Clock size={16} />, description: "Less than a week" };
    } 
      return { label: "Active", color: "success", icon: <CheckCircle size={16} />, description: "On track" };
    
  };

  const getDaysRemainingText = (program) => {
    if (program.status === 'pending') {
      const startDate = new Date(program.startDate);
      const today = new Date();
      const daysUntilStart = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilStart <= 0) {
        return 'Starts today';
      } if (daysUntilStart === 1) {
        return 'Starts tomorrow';
      } 
        return `Starts in ${daysUntilStart} days`;
      
    }

    const daysRemaining = program.daysRemaining;
    
    if (daysRemaining <= 0) {
      const daysOverdue = Math.abs(Math.round(daysRemaining));
      return daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`;
    } if (daysRemaining < 1) {
      const hours = Math.round(daysRemaining * 24);
      return hours <= 1 ? `${hours} hour` : `${hours} hours`;
    } if (daysRemaining === 1) {
      return '1 day';
    } 
      return `${Math.round(daysRemaining)} days`;
    
  };

  const statusInfo = getStatusInfo(program);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            {program.title || 'Program Details'}
          </Typography>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            icon={statusInfo.icon}
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Program Timeline */}
        <Box mb={3}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Program Timeline
          </Typography>
          <Box 
            sx={{
              p: 3,
              bgcolor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Calendar size={20} color={theme.palette.success.main} />
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Program Duration
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    {formatDate(program.startDate)} - {formatDate(program.endDate)}
                  </Typography>
                </Box>
              </Box>
              
              <Box textAlign="right">
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {program.status === 'pending' ? 'Starts In' : 'Time Remaining'}
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  color={program.status === 'pending' ? theme.palette.info.main : 
                         program.daysRemaining <= 7 ? theme.palette.warning.main : theme.palette.success.main}
                >
                  {getDaysRemainingText(program)}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" justifyContent="center">
              <Box 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: statusInfo.color === 'success' ? alpha(theme.palette.success.main, 0.1) :
                            statusInfo.color === 'warning' ? alpha(theme.palette.warning.main, 0.1) :
                            statusInfo.color === 'info' ? alpha(theme.palette.info.main, 0.1) :
                            alpha(theme.palette.error.main, 0.1)
                }}
              >
                {statusInfo.icon}
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  color={statusInfo.color === 'success' ? theme.palette.success.main :
                         statusInfo.color === 'warning' ? theme.palette.warning.main :
                         statusInfo.color === 'info' ? theme.palette.info.main :
                         theme.palette.error.main}
                >
                  {statusInfo.description}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Distribution Summary - Only for ongoing programs */}
        {program.status === 'ongoing' && (
          <>
            <Box mb={3}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Distribution Summary
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Items Distribution
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    {program.progress?.distributedItems || 0} of {program.progress?.totalItems || 0} items distributed
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color={getProgressColor(program.progress?.completionRate || 0)}>
                    {Math.round(program.progress?.completionRate || 0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={program.progress?.completionRate || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: getProgressColor(program.progress?.completionRate || 0)
                    }
                  }}
                />
                {program.progress?.pendingItems > 0 && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    {program.progress.pendingItems} items pending distribution
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Beneficiaries Progress
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    {program.beneficiaryProgress?.completedBeneficiaries || 0} of {program.beneficiaryProgress?.totalBeneficiaries || 0} beneficiaries completed
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {Math.round(program.beneficiaryProgress?.beneficiaryCompletionRate || 0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={program.beneficiaryProgress?.beneficiaryCompletionRate || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: theme.palette.success.main
                    }
                  }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Upcoming Program Notice */}
        {program.status === 'pending' && (
          <>
            <Box 
              mb={3}
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.info.main, 0.08),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              <Typography variant="h6" fontWeight={600} color="info.main" gutterBottom>
                Scheduled Program
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This program is scheduled to begin on {formatDate(program.startDate)}. Distribution tracking and progress monitoring will become available once the program starts.
              </Typography>
              <Box display="flex" gap={2} mt={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total Items Planned
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {program.progress?.totalItems || 0}
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Total Beneficiaries
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {program.beneficiaryProgress?.totalBeneficiaries || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Creator Information */}
        {program.creator && (
          <Box mb={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Program Creator
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 40, height: 40 }}>
                <UserCircle size={24} />
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {typeof program.creator === 'string' ? program.creator : program.creator.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {program.creator.role || 'Program Coordinator'}
                  {program.creator.sector && ` • ${program.creator.sector}`}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Sector Information */}
        {program.sector && (
          <Box mb={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Sector
            </Typography>
            <Chip
              label={program.sector}
              color="primary"
              variant="outlined"
              icon={<Layers size={16} />}
            />
          </Box>
        )}

        {/* Beneficiaries List */}
        <Box mb={2}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Beneficiaries ({program.beneficiaries?.length || program.beneficiaryProgress?.totalBeneficiaries || 0})
          </Typography>
          {loading ? (
            <Box display="flex" alignItems="center" gap={1} py={2}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Loading beneficiaries...
              </Typography>
            </Box>
          ) : program.beneficiaries && program.beneficiaries.length > 0 ? (
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {program.beneficiaries.map((beneficiary, index) => (
                <Box 
                  key={beneficiary.id || index} 
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.success.main }}>
                        <Users size={20} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {beneficiary.name || `Beneficiary ${index + 1}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          RSBSA: {beneficiary.rsbsa_number || 'Not Available'} • {beneficiary.barangay || 'Barangay TBD'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${beneficiary.items_count || 0} items`}
                      size="small"
                      color={beneficiary.distributed_items > 0 ? 'success' : 'default'}
                      icon={<Package size={12} />}
                    />
                  </Box>

                  {program.status === 'ongoing' && (
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight={600} color="text.primary">
                          Items Distribution Progress
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={700}
                          color={beneficiary.items_count > 0 && beneficiary.distributed_items === beneficiary.items_count ? 'success.main' : 'warning.main'}
                        >
                          {(beneficiary.distributed_items || 0)} of {beneficiary.items_count || 0} items distributed
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={beneficiary.items_count > 0 ? ((beneficiary.distributed_items || 0) / beneficiary.items_count) * 100 : 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          mb: 1,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: theme.palette.success.main
                          }
                        }}
                      />

                      <Box display="flex" gap={1} flexWrap="wrap">
                        {beneficiary.distributed_items > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircle size={12} color={theme.palette.success.main} />
                            <Typography variant="caption" color="success.main" fontWeight={600}>
                              {beneficiary.distributed_items} distributed
                            </Typography>
                          </Box>
                        )}
                        {beneficiary.pending_items > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Clock size={12} color={theme.palette.warning.main} />
                            <Typography variant="caption" color="warning.main" fontWeight={600}>
                              {beneficiary.pending_items} pending
                            </Typography>
                          </Box>
                        )}
                        {beneficiary.unclaimed_items > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AlertTriangle size={12} color={theme.palette.error.main} />
                            <Typography variant="caption" color="error.main" fontWeight={600}>
                              {beneficiary.unclaimed_items} unclaimed
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {(beneficiary.pending_items > 0 || beneficiary.unclaimed_items > 0) && (
                        <Box 
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: beneficiary.pending_items > 0 ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            borderRadius: 1,
                            border: `1px solid ${beneficiary.pending_items > 0 ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.error.main, 0.2)}`
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            {beneficiary.pending_items > 0 ? (
                              <>
                                <Clock size={16} color={theme.palette.warning.main} />
                                <Typography variant="body2" fontWeight={600} color="warning.main">
                                  Action Required: {beneficiary.pending_items} item(s) pending distribution
                                </Typography>
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={16} color={theme.palette.error.main} />
                                <Typography variant="body2" fontWeight={600} color="error.main">
                                  Follow Up Needed: {beneficiary.unclaimed_items} item(s) remain unclaimed
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}

                  {program.status === 'pending' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Assigned {beneficiary.items_count || 0} item(s) for distribution when program starts
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Box 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: alpha(theme.palette.grey[500], 0.05),
                borderRadius: 1,
                border: `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`
              }}
            >
              <Users size={32} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {program.beneficiaryProgress?.totalBeneficiaries > 0 
                  ? `This program has ${program.beneficiaryProgress.totalBeneficiaries} beneficiaries, but detailed list is not available.`
                  : 'No beneficiaries found for this program.'
                }
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDetailsModal;
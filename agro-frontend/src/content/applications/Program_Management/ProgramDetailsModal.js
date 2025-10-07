/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  alpha,
} from '@mui/material';
import {
  User,
  MapPin,
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  CheckCircle,
  Clock,
  X,
  Calendar,
  Users,
  Award,
  Sprout,
  TreePine,
} from 'lucide-react';
import { useState } from 'react';

function ProgramDetailsModal({ 
  open, 
  onClose, 
  program, 
  onApproveProgram, 
  onCancelProgram,  
  onCompleteProgram, 
  user 
}) {
  const theme = useTheme();
  const [expandedBeneficiary, setExpandedBeneficiary] = useState(null);

  // Forest theme colors
  const forestGreen = '#2d5016';
  const leafGreen = '#4a7c2c';
  const oceanBlue = '#1e5f74';
  const skyBlue = '#3d8ea8';
  const lightGreen = '#7cb342';

  if (!program) return null;

  const renderStatusChip = (status) => {
    const statusConfig = {
      pending: { 
        color: 'warning', 
        icon: <Clock size={16} />,
        gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)'
      },
      ongoing: { 
        color: 'info', 
        icon: <Sprout size={16} />,
        gradient: `linear-gradient(135deg, ${skyBlue} 0%, ${oceanBlue} 100%)`
      },
      completed: { 
        color: 'success', 
        icon: <CheckCircle size={16} />,
        gradient: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`
      },
      cancelled: { 
        color: 'error', 
        icon: <X size={16} />,
        gradient: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)'
      },
    };
    
    const config = statusConfig[status] || { color: 'default', icon: null };
    
    return (
      <Chip
        label={status}
        size="small"
        icon={config.icon}
        sx={{ 
          textTransform: 'capitalize',
          fontWeight: 700,
          color: 'white',
          background: config.gradient,
          border: 'none',
          '& .MuiChip-icon': { 
            fontSize: 16,
            color: 'white'
          },
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      />
    );
  };

  const renderApprovalChip = (status) => {
    const configMap = {
      pending: {
        gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
        border: '2px solid #fb8c00'
      },
      approved: {
        gradient: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
        border: `2px solid ${leafGreen}`
      },
      rejected: {
        gradient: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
        border: '2px solid #c62828'
      },
    };
    
    const config = configMap[status] || {};
    
    return (
      <Chip
        label={status}
        size="small"
        sx={{ 
          textTransform: 'capitalize', 
          fontWeight: 700,
          color: 'white',
          background: config.gradient,
          border: config.border,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      />
    );
  };

  const formatDate = (dateStr) => {
    return dateStr ? new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '—';
  };

  const formatCurrency = (value) => {
    return value ? `₱${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';
  };

  const groupedBeneficiaries = program.beneficiaries?.reduce((acc, programBeneficiary) => {
    const rsbsaNumber = programBeneficiary.beneficiary?.system_generated_rsbsa_number || 
                       programBeneficiary.beneficiary?.manual_rsbsa_number;
    
    const beneficiaryKey = rsbsaNumber || 
                          programBeneficiary.beneficiary?.user?.id || 
                          `temp-${programBeneficiary.id}`;
    
    if (!acc[beneficiaryKey]) {
      acc[beneficiaryKey] = {
        beneficiary: programBeneficiary.beneficiary,
        items: [],
        rsbsaNumber: rsbsaNumber
      };
    }
    
    if (programBeneficiary.items && programBeneficiary.items.length > 0) {
      programBeneficiary.items.forEach(item => {
        const itemExists = acc[beneficiaryKey].items.some(existingItem => 
          existingItem.id === item.id || 
          (existingItem.inventory?.id === item.inventory?.id && existingItem.quantity === item.quantity)
        );
        
        if (!itemExists) {
          acc[beneficiaryKey].items.push(item);
        }
      });
    }
    
    return acc;
  }, {}) || {};

  // UPDATED LOGIC: Only pending programs can be cancelled
  const canApprove = user?.role === 'admin' && program.approval_status === 'pending';
  const canCancel = (user?.role === 'admin' || user?.role === 'coordinator') && 
                   program.status === 'pending' && 
                   program.approval_status === 'pending';
  const canComplete = user?.role === 'coordinator' && 
                     program.approval_status === 'approved' && 
                     program.status === 'ongoing';

  const handleExpandBeneficiary = (beneficiaryId) => {
    setExpandedBeneficiary(expandedBeneficiary === beneficiaryId ? null : beneficiaryId);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 2,
          background: `linear-gradient(135deg, ${forestGreen} 0%, ${oceanBlue} 100%)`,
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <TreePine size={24} color="white" />
          </Avatar>
          <Box>
            <Typography variant="h5" component="div" fontWeight={700}>
              Program Details
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Comprehensive program overview
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3, bgcolor: '#f5f9f7' }}>
        {/* Program Header Card */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 3, 
            background: `linear-gradient(135deg, ${alpha(leafGreen, 0.15)} 0%, ${alpha(oceanBlue, 0.15)} 100%)`,
            border: `2px solid ${alpha(leafGreen, 0.3)}`,
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${alpha(skyBlue, 0.2)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Sprout size={28} color={leafGreen} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: forestGreen }}>
                    {program.title}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ pl: 5 }}>
                  Created on {formatDate(program.created_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                      Coordinator
                    </Typography>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1.5}
                      sx={{
                        bgcolor: 'white',
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(leafGreen, 0.2)}`,
                      }}
                    >
                      <User size={20} color={leafGreen} />
                      <Typography variant="body1" fontWeight={700} color={forestGreen}>
                        {program.creator
                          ? `${program.creator.fname} ${program.creator.lname}`
                          : '—'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                      Sector
                    </Typography>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1.5}
                      sx={{
                        bgcolor: 'white',
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(oceanBlue, 0.2)}`,
                      }}
                    >
                      <MapPin size={20} color={oceanBlue} />
                      <Typography variant="body1" fontWeight={700} color={oceanBlue}>
                        {program.creator?.sector?.sector_name || '—'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                      Status
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {renderApprovalChip(program.approval_status)}
                      {renderStatusChip(program.status)}
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight={600}>
                      Duration
                    </Typography>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      gap={1.5}
                      sx={{
                        bgcolor: 'white',
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(leafGreen, 0.2)}`,
                      }}
                    >
                      <Calendar size={20} color={leafGreen} />
                      <Typography variant="body1" fontWeight={700} color={forestGreen}>
                        {formatDate(program.start_date)} — {formatDate(program.end_date)}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3, borderColor: alpha(leafGreen, 0.2) }} />

        {/* Beneficiaries Section */}
        <Box mb={3}>
          <Box 
            display="flex" 
            alignItems="center" 
            gap={2} 
            mb={3}
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${alpha(leafGreen, 0.1)} 0%, ${alpha(oceanBlue, 0.1)} 100%)`,
              borderRadius: 2,
              border: `2px solid ${alpha(leafGreen, 0.2)}`,
            }}
          >
            <Avatar sx={{ bgcolor: leafGreen, width: 40, height: 40 }}>
              <Users size={24} />
            </Avatar>
            <Typography variant="h5" fontWeight={800} color={forestGreen}>
              Beneficiaries
            </Typography>
            <Chip 
              label={Object.keys(groupedBeneficiaries).length} 
              sx={{
                fontWeight: 700,
                background: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
                color: 'white',
                border: 'none',
              }}
              size="small" 
            />
          </Box>

          {Object.keys(groupedBeneficiaries).length > 0 ? (
            <Stack spacing={2}>
              {Object.entries(groupedBeneficiaries).map(([beneficiaryId, data]) => {
                const { beneficiary, items } = data;
                const isExpanded = expandedBeneficiary === beneficiaryId;
                const totalValue = items.reduce((sum, item) => {
                  const itemValue = item.quantity * (item.inventory?.unit_value || 0);
                  return sum + itemValue;
                }, 0);

                return (
                  <Card 
                    key={beneficiaryId} 
                    elevation={2}
                    sx={{ 
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: 2,
                      border: `2px solid ${alpha(leafGreen, 0.2)}`,
                      '&:hover': { 
                        elevation: 8,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${alpha(leafGreen, 0.2)}`,
                        borderColor: leafGreen,
                      }
                    }}
                  >
                    <CardContent sx={{ pb: isExpanded ? 1 : 2 }}>
                      {/* Beneficiary Header */}
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between"
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleExpandBeneficiary(beneficiaryId)}
                      >
                        <Box display="flex" alignItems="center" gap={2} flex={1}>
                          <Avatar 
                            sx={{ 
                              background: `linear-gradient(135deg, ${leafGreen} 0%, ${oceanBlue} 100%)`,
                              width: 48,
                              height: 48,
                            }}
                          >
                            <User size={24} />
                          </Avatar>
                          
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight={700} color={forestGreen}>
                              {beneficiary?.user 
                                ? `${beneficiary.user.fname} ${beneficiary.user.lname}`
                                : 'Unknown Beneficiary'}
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={3} mt={0.5}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <MapPin size={16} color={oceanBlue} />
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                  {beneficiary?.barangay || '—'}
                                </Typography>
                              </Box>
                              
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <Award size={16} color={leafGreen} />
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                  {beneficiary?.system_generated_rsbsa_number || 
                                   beneficiary?.manual_rsbsa_number || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={2}>
                          <Chip 
                            label={`${items.length} items`}
                            sx={{
                              fontWeight: 700,
                              background: `linear-gradient(135deg, ${skyBlue} 0%, ${oceanBlue} 100%)`,
                              color: 'white',
                              border: 'none',
                            }}
                            size="small"
                          />
                          {totalValue > 0 && (
                            <Typography variant="h6" sx={{ color: leafGreen, fontWeight: 800 }}>
                              {formatCurrency(totalValue)}
                            </Typography>
                          )}
                          <IconButton 
                            size="small"
                            sx={{
                              bgcolor: alpha(leafGreen, 0.1),
                              '&:hover': { bgcolor: alpha(leafGreen, 0.2) }
                            }}
                          >
                            {isExpanded ? <ChevronUp size={20} color={leafGreen} /> : <ChevronDown size={20} color={leafGreen} />}
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Items List */}
                      <Collapse in={isExpanded}>
                        <Box mt={2} pt={2} borderTop={`2px solid ${alpha(leafGreen, 0.2)}`}>
                          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                            <Package size={20} color={leafGreen} />
                            <Typography variant="subtitle1" fontWeight={700} color={forestGreen}>
                              Allocated Items
                            </Typography>
                          </Box>
                          
                          {items.length > 0 ? (
                            <List dense>
                              {items.map((item, idx) => (
                                <ListItem 
                                  key={idx}
                                  sx={{ 
                                    px: 2,
                                    py: 1.5,
                                    backgroundColor: alpha(leafGreen, 0.06),
                                    borderRadius: 1.5,
                                    mb: 1,
                                    border: `1px solid ${alpha(leafGreen, 0.15)}`,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      backgroundColor: alpha(leafGreen, 0.1),
                                      transform: 'translateX(4px)',
                                    }
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Box 
                                      sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
                                      }}
                                    >
                                      <Package size={18} color="white" />
                                    </Box>
                                  </ListItemIcon>
                                  
                                  <ListItemText
                                    primary={
                                      <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight={700} color={forestGreen}>
                                          {item.inventory?.item_name || 'Unknown Item'}
                                        </Typography>
                                        <Box display="flex" alignItems="center" gap={2}>
                                          <Chip
                                            label={`${item.quantity} ${item.inventory?.unit || 'pcs'}`}
                                            size="small"
                                            sx={{
                                              fontWeight: 700,
                                              bgcolor: alpha(oceanBlue, 0.15),
                                              color: oceanBlue,
                                            }}
                                          />
                                          {item.inventory?.unit_value && (
                                            <Typography variant="body1" sx={{ color: leafGreen, fontWeight: 800 }}>
                                              {formatCurrency(item.quantity * item.inventory.unit_value)}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                    }
                                    secondary={
                                      item.inventory?.unit_value && (
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                          Unit value: {formatCurrency(item.inventory.unit_value)}
                                        </Typography>
                                      )
                                    }
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                              No items allocated
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Card 
              elevation={0} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                bgcolor: alpha(leafGreen, 0.05),
                border: `2px dashed ${alpha(leafGreen, 0.3)}`,
                borderRadius: 2,
              }}
            >
              <Users size={48} color={alpha(forestGreen, 0.5)} style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom fontWeight={700}>
                No Beneficiaries Assigned
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This program doesn't have any beneficiaries assigned yet.
              </Typography>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 3, 
          gap: 1,
          background: `linear-gradient(135deg, ${alpha(leafGreen, 0.05)} 0%, ${alpha(oceanBlue, 0.05)} 100%)`,
        }}
      >
        {canApprove && (
          <Button 
            onClick={() => onApproveProgram(program.id)} 
            variant="contained"
            size="large"
            startIcon={<CheckCircle size={20} />}
            sx={{
              background: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
              fontWeight: 700,
              boxShadow: `0 4px 12px ${alpha(leafGreen, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
                boxShadow: `0 6px 16px ${alpha(leafGreen, 0.5)}`,
              }
            }}
          >
            Approve Program
          </Button>
        )}
        
        {/* Cancel button only shows for pending programs */}
        {canCancel && (
          <Button 
            onClick={() => onCancelProgram(program.id)} 
            variant="contained"
            size="large"
            startIcon={<X size={20} />}
            sx={{
              background: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(239, 83, 80, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                boxShadow: '0 6px 16px rgba(239, 83, 80, 0.5)',
              }
            }}
          >
            Cancel Program
          </Button>
        )}
        
        {/* Complete button only shows for approved ongoing programs */}
        {canComplete && (
          <Button 
            onClick={() => onCompleteProgram(program.id)} 
            variant="contained"
            size="large"
            startIcon={<CheckCircle size={20} />}
            sx={{
              background: `linear-gradient(135deg, ${skyBlue} 0%, ${oceanBlue} 100%)`,
              fontWeight: 700,
              boxShadow: `0 4px 12px ${alpha(oceanBlue, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${oceanBlue} 0%, #1a4d5c 100%)`,
                boxShadow: `0 6px 16px ${alpha(oceanBlue, 0.5)}`,
              }
            }}
          >
            Complete Program
          </Button>
        )}

        <Button 
          onClick={onClose} 
          variant="outlined"
          size="large"
          sx={{
            fontWeight: 700,
            borderWidth: 2,
            borderColor: alpha(forestGreen, 0.3),
            color: forestGreen,
            '&:hover': {
              borderWidth: 2,
              borderColor: forestGreen,
              bgcolor: alpha(forestGreen, 0.05),
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ProgramDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  program: PropTypes.object,
  onApproveProgram: PropTypes.func,
  onCancelProgram: PropTypes.func,  
  onCompleteProgram: PropTypes.func,
  user: PropTypes.object,
};

export default ProgramDetailsModal;
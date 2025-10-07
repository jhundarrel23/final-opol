/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Eye,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  X,
  FileText,
  AlertCircle,
  Users,
  Sprout,
  TreePine,
} from 'lucide-react';

function ProgramTable({ programs, onViewProgram }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Forest theme colors
  const forestGreen = '#2d5016';
  const leafGreen = '#4a7c2c';
  const oceanBlue = '#1e5f74';
  const skyBlue = '#3d8ea8';
  const lightGreen = '#7cb342';

  if (!programs || programs.length === 0) {
    return (
      <Card 
        elevation={0} 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          bgcolor: alpha(leafGreen, 0.03),
          border: `2px dashed ${alpha(leafGreen, 0.25)}`,
          borderRadius: 2,
        }}
      >
        <Box 
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            bgcolor: alpha(leafGreen, 0.1),
          }}
        >
          <TreePine size={36} color={forestGreen} />
        </Box>
        <Typography variant="h6" sx={{ color: forestGreen, fontWeight: 700, mb: 1 }}>
          No Programs Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are no subsidy programs to display at the moment.
        </Typography>
      </Card>
    );
  }

  const renderStatusChip = (status) => {
    const statusConfig = {
      pending: { 
        icon: <Clock size={14} />, 
        gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
      },
      ongoing: { 
        icon: <Sprout size={14} />, 
        gradient: `linear-gradient(135deg, ${skyBlue} 0%, ${oceanBlue} 100%)`,
      },
      completed: { 
        icon: <CheckCircle size={14} />, 
        gradient: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
      },
      cancelled: { 
        icon: <X size={14} />, 
        gradient: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
      },
    };

    const config = statusConfig[status] || { 
      icon: <AlertCircle size={14} />,
      gradient: 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)',
    };

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
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          '& .MuiChip-icon': { 
            fontSize: 14,
            color: 'white'
          },
          '& .MuiChip-label': { px: 1.5 }
        }}
      />
    );
  };

  const renderApprovalChip = (status) => {
    const approvalConfig = {
      pending: { 
        label: 'Pending Review',
        icon: <Clock size={14} />, 
        gradient: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
        border: '2px solid #fb8c00'
      },
      approved: { 
        label: 'Approved',
        icon: <CheckCircle size={14} />, 
        gradient: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
        border: `2px solid ${leafGreen}`
      },
      rejected: { 
        label: 'Rejected',
        icon: <X size={14} />, 
        gradient: 'linear-gradient(135deg, #ef5350 0%, #c62828 100%)',
        border: '2px solid #c62828'
      },
    };

    const config = approvalConfig[status] || { 
      label: status,
      icon: <AlertCircle size={14} />,
      gradient: 'linear-gradient(135deg, #9e9e9e 0%, #616161 100%)',
      border: '2px solid #616161'
    };

    return (
      <Chip
        label={config.label}
        size="small"
        icon={config.icon}
        sx={{
          textTransform: 'capitalize',
          fontWeight: 700,
          color: 'white',
          background: config.gradient,
          border: config.border,
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          '& .MuiChip-icon': { 
            fontSize: 14,
            color: 'white'
          }
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

  // Mobile/Tablet Card View
  if (isMobile) {
    return (
      <Stack spacing={2.5}>
        {programs.map((program) => (
          <Card 
            key={program.id} 
            elevation={1}
            sx={{ 
              transition: 'all 0.2s ease-in-out',
              borderRadius: 2,
              border: `1px solid ${alpha(leafGreen, 0.15)}`,
              '&:hover': { 
                elevation: 3,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 20px ${alpha(leafGreen, 0.15)}`,
                borderColor: alpha(leafGreen, 0.3),
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen, mb: 1.5 }}>
                    {program.title}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {renderApprovalChip(program.approval_status)}
                    {renderStatusChip(program.status)}
                  </Stack>
                </Box>
                <IconButton
                  onClick={() => onViewProgram(program)}
                  sx={{
                    background: `linear-gradient(135deg, ${leafGreen} 0%, ${oceanBlue} 100%)`,
                    color: 'white',
                    width: 40,
                    height: 40,
                    ml: 2,
                    '&:hover': { 
                      background: `linear-gradient(135deg, ${forestGreen} 0%, ${oceanBlue} 100%)`,
                    },
                  }}
                >
                  <Eye size={18} />
                </IconButton>
              </Box>

              {/* Details */}
              <Stack spacing={1.5} mt={2}>
                {program.creator && (
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
                      }}
                    >
                      <User size={16} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color={forestGreen}>
                        {program.creator.fname} {program.creator.lname}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <MapPin size={12} color={alpha(forestGreen, 0.6)} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {program.creator.sector?.sector_name || 'No Sector'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                <Box display="flex" alignItems="center" gap={1}>
                  <Calendar size={16} color={oceanBlue} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {formatDate(program.start_date)} - {formatDate(program.end_date)}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <Clock size={14} color={alpha(forestGreen, 0.6)} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Created {formatDate(program.created_at)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Desktop Table View - Formal Design
  return (
    <TableContainer 
      component={Paper} 
      elevation={0}
      sx={{ 
        borderRadius: 2,
        border: `1px solid ${alpha(leafGreen, 0.2)}`,
        overflow: 'hidden',
      }}
    >
      <Table sx={{ minWidth: isTablet ? 700 : 900 }}>
        <TableHead 
          sx={{ 
            background: `linear-gradient(135deg, ${alpha(leafGreen, 0.08)} 0%, ${alpha(oceanBlue, 0.08)} 100%)`,
            borderBottom: `2px solid ${alpha(leafGreen, 0.3)}`,
          }}
        >
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Program Title
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Coordinator
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Approval
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Status
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Duration
            </TableCell>
            <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Created
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8125rem', py: 2.5, width: 100, color: forestGreen, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {programs.map((program, index) => (
            <TableRow 
              key={program.id}
              sx={{ 
                '&:nth-of-type(even)': { 
                  bgcolor: alpha(leafGreen, 0.02),
                },
                '&:hover': { 
                  bgcolor: alpha(leafGreen, 0.05),
                  '& .action-button': {
                    transform: 'scale(1.05)',
                  }
                },
                transition: 'background-color 0.2s ease',
                borderBottom: `1px solid ${alpha(leafGreen, 0.1)}`,
              }}
            >
              <TableCell sx={{ py: 2.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: forestGreen }}>
                  {program.title}
                </Typography>
              </TableCell>
              
              <TableCell sx={{ py: 2.5 }}>
                {program.creator ? (
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        background: `linear-gradient(135deg, ${lightGreen} 0%, ${leafGreen} 100%)`,
                        fontSize: '0.75rem'
                      }}
                    >
                      <User size={16} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} sx={{ color: forestGreen }}>
                        {program.creator.fname} {program.creator.lname}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <MapPin size={11} color={alpha(forestGreen, 0.5)} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {program.creator.sector?.sector_name || 'No Sector'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">—</Typography>
                )}
              </TableCell>

              <TableCell sx={{ py: 2.5 }}>
                {renderApprovalChip(program.approval_status)}
              </TableCell>

              <TableCell sx={{ py: 2.5 }}>
                {renderStatusChip(program.status)}
              </TableCell>

              <TableCell sx={{ py: 2.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: forestGreen }}>
                    {formatDate(program.start_date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    to {formatDate(program.end_date)}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell sx={{ py: 2.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {formatDate(program.created_at)}
                </Typography>
              </TableCell>

              <TableCell align="center" sx={{ py: 2.5 }}>
                <Tooltip title="View Program Details" placement="top">
                  <Button
                    className="action-button"
                    size="small"
                    variant="contained"
                    onClick={() => onViewProgram(program)}
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      transition: 'all 0.2s ease',
                      background: `linear-gradient(135deg, ${leafGreen} 0%, ${oceanBlue} 100%)`,
                      boxShadow: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${forestGreen} 0%, ${oceanBlue} 100%)`,
                        boxShadow: `0 2px 8px ${alpha(leafGreen, 0.25)}`,
                      }
                    }}
                  >
                    <Eye size={16} />
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ProgramTable.propTypes = {
  programs: PropTypes.array.isRequired,
  onViewProgram: PropTypes.func.isRequired,
};

export default ProgramTable;
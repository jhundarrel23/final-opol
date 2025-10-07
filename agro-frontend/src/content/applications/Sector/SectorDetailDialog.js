/* eslint-disable no-unused-vars */
import { memo, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
  Divider,
  alpha
} from '@mui/material';
import { 
  X, ChevronDown, User, Users, MapPin, Phone, Calendar, 
  FileText, Mail, AlertCircle, Wheat, Map, Search, TrendingUp 
} from 'lucide-react';

// Helper Functions
const getStatusColor = (status) => {
  const colors = {
    approved: { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
    active: { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
    pending: { bg: '#fff3e0', color: '#f57c00', border: '#ffcc80' },
    rejected: { bg: '#ffebee', color: '#d32f2f', border: '#ffcdd2' },
    inactive: { bg: '#f5f5f5', color: '#757575', border: '#bdbdbd' },
  };
  return colors[status?.toLowerCase()] || { bg: '#f5f5f5', color: '#666', border: '#e0e0e0' };
};

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ').filter(w => w.length > 0);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const formatPhoneNumber = (phone) => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Memoized Beneficiary Row
const BeneficiaryRow = memo(({ beneficiary, index }) => {
  const statusColors = getStatusColor(beneficiary.enrollment_status);
  
  return (
    <TableRow 
      hover
      sx={{ 
        '&:hover': { bgcolor: alpha('#1565c0', 0.03) },
        bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
        transition: 'background-color 0.2s ease'
      }}
    >
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <FileText size={16} color="#1565c0" />
          <Typography variant="body2" fontWeight={500} fontFamily="monospace">
            {beneficiary.rsbsa_number || 'N/A'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600} sx={{ color: '#1a237e' }}>
          {beneficiary.name}
        </Typography>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <MapPin size={16} color="#2e7d32" />
          <Typography variant="body2">{beneficiary.barangay}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Phone size={16} color="#f57c00" />
          <Typography variant="body2" fontFamily="monospace">
            {formatPhoneNumber(beneficiary.contact_number)}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={beneficiary.enrollment_status}
          size="small"
          sx={{
            textTransform: 'capitalize',
            fontWeight: 600,
            bgcolor: statusColors.bg,
            color: statusColors.color,
            border: `1px solid ${statusColors.border}`,
            fontSize: '0.75rem'
          }}
        />
      </TableCell>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Calendar size={16} color="#666" />
          <Typography variant="body2" fontWeight={500}>
            {beneficiary.enrollment_year}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        {beneficiary.farm_profile ? (
          <Tooltip 
            title={
              <Box>
                <Typography variant="caption" display="block">
                  <strong>Farm ID:</strong> {beneficiary.farm_profile.id}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Total Area:</strong> {beneficiary.farm_profile.total_area.toFixed(2)} hectares
                </Typography>
              </Box>
            }
            arrow
            placement="left"
          >
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Map size={14} color="#2e7d32" />
                <Typography variant="caption" fontWeight={600}>
                  {beneficiary.farm_profile.total_parcels} {beneficiary.farm_profile.total_parcels === 1 ? 'Parcel' : 'Parcels'}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Wheat size={14} color="#f57c00" />
                <Typography variant="caption" color="text.secondary">
                  {beneficiary.farm_profile.total_area.toFixed(2)} ha
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        ) : (
          <Typography variant="caption" color="textSecondary" fontStyle="italic">
            No farm data
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
});

BeneficiaryRow.displayName = 'BeneficiaryRow';

// Main Component
function SectorDetailDialog({ open, onClose, coordinatorDetails, loading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!coordinatorDetails) return null;
    
    const totalBeneficiaries = coordinatorDetails.total_beneficiaries;
    const totalParcels = coordinatorDetails.coordinators.reduce((sum, coord) => 
      sum + coord.beneficiaries.reduce((bSum, ben) => 
        bSum + (ben.farm_profile?.total_parcels || 0), 0
      ), 0
    );
    const totalArea = coordinatorDetails.coordinators.reduce((sum, coord) => 
      sum + coord.beneficiaries.reduce((bSum, ben) => 
        bSum + (ben.farm_profile?.total_area || 0), 0
      ), 0
    );

    return { totalBeneficiaries, totalParcels, totalArea };
  }, [coordinatorDetails]);

  // Filter coordinators based on search
  const filteredCoordinators = useMemo(() => {
    if (!coordinatorDetails || !searchQuery.trim()) {
      return coordinatorDetails?.coordinators || [];
    }

    const query = searchQuery.toLowerCase();
    return coordinatorDetails.coordinators.filter(coordinator => 
      coordinator.name.toLowerCase().includes(query) ||
      coordinator.email.toLowerCase().includes(query) ||
      coordinator.beneficiaries.some(ben => 
        ben.name.toLowerCase().includes(query) ||
        ben.rsbsa_number?.toLowerCase().includes(query) ||
        ben.barangay.toLowerCase().includes(query)
      )
    );
  }, [coordinatorDetails, searchQuery]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
      aria-labelledby="sector-detail-title"
    >
      <DialogTitle 
        id="sector-detail-title"
        sx={{ 
          background: 'linear-gradient(135deg, #2e7d32 0%, #1565c0 100%)',
          color: 'white',
          pb: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ color: 'white', opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1 }}>
              Sector Details
            </Typography>
            {coordinatorDetails && (
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5, color: 'white' }}>
                {coordinatorDetails.sector.name}
              </Typography>
            )}
          </Box>
          <Tooltip title="Close dialog">
            <IconButton 
              size="small" 
              onClick={onClose}
              aria-label="Close"
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <X size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8} gap={2}>
            <CircularProgress sx={{ color: '#2e7d32' }} />
            <Typography variant="body2" color="textSecondary">
              Loading sector details...
            </Typography>
          </Box>
        ) : coordinatorDetails ? (
          <Box>
            {coordinatorDetails.coordinators.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, bgcolor: '#f5f5f5' }}>
                <User size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography variant="body1" color="textSecondary" fontWeight={500}>
                  No coordinators assigned to this sector yet.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Statistics Grid - New Design */}
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap={2} mb={3}>
                  {/* Total Beneficiaries Card */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      bgcolor: alpha('#e3f2fd', 0.4),
                      border: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        bgcolor: alpha('#1565c0', 0.08),
                        transform: 'translate(40%, -40%)'
                      }
                    }}
                  >
                    <Box position="relative" zIndex={1}>
                      <Box 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          borderRadius: 2.5, 
                          bgcolor: alpha('#1565c0', 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <Users size={28} color="#1565c0" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" color="#1565c0" gutterBottom>
                        {statistics.totalBeneficiaries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Total Beneficiaries
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Total Parcels Card */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      bgcolor: alpha('#f3e5f5', 0.4),
                      border: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        bgcolor: alpha('#7b1fa2', 0.08),
                        transform: 'translate(40%, -40%)'
                      }
                    }}
                  >
                    <Box position="relative" zIndex={1}>
                      <Box 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          borderRadius: 2.5, 
                          bgcolor: alpha('#7b1fa2', 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <Map size={28} color="#7b1fa2" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" color="#7b1fa2" gutterBottom>
                        {statistics.totalParcels}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Total Parcels
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Total Hectares Card */}
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      bgcolor: alpha('#fff3e0', 0.6),
                      border: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        bgcolor: alpha('#f57c00', 0.08),
                        transform: 'translate(40%, -40%)'
                      }
                    }}
                  >
                    <Box position="relative" zIndex={1}>
                      <Box 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          borderRadius: 2.5, 
                          bgcolor: alpha('#f57c00', 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <TrendingUp size={28} color="#f57c00" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold" color="#f57c00" gutterBottom>
                        {statistics.totalArea.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Total Hectares
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Search Bar */}
                <Box mb={3}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search coordinators, beneficiaries, RSBSA numbers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={20} color="#666" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f5f5f5',
                        '&:hover': { bgcolor: '#eeeeee' },
                        '&.Mui-focused': { bgcolor: 'white' }
                      }
                    }}
                  />
                </Box>

                {/* Coordinators List Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a237e' }}>
                    Beneficiaries by Coordinator
                  </Typography>
                  {searchQuery && (
                    <Chip 
                      label={`${filteredCoordinators.length} result${filteredCoordinators.length !== 1 ? 's' : ''}`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

                {filteredCoordinators.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: '#f5f5f5' }}>
                    <Search size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <Typography variant="body1" color="textSecondary">
                      No results found for "{searchQuery}"
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {filteredCoordinators.map((coordinator, index) => (
                      <Paper 
                        key={coordinator.id}
                        elevation={0}
                        sx={{ 
                          borderRadius: 3,
                          border: '2px solid #e0e0e0',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Coordinator Header */}
                        <Box
                          sx={{
                            p: 2.5,
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)',
                            borderBottom: '2px solid #e0e0e0'
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                              <Badge
                                badgeContent={index + 1}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    bgcolor: '#1565c0',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #1565c0 100%)',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem'
                                  }}
                                >
                                  {getInitials(coordinator.name)}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="body1" fontWeight={600} sx={{ color: '#1a237e' }}>
                                    {coordinator.name}
                                  </Typography>
                                  <Chip
                                    label={coordinator.status}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      textTransform: 'capitalize',
                                      fontWeight: 'bold',
                                      bgcolor: coordinator.status === 'active' ? '#e8f5e9' : '#ffebee',
                                      color: coordinator.status === 'active' ? '#2e7d32' : '#d32f2f',
                                      border: `1px solid ${coordinator.status === 'active' ? '#a5d6a7' : '#ffcdd2'}`
                                    }}
                                  />
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  <Mail size={12} color="#666" />
                                  <Typography variant="caption" color="textSecondary">
                                    {coordinator.email}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                    • @{coordinator.username}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                            <Chip
                              icon={<Users size={14} />}
                              label={`${coordinator.beneficiaries.length} ${coordinator.beneficiaries.length === 1 ? 'Beneficiary' : 'Beneficiaries'}`}
                              sx={{
                                fontWeight: 'bold',
                                bgcolor: '#e8f5e9',
                                color: '#2e7d32',
                                border: '1px solid #a5d6a7'
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Beneficiaries Table */}
                        {coordinator.beneficiaries.length === 0 ? (
                          <Box textAlign="center" py={4} bgcolor="#fafafa">
                            <Users size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                            <Typography variant="body2" color="textSecondary">
                              No beneficiaries assigned yet.
                            </Typography>
                          </Box>
                        ) : (
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>RSBSA Number</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Name</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Barangay</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Contact</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Status</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Year</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Farm Info</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {coordinator.beneficiaries.map((beneficiary, idx) => (
                                  <BeneficiaryRow 
                                    key={beneficiary.enrollment_id} 
                                    beneficiary={beneficiary} 
                                    index={idx}
                                  />
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>
        ) : (
          <Box textAlign="center" py={6}>
            <AlertCircle size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant="body1" color="textSecondary">
              No data available
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SectorDetailDialog;
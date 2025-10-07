/* eslint-disable no-unused-vars */
import {
  Typography,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  TablePagination,
  Chip,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { format } from 'date-fns';
import { ArrowBack, Visibility, Close, Search } from '@mui/icons-material';

// Status color config
const STATUS_CONFIG = {
  pending: { color: '#E65100', bg: '#FFF3E0', label: 'PENDING' },
  ongoing: { color: '#F57C00', bg: '#FFF8E1', label: 'ONGOING' },
  approved: { color: '#2E7D32', bg: '#E8F5E8', label: 'APPROVED' },
  rejected: { color: '#C62828', bg: '#FFEBEE', label: 'REJECTED' },
  cancelled: { color: '#616161', bg: '#F5F5F5', label: 'CANCELLED' },
  completed: { color: '#1565C0', bg: '#E3F2FD', label: 'COMPLETED' },
  distributed: { color: '#7B1FA2', bg: '#F3E5F5', label: 'DISTRIBUTED' }
};

// Table columns for program history
const TABLE_COLUMNS = [
  { id: 'title', label: 'Program Title', width: '200px' },
  { id: 'status', label: 'Program Status', width: '130px' },
  { id: 'approval_status', label: 'Approval Status', width: '130px' },
  { id: 'created_by', label: 'Created By', width: '160px' },
  { id: 'approved_by', label: 'Approved By', width: '160px' },
  { id: 'approved_at', label: 'Date Completed/Cancelled', width: '180px' },
  { id: 'beneficiaries', label: 'Beneficiaries', width: '100px' },
  { id: 'actions', label: 'Actions', width: '120px' }
];

// Styles
const styles = {
  headCell: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    borderBottom: '2px solid #E5E7EB',
    py: 2,
    px: 3,
  },
  bodyRow: {
    '&:hover': { backgroundColor: '#F9FAFB' },
    borderBottom: '1px solid #F3F4F6',
  },
  bodyCell: {
    py: 2.5,
    px: 3,
    fontSize: '0.875rem'
  },
  pagination: {
    borderTop: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
  }
};

// Utility: format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    return 'Invalid Date';
  }
};

// Status chip
const StatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        border: 'none',
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
};

// Details Modal Component
const ProgramDetailsModal = ({ open, onClose, program }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiaryPage, setBeneficiaryPage] = useState(0);
  const [beneficiaryRowsPerPage, setBeneficiaryRowsPerPage] = useState(10);

  if (!program) return null;

  // Filter and paginate beneficiaries
  const filteredBeneficiaries = program.beneficiaries?.filter(beneficiary => {
    const fullName = `${beneficiary.beneficiary.user.fname} ${beneficiary.beneficiary.user.lname}`.toLowerCase();
    const rsbsa = beneficiary.beneficiary.system_generated_rsbsa_number?.toLowerCase() || '';
    const barangay = beneficiary.beneficiary.barangay?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || rsbsa.includes(searchLower) || barangay.includes(searchLower);
  }) || [];

  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    beneficiaryPage * beneficiaryRowsPerPage, 
    beneficiaryPage * beneficiaryRowsPerPage + beneficiaryRowsPerPage
  );

  const handleBeneficiaryPageChange = (event, newPage) => setBeneficiaryPage(newPage);
  const handleBeneficiaryRowsPerPageChange = (event) => {
    setBeneficiaryRowsPerPage(parseInt(event.target.value, 10));
    setBeneficiaryPage(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #E5E7EB',
          pb: 2
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
            Program Details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View complete program information and beneficiaries
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ 
            backgroundColor: '#F3F4F6', 
            '&:hover': { backgroundColor: '#E5E7EB' } 
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 3 }}>
        {/* Program Information Card */}
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid #E5E7EB', 
            borderRadius: 2, 
            p: 3, 
            mb: 3,
            backgroundColor: '#FAFBFC'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 600 }}>
            📋 Program Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Program Title
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {program.title}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Description
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                  {program.description || 'No description provided'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Duration
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {program.start_date} to {program.end_date}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Program Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip status={program.status} />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Approval Status
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip status={program.approval_status} />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Created Date
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formatDate(program.created_at)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* People Involved Card */}
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid #E5E7EB', 
            borderRadius: 2, 
            p: 3, 
            mb: 3,
            backgroundColor: '#FAFBFC'
          }}
        >
          <Typography variant="h6" sx={{ mb: 3, color: '#1F2937', fontWeight: 600 }}>
            👥 People Involved
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Created By
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                  {program.creator ? `${program.creator.fname} ${program.creator.lname}` : 'N/A'}
                </Typography>
                {program.creator && (
                  <Typography variant="caption" color="text.secondary">
                    {program.creator.role}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                  Approved By
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                  {program.approver ? `${program.approver.fname} ${program.approver.lname}` : 'N/A'}
                </Typography>
                {program.approver && (
                  <Typography variant="caption" color="text.secondary">
                    {program.approver.role}
                  </Typography>
                )}
              </Box>

              {program.approved_at && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>
                    Approved Date
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDate(program.approved_at)}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Beneficiaries Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid #E5E7EB', 
            borderRadius: 2, 
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600 }}>
                👨‍🌾 Program Beneficiaries
              </Typography>
              <Chip 
                label={`${program.beneficiaries?.length || 0} Total`}
                size="small"
                sx={{ 
                  backgroundColor: '#EBF8FF', 
                  color: '#1E40AF',
                  fontWeight: 600
                }}
              />
            </Box>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search beneficiaries by name, RSBSA, or barangay..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setBeneficiaryPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#6B7280' }} />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '&:hover': { borderColor: '#3B82F6' }
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Showing {filteredBeneficiaries.length} of {program.beneficiaries?.length || 0} beneficiaries
            </Typography>
          </Box>

          {/* Table */}
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...styles.headCell, minWidth: 180 }}>Beneficiary</TableCell>
                  <TableCell sx={{ ...styles.headCell, minWidth: 120 }}>RSBSA</TableCell>
                  <TableCell sx={{ ...styles.headCell, minWidth: 100 }}>Barangay</TableCell>
                  <TableCell sx={{ ...styles.headCell, minWidth: 200 }}>Items Received</TableCell>
                  <TableCell sx={{ ...styles.headCell, minWidth: 100 }} align="right">Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBeneficiaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {searchTerm ? '🔍 No beneficiaries match your search' : '📭 No beneficiaries found'}
                        </Typography>
                        {searchTerm && (
                          <Button 
                            size="small" 
                            onClick={() => setSearchTerm('')}
                            sx={{ textTransform: 'none' }}
                          >
                            Clear search
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBeneficiaries.map((beneficiary, index) => {
                    const totalValue = beneficiary.items?.reduce((sum, item) => {
                      return sum + (parseFloat(item.total_value) || 0);
                    }, 0) || 0;

                    return (
                      <TableRow key={index} sx={styles.bodyRow}>
                        <TableCell sx={styles.bodyCell}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {beneficiary.beneficiary.user.fname} {beneficiary.beneficiary.user.lname}
                          </Typography>
                        </TableCell>

                        <TableCell sx={styles.bodyCell}>
                          <Typography variant="caption" sx={{ 
                            fontFamily: 'monospace',
                            backgroundColor: '#F3F4F6',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}>
                            {beneficiary.beneficiary.system_generated_rsbsa_number}
                          </Typography>
                        </TableCell>

                        <TableCell sx={styles.bodyCell}>
                          <Typography variant="body2">
                            {beneficiary.beneficiary.barangay}
                          </Typography>
                        </TableCell>

                        <TableCell sx={styles.bodyCell}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {beneficiary.items?.slice(0, 3).map((item, itemIndex) => (
                              <Chip
                                key={itemIndex}
                                label={`${item.item_name} (${item.quantity})`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            ))}
                            {beneficiary.items?.length > 3 && (
                              <Chip
                                label={`+${beneficiary.items.length - 3} more`}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  backgroundColor: '#E5E7EB',
                                  '& .MuiChip-label': { px: 1 }
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        <TableCell sx={styles.bodyCell} align="right">
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: totalValue > 0 ? '#059669' : '#6B7280'
                          }}>
                            ₱{totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ ...styles.pagination, px: 2 }}>
            <TablePagination
              component="div"
              count={filteredBeneficiaries.length}
              page={beneficiaryPage}
              onPageChange={handleBeneficiaryPageChange}
              rowsPerPage={beneficiaryRowsPerPage}
              onRowsPerPageChange={handleBeneficiaryRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              showFirstButton
              showLastButton
            />
          </Box>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E5E7EB' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{ 
            textTransform: 'none',
            borderRadius: 2,
            px: 3
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function ProgramHistory() {
  const navigate = useNavigate();

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get('/api/subsidy-programs/history');
        // Laravel paginated response structure
        setHistoryData(res.data.data || []); // Get the data array from pagination
      } catch (err) {
        console.error('Error fetching program history:', err);
        setError(err.response?.data?.message || 'Failed to load program history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle view details
  const handleViewDetails = async (programId) => {
    try {
      const res = await axiosInstance.get(`/api/subsidy-programs/${programId}`);
      setSelectedProgram(res.data);
      setDetailsModalOpen(true);
    } catch (err) {
      console.error('Error fetching program details:', err);
      setError('Failed to load program details');
    }
  };

  // Filter programs based on search term
  const filteredHistory = useMemo(() => {
    if (!historyData) return [];
    if (!searchTerm) return historyData;
    
    return historyData.filter(program => {
      const title = program.title?.toLowerCase() || '';
      const creatorName = program.creator ? `${program.creator.fname} ${program.creator.lname}`.toLowerCase() : '';
      const approverName = program.approver ? `${program.approver.fname} ${program.approver.lname}`.toLowerCase() : '';
      const status = program.status?.toLowerCase() || '';
      const approvalStatus = program.approval_status?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      return title.includes(searchLower) || 
             creatorName.includes(searchLower) || 
             approverName.includes(searchLower) ||
             status.includes(searchLower) ||
             approvalStatus.includes(searchLower) ||
             program.id.toString().includes(searchLower);
    });
  }, [historyData, searchTerm]);

  // Paginate history (client-side pagination for now)
  const paginatedHistory = useMemo(() => {
    return filteredHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredHistory, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
        <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Loading program history...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {error}
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <PageTitleWrapper>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: '#6B7280' }}
          >
            Back
          </Button>
        </Box>

        <Typography variant="h3">Subsidy Programs History</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Completed and cancelled subsidy programs
        </Typography>
      </PageTitleWrapper>

      <Container maxWidth="xl">
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search programs by title, ID, creator, approver, or status..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ maxWidth: 600 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, ml: 1 }}>
            Showing {filteredHistory.length} of {historyData?.length || 0} programs
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{ 
            border: '1px solid #E5E7EB', 
            borderRadius: 2, 
            overflow: 'hidden',
            backgroundColor: '#FFFFFF'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {TABLE_COLUMNS.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{ ...styles.headCell, width: col.width }}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_COLUMNS.length} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {searchTerm ? 'No programs match your search criteria' : 'No program history available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((row, idx) => (
                    <TableRow key={row.id || idx} sx={styles.bodyRow}>
                      {/* Program Title */}
                      <TableCell sx={styles.bodyCell}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {row.id}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {row.start_date} - {row.end_date}
                        </Typography>
                      </TableCell>

                      {/* Program Status */}
                      <TableCell sx={styles.bodyCell}>
                        <StatusChip status={row.status} />
                      </TableCell>

                      {/* Approval Status */}
                      <TableCell sx={styles.bodyCell}>
                        <StatusChip status={row.approval_status} />
                      </TableCell>

                      {/* Created By */}
                      <TableCell sx={styles.bodyCell}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.creator ? `${row.creator.fname} ${row.creator.lname}` : 'N/A'}
                        </Typography>
                        {row.creator && (
                          <Typography variant="caption" color="text.secondary">
                            {row.creator.role} - {row.creator.sector?.sector_name}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Approved By */}
                      <TableCell sx={styles.bodyCell}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.approver ? `${row.approver.fname} ${row.approver.lname}` : 'N/A'}
                        </Typography>
                        {row.approver && (
                          <Typography variant="caption" color="text.secondary">
                            {row.approver.role}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Approved At */}
                      <TableCell sx={styles.bodyCell}>
                        <Typography variant="body2">
                          {formatDate(row.approved_at)}
                        </Typography>
                      </TableCell>

                      {/* Beneficiaries Count */}
                      <TableCell sx={styles.bodyCell}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {row.beneficiaries?.length || 0}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            beneficiar{row.beneficiaries?.length === 1 ? 'y' : 'ies'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={styles.bodyCell}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(row.id)}
                          sx={{
                            fontSize: '0.75rem',
                            px: 2,
                            py: 0.5,
                            borderColor: '#E5E7EB',
                            color: '#374151',
                            '&:hover': {
                              backgroundColor: '#F9FAFB',
                              borderColor: '#D1D5DB'
                            }
                          }}
                          variant="outlined"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={styles.pagination}>
            <TablePagination
              component="div"
              count={filteredHistory?.length || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </Paper>
      </Container>

      {/* Details Modal */}
      <ProgramDetailsModal 
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        program={selectedProgram}
      />

      <Footer />
    </>
  );
}

export default ProgramHistory;
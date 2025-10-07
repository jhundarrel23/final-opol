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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  TextField,
  InputAdornment,
  TablePagination,
  Chip,
  Alert,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import Footer from 'src/components/Footer';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { format } from 'date-fns';

// Status configuration for consistent styling
const STATUS_CONFIG = {
  pending: { 
    color: '#E65100', 
    bg: '#FFF3E0', 
    label: 'PENDING' 
  },
  approved: { 
    color: '#2E7D32', 
    bg: '#E8F5E8', 
    label: 'APPROVED' 
  },
  rejected: { 
    color: '#C62828', 
    bg: '#FFEBEE', 
    label: 'REJECTED' 
  },
  cancelled: { 
    color: '#616161', 
    bg: '#F5F5F5', 
    label: 'CANCELLED' 
  },
  for_interview: { 
    color: '#1565C0', 
    bg: '#E3F2FD', 
    label: 'FOR INTERVIEW' 
  },
  interview_completed: { 
    color: '#7B1FA2', 
    bg: '#F3E5F5', 
    label: 'INTERVIEW DONE' 
  }
};

// Table columns configuration
const TABLE_COLUMNS = [
  { id: 'reference', label: 'Reference Code', width: '140px' },
  { id: 'name', label: 'Beneficiary Name', width: '200px' },
  { id: 'type', label: 'Enrollment Type', width: '120px' },
  { id: 'status', label: 'Status', width: '140px' },
  { id: 'submitted_date', label: 'Submitted Date', width: '130px' },
  { id: 'processed_date', label: 'Processed Date', width: '130px' },
  { id: 'processed_by', label: 'Processed By', width: '150px' }
];

const ENROLLMENT_TYPE_CONFIG = {
  new: { color: '#1D4ED8', bg: '#EFF6FF', label: 'NEW' },
  renewal: { color: '#166534', bg: '#F0FDF4', label: 'RENEWAL' },
  update: { color: '#B45309', bg: '#FFFBEB', label: 'UPDATE' }
};

// Styles
const styles = {
  header: {
    p: 3,
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontWeight: 600,
    color: '#111827',
    mb: 0.5
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: '0.875rem'
  },
  searchField: {
    minWidth: 300,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#FFFFFF',
      borderRadius: 1.5,
      height: 40,
      '& fieldset': { borderColor: '#D1D5DB' },
      '&:hover fieldset': { borderColor: '#9CA3AF' },
      '&.Mui-focused fieldset': { 
        borderColor: '#3B82F6', 
        borderWidth: 1 
      },
    },
  },
  filterSelect: {
    minWidth: 180,
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#FFFFFF',
      borderRadius: 1.5,
      height: 40,
    }
  },
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
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
      color: '#6B7280',
      fontSize: '0.875rem',
    },
    '& .MuiTablePagination-select': { 
      color: '#374151' 
    },
  }
};

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};

const getFullName = (user) => {
  if (!user) return 'N/A';
  const fullName = `${user.fname || ''} ${user.lname || ''}`.trim();
  return fullName || 'N/A';
};

// Status Chip Component
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

// Enrollment Type Chip Component
const EnrollmentTypeChip = ({ type }) => {
  const config = ENROLLMENT_TYPE_CONFIG[type] || ENROLLMENT_TYPE_CONFIG.new;
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 500,
        fontSize: '0.7rem',
        height: 22,
        border: 'none',
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
};

// Empty State Component
const EmptyState = ({ hasSearch, hasFilter, searchTerm, filterStatus }) => (
  <TableRow>
    <TableCell colSpan={7} align="center">
      <Box sx={{ py: 6 }}>
        <Typography variant="body1" sx={{ color: '#6B7280', mb: 1 }}>
          {hasSearch || hasFilter ? 'No matches found' : 'No enrollment history available'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          {hasSearch || hasFilter
            ? `Try adjusting your search${searchTerm ? ` for "${searchTerm}"` : ''} or filters`
            : 'Enrollment history will appear here once applications are submitted'
          }
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);

// Table Header Component
const TableHeader = ({ historyCount, searchTerm, onSearchChange, filterStatus, onFilterChange }) => (
  <Box sx={styles.header}>
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 2 
    }}>
      {/* Title Section */}
      <Box>
        <Typography variant="h6" sx={styles.headerTitle}>
          Enrollment History
        </Typography>
        <Typography variant="body2" sx={styles.headerSubtitle}>
          {historyCount} {historyCount === 1 ? 'record' : 'records'} found
        </Typography>
      </Box>

      {/* Controls Section */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search Field */}
        <TextField
          size="small"
          placeholder="Search by name, reference, or type..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={styles.searchField}
        />

        {/* Status Filter */}
        <FormControl size="small" sx={styles.filterSelect}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={filterStatus}
            label="Status Filter"
            onChange={(e) => onFilterChange(e.target.value)}
            startAdornment={<FilterIcon sx={{ color: '#9CA3AF', fontSize: 18, mr: 0.5 }} />}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="for_interview">For Interview</MenuItem>
            <MenuItem value="interview_completed">Interview Done</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  </Box>
);

function EnrollmentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Using the admin endpoint to get all enrollment data
        const res = await axiosInstance.get('/api/rsbsa/enrollments/history');
        const enrollmentData = res.data?.data || res.data || [];
        setHistory(enrollmentData);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err.response?.data?.message || 'Failed to load enrollment history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filtered and searched history
  const filteredHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];

    return history.filter((item) => {
      if (!item) return false;

      // Status filter
      const statusMatch = filterStatus === 'all' || item.application_status === filterStatus;

      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const userInfo = item.user || {};
      const searchMatch = !searchTerm || 
        getFullName(userInfo).toLowerCase().includes(searchLower) ||
        item.application_reference_code?.toLowerCase().includes(searchLower) ||
        item.enrollment_type?.toLowerCase().includes(searchLower);

      return statusMatch && searchMatch;
    });
  }, [history, filterStatus, searchTerm]);

  // Paginated data
  const paginatedHistory = filteredHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getProcessedDate = (item) => {
    if (item.approved_at) return formatDate(item.approved_at);
    if (item.rejected_at) return formatDate(item.rejected_at);
    if (item.interview_completed_at) return formatDate(item.interview_completed_at);
    return 'N/A';
  };

  const getProcessedBy = (item) => {
    if (item.approver) return getFullName(item.approver);
    if (item.rejector) return getFullName(item.rejector);
    if (item.reviewer) return getFullName(item.reviewer);
    return 'N/A';
  };

  return (
    <>
      <PageTitleWrapper>
        <Typography variant="h3">Enrollment History</Typography>
      </PageTitleWrapper>

      <Container maxWidth="xl">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column" gap={2}>
            <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              Loading enrollment history...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {error}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Please try refreshing the page or contact support if the problem persists.
            </Typography>
          </Alert>
        ) : (
          <Paper
            elevation={0}
            sx={{ 
              border: '1px solid #E5E7EB', 
              borderRadius: 2, 
              overflow: 'hidden',
              backgroundColor: '#FFFFFF'
            }}
          >
            {/* Header */}
            <TableHeader
              historyCount={filteredHistory.length}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              filterStatus={filterStatus}
              onFilterChange={handleFilterChange}
            />

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {TABLE_COLUMNS.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{
                          ...styles.headCell,
                          width: column.width,
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {paginatedHistory.length === 0 ? (
                    <EmptyState 
                      hasSearch={Boolean(searchTerm)}
                      hasFilter={filterStatus !== 'all'}
                      searchTerm={searchTerm}
                      filterStatus={filterStatus}
                    />
                  ) : (
                    paginatedHistory.map((item) => {
                      const userInfo = item.user || {};
                      
                      return (
                        <TableRow key={item.id} sx={styles.bodyRow}>
                          {/* Reference Code */}
                          <TableCell sx={styles.bodyCell}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: '#111827',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                              }}
                            >
                              {item.application_reference_code || 'N/A'}
                            </Typography>
                          </TableCell>

                          {/* Beneficiary Name */}
                          <TableCell sx={styles.bodyCell}>
                            <Typography
                              variant="body2"
                              sx={{ 
                                fontWeight: 500, 
                                color: '#111827' 
                              }}
                            >
                              {getFullName(userInfo)}
                            </Typography>
                          </TableCell>

                          {/* Enrollment Type */}
                          <TableCell sx={styles.bodyCell}>
                            <EnrollmentTypeChip type={item.enrollment_type} />
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={styles.bodyCell}>
                            <StatusChip status={item.application_status} />
                          </TableCell>

                          {/* Submitted Date */}
                          <TableCell sx={styles.bodyCell}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6B7280',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatDate(item.created_at)}
                            </Typography>
                          </TableCell>

                          {/* Processed Date */}
                          <TableCell sx={styles.bodyCell}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#6B7280',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getProcessedDate(item)}
                            </Typography>
                          </TableCell>

                          {/* Processed By */}
                          <TableCell sx={styles.bodyCell}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#111827',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {getProcessedBy(item)}
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
            <Box sx={styles.pagination}>
              <TablePagination
                component="div"
                count={filteredHistory.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Box>
          </Paper>
        )}
      </Container>

      <Footer />
    </>
  );
}

export default EnrollmentHistory;
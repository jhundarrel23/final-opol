/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

// ==================== CONSTANTS ====================
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

const ENROLLMENT_TYPE_CONFIG = {
  new: { color: '#1D4ED8', bg: '#EFF6FF', label: 'NEW' },
  renewal: { color: '#166534', bg: '#F0FDF4', label: 'RENEWAL' },
  update: { color: '#B45309', bg: '#FFFBEB', label: 'UPDATE' }
};

const TABLE_COLUMNS = [
  { id: 'reference', label: 'Reference Code', width: '140px' },
  { id: 'beneficiary', label: 'Beneficiary', width: '180px' },
  { id: 'type', label: 'Type', width: '100px' },
  { id: 'application_status', label: 'Application Status', width: '140px' },
  { id: 'interview_status', label: 'Interview Status', width: '130px' },
  { id: 'interviewer', label: 'Interviewer', width: '150px' },
  { id: 'date', label: 'Date Created', width: '120px' },
  { id: 'actions', label: 'Actions', width: '200px', align: 'center' }
];

// ==================== STYLES ====================
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

// ==================== UTILITY FUNCTIONS ====================
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

// ==================== CHIP COMPONENTS ====================
const StatusChip = ({ status, config }) => (
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

const ApplicationStatusChip = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.cancelled;
  return <StatusChip status={status} config={config} />;
};

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

const InterviewStatusChip = ({ enrollment }) => {
  if (enrollment.interview_completed_at) {
    return (
      <Chip
        label="COMPLETED"
        size="small"
        sx={{
          backgroundColor: '#E8F5E8',
          color: '#2E7D32',
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24,
          border: 'none',
          '& .MuiChip-label': { px: 1.5 },
        }}
      />
    );
  }
  
  return (
    <Chip
      label="PENDING"
      size="small"
      sx={{
        backgroundColor: '#FFF3E0',
        color: '#E65100',
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        border: 'none',
        '& .MuiChip-label': { px: 1.5 },
      }}
    />
  );
};

// ==================== CONFIRMATION DIALOGS ====================
const ApprovalConfirmDialog = ({ open, onClose, onConfirm, enrollment, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle sx={{ color: '#059669', fontWeight: 600 }}>
      Approve Enrollment
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to approve the enrollment for{' '}
        <strong>{getFullName(enrollment?.user)}</strong> with reference code{' '}
        <strong>{enrollment?.application_reference_code}</strong>?
      </DialogContentText>
      <DialogContentText sx={{ mt: 2, color: '#6B7280' }}>
        This action cannot be undone. The beneficiary will be notified of the approval.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button 
        onClick={onClose} 
        disabled={loading}
        variant="outlined"
        sx={{ margin: 1 }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleIcon />}
        sx={{
          margin: 1,
          backgroundColor: '#059669',
          '&:hover': { backgroundColor: '#047857' },
        }}
      >
        {loading ? 'Approving...' : 'Approve'}
      </Button>
    </DialogActions>
  </Dialog>
);

const RejectionConfirmDialog = ({ open, onClose, onConfirm, enrollment, loading }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || null);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#DC2626', fontWeight: 600 }}>
        Reject Enrollment
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 3 }}>
          Are you sure you want to reject the enrollment for{' '}
          <strong>{getFullName(enrollment?.user)}</strong> with reference code{' '}
          <strong>{enrollment?.application_reference_code}</strong>?
        </DialogContentText>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Rejection Reason (Optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason for rejection..."
          disabled={loading}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
          sx={{ margin: 1 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <CancelIcon />}
          sx={{
            margin: 1,
            backgroundColor: '#DC2626',
            '&:hover': { backgroundColor: '#B91C1C' },
          }}
        >
          {loading ? 'Rejecting...' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ==================== ACTION BUTTONS ====================
const ActionButtons = ({ enrollment, onViewInterview, onApprove, onReject, user }) => {
  const isPending = enrollment.application_status === 'pending';
  const isAdmin = user?.role === 'admin';
  
  return (
    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
      {/* View Button */}
      <Button
        size="small"
        variant="outlined"
        startIcon={<ViewIcon fontSize="small" />}
        onClick={() => onViewInterview && onViewInterview(enrollment)}
        sx={{
          margin: 0.5,
          minWidth: 80,
          height: 32,
          borderColor: '#D1D5DB',
          color: '#374151',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'none',
          borderRadius: 1,
          '&:hover': {
            borderColor: '#9CA3AF',
            backgroundColor: '#F9FAFB',
          },
        }}
      >
        View
      </Button>

      {/* Approve Button - Only for admins and pending applications */}
      {isPending && isAdmin && onApprove && (
        <Button
          size="small"
          variant="contained"
          startIcon={<CheckCircleIcon fontSize="small" />}
          onClick={() => onApprove(enrollment.id)}
          sx={{
            margin: 0.5,
            minWidth: 90,
            height: 32,
            backgroundColor: '#059669',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#047857',
            },
            '&:active': {
              backgroundColor: '#065f46',
            },
          }}
        >
          Approve
        </Button>
      )}

      {/* Reject Button - Only for admins and pending applications */}
      {isPending && isAdmin && onReject && (
        <Button
          size="small"
          variant="contained"
          startIcon={<CancelIcon fontSize="small" />}
          onClick={() => onReject(enrollment.id)}
          sx={{
            margin: 0.5,
            minWidth: 80,
            height: 32,
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'none',
            borderRadius: 1,
            '&:hover': {
              backgroundColor: '#B91C1C',
            },
            '&:active': {
              backgroundColor: '#991B1B',
            },
          }}
        >
          Reject
        </Button>
      )}
    </Stack>
  );
};

// ==================== EMPTY STATE ====================
const EmptyState = ({ hasSearch, searchTerm }) => (
  <TableRow>
    <TableCell colSpan={8} align="center">
      <Box sx={{ py: 6 }}>
        <Typography variant="body1" sx={{ color: '#6B7280', mb: 1 }}>
          {hasSearch ? 'No matches found' : 'No enrollments available'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
          {hasSearch 
            ? `Try adjusting your search for "${searchTerm}"` 
            : 'New enrollment applications will appear here'
          }
        </Typography>
      </Box>
    </TableCell>
  </TableRow>
);

// ==================== TABLE HEADER ====================
const TableHeader = ({ enrollmentCount, searchTerm, onSearchChange }) => (
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
          RSBSA Enrollment Management
        </Typography>
        <Typography variant="body2" sx={styles.headerSubtitle}>
          {enrollmentCount} {enrollmentCount === 1 ? 'enrollment' : 'enrollments'} found
        </Typography>
      </Box>

      {/* Search Section */}
      <TextField
        size="small"
        placeholder="Search by reference, name, type, or status..."
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
    </Box>
  </Box>
);

// ==================== MAIN COMPONENT ====================
const RSBSAEnrollmentTable = ({
  enrollments = [],
  loading = false,
  error = null,
  onViewInterview,
  onApproveEnrollment,
  onRejectEnrollment,
  user,
}) => {
  // ==================== STATE ====================
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalDialog, setApprovalDialog] = useState({ open: false, enrollment: null });
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, enrollment: null });
  const [actionLoading, setActionLoading] = useState(false);

  // ==================== COMPUTED VALUES ====================
  const filteredEnrollments = useMemo(() => {
    if (!Array.isArray(enrollments)) return [];

    return enrollments.filter((enrollment) => {
      if (!enrollment) return false;

      const searchLower = searchTerm.toLowerCase();
      const userInfo = enrollment.user || {};
      const reviewer = enrollment.reviewer || {};

      return (
        enrollment.application_reference_code?.toLowerCase().includes(searchLower) ||
        getFullName(userInfo).toLowerCase().includes(searchLower) ||
        enrollment.enrollment_type?.toLowerCase().includes(searchLower) ||
        enrollment.application_status?.toLowerCase().includes(searchLower) ||
        getFullName(reviewer).toLowerCase().includes(searchLower)
      );
    });
  }, [enrollments, searchTerm]);

  const paginatedEnrollments = filteredEnrollments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ==================== HANDLERS ====================
  const handleChangePage = (event, newPage) => setPage(newPage);
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleApprove = (enrollmentId) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    setApprovalDialog({ open: true, enrollment });
  };

  const handleReject = (enrollmentId) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    setRejectionDialog({ open: true, enrollment });
  };

  const confirmApprove = async () => {
    if (!approvalDialog.enrollment || !onApproveEnrollment) return;

    setActionLoading(true);
    try {
      const result = await onApproveEnrollment(approvalDialog.enrollment.id);
      if (result?.success) {
        setApprovalDialog({ open: false, enrollment: null });
      }
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReject = async (reason) => {
    if (!rejectionDialog.enrollment || !onRejectEnrollment) return;

    setActionLoading(true);
    try {
      const result = await onRejectEnrollment(rejectionDialog.enrollment.id, reason);
      if (result?.success) {
        setRejectionDialog({ open: false, enrollment: null });
      }
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== RENDER CONDITIONS ====================
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} sx={{ color: '#3B82F6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <>
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
          enrollmentCount={filteredEnrollments.length}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
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
              {paginatedEnrollments.length === 0 ? (
                <EmptyState 
                  hasSearch={Boolean(searchTerm)} 
                  searchTerm={searchTerm} 
                />
              ) : (
                paginatedEnrollments.map((enrollment) => {
                  const userInfo = enrollment.user || {};
                  const reviewer = enrollment.reviewer || {};

                  return (
                    <TableRow key={enrollment.id} sx={styles.bodyRow}>
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
                          {enrollment.application_reference_code || 'N/A'}
                        </Typography>
                      </TableCell>

                      {/* Beneficiary */}
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
                      <TableCell sx={{...styles.bodyCell, maxWidth: '120px'}}>
                        <EnrollmentTypeChip type={enrollment.enrollment_type} />
                      </TableCell>

                      {/* Application Status */}
                      <TableCell sx={{...styles.bodyCell, maxWidth: '160px'}}>
                        <ApplicationStatusChip status={enrollment.application_status} />
                      </TableCell>

                      {/* Interview Status */}
                      <TableCell sx={{...styles.bodyCell, maxWidth: '150px'}}>
                        <InterviewStatusChip enrollment={enrollment} />
                      </TableCell>

                      {/* Interviewer */}
                      <TableCell sx={{...styles.bodyCell, maxWidth: '180px'}}>
                        <Typography 
                          variant="body2" 
                          title={getFullName(reviewer) !== 'N/A' ? getFullName(reviewer) : 'Unassigned'} // Tooltip on hover
                          sx={{ 
                            color: '#111827', // Changed from #6B7280 to #111827 (black)
                            fontWeight: 500, // Added font weight for better visibility
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {getFullName(reviewer) !== 'N/A' ? getFullName(reviewer) : 'Unassigned'}
                        </Typography>
                      </TableCell>

                      {/* Date Created */}
                      <TableCell sx={{...styles.bodyCell, maxWidth: '140px'}}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#6B7280',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDate(enrollment.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{...styles.bodyCell, maxWidth: '250px'}}>
                        <ActionButtons
                          enrollment={enrollment}
                          onViewInterview={onViewInterview}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          user={user}
                        />
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
            count={filteredEnrollments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Box>
      </Paper>

      {/* Confirmation Dialogs */}
      <ApprovalConfirmDialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ open: false, enrollment: null })}
        onConfirm={confirmApprove}
        enrollment={approvalDialog.enrollment}
        loading={actionLoading}
      />

      <RejectionConfirmDialog
        open={rejectionDialog.open}
        onClose={() => setRejectionDialog({ open: false, enrollment: null })}
        onConfirm={confirmReject}
        enrollment={rejectionDialog.enrollment}
        loading={actionLoading}
      />
    </>
  );
};

// ==================== PROP TYPES ====================
RSBSAEnrollmentTable.propTypes = {
  enrollments: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onViewInterview: PropTypes.func.isRequired,
  onApproveEnrollment: PropTypes.func,
  onRejectEnrollment: PropTypes.func,
  user: PropTypes.object,
};

ActionButtons.propTypes = {
  enrollment: PropTypes.object.isRequired,
  onViewInterview: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  user: PropTypes.object,
};

StatusChip.propTypes = {
  status: PropTypes.string,
  config: PropTypes.object.isRequired,
};

ApplicationStatusChip.propTypes = {
  status: PropTypes.string,
};

EnrollmentTypeChip.propTypes = {
  type: PropTypes.string,
};

InterviewStatusChip.propTypes = {
  enrollment: PropTypes.object.isRequired,
};

EmptyState.propTypes = {
  hasSearch: PropTypes.bool.isRequired,
  searchTerm: PropTypes.string,
};

TableHeader.propTypes = {
  enrollmentCount: PropTypes.number.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

ApprovalConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  enrollment: PropTypes.object,
  loading: PropTypes.bool,
};

RejectionConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  enrollment: PropTypes.object,
  loading: PropTypes.bool,
};

export default RSBSAEnrollmentTable;
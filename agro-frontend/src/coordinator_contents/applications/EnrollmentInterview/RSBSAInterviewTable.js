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
  Tooltip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Stack,
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Label from 'src/components/Label';

const RSBSAInterviewTable = ({
  enrollments = [],
  loading = false,
  error = null,
  onCompleteInterview, 
  onViewInterview,
  user,
  onRefresh,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');


  console.log('🔍 RSBSAInterviewTable props:', {
    enrollments: enrollments?.length,
    onViewInterview: typeof onViewInterview,
    user: user?.id,
  });

  // Filter and search enrollments
  const filteredEnrollments = useMemo(() => {
    if (!enrollments) return [];
    
    return enrollments.filter((enrollment) => {
      if (!enrollment) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const userInfo = enrollment.user || {};
      const beneficiaryDetails = enrollment.beneficiary_detail || {};
      
      return (
        enrollment.application_reference_code?.toLowerCase().includes(searchLower) ||
        `${userInfo.fname} ${userInfo.lname}`.toLowerCase().includes(searchLower) ||
        beneficiaryDetails.contact_number?.toLowerCase().includes(searchLower) ||
        enrollment.enrollment_type?.toLowerCase().includes(searchLower) ||
        enrollment.application_status?.toLowerCase().includes(searchLower)
      );
    });
  }, [enrollments, searchTerm]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusLabel = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default'
    };
    return <Label color={colors[status] || 'default'}>{status?.toUpperCase()}</Label>;
  };

  const getInterviewStatusLabel = (enrollment) => {
    if (enrollment.interview_completed_at) {
      return <Label color="success">Completed</Label>;
    }
    return <Label color="warning">Pending</Label>;
  };

  const handleViewInterviewClick = (enrollment) => {
    console.log('👁️ Table handleViewInterviewClick called for:', enrollment.id);
    console.log('🔧 onViewInterview function type:', typeof onViewInterview);
    
    if (onViewInterview && typeof onViewInterview === 'function') {
      onViewInterview(enrollment);
    } else {
      console.error('❌ onViewInterview not available in table');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedEnrollments = filteredEnrollments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">RSBSA Interview Management</Typography>
          </Box>
        }
        subheader={`${filteredEnrollments.length} interview${filteredEnrollments.length !== 1 ? 's' : ''} found`}
        action={
          <TextField
            size="small"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
        }
      />
      
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reference Code</TableCell>
                <TableCell>Beneficiary Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Application Status</TableCell>
                <TableCell>Interview Status</TableCell>
                <TableCell>Application Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 4 }}>
                      {searchTerm ? 'No interviews match your search criteria.' : 'No interviews available.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEnrollments.map((enrollment) => {
                  const userInfo = enrollment.user || {};
                  const beneficiaryDetails = enrollment.beneficiary_detail || {};
                  const isCompleted = !!enrollment.interview_completed_at;

                  return (
                    <TableRow key={enrollment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {enrollment.application_reference_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {`${userInfo.fname || ''} ${userInfo.mname ? `${userInfo.mname} ` : ''}${userInfo.lname || ''} ${userInfo.extension_name || ''}`.trim()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {beneficiaryDetails.contact_number || userInfo.phone_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={enrollment.enrollment_type?.toUpperCase() || 'N/A'} 
                          size="small" 
                          variant="outlined"
                          color={enrollment.enrollment_type === 'new' ? 'primary' : 'success'}
                        />
                      </TableCell>
                      <TableCell>
                        {getStatusLabel(enrollment.application_status)}
                      </TableCell>
                      <TableCell>
                        {getInterviewStatusLabel(enrollment)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {enrollment.created_at ? formatDate(enrollment.created_at) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title={isCompleted ? "View Interview Details" : "View and Complete Interview"}>
                            <Button
                              size="small"
                              variant={isCompleted ? "outlined" : "contained"}
                              color="primary"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewInterviewClick(enrollment)}
                              sx={{ minWidth: 120 }}
                            >
                              {isCompleted ? 'View Details' : 'View & Complete'}
                            </Button>
                          </Tooltip>
                          
                          {isCompleted && (
                            <Chip
                              label="Verified"
                              size="small"
                              color="success"
                              icon={<CheckCircleIcon />}
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredEnrollments.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Interviews per page:"
        />
      </CardContent>
    </Card>
  );
};

RSBSAInterviewTable.propTypes = {
  enrollments: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onCompleteInterview: PropTypes.func, // Made optional since not used in table anymore
  onViewInterview: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  onRefresh: PropTypes.func,
};

RSBSAInterviewTable.defaultProps = {
  enrollments: [],
  loading: false,
  error: null,
  onCompleteInterview: null,
  onRefresh: null,
};

export default RSBSAInterviewTable;
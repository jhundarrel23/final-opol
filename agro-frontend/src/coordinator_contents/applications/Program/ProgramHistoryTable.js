import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Typography,
  Box,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Label from 'src/components/Label';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';

const getStatusLabel = (status) => {
  const map = {
    completed: { text: 'Completed', color: 'success' },
    cancelled: { text: 'Cancelled', color: 'error' }
  };
  const { text, color } = map[status] || { text: status, color: 'default' };
  return <Label color={color}>{text}</Label>;
};

const getApprovalLabel = (status) => {
  const map = {
    approved: { text: 'Approved', color: 'success' },
    rejected: { text: 'Rejected', color: 'error' },
    pending: { text: 'Pending', color: 'warning' }
  };
  const { text, color } = map[status] || { text: status, color: 'default' };
  return <Label color={color}>{text}</Label>;
};

const ProgramHistoryTable = ({ programs, onView, pagination, onPageChange, onRowsPerPageChange }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = programs.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  );

  const getStats = (program) => {
    const total = program.beneficiaries?.reduce((sum, b) => 
      sum + (b.items?.length || 0), 0) || 0;
    const distributed = program.beneficiaries?.reduce((sum, b) => 
      sum + (b.items?.filter(i => i.status === 'distributed').length || 0), 0) || 0;
    return { total, distributed };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader
        title="Program History"
        subheader="Completed and cancelled programs (read-only)"
        action={
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filter Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Program Title</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="center">Beneficiaries</TableCell>
              <TableCell align="center">Distribution</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Approval</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((program) => {
                const { total, distributed } = getStats(program);
                const distributionRate = total > 0 ? Math.round((distributed/total)*100) : 0;
                
                return (
                  <TableRow key={program.id} hover>
                    <TableCell>
                      <Typography fontWeight="bold" noWrap>
                        {program.title}
                      </Typography>
                      {program.description && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 250, display: 'block' }}>
                          {program.description.length > 60 
                            ? `${program.description.substring(0, 60)}...` 
                            : program.description
                          }
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(program.start_date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {formatDate(program.end_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {program.creator 
                          ? `${program.creator.fname} ${program.creator.lname}`
                          : 'Unknown'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {program.beneficiaries?.length || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {distributed}/{total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({distributionRate}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {getStatusLabel(program.status)}
                    </TableCell>
                    <TableCell align="center">
                      {getApprovalLabel(program.approval_status)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details" arrow>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => onView(program)}
                        >
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box py={5}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {programs.length === 0 
                        ? 'No program history available yet.'
                        : 'No programs match the selected filter.'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed and cancelled programs will appear here.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={filtered.length}
          page={(pagination?.current_page || 1) - 1}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          rowsPerPage={pagination?.per_page || 10}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showFirstButton
          showLastButton
        />
      </Box>
    </Card>
  );
};

ProgramHistoryTable.propTypes = {
  programs: PropTypes.array.isRequired,
  onView: PropTypes.func,
  pagination: PropTypes.object,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func
};

ProgramHistoryTable.defaultProps = {
  programs: []
};

export default ProgramHistoryTable;

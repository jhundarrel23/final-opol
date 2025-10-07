import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Card,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  Typography,
  useTheme,
  CardHeader
} from '@mui/material';

import Label from 'src/components/Label';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import BulkActions from './BulkActions';

// ✅ Updated status mapping for subsidy programs
const getStatusLabel = (status) => {
  const statusMap = {
    pending: { text: 'Pending', color: 'warning' },
    ongoing: { text: 'Ongoing', color: 'info' },
    completed: { text: 'Completed', color: 'success' },
    cancelled: { text: 'Cancelled', color: 'error' }
  };
  const { text, color } = statusMap[status] || { text: 'Unknown', color: 'secondary' };
  return <Label color={color}>{text}</Label>;
};

// ✅ Updated approval status mapping
const getApprovalStatusLabel = (approvalStatus) => {
  const statusMap = {
    pending: { text: 'Pending Approval', color: 'warning' },
    approved: { text: 'Approved', color: 'success' },
    rejected: { text: 'Rejected', color: 'error' }
  };
  const { text, color } = statusMap[approvalStatus] || { text: 'Unknown', color: 'secondary' };
  return <Label color={color}>{text}</Label>;
};

// ✅ Updated filters for subsidy programs
const applyFilters = (programs, filters) => {
  return programs.filter((program) => {
    if (filters.status && program.status !== filters.status) {
      return false;
    }
    if (filters.approvalStatus && program.approval_status !== filters.approvalStatus) {
      return false;
    }
    return true;
  });
};

// ✅ Pagination helper
const applyPagination = (items, page, limit) => {
  return items.slice(page * limit, page * limit + limit);
};

const ProgramTable = ({ programs, onEdit, onDelete, onView }) => {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({ 
    status: null, 
    approvalStatus: null 
  });

  const theme = useTheme();

  // ✅ Updated filter options
  const statusOptions = [
    { id: 'all', name: 'All Statuses' },
    { id: 'pending', name: 'Pending' },
    { id: 'ongoing', name: 'Ongoing' },
    { id: 'completed', name: 'Completed' },
    { id: 'cancelled', name: 'Cancelled' }
  ];

  const approvalOptions = [
    { id: 'all', name: 'All Approval Status' },
    { id: 'pending', name: 'Pending Approval' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' }
  ];

  const handleStatusChange = (event) => {
    const value = event.target.value === 'all' ? null : event.target.value;
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleApprovalStatusChange = (event) => {
    const value = event.target.value === 'all' ? null : event.target.value;
    setFilters((prev) => ({ ...prev, approvalStatus: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? programs.map((p) => p.id) : []);
  };

  const handleSelectOne = (event, id) => {
    if (event.target.checked) {
      setSelected((prev) => [...prev, id]);
    } else {
      setSelected((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filtered = applyFilters(programs, filters);
  const paginated = applyPagination(filtered, page, limit);

  const selectedAll = selected.length === programs.length && programs.length > 0;
  const selectedSome = selected.length > 0 && selected.length < programs.length;
  const bulkActionsActive = selected.length > 0;

  return (
    <Card>
      {bulkActionsActive ? (
        <Box flex={1} p={2}>
          <BulkActions selected={selected} onClearSelection={() => setSelected([])} />
        </Box>
      ) : (
        <CardHeader
          title="Subsidy Programs"
          action={
            <Box display="flex" gap={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || 'all'}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Approval</InputLabel>
                <Select
                  value={filters.approvalStatus || 'all'}
                  onChange={handleApprovalStatusChange}
                  label="Approval"
                >
                  {approvalOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          }
        />
      )}

      <Divider />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Program Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Approval</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((program) => {
                const isSelected = selected.includes(program.id);

                return (
                  <TableRow hover key={program.id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(e, program.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" noWrap>
                        {program.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {program.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {program.start_date ? new Date(program.start_date).toLocaleDateString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {program.end_date ? new Date(program.end_date).toLocaleDateString() : '-'}
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
                      {getStatusLabel(program.status)}
                    </TableCell>
                    <TableCell align="center">
                      {getApprovalStatusLabel(program.approval_status)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.info.main,
                            '&:hover': {
                              background: theme.palette.info.lighter || theme.palette.info.main + '10'
                            }
                          }}
                          onClick={() => onView?.(program)}
                        >
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit" arrow>
                        <span>
                          <IconButton
                            size="small"
                            disabled={program.approval_status === 'approved'}
                            sx={{
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: theme.palette.primary.lighter || theme.palette.primary.main + '10'
                              }
                            }}
                            onClick={() => onEdit?.(program)}
                          >
                            <EditTwoToneIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <span>
                          <IconButton
                            size="small"
                            disabled={program.approval_status === 'approved'}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                background: theme.palette.error.lighter || theme.palette.error.main + '10'
                              }
                            }}
                            onClick={() => onDelete?.(program)}
                          >
                            <DeleteTwoToneIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    {programs.length === 0 
                      ? 'No programs created yet.'
                      : 'No programs match the selected filters.'
                    }
                  </Typography>
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
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          showFirstButton
          showLastButton
        />
      </Box>
    </Card>
  );
};

ProgramTable.propTypes = {
  programs: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func
};

ProgramTable.defaultProps = {
  programs: []
};

export default ProgramTable;
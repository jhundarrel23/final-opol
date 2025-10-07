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
import BulkActions from './BulkActions';

const getStatusLabel = (status) => {
  const statusMap = {
    active: { text: 'Active', color: 'success' },
    inactive: { text: 'Inactive', color: 'error' }
  };
  const { text, color } = statusMap[status] || { text: 'Unknown', color: 'warning' };
  return <Label color={color}>{text}</Label>;
};

const applyFilters = (coordinators, filters) => {
  return coordinators.filter((coordinator) => {
    if (filters.status && coordinator.status !== filters.status) {
      return false;
    }
    return true;
  });
};

const applyPagination = (items, page, limit) => {
  return items.slice(page * limit, page * limit + limit);
};

const CoordinatorTable = ({ coordinators }) => {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [filters, setFilters] = useState({ status: null });

  const theme = useTheme();

  const statusOptions = [
    { id: 'all', name: 'All' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' }
  ];

  const handleStatusChange = (event) => {
    const value = event.target.value === 'all' ? null : event.target.value;
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleSelectAll = (event) => {
    setSelected(event.target.checked ? coordinators.map((c) => c.id) : []);
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
  };

  const filtered = applyFilters(coordinators, filters);
  const paginated = applyPagination(filtered, page, limit);

  const selectedAll = selected.length === coordinators.length && coordinators.length > 0;
  const selectedSome = selected.length > 0 && selected.length < coordinators.length;
  const bulkActionsActive = selected.length > 0;

  return (
    <Card>
      {bulkActionsActive ? (
        <Box flex={1} p={2}>
          <BulkActions />
        </Box>
      ) : (
        <CardHeader
          title="Coordinator List"
          action={
            <Box width={150}>
              <FormControl fullWidth variant="outlined">
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
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Section</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((coordinator) => {
                const isSelected = selected.includes(coordinator.id);

                return (
                  <TableRow hover key={coordinator.id} selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(e, coordinator.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" noWrap>
                        {coordinator.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{coordinator.email}</TableCell>
                    <TableCell>{coordinator.role}</TableCell>
                  <TableCell>{coordinator.sector?.sector_name || 'N/A'}</TableCell>  
                    <TableCell align="right">
                      {getStatusLabel(coordinator.status)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              background: theme.colors.primary.lighter
                            }
                          }}
                          // onClick={() => handleEdit(coordinator)}
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Deactivate" arrow>
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              background: theme.colors.error.lighter
                            }
                          }}
                          // onClick={() => handleDelete(coordinator)}
                        >
                          <DeleteTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No coordinators found.
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
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    </Card>
  );
};

CoordinatorTable.propTypes = {
  coordinators: PropTypes.array.isRequired
};

CoordinatorTable.defaultProps = {
  coordinators: []
};

export default CoordinatorTable;

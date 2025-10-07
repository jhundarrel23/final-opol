import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Tooltip,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Card,
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
  CardHeader,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import { SwapHoriz } from '@mui/icons-material';

import Label from 'src/components/Label';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/Search';

const getStatusLabel = (status) => {
  const statusMap = {
    active: { text: 'Active', color: 'success' },
    inactive: { text: 'Inactive', color: 'error' }
  };
  const { text, color } = statusMap[status] || { text: 'Unknown', color: 'warning' };
  return <Label color={color}>{text}</Label>;
};

const applyFilters = (coordinators, filters, search) => {
  return coordinators.filter((coordinator) => {
    const matchesStatus = !filters.status || coordinator.status === filters.status;
    const matchesSearch =
      !search ||
      coordinator.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      coordinator.fname?.toLowerCase().includes(search.toLowerCase()) ||
      coordinator.email?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });
};

const applyPagination = (items, page, limit) => {
  return items.slice(page * limit, page * limit + limit);
};

const CoordinatorTable = ({ coordinators, onEdit, onDelete, onTransfer }) => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [filters, setFilters] = useState({ status: null });
  const [search, setSearch] = useState('');

  const theme = useTheme();

  const statusOptions = [
    { id: 'all', name: 'All' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' }
  ];

  const handleStatusChange = (event) => {
    const value = event.target.value === 'all' ? null : event.target.value;
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (coordinator) => {
    if (onEdit) {
      onEdit(coordinator);
    } else {
      console.log('Edit coordinator:', coordinator);
    }
  };

  const handleDelete = (coordinator) => {
    if (onDelete) {
      onDelete(coordinator);
    } else {
      console.log('Delete coordinator:', coordinator);
    }
  };

  const handleTransfer = () => {
    if (onTransfer) {
      onTransfer();
    } else {
      console.log('Transfer beneficiaries');
    }
  };

  // Apply filters + search + pagination
  const filtered = applyFilters(coordinators, filters, search);
  const paginated = applyPagination(filtered, page, limit);

  return (
    <Card>
      <CardHeader
        title="Coordinator List"
        action={
          <Box display="flex" alignItems="center" gap={2}>
            {/* Transfer Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SwapHoriz />}
              onClick={handleTransfer}
              sx={{ minWidth: 180 }}
            >
              Transfer Beneficiaries
            </Button>

            {/* Search Field */}
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchTwoToneIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            {/* Status Filter */}
            <FormControl fullWidth variant="outlined" size="small" sx={{ width: 150 }}>
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

      <Divider />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((coordinator, index) => {
                const fullName =
                  coordinator.full_name ||
                  [coordinator.fname, coordinator.mname, coordinator.lname, coordinator.extension_name]
                    .filter(Boolean)
                    .join(' ') ||
                  'N/A';

                return (
                  <TableRow
                    hover
                    key={coordinator.id}
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.grey[50] }
                    }}
                  >
                    {/* Row Number */}
                    <TableCell>{page * limit + index + 1}</TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {fullName}
                      </Typography>
                      {coordinator.username && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          @{coordinator.username}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {coordinator.email || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {coordinator.role || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {coordinator.sector?.sector_name || 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">{getStatusLabel(coordinator.status)}</TableCell>

                    <TableCell align="right">
                      <Tooltip title="Edit" arrow>
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': { background: theme.palette.primary.light + '20' }
                          }}
                          onClick={() => handleEdit(coordinator)}
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={coordinator.status === 'active' ? 'Deactivate' : 'Activate'}
                        arrow
                      >
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': { background: theme.palette.error.light + '20' }
                          }}
                          onClick={() => handleDelete(coordinator)}
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
                  <Box py={3}>
                    <Typography variant="body2" color="text.secondary">
                      {coordinators.length === 0
                        ? 'No coordinators found.'
                        : 'No coordinators match the current filter or search.'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filtered.length > 0 && (
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
      )}
    </Card>
  );
};

CoordinatorTable.propTypes = {
  coordinators: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onTransfer: PropTypes.func
};

CoordinatorTable.defaultProps = {
  coordinators: [],
  onEdit: null,
  onDelete: null,
  onTransfer: null
};

export default CoordinatorTable;
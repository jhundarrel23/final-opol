import { useState, useMemo, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
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
  TablePagination,
  TableHead,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  useTheme,
  CardHeader,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  TextField,
  Button
} from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import Label from 'src/components/Label';

const STATUS_OPTIONS = ['all', 'active', 'inactive'];

const getStatusLabel = (status) => {
  const map = {
    active: { text: 'Active', color: 'success' },
    inactive: { text: 'Inactive', color: 'error' }
  };
  const { text, color } = map[status] || { text: 'Unknown', color: 'default' };
  return <Label color={color}>{text}</Label>;
};

const applyFilters = (data, filters) => {
  return data.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    return true;
  });
};

const applyPagination = (data, page, limit) => {
  return data.slice(page * limit, page * limit + limit);
};

const SectorTable = ({ sectors, fetchSectors }) => {
  const theme = useTheme();

  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ status: null });
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: null, sector_name: '', status: 'active' });
  const [editNameExists, setEditNameExists] = useState(false);
  const [editError, setEditError] = useState('');

  const selectedSome = selectedIds.length > 0 && selectedIds.length < sectors.length;
  const selectedAll = selectedIds.length === sectors.length;
  const hasBulkActions = selectedIds.length > 0;

  const handleStatusChange = (e) => {
    const value = e.target.value === 'all' ? null : e.target.value;
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(0);
  };

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? sectors.map((s) => s.id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePageChange = (_, newPage) => setPage(newPage);
  const handleLimitChange = (e) => setLimit(parseInt(e.target.value, 10));

  const confirmDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/sectors/${deleteId}`);
      setSnackbar({ open: true, message: 'Sector deleted successfully.', severity: 'success' });
      fetchSectors();
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to delete sector.', severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce(async (dataToUpdate) => {
        try {
          await axiosInstance.put(`/api/sectors/${dataToUpdate.id}`, {
            sector_name: dataToUpdate.sector_name,
            status: dataToUpdate.status
          });
          setSnackbar({ open: true, message: 'Sector updated successfully.', severity: 'success' });
          setEditOpen(false);
          fetchSectors();
        } catch (error) {
          console.error(error);
          const message = error.response?.data?.message || '';
          const errors = error.response?.data?.errors;
          const isDuplicate =
            message.toLowerCase().includes('already exists') ||
            message.toLowerCase().includes('has already been taken') ||
            (errors && errors.sector_name?.[0]?.toLowerCase().includes('already'));
          setSnackbar({
            open: true,
            message: isDuplicate
              ? 'Sector name already exists.'
              : 'Failed to update sector.',
            severity: 'error'
          });
        }
      }, 500),
    [fetchSectors]
  );

  const debouncedCheckEditName = useMemo(
    () =>
      debounce(async (name, id) => {
        if (!name.trim()) {
          setEditNameExists(false);
          return;
        }

        try {
          const res = await axiosInstance.get('/api/sectors');
          const exists = res.data.some(
            (sector) =>
              sector.sector_name.toLowerCase().trim() === name.toLowerCase().trim() &&
              sector.id !== id
          );
          setEditNameExists(exists);
        } catch (err) {
          console.error('Error checking sector name:', err);
        }
      }, 500),
    []
  );

  useEffect(() => {
    if (editOpen && editData.sector_name && editData.id) {
      debouncedCheckEditName(editData.sector_name, editData.id);
    }
    return () => debouncedCheckEditName.cancel();
  }, [editData.sector_name, editData.id, editOpen, debouncedCheckEditName]);

  const handleEdit = (sector) => {
    setEditData({
      id: sector.id,
      sector_name: sector.sector_name,
      status: sector.status
    });
    setEditOpen(true);
    setEditError('');
    setEditNameExists(false);
  };

  const handleUpdate = () => {
    if (!editData.sector_name.trim()) {
      setEditError('Sector name is required');
      return;
    }

    if (editNameExists) {
      setEditError('Sector name already exists');
      return;
    }

    setEditError('');
    debouncedUpdate(editData);
  };

  const filtered = applyFilters(sectors, filters);
  const paginated = applyPagination(filtered, page, limit);

  return (
    <Card>
      {hasBulkActions ? (
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
          <strong>{selectedIds.length} selected</strong>
          <Button variant="outlined" color="error" disabled>
            Bulk Delete (Disabled)
          </Button>
        </Box>
      ) : (
        <CardHeader
          title="Sector List"
          action={
            <Box width={150}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status || 'all'}
                  onChange={handleStatusChange}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
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
              <TableCell>Sector Name</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((sector) => {
              const isSelected = selectedIds.includes(sector.id);
              return (
                <TableRow key={sector.id} hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isSelected}
                      onChange={() => handleSelectOne(sector.id)}
                    />
                  </TableCell>
                  <TableCell>{sector.sector_name}</TableCell>
                  <TableCell>{format(new Date(sector.created_at), 'MMMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(sector.updated_at), 'MMMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusLabel(sector.status)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Sector" arrow>
                      <IconButton
                        sx={{ '&:hover': { background: theme.colors.primary.lighter }, color: theme.palette.primary.main }}
                        size="small"
                        onClick={() => handleEdit(sector)}
                      >
                        <EditTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Sector" arrow>
                      <IconButton
                        sx={{ '&:hover': { background: theme.colors.error.lighter }, color: theme.palette.error.main }}
                        size="small"
                        onClick={() => confirmDelete(sector.id)}
                      >
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box p={2}>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={limit}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleLimitChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sector? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Sector</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Sector Name"
              value={editData.sector_name}
              onChange={(e) => {
                setEditData({ ...editData, sector_name: e.target.value });
                setEditError('');
              }}
              error={!!editError || editNameExists}
              helperText={editError || (editNameExists && 'Sector name already exists') || ''}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

SectorTable.propTypes = {
  sectors: PropTypes.array.isRequired,
  fetchSectors: PropTypes.func.isRequired
};

export default SectorTable;

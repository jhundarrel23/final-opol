import { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Search
} from 'lucide-react';
import { useServiceCatalogs } from './useServiceManagement';
import axiosInstance from '../../../api/axiosInstance';

const ServiceCatalogList = forwardRef(({ onOperation }, ref) => {
  const { data: catalogs, loading, error, refresh } = useServiceCatalogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    description: '',
    is_active: true
  });

  useImperativeHandle(ref, () => ({
    refreshCatalogs: refresh
  }));

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      unit: '',
      description: '',
      is_active: true
    });
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (catalog) => {
    setSelectedCatalog(catalog);
    setFormData({
      name: catalog.name,
      unit: catalog.unit || '',
      description: catalog.description || '',
      is_active: catalog.is_active
    });
    setEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setSelectedCatalog(null);
    setFormData({
      name: '',
      unit: '',
      description: '',
      is_active: true
    });
  };

  const handleAdd = async () => {
    try {
      await axiosInstance.post('/api/service-catalogs', formData);
      onOperation?.('Service catalog created successfully', 'success');
      handleCloseModals();
      refresh();
    } catch (error) {
      console.error('Error creating catalog:', error);
      onOperation?.(error.response?.data?.message || 'Failed to create catalog', 'error');
    }
  };

  const handleEdit = async () => {
    try {
      await axiosInstance.put(`/api/service-catalogs/${selectedCatalog.id}`, formData);
      onOperation?.('Service catalog updated successfully', 'success');
      handleCloseModals();
      refresh();
    } catch (error) {
      console.error('Error updating catalog:', error);
      onOperation?.(error.response?.data?.message || 'Failed to update catalog', 'error');
    }
  };

  const handleDelete = async (catalog) => {
    if (!window.confirm(`Delete "${catalog.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/service-catalogs/${catalog.id}`);
      onOperation?.('Service catalog deleted successfully', 'success');
      refresh();
    } catch (error) {
      console.error('Error deleting catalog:', error);
      onOperation?.(error.response?.data?.message || 'Failed to delete catalog', 'error');
    }
  };

  const filteredCatalogs = catalogs.filter(catalog => {
    const searchLower = searchQuery.toLowerCase();
    return (
      catalog.name?.toLowerCase().includes(searchLower) ||
      catalog.description?.toLowerCase().includes(searchLower) ||
      catalog.sector?.sector_name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3} textAlign="center">
        <Alert severity="error">{error}</Alert>
        <Button onClick={refresh} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Card>
        <Box p={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <TextField
              placeholder="Search catalogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search size={20} style={{ marginRight: 8 }} />
              }}
              sx={{ maxWidth: 400 }}
            />
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={handleOpenAddModal}
              sx={{ bgcolor: '#2d5016' }}
            >
              Add Service Catalog
            </Button>
          </Stack>
        </Box>

        {filteredCatalogs.length === 0 ? (
          <Box p={4} textAlign="center">
            <Package size={48} color="#ccc" style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Service Catalogs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No catalogs match your search.' : 'Create your first service catalog to get started.'}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Package size={16} />
                      <span>Service Name</span>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Sector</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCatalogs.map((catalog) => (
                  <TableRow key={catalog.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {catalog.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {catalog.unit || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {catalog.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {catalog.sector?.sector_name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={catalog.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={catalog.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditModal(catalog)}
                            sx={{ color: '#ed6c02' }}
                          >
                            <Edit3 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(catalog)}
                            sx={{ color: '#d32f2f' }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Dialog 
        open={addModalOpen || editModalOpen} 
        onClose={handleCloseModals}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {addModalOpen ? 'Add Service Catalog' : 'Edit Service Catalog'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText="e.g., Livestock Distribution, Training Program"
            />
            <TextField
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              fullWidth
              helperText="e.g., head, kg, session (optional)"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              helperText="Brief description of the service (optional)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModals}>Cancel</Button>
          <Button
            variant="contained"
            onClick={addModalOpen ? handleAdd : handleEdit}
            disabled={!formData.name.trim()}
            sx={{ bgcolor: '#2d5016' }}
          >
            {addModalOpen ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

ServiceCatalogList.displayName = 'ServiceCatalogList';

export default ServiceCatalogList;

/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Package, Plus, Edit, Delete } from 'lucide-react';
import { useServiceCatalogs, useCreateServiceCatalog, useUpdateServiceCatalog, useDeleteServiceCatalog } from './useServiceManagement';

const ServiceCatalogManagement = forwardRef(({ onOperation }, ref) => {
  const { data: catalogs, loading, error, refresh } = useServiceCatalogs();
  const { createCatalog } = useCreateServiceCatalog();
  const { updateCatalog } = useUpdateServiceCatalog();
  const { deleteCatalog } = useDeleteServiceCatalog();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [formData, setFormData] = useState({ name: '', unit: '', description: '' });

  useImperativeHandle(ref, () => ({ refreshCatalogs: refresh }));

  const handleAdd = async (data) => {
    try {
      await createCatalog(data);
      onOperation('Catalog created', 'success');
      setAddOpen(false);
      refresh();
    } catch (err) {
      onOperation('Create failed', 'error');
    }
  };

  const handleEdit = (catalog) => { setSelectedCatalog(catalog); setFormData({ name: catalog.name, unit: catalog.unit, description: catalog.description }); setEditOpen(true); };
  const handleUpdate = async (data) => {
    try {
      await updateCatalog(selectedCatalog.id, data);
      onOperation('Updated', 'success');
      setEditOpen(false);
      refresh();
    } catch (err) {
      onOperation('Update failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try {
        await deleteCatalog(id);
        onOperation('Deleted', 'success');
        refresh();
      } catch (err) {
        onOperation('Delete failed', 'error');
      }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box><Typography variant="h6" fontWeight={600}>Service Catalogs</Typography><Typography variant="body2" color="text.secondary">Manage service types</Typography></Box>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setAddOpen(true)}>Add Catalog</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow><TableCell sx={{ fontWeight: 600 }}>Name</TableCell><TableCell sx={{ fontWeight: 600 }}>Unit</TableCell><TableCell sx={{ fontWeight: 600 }}>Sector</TableCell><TableCell sx={{ fontWeight: 600 }}>Status</TableCell><TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {catalogs.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.unit || 'N/A'}</TableCell>
                <TableCell>{c.sector?.sector_name || 'N/A'}</TableCell>
                <TableCell><Chip label={c.is_active ? 'Active' : 'Inactive'} color={c.is_active ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => handleEdit(c)} startIcon={<Edit size={16} />}>Edit</Button>
                    <Button size="small" onClick={() => handleDelete(c.id)} color="error" variant="outlined" startIcon={<Delete size={16} />}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Modal */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
        <DialogTitle>Add Catalog</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name *" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Unit (e.g., head)" value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))} fullWidth />
            <TextField label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={() => handleAdd(formData)} variant="contained" disabled={!formData.name}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal (similar to Add) */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Catalog</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name *" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="Unit" value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))} fullWidth />
            <TextField label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={() => handleUpdate(formData)} variant="contained" disabled={!formData.name}>Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

ServiceCatalogManagement.displayName = 'ServiceCatalogManagement';
export default ServiceCatalogManagement;
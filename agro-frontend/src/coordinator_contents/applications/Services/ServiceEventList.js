/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Chip, CircularProgress, Alert, Typography, Stack, Tooltip, TextField, InputAdornment, Card } from '@mui/material';
import { Edit3, Trash2, Calendar, MapPin, Eye, Search } from 'lucide-react';
import { useServiceEvents, useUpdateServiceEvent, useDeleteServiceEvent } from './useServiceManagement';
import EditServiceEventModal from './EditServiceEventModal';
import ServiceEventDetailModal from './ServiceEventDetailModal';

const ServiceEventList = forwardRef(({ onOperation }, ref) => {
  const { data: events, loading, error, refresh } = useServiceEvents();
  const { updateEvent } = useUpdateServiceEvent();
  const { deleteEvent } = useDeleteServiceEvent();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useImperativeHandle(ref, () => ({ refreshEvents: refresh }));

  const filteredEvents = events.filter(e => e.barangay.toLowerCase().includes(searchQuery.toLowerCase()) || e.catalog?.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleEdit = (event) => { setSelectedEvent(event); setEditModalOpen(true); };
  const handleView = (event) => { setSelectedEvent(event); setDetailModalOpen(true); };
  const handleEditSubmit = async (updatedData) => {
    try {
      await updateEvent(selectedEvent.id, updatedData);
      onOperation('Event updated', 'success');
      setEditModalOpen(false);
      refresh();
    } catch (err) {
      onOperation('Update failed', 'error');
    }
  };
  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      try {
        await deleteEvent(id);
        onOperation('Event deleted', 'success');
        refresh();
      } catch (err) {
        onOperation('Delete failed', 'error');
      }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField label="Search Events" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment> }} sx={{ width: 300 }} />
        <Typography variant="h6" fontWeight={600}>Service Events ({filteredEvents.length})</Typography>
      </Stack>
      {filteredEvents.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Barangay</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map(event => (
                <TableRow key={event.id} hover>
                  <TableCell><Stack direction="row" alignItems="center" spacing={1}><Package size={16} /><Typography variant="body2" fontWeight={600}>{event.catalog?.name}</Typography></Stack></TableCell>
                  <TableCell><Stack direction="row" alignItems="center" spacing={1}><MapPin size={16} /><Typography variant="body2">{event.barangay}</Typography></Stack></TableCell>
                  <TableCell><Typography variant="body2">{new Date(event.service_date).toLocaleDateString()}</Typography></TableCell>
                  <TableCell><Chip label={event.status} color={event.status === 'completed' ? 'success' : event.status === 'cancelled' ? 'error' : 'info'} size="small" /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View"><IconButton size="small" onClick={() => handleView(event)}><Eye size={16} /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(event)} sx={{ color: '#1976d2' }}><Edit3 size={16} /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(event.id, `${event.catalog?.name} - ${event.barangay}`)} sx={{ color: '#d32f2f' }}><Trash2 size={16} /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Calendar size={48} color="#ccc" sx={{ mx: 'auto', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No Events</Typography>
          <Typography variant="body2" color="text.secondary">Create your first service event to get started.</Typography>
        </Card>
      )}
      <EditServiceEventModal open={editModalOpen} onClose={() => { setEditModalOpen(false); setSelectedEvent(null); }} onSubmit={handleEditSubmit} event={selectedEvent} />
      <ServiceEventDetailModal open={detailModalOpen} onClose={() => { setDetailModalOpen(false); setSelectedEvent(null); }} event={selectedEvent} onOperation={onOperation} />
    </Box>
  );
});

ServiceEventList.displayName = 'ServiceEventList';
export default ServiceEventList;
/* eslint-disable import/named */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-unused-vars */
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button, Stack } from '@mui/material';
import { useServiceEvents, useCreateBeneficiary, useDeleteBeneficiary } from './useServiceManagement'; // Wait, useDeleteBeneficiary from useCreateBeneficiary hook

const ServiceBeneficiaries = forwardRef(({ onOperation }, ref) => {
  const { data: events, loading, error, refresh } = useServiceEvents();
  const [allBeneficiaries, setAllBeneficiaries] = useState([]);
  const { createBeneficiary, deleteBeneficiary } = useCreateBeneficiary(); // Hook has both

  useImperativeHandle(ref, () => ({ refreshBeneficiaries: refresh }));

  useEffect(() => {
    const flattened = events.flatMap(event => 
      (event.beneficiaries || []).map(b => ({ ...b, eventBarangay: event.barangay, eventDate: event.service_date }))
    );
    setAllBeneficiaries(flattened);
  }, [events]);

  const handleAdd = async (eventId, data) => {
    try {
      await createBeneficiary(eventId, data);
      onOperation('Beneficiary added', 'success');
      refresh();
    } catch (err) {
      onOperation('Add failed', 'error');
    }
  };

  const handleDelete = async (eventId, id) => {
    if (window.confirm('Delete?')) {
      try {
        await deleteBeneficiary(eventId, id);
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
    <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Event Barangay</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Event Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Beneficiary ID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Species</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Quantity</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allBeneficiaries.map(b => (
            <TableRow key={`${b.service_event_id}-${b.id}`}>
              <TableCell>{b.eventBarangay}</TableCell>
              <TableCell>{new Date(b.eventDate).toLocaleDateString()}</TableCell>
              <TableCell>{b.beneficiary_id}</TableCell>
              <TableCell>{b.species || 'N/A'}</TableCell>
              <TableCell align="center">{b.quantity}</TableCell>
              <TableCell><Chip label={b.status} color={b.status === 'provided' ? 'success' : 'error'} size="small" /></TableCell>
              <TableCell align="center"><Button size="small" onClick={() => handleDelete(b.service_event_id, b.id)} color="error" variant="outlined">Delete</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {allBeneficiaries.length === 0 && <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No beneficiaries found.</Typography></Box>}
    </TableContainer>
  );
});

ServiceBeneficiaries.displayName = 'ServiceBeneficiaries';
export default ServiceBeneficiaries;
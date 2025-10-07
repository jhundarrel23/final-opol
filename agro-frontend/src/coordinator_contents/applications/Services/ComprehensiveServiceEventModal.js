/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable react/jsx-no-duplicate-props */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Box, Typography, CircularProgress, Alert, Stack, Stepper, Step, StepLabel, Chip, Divider, Autocomplete, Card, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, InputAdornment
} from '@mui/material';
import { Calendar, MapPin, Package, Users, Plus, Save, X, Trash2, User, Boxes, AlertTriangle } from 'lucide-react';
import { useCreateServiceEvent, useServiceCatalogs, useBeneficiaries, useInventoryStocks, useCreateBeneficiary, useCreateServiceEventStock } from './useServiceManagement';

const ComprehensiveServiceEventModal = ({ open, onClose, onSubmit }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [eventData, setEventData] = useState({ service_catalog_id: '', barangay: '', service_date: new Date().toISOString().split('T')[0], remarks: '' });
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState([]);
  const [errors, setErrors] = useState({});
  const [beneficiaryForm, setBeneficiaryForm] = useState({ selectedBeneficiary: null, quantity: 1, species: '' });
  const [inventoryForm, setInventoryForm] = useState({ selectedItem: null, quantityUsed: 1, remarks: '' });

  const { data: catalogs, loading: catalogsLoading } = useServiceCatalogs();
  const { data: beneficiaries, loading: beneficiariesLoading } = useBeneficiaries();
  const { data: inventoryStocks, loading: inventoryLoading } = useInventoryStocks();
  const { createEvent, loading: creatingEvent, error: eventError } = useCreateServiceEvent();
  const { createBeneficiary } = useCreateBeneficiary();
  const { createStock } = useCreateServiceEventStock();

  const steps = [
    { label: 'Service Details', description: 'Choose type, location, date', required: true },
    { label: 'Beneficiaries', description: 'Select farmers', required: false },
    { label: 'Inventory', description: 'Link items', required: false },
    { label: 'Review', description: 'Confirm and create', required: true }
  ];

  const resetForm = useCallback(() => {
    setActiveStep(0);
    setCompletedSteps(new Set());
    setEventData({ service_catalog_id: '', barangay: '', service_date: new Date().toISOString().split('T')[0], remarks: '' });
    setSelectedBeneficiaries([]);
    setSelectedInventory([]);
    setErrors({});
    setBeneficiaryForm({ selectedBeneficiary: null, quantity: 1, species: '' });
    setInventoryForm({ selectedItem: null, quantityUsed: 1, remarks: '' });
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!eventData.service_catalog_id) newErrors.service_catalog_id = 'Required';
      if (!eventData.barangay.trim()) newErrors.barangay = 'Required';
      if (!eventData.service_date) newErrors.service_date = 'Required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep(0)) return;
    setCompletedSteps(prev => new Set([...prev, activeStep]));
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const handleEventDataChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddBeneficiary = () => {
    if (beneficiaryForm.selectedBeneficiary) {
      const newBen = { ...beneficiaryForm.selectedBeneficiary, quantity: beneficiaryForm.quantity, species: beneficiaryForm.species, tempId: Date.now() + Math.random() };
      setSelectedBeneficiaries(prev => [...prev, newBen]);
      setBeneficiaryForm({ selectedBeneficiary: null, quantity: 1, species: '' });
    }
  };

  const handleRemoveBeneficiary = (tempId) => setSelectedBeneficiaries(prev => prev.filter(b => b.tempId !== tempId));

  const handleAddInventory = () => {
    if (inventoryForm.selectedItem && inventoryForm.quantityUsed <= (inventoryForm.selectedItem.quantity_available || 0)) {
      const newInv = { ...inventoryForm.selectedItem, quantity_used: inventoryForm.quantityUsed, remarks: inventoryForm.remarks, tempId: Date.now() + Math.random() };
      setSelectedInventory(prev => [...prev, newInv]);
      setInventoryForm({ selectedItem: null, quantityUsed: 1, remarks: '' });
    }
  };

  const handleRemoveInventory = (tempId) => setSelectedInventory(prev => prev.filter(i => i.tempId !== tempId));

  const handleSubmit = async () => {
    try {
      const createdEvent = await createEvent(eventData);
      for (const ben of selectedBeneficiaries) {
        await createBeneficiary(createdEvent.id, { beneficiary_id: ben.id, species: ben.species, quantity: ben.quantity, remarks: '' });
      }
      for (const inv of selectedInventory) {
        await createStock(createdEvent.id, { inventory_stock_id: inv.id, quantity_used: inv.quantity_used, remarks: inv.remarks });
      }
      onSubmit({ ...createdEvent, beneficiariesCount: selectedBeneficiaries.length, inventoryCount: selectedInventory.length });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  // Safe data
  const safeCatalogs = (catalogs || []).filter(c => c.is_active).sort((a, b) => a.name.localeCompare(b.name));
  const safeBeneficiaries = beneficiaries || [];
  const safeInventory = inventoryStocks || [];
  const availableInventory = safeInventory.filter(i => (i.quantity_available || 0) > 0 && !selectedInventory.some(s => s.id === i.id));
  const selectedCatalog = catalogs?.find(c => c.id === parseInt(eventData.service_catalog_id));

  const formatCurrency = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

  const getBeneficiaryName = (b) => b?.name || b?.full_name || `${b?.firstName || ''} ${b?.lastName || ''}`.trim() || `Beneficiary #${b?.id || 'unknown'}`;

  const totalCost = selectedInventory.reduce((sum, i) => sum + ((i.quantity_used || 0) * (i.unit_cost || 0)), 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%)', minHeight: '85vh' } }}>
      <DialogTitle sx={{ pb: 2, background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)', color: 'white' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Package size={28} />
            <Box>
              <Typography variant="h5" fontWeight={700}>Create Service Event</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Complete workflow with beneficiaries and inventory</Typography>
            </Box>
          </Stack>
          <Button onClick={onClose} sx={{ color: 'white', minWidth: 'auto', p: 1 }}><X size={24} /></Button>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: '70vh', overflow: 'hidden' }}>
        {eventError && <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{eventError}</Alert>}
        <Box sx={{ display: 'flex', height: '100%' }}>
          <Box sx={{ width: 300, bgcolor: '#f8fdf9', borderRight: '1px solid #e0e0e0', p: 3, overflowY: 'auto' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom color="#2d5016">Progress</Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} completed={completedSteps.has(index)}>
                  <StepLabel onClick={() => (index === 0 || completedSteps.has(0)) && setActiveStep(index)} sx={{ cursor: index === 0 || completedSteps.has(0) ? 'pointer' : 'default' }}>
                    <Typography variant="body2" fontWeight={activeStep === index ? 700 : 500}>
                      {step.label} {step.required && <span style={{ color: '#f44336' }}> *</span>}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{step.description}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'white', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Summary</Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">Service:</Typography>
                  <Typography variant="caption" fontWeight={600}>{selectedCatalog?.name || 'Not selected'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">Beneficiaries:</Typography>
                  <Typography variant="caption" fontWeight={600}>{selectedBeneficiaries.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">Inventory:</Typography>
                  <Typography variant="caption" fontWeight={600}>{selectedInventory.length}</Typography>
                </Stack>
                {totalCost > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption">Est. Cost:</Typography>
                    <Typography variant="caption" fontWeight={600} color="#f57c00">{formatCurrency(totalCost)}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600} color="#2d5016">Service Details</Typography>
                <FormControl fullWidth error={!!errors.service_catalog_id}>
                  <InputLabel>Service Type *</InputLabel>
                  <Select name="service_catalog_id" value={eventData.service_catalog_id} label="Service Type *" onChange={handleEventDataChange} disabled={catalogsLoading} sx={{ borderRadius: 2 }}>
                    {catalogsLoading ? (
                      <MenuItem disabled><Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={20} /><Typography>Loading...</Typography></Stack></MenuItem>
                    ) : safeCatalogs.length > 0 ? (
                      safeCatalogs.map(catalog => (
                        <MenuItem key={catalog.id} value={catalog.id}>
                          <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Package size={16} />
                              <Typography variant="body2" fontWeight={600}>{catalog.name}</Typography>
                              {catalog.unit && <Chip label={catalog.unit} size="small" />}
                            </Stack>
                            {catalog.description && <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>{catalog.description}</Typography>}
                          </Stack>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No catalogs available</MenuItem>
                    )}
                  </Select>
                  {errors.service_catalog_id && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>{errors.service_catalog_id}</Typography>}
                </FormControl>
                <TextField fullWidth label="Barangay *" name="barangay" value={eventData.barangay} onChange={handleEventDataChange} error={!!errors.barangay} helperText={errors.barangay || 'Target barangay'} InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField fullWidth label="Service Date *" name="service_date" type="date" value={eventData.service_date} onChange={handleEventDataChange} error={!!errors.service_date} helperText={errors.service_date || 'Scheduled date'} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><Calendar size={18} /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField fullWidth label="Remarks" name="remarks" value={eventData.remarks} onChange={handleEventDataChange} multiline rows={3} helperText="Optional notes" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                {selectedCatalog && (
                  <Card sx={{ p: 2, bgcolor: '#e8f5e9', border: '1px solid #4a7c59' }}>
                    <Typography variant="subtitle2" color="#2d5016" fontWeight={600} gutterBottom>Preview</Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Package size={20} color="#4a7c59" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>{selectedCatalog.name}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          {selectedCatalog.unit && <Chip label={selectedCatalog.unit} size="small" />}
                          {selectedCatalog.sector && <Typography variant="caption" color="text.secondary">{selectedCatalog.sector.sector_name} Sector</Typography>}
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                )}
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600} color="#2d5016">Add Beneficiaries ({selectedBeneficiaries.length})</Typography>
                <Card sx={{ p: 2, bgcolor: '#e3f2fd', border: '1px solid #1976d2' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Add to Event</Typography>
                  <Stack direction="row" spacing={2} alignItems="end">
                    <Autocomplete
                      options={safeBeneficiaries}
                      getOptionLabel={getBeneficiaryName}
                      loading={beneficiariesLoading}
                      value={beneficiaryForm.selectedBeneficiary}
                      onChange={(e, newValue) => setBeneficiaryForm(prev => ({ ...prev, selectedBeneficiary: newValue }))}
                      sx={{ flex: 1 }}
                      renderInput={(params) => <TextField {...params} label="Select Beneficiary" InputProps={{ ...params.InputProps, startAdornment: <User size={18} style={{ marginRight: 8 }} /> }} />}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight={600}>{getBeneficiaryName(option)}</Typography>
                            <Typography variant="caption" color="text.secondary">ID: {option.id} {option.barangay && `• ${option.barangay}`}</Typography>
                          </Stack>
                        </Box>
                      )}
                    />
                    <TextField label="Quantity" type="number" value={beneficiaryForm.quantity} onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} inputProps={{ min: 1 }} sx={{ width: 100 }} />
                    <TextField label="Species" value={beneficiaryForm.species} onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, species: e.target.value }))} sx={{ width: 150 }} helperText="Optional" />
                    <Button variant="contained" onClick={handleAddBeneficiary} disabled={!beneficiaryForm.selectedBeneficiary} startIcon={<Plus size={16} />}>Add</Button>
                  </Stack>
                </Card>
                {selectedBeneficiaries.length > 0 && (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow><TableCell sx={{ fontWeight: 600 }}>Beneficiary</TableCell><TableCell sx={{ fontWeight: 600 }}>Species</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Quantity</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedBeneficiaries.map(b => (
                          <TableRow key={b.tempId}>
                            <TableCell><Stack direction="row" alignItems="center" spacing={1}><User size={16} /><Typography variant="body2" fontWeight={600}>{getBeneficiaryName(b)}</Typography></Stack></TableCell>
                            <TableCell><Typography variant="body2">{b.species || 'N/A'}</Typography></TableCell>
                            <TableCell align="center"><Typography variant="body2" fontWeight={600}>{b.quantity}</Typography></TableCell>
                            <TableCell align="center"><Tooltip title="Remove"><IconButton size="small" onClick={() => handleRemoveBeneficiary(b.tempId)} sx={{ color: '#d32f2f' }}><Trash2 size={16} /></IconButton></Tooltip></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {selectedBeneficiaries.length === 0 && <Alert severity="info" sx={{ borderRadius: 2 }}>No beneficiaries yet. Add or skip.</Alert>}
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600} color="#2d5016">Link Inventory ({selectedInventory.length})</Typography>
                <Card sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Add Item</Typography>
                  <Stack spacing={2}>
                    <Autocomplete
                      options={availableInventory}
                      getOptionLabel={(option) => `${option.item_name} (${option.quantity_available} ${option.unit} avail)`}
                      loading={inventoryLoading}
                      value={inventoryForm.selectedItem}
                      onChange={(e, newValue) => setInventoryForm(prev => ({ ...prev, selectedItem: newValue }))}
                      renderInput={(params) => <TextField {...params} label="Select Item" InputProps={{ ...params.InputProps, startAdornment: <Boxes size={18} style={{ marginRight: 8 }} /> }} />}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight={600}>{option.item_name}</Typography>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="caption" color="text.secondary">Avail: {option.quantity_available} {option.unit}</Typography>
                              <Typography variant="caption" color="text.secondary">Cost: {formatCurrency(option.unit_cost)}/{option.unit}</Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      )}
                    />
                    <Stack direction="row" spacing={2} alignItems="end">
                      <TextField label="Quantity Used" type="number" value={inventoryForm.quantityUsed} onChange={(e) => setInventoryForm(prev => ({ ...prev, quantityUsed: parseFloat(e.target.value) || 1 }))} inputProps={{ min: 0.01, step: 0.01, max: inventoryForm.selectedItem?.quantity_available || 999 }} sx={{ width: 150 }} helperText={inventoryForm.selectedItem ? `Max: ${inventoryForm.selectedItem.quantity_available}` : ''} InputProps={{ endAdornment: inventoryForm.selectedItem && <InputAdornment position="end">{inventoryForm.selectedItem.unit}</InputAdornment> }} />
                      <TextField label="Remarks" value={inventoryForm.remarks} onChange={(e) => setInventoryForm(prev => ({ ...prev, remarks: e.target.value }))} sx={{ flex: 1 }} helperText="Optional" />
                      <Button variant="contained" onClick={handleAddInventory} disabled={!inventoryForm.selectedItem || inventoryForm.quantityUsed > (inventoryForm.selectedItem?.quantity_available || 0)} startIcon={<Plus size={16} />}>Add</Button>
                    </Stack>
                    {inventoryForm.selectedItem && inventoryForm.quantityUsed > (inventoryForm.selectedItem.quantity_available || 0) && (
                      <Alert severity="error" sx={{ borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}><AlertTriangle size={20} /><Typography variant="body2">Insufficient! Max: {inventoryForm.selectedItem.quantity_available} {inventoryForm.selectedItem.unit}</Typography></Stack>
                      </Alert>
                    )}
                    {inventoryForm.selectedItem && (
                      <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{inventoryForm.quantityUsed} × {formatCurrency(inventoryForm.selectedItem.unit_cost)}</Typography>
                          <Typography variant="body1" fontWeight={600} color="#ff9800">{formatCurrency(inventoryForm.quantityUsed * (inventoryForm.selectedItem.unit_cost || 0))}</Typography>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Card>
                {selectedInventory.length > 0 && (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow><TableCell sx={{ fontWeight: 600 }}>Item</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Qty Used</TableCell><TableCell sx={{ fontWeight: 600 }} align="right">Unit Cost</TableCell><TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell><TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell><TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell></TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInventory.map(i => (
                          <TableRow key={i.tempId}>
                            <TableCell><Stack direction="row" alignItems="center" spacing={1}><Boxes size={16} /><Typography variant="body2" fontWeight={600}>{i.item_name}</Typography></Stack></TableCell>
                            <TableCell align="center"><Typography variant="body2" fontWeight={600}>{i.quantity_used} {i.unit}</Typography></TableCell>
                            <TableCell align="right">{formatCurrency(i.unit_cost)}</TableCell>
                            <TableCell align="right"><Typography variant="body2" fontWeight={600} color="#ff9800">{formatCurrency((i.quantity_used || 0) * (i.unit_cost || 0))}</Typography></TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{i.remarks || 'N/A'}</Typography></TableCell>
                            <TableCell align="center"><Tooltip title="Remove"><IconButton size="small" onClick={() => handleRemoveInventory(i.tempId)} sx={{ color: '#d32f2f' }}><Trash2 size={16} /></IconButton></Tooltip></TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ bgcolor: '#fff3e0' }}>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>Total Cost:</TableCell>
                          <TableCell align="right"><Typography variant="h6" fontWeight={700} color="#ff9800">{formatCurrency(totalCost)}</Typography></TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {selectedInventory.length === 0 && <Alert severity="info" sx={{ borderRadius: 2 }}>No inventory yet. Add or skip.</Alert>}
              </Stack>
            )}

            {activeStep === 3 && (
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={600} color="#2d5016">Review & Create</Typography>
                <Card sx={{ p: 3, bgcolor: '#e8f5e9', border: '2px solid #4a7c59' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="#2d5016">Details</Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Service:</Typography>
                      <Stack direction="row" alignItems="center" spacing={1}><Typography variant="body1" fontWeight={600}>{selectedCatalog?.name}</Typography>{selectedCatalog?.unit && <Chip label={selectedCatalog.unit} size="small" />}</Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Location:</Typography><Typography variant="body1" fontWeight={600}>{eventData.barangay}</Typography></Stack>
                    <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Date:</Typography><Typography variant="body1" fontWeight={600}>{new Date(eventData.service_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography></Stack>
                    {eventData.remarks && <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">Remarks:</Typography><Typography variant="body2" fontWeight={600} sx={{ maxWidth: 300, textAlign: 'right' }}>{eventData.remarks}</Typography></Stack>}
                  </Stack>
                </Card>
                <Card sx={{ p: 3, bgcolor: '#e3f2fd', border: '2px solid #1976d2' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="#1976d2">Beneficiaries ({selectedBeneficiaries.length})</Typography>
                  {selectedBeneficiaries.length > 0 ? (
                    <Stack spacing={1}>
                      {selectedBeneficiaries.map((b, i) => (
                        <Stack key={b.tempId} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{i + 1}. {getBeneficiaryName(b)}</Typography>
                          <Typography variant="body2" fontWeight={600}>{b.quantity} {b.species && `(${b.species})`}</Typography>
                        </Stack>
                      ))}
                      <Divider />
                      <Stack direction="row" justifyContent="space-between"><Typography variant="body1" fontWeight={700}>Total:</Typography><Typography variant="body1" fontWeight={700} color="#1976d2">{selectedBeneficiaries.length}</Typography></Stack>
                    </Stack>
                  ) : <Typography variant="body2" color="text.secondary">None added - add later</Typography>}
                </Card>
                <Card sx={{ p: 3, bgcolor: '#fff3e0', border: '2px solid #ff9800' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="#f57c00">Inventory ({selectedInventory.length})</Typography>
                  {selectedInventory.length > 0 ? (
                    <Stack spacing={1}>
                      {selectedInventory.map((i, idx) => (
                        <Stack key={i.tempId} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{idx + 1}. {i.item_name}</Typography>
                          <Typography variant="body2" fontWeight={600}>{i.quantity_used} {i.unit} - {formatCurrency((i.quantity_used || 0) * (i.unit_cost || 0))}</Typography>
                        </Stack>
                      ))}
                      <Divider />
                      <Stack direction="row" justifyContent="space-between"><Typography variant="body1" fontWeight={700}>Total Cost:</Typography><Typography variant="body1" fontWeight={700} color="#f57c00">{formatCurrency(totalCost)}</Typography></Stack>
                    </Stack>
                  ) : <Typography variant="body2" color="text.secondary">None linked - add later</Typography>}
                </Card>
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>Ready to create!</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Adds {selectedBeneficiaries.length} beneficiaries and {selectedInventory.length} items.</Typography>
                </Alert>
                <Button onClick={resetForm} variant="outlined" startIcon={<X size={16} />} sx={{ color: '#d32f2f', borderColor: '#d32f2f', alignSelf: 'flex-start' }}>Reset</Button>
              </Stack>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, bgcolor: '#f8fdf9' }}>
        <Button onClick={handleBack} disabled={activeStep === 0} sx={{ color: 'text.secondary' }}>Back</Button>
        <Box sx={{ flex: 1 }} />
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={activeStep === 0 && !validateStep(0)} sx={{ px: 3, background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)', '&:hover': { background: 'linear-gradient(135deg, #1a3409 0%, #2d5016 100%)' } }}>
            {activeStep === 0 ? 'Next: Beneficiaries' : 'Next'}
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="contained" disabled={creatingEvent || !completedSteps.has(0)} startIcon={creatingEvent ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <Save size={18} />} sx={{ px: 4, background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 100%)', '&:hover': { background: 'linear-gradient(135deg, #1a3409 0%, #2d5016 100%)' } }}>
            {creatingEvent ? 'Creating...' : 'Create Event'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ComprehensiveServiceEventModal;
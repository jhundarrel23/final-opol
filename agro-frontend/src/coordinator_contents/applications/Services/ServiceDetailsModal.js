import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  TextField,
  CircularProgress,
  Alert,
  Card
} from '@mui/material';
import {
  X,
  Calendar,
  MapPin,
  Package,
  Users,
  Boxes,
  FileText,
  Plus,
  Trash2,
  User,
  Edit3
} from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';

const ServiceDetailsModal = ({ 
  open, 
  onClose, 
  event, 
  onComplete, 
  onRefresh,
  isHistoryView,
  onOperation 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Add beneficiary form
  const [addBeneficiaryOpen, setAddBeneficiaryOpen] = useState(false);
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    beneficiary_id: '',
    species: '',
    quantity: 1,
    remarks: ''
  });

  // Add inventory form
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    inventory_stock_id: '',
    quantity_used: 1,
    remarks: ''
  });

  useEffect(() => {
    if (open && event) {
      fetchEventDetails();
      setEditData({
        barangay: event.barangay,
        service_date: event.service_date,
        remarks: event.remarks,
        status: event.status
      });
    }
  }, [open, event]);

  const fetchEventDetails = async () => {
    if (!event?.id) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/service-events/${event.id}`);
      setEventDetails(response.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      onOperation?.('Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditData({
      barangay: event.barangay,
      service_date: event.service_date,
      remarks: event.remarks,
      status: event.status
    });
  };

  const handleSaveEdit = async () => {
    try {
      await axiosInstance.put(`/api/service-events/${event.id}`, editData);
      onOperation?.('Event updated successfully', 'success');
      setEditMode(false);
      onRefresh?.();
      fetchEventDetails();
    } catch (error) {
      console.error('Error updating event:', error);
      onOperation?.(error.response?.data?.message || 'Failed to update event', 'error');
    }
  };

  const handleAddBeneficiary = async () => {
    try {
      await axiosInstance.post(
        `/api/service-events/${event.id}/beneficiaries`,
        beneficiaryForm
      );
      onOperation?.('Beneficiary added successfully', 'success');
      setAddBeneficiaryOpen(false);
      setBeneficiaryForm({
        beneficiary_id: '',
        species: '',
        quantity: 1,
        remarks: ''
      });
      fetchEventDetails();
      onRefresh?.();
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      onOperation?.(error.response?.data?.message || 'Failed to add beneficiary', 'error');
    }
  };

  const handleRemoveBeneficiary = async (beneficiaryId) => {
    if (!window.confirm('Remove this beneficiary from the event?')) return;

    try {
      await axiosInstance.delete(
        `/api/service-events/${event.id}/beneficiaries/${beneficiaryId}`
      );
      onOperation?.('Beneficiary removed successfully', 'success');
      fetchEventDetails();
      onRefresh?.();
    } catch (error) {
      console.error('Error removing beneficiary:', error);
      onOperation?.(error.response?.data?.message || 'Failed to remove beneficiary', 'error');
    }
  };

  const handleAddInventory = async () => {
    try {
      await axiosInstance.post(
        `/api/service-events/${event.id}/stocks`,
        inventoryForm
      );
      onOperation?.('Inventory item added successfully', 'success');
      setAddInventoryOpen(false);
      setInventoryForm({
        inventory_stock_id: '',
        quantity_used: 1,
        remarks: ''
      });
      fetchEventDetails();
      onRefresh?.();
    } catch (error) {
      console.error('Error adding inventory:', error);
      onOperation?.(error.response?.data?.message || 'Failed to add inventory', 'error');
    }
  };

  const handleRemoveInventory = async (stockId) => {
    if (!window.confirm('Remove this inventory item from the event?')) return;

    try {
      await axiosInstance.delete(
        `/api/service-events/${event.id}/stocks/${stockId}`
      );
      onOperation?.('Inventory item removed successfully', 'success');
      fetchEventDetails();
      onRefresh?.();
    } catch (error) {
      console.error('Error removing inventory:', error);
      onOperation?.(error.response?.data?.message || 'Failed to remove inventory', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'success';
      case 'ongoing':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!event) return null;

  const displayEvent = eventDetails || event;
  const canEdit = !isHistoryView && displayEvent.status !== 'completed';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#2d5016', color: 'white', py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Package size={24} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {displayEvent.catalog?.name || 'Service Event'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {displayEvent.barangay} • {formatDate(displayEvent.service_date)}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={displayEvent.status || 'pending'} 
              size="small"
              color={getStatusColor(displayEvent.status)}
              sx={{ color: 'white' }}
            />
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <X size={20} />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Details" icon={<FileText size={16} />} iconPosition="start" />
                <Tab 
                  label={`Beneficiaries (${displayEvent.beneficiaries?.length || 0})`} 
                  icon={<Users size={16} />} 
                  iconPosition="start" 
                />
                <Tab 
                  label={`Inventory (${displayEvent.stocks?.length || 0})`} 
                  icon={<Boxes size={16} />} 
                  iconPosition="start" 
                />
              </Tabs>
            </Box>

            <Box p={3}>
              {/* Details Tab */}
              {activeTab === 0 && (
                <Stack spacing={3}>
                  <Card sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6" fontWeight={600}>
                        Event Information
                      </Typography>
                      {canEdit && !editMode && (
                        <Button
                          startIcon={<Edit3 size={16} />}
                          onClick={handleEdit}
                          size="small"
                        >
                          Edit
                        </Button>
                      )}
                    </Stack>
                    
                    {editMode ? (
                      <Stack spacing={2}>
                        <TextField
                          label="Barangay"
                          value={editData.barangay}
                          onChange={(e) => setEditData({...editData, barangay: e.target.value})}
                          fullWidth
                        />
                        <TextField
                          label="Service Date"
                          type="date"
                          value={editData.service_date?.split('T')[0]}
                          onChange={(e) => setEditData({...editData, service_date: e.target.value})}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Status"
                          select
                          value={editData.status}
                          onChange={(e) => setEditData({...editData, status: e.target.value})}
                          fullWidth
                          SelectProps={{ native: true }}
                        >
                          <option value="pending">Pending</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </TextField>
                        <TextField
                          label="Remarks"
                          value={editData.remarks}
                          onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                          multiline
                          rows={3}
                          fullWidth
                        />
                        <Stack direction="row" spacing={2}>
                          <Button variant="contained" onClick={handleSaveEdit}>
                            Save Changes
                          </Button>
                          <Button variant="outlined" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <Package size={20} />
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Service Type
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {displayEvent.catalog?.name}
                            </Typography>
                            {displayEvent.catalog?.description && (
                              <Typography variant="body2" color="text.secondary">
                                {displayEvent.catalog.description}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                        
                        <Divider />
                        
                        <Stack direction="row" spacing={2}>
                          <MapPin size={20} />
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {displayEvent.barangay}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Divider />
                        
                        <Stack direction="row" spacing={2}>
                          <Calendar size={20} />
                          <Box flex={1}>
                            <Typography variant="caption" color="text.secondary">
                              Service Date
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {formatDate(displayEvent.service_date)}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        {displayEvent.coordinator && (
                          <>
                            <Divider />
                            <Stack direction="row" spacing={2}>
                              <User size={20} />
                              <Box flex={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Coordinator
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {displayEvent.coordinator.name}
                                </Typography>
                              </Box>
                            </Stack>
                          </>
                        )}
                        
                        {displayEvent.remarks && (
                          <>
                            <Divider />
                            <Stack direction="row" spacing={2}>
                              <FileText size={20} />
                              <Box flex={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Remarks
                                </Typography>
                                <Typography variant="body1">
                                  {displayEvent.remarks}
                                </Typography>
                              </Box>
                            </Stack>
                          </>
                        )}
                      </Stack>
                    )}
                  </Card>

                  {displayEvent.catalog?.sector && (
                    <Card sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                      <Typography variant="body2" color="text.secondary">
                        Sector: <strong>{displayEvent.catalog.sector.sector_name}</strong>
                      </Typography>
                    </Card>
                  )}
                </Stack>
              )}

              {/* Beneficiaries Tab */}
              {activeTab === 1 && (
                <Stack spacing={2}>
                  {canEdit && (
                    <Box>
                      {!addBeneficiaryOpen ? (
                        <Button
                          startIcon={<Plus size={16} />}
                          onClick={() => setAddBeneficiaryOpen(true)}
                          variant="outlined"
                        >
                          Add Beneficiary
                        </Button>
                      ) : (
                        <Card sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                          <Typography variant="subtitle2" fontWeight={600} mb={2}>
                            Add Beneficiary
                          </Typography>
                          <Stack spacing={2}>
                            <TextField
                              label="Beneficiary ID"
                              type="number"
                              value={beneficiaryForm.beneficiary_id}
                              onChange={(e) => setBeneficiaryForm({...beneficiaryForm, beneficiary_id: e.target.value})}
                              size="small"
                              helperText="Enter the beneficiary's database ID"
                            />
                            <TextField
                              label="Species (optional)"
                              value={beneficiaryForm.species}
                              onChange={(e) => setBeneficiaryForm({...beneficiaryForm, species: e.target.value})}
                              size="small"
                            />
                            <TextField
                              label="Quantity"
                              type="number"
                              value={beneficiaryForm.quantity}
                              onChange={(e) => setBeneficiaryForm({...beneficiaryForm, quantity: parseInt(e.target.value) || 1})}
                              size="small"
                              inputProps={{ min: 1 }}
                            />
                            <TextField
                              label="Remarks (optional)"
                              value={beneficiaryForm.remarks}
                              onChange={(e) => setBeneficiaryForm({...beneficiaryForm, remarks: e.target.value})}
                              size="small"
                              multiline
                              rows={2}
                            />
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="contained"
                                onClick={handleAddBeneficiary}
                                disabled={!beneficiaryForm.beneficiary_id}
                              >
                                Add
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setAddBeneficiaryOpen(false);
                                  setBeneficiaryForm({
                                    beneficiary_id: '',
                                    species: '',
                                    quantity: 1,
                                    remarks: ''
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        </Card>
                      )}
                    </Box>
                  )}

                  {displayEvent.beneficiaries && displayEvent.beneficiaries.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Beneficiary ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Species</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Quantity</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                            {canEdit && (
                              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayEvent.beneficiaries.map((ben) => (
                            <TableRow key={ben.id} hover>
                              <TableCell>{ben.beneficiary_id}</TableCell>
                              <TableCell>
                                {ben.beneficiary?.name || ben.beneficiary?.full_name || 'N/A'}
                              </TableCell>
                              <TableCell>{ben.species || 'N/A'}</TableCell>
                              <TableCell align="center">
                                <Chip label={ben.quantity} size="small" />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={ben.status || 'active'} 
                                  size="small"
                                  color={ben.status === 'provided' ? 'success' : 'default'}
                                />
                              </TableCell>
                              <TableCell>{ben.remarks || '-'}</TableCell>
                              {canEdit && (
                                <TableCell align="center">
                                  <Tooltip title="Remove">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveBeneficiary(ben.id)}
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <Trash2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No beneficiaries added to this event yet.
                    </Alert>
                  )}
                </Stack>
              )}

              {/* Inventory Tab */}
              {activeTab === 2 && (
                <Stack spacing={2}>
                  {canEdit && (
                    <Box>
                      {!addInventoryOpen ? (
                        <Button
                          startIcon={<Plus size={16} />}
                          onClick={() => setAddInventoryOpen(true)}
                          variant="outlined"
                        >
                          Add Inventory Item
                        </Button>
                      ) : (
                        <Card sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                          <Typography variant="subtitle2" fontWeight={600} mb={2}>
                            Add Inventory Item
                          </Typography>
                          <Stack spacing={2}>
                            <TextField
                              label="Inventory Stock ID"
                              type="number"
                              value={inventoryForm.inventory_stock_id}
                              onChange={(e) => setInventoryForm({...inventoryForm, inventory_stock_id: e.target.value})}
                              size="small"
                              helperText="Enter the inventory stock ID"
                            />
                            <TextField
                              label="Quantity Used"
                              type="number"
                              value={inventoryForm.quantity_used}
                              onChange={(e) => setInventoryForm({...inventoryForm, quantity_used: parseFloat(e.target.value) || 1})}
                              size="small"
                              inputProps={{ min: 0.01, step: 0.01 }}
                            />
                            <TextField
                              label="Remarks (optional)"
                              value={inventoryForm.remarks}
                              onChange={(e) => setInventoryForm({...inventoryForm, remarks: e.target.value})}
                              size="small"
                              multiline
                              rows={2}
                            />
                            <Stack direction="row" spacing={2}>
                              <Button
                                variant="contained"
                                onClick={handleAddInventory}
                                disabled={!inventoryForm.inventory_stock_id}
                              >
                                Add
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setAddInventoryOpen(false);
                                  setInventoryForm({
                                    inventory_stock_id: '',
                                    quantity_used: 1,
                                    remarks: ''
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        </Card>
                      )}
                    </Box>
                  )}

                  {displayEvent.stocks && displayEvent.stocks.length > 0 ? (
                    <TableContainer component={Paper}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Quantity Used</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                            {canEdit && (
                              <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                            )}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {displayEvent.stocks.map((stock) => (
                            <TableRow key={stock.id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {stock.pivot?.quantity_used ? 
                                    stock.item_name || stock.inventory_stock?.item_name || 'N/A'
                                    : stock.inventory_stock?.item_name || stock.item_name || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={stock.pivot?.quantity_used || stock.quantity_used || 0} 
                                  size="small"
                                  color="primary"
                                />
                              </TableCell>
                              <TableCell>
                                {stock.unit || stock.inventory_stock?.unit || 'units'}
                              </TableCell>
                              <TableCell>
                                {stock.pivot?.remarks || stock.remarks || '-'}
                              </TableCell>
                              {canEdit && (
                                <TableCell align="center">
                                  <Tooltip title="Remove">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveInventory(stock.id)}
                                      sx={{ color: '#d32f2f' }}
                                    >
                                      <Trash2 size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">
                      No inventory items linked to this event yet.
                    </Alert>
                  )}
                </Stack>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose}>Close</Button>
        {canEdit && displayEvent.status !== 'completed' && (
          <Button
            variant="contained"
            onClick={() => onComplete?.(displayEvent)}
            sx={{ bgcolor: '#2e7d32' }}
          >
            Complete Event
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ServiceDetailsModal;

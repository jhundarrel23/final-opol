/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNotifications } from '../../../contexts/NotificationContext';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Backdrop
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
  maxHeight: '80vh',
  overflow: 'auto'
};

function AddBeneficiaryModal({ 
  open, 
  handleClose, 
  coordinatorCommodity,
  onBeneficiariesAdded // callback to refresh parent component
}) {
  const { addNotification } = useNotifications();
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset modal state
  const resetState = () => {
    setSearch('');
    setSelectedIds([]);
    setSelectedCommodityFilter('');
    setEnrollmentList([]);
    setError('');
    setSuccess('');
  };

  const closeAndReset = () => {
    if (adding) return; // prevent closing while adding
    resetState();
    handleClose();
  };

  // Fetch enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.get('/api/rsbsa/coordinator-beneficiaries/enrollments', {
        params: { search: search || undefined }
      });

      const rawList = res.data?.data || [];

      const normalized = rawList.map(e => ({
        enrollment_id: e.enrollment_id,
        user_id: e.user_id,
        name: e.name || 'N/A',
        address: e.address || 'N/A',
        contact_number: e.contact_number || 'N/A',
        rsbsa_number: e.rsbsa_number || 'N/A',
        commodities: Array.isArray(e.commodities) ? e.commodities : []
      }));

      setEnrollmentList(normalized);
    } catch (err) {
      console.error('❌ Error fetching enrollments:', err);
      setError(err.response?.data?.message || 'Failed to fetch beneficiaries. Please try again.');
      setEnrollmentList([]);
    } finally {
      setLoading(false);
    }
  }, [open, search]);

  // Debounced fetch
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      fetchEnrollments();
    }, 500);
    return () => clearTimeout(timeout);
  }, [fetchEnrollments, open]);

  // Toggle select
  const toggleSelect = (enrollmentId) => {
    if (adding) return;
    setSelectedIds(prev =>
      prev.includes(enrollmentId) ? prev.filter(x => x !== enrollmentId) : [...prev, enrollmentId]
    );
  };

  // Add selected beneficiaries
  const addSelectedBeneficiaries = async () => {
    const idsToSend = selectedIds.length > 0
      ? selectedIds
      : filteredEnrollments.map(b => b.enrollment_id);

    if (idsToSend.length === 0) return;

    setAdding(true);
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/api/rsbsa/coordinator-beneficiaries/assign', {
        enrollment_ids: idsToSend
      });

      if (response.data?.success) {
        if (response.data?.data && typeof response.data.data === 'object') {
          const {
            assigned_count = 0,
            already_assigned_count = 0,
            total_requested = 0
          } = response.data.data;

          let successMsg = `Successfully assigned ${assigned_count} beneficiaries!`;
          if (already_assigned_count > 0) {
            successMsg += ` (${already_assigned_count} were already assigned)`;
          }

          setSuccess(successMsg);

          // Add notification for successful beneficiary assignment
          if (assigned_count > 0) {
            addNotification({
              type: 'beneficiary_update',
              title: 'New Beneficiaries Assigned',
              message: `Successfully assigned ${assigned_count} new beneficiaries to your coordinator account`,
              priority: 'medium'
            });
          }

          if (onBeneficiariesAdded) {
            onBeneficiariesAdded({
              assigned_count,
              already_assigned_count,
              total_requested
            });
          }

          if (already_assigned_count === 0) {
            setTimeout(() => {
              closeAndReset();
            }, 2000);
          }
        } else {
          const assignedCount = idsToSend.length;
          setSuccess(`Successfully assigned ${assignedCount} beneficiaries!`);
          
          // Add notification for successful beneficiary assignment
          addNotification({
            type: 'beneficiary_update',
            title: 'New Beneficiaries Assigned',
            message: `Successfully assigned ${assignedCount} new beneficiaries to your coordinator account`,
            priority: 'medium'
          });
          
          if (onBeneficiariesAdded) {
            onBeneficiariesAdded({
              assigned_count: assignedCount,
              already_assigned_count: 0,
              total_requested: assignedCount
            });
          }

          setTimeout(() => {
            closeAndReset();
          }, 2000);
        }

        setSelectedIds([]);
        await fetchEnrollments();
      } else {
        setError(response.data?.message || 'Failed to assign beneficiaries.');
      }
    } catch (err) {
      console.error('Error adding beneficiaries:', err);
      setError(err.response?.data?.message || 'Failed to assign beneficiaries. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // Select/Deselect all filtered
  const toggleSelectAll = (checked) => {
    if (adding) return;
    if (checked) {
      const allFilteredIds = filteredEnrollments.map(b => b.enrollment_id);
      setSelectedIds(prev => [...new Set([...prev, ...allFilteredIds])]);
    } else {
      const filteredIds = filteredEnrollments.map(b => b.enrollment_id);
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  // Unique commodities for filter
  const availableCommodities = [
    ...new Set(
      enrollmentList.flatMap(e => e.commodities.map(c => c.name))
    )
  ];

  // Apply commodity filter
  const filteredEnrollments = selectedCommodityFilter
    ? enrollmentList.filter(e =>
        e.commodities.some(c =>
          c.name.toLowerCase().includes(selectedCommodityFilter.toLowerCase())
        )
      )
    : enrollmentList;

  // Selection states
  const filteredSelectedCount = filteredEnrollments.filter(b => 
    selectedIds.includes(b.enrollment_id)
  ).length;

  const isAllFilteredSelected = filteredEnrollments.length > 0 &&
    filteredSelectedCount === filteredEnrollments.length;

  const isIndeterminate = filteredSelectedCount > 0 &&
    filteredSelectedCount < filteredEnrollments.length;

  return (
    <>
      <Modal open={open} onClose={closeAndReset}>
        <Box sx={style}>
          <Typography variant="h6" gutterBottom>
            Add Beneficiaries
            {coordinatorCommodity && (
              <Typography variant="subtitle2" color="text.secondary">
                Showing beneficiaries with commodities matching your sector
              </Typography>
            )}
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading beneficiaries...</Typography>
            </Box>
          ) : (
            <>
              {/* Search + Filter */}
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  label="Search by name"
                  fullWidth
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Enter beneficiary name..."
                  disabled={adding}
                />
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter by Commodity</InputLabel>
                  <Select
                    value={selectedCommodityFilter}
                    label="Filter by Commodity"
                    onChange={(e) => setSelectedCommodityFilter(e.target.value)}
                    disabled={adding}
                  >
                    <MenuItem value="">All Commodities</MenuItem>
                    {availableCommodities.map(commodity => (
                      <MenuItem key={commodity} value={commodity}>
                        {commodity}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Results Summary */}
              {filteredEnrollments.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Showing {filteredEnrollments.length} of {enrollmentList.length} beneficiaries
                  {selectedCommodityFilter && ` with "${selectedCommodityFilter}"`}
                  {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
                </Typography>
              )}

              {/* Table */}
              {filteredEnrollments.length === 0 ? (
                <Typography sx={{ textAlign: 'center', py: 4 }}>
                  {enrollmentList.length === 0
                    ? "No available beneficiaries found for your sector."
                    : `No beneficiaries found matching "${selectedCommodityFilter}".`}
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={isIndeterminate}
                            checked={isAllFilteredSelected}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                            disabled={adding}
                          />
                        </TableCell>
                        <TableCell>Enrollment ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Contact Number</TableCell>
                        <TableCell>Commodities</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEnrollments.map(b => {
                        const isCoordinatorSpecialty = coordinatorCommodity
                          ? b.commodities.some(c =>
                              c.name.toLowerCase().includes(coordinatorCommodity.toLowerCase())
                            )
                          : true;
                        const isSelected = selectedIds.includes(b.enrollment_id);

                        return (
                          <TableRow
                            key={b.enrollment_id}
                            hover
                            sx={{
                              backgroundColor: isSelected 
                                ? 'action.selected'
                                : isCoordinatorSpecialty 
                                  ? '#e8f5e8' 
                                  : 'inherit',
                              cursor: adding ? 'default' : 'pointer',
                              opacity: adding ? 0.7 : 1
                            }}
                            onClick={() => !adding && toggleSelect(b.enrollment_id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleSelect(b.enrollment_id)}
                                onClick={(e) => e.stopPropagation()}
                                disabled={adding}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: isCoordinatorSpecialty ? 'bold' : 'normal' }}>
                              {b.enrollment_id}
                            </TableCell>
                            <TableCell sx={{ fontWeight: isCoordinatorSpecialty ? 'bold' : 'normal' }}>
                              {b.name}
                            </TableCell>
                            <TableCell>{b.address}</TableCell>
                            <TableCell>{b.contact_number}</TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {b.commodities.length > 0 ? (
                                  b.commodities.map((c, idx) => {
                                    const label = `${c.category}: ${c.name} (${c.parcelArea} ha, ${c.farm_type})`;
                                    const isMatch = coordinatorCommodity 
                                      ? c.name.toLowerCase().includes(coordinatorCommodity.toLowerCase())
                                      : true;
                                    return (
                                      <Chip
                                        key={idx}
                                        label={label}
                                        size="small"
                                        color={isMatch ? "primary" : "default"}
                                        variant={isMatch ? "filled" : "outlined"}
                                      />
                                    );
                                  })
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No commodities
                                  </Typography>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {/* Actions */}
              <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {selectedIds.length > 0
                    ? `${selectedIds.length} beneficiaries selected`
                    : `No manual selection (will assign all filtered)`}
                </Typography>
                
                <Box>
                  <Button 
                    onClick={closeAndReset} 
                    sx={{ mr: 1 }}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={addSelectedBeneficiaries}
                    disabled={filteredEnrollments.length === 0 || adding}
                    startIcon={adding ? <CircularProgress size={20} /> : null}
                  >
                    {adding ? 'Adding...' : `Assign (${selectedIds.length > 0 ? selectedIds.length : filteredEnrollments.length})`}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={adding}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography sx={{ mt: 2 }}>
            Adding {selectedIds.length > 0 ? selectedIds.length : filteredEnrollments.length} beneficiaries...
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
}

export default AddBeneficiaryModal;

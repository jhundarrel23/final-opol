/* eslint-disable no-unused-vars */
/* eslint-disable no-alert */
import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
  Eye,
  X,
  AlertCircle,
  Building2,
  Users,
  User,
  UserCheck
} from 'lucide-react';
import useSectors from './useSectors';
import SectorDetailDialog from './SectorDetailDialog';

function SectorList({ sectorSummary, onRefresh }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedSector, setSelectedSector] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [coordinatorDetails, setCoordinatorDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [formData, setFormData] = useState({
    sector_name: '',
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    sectors,
    loading,
    error,
    fetchSectors,
    getCoordinatorsWithBeneficiaries,
    createSector,
    updateSector,
    deleteSector,
    restoreSector,
    checkName,
  } = useSectors();

  const handleOpenDialog = (mode, sector = null) => {
    setDialogMode(mode);
    setSelectedSector(sector);
    setFormData({
      sector_name: sector ? sector.sector_name : '',
    });
    setFormError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ sector_name: '' });
    setFormError('');
    setSelectedSector(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async () => {
    if (!formData.sector_name.trim()) {
      setFormError('Sector name is required');
      return;
    }

    const { data: checkData } = await checkName(formData.sector_name);
    if (checkData?.exists && dialogMode === 'create') {
      setFormError('Sector name already exists');
      return;
    }

    if (dialogMode === 'edit' && selectedSector) {
      if (checkData?.exists && formData.sector_name.toLowerCase() !== selectedSector.sector_name.toLowerCase()) {
        setFormError('Sector name already exists');
        return;
      }
    }

    if (dialogMode === 'create') {
      const { error } = await createSector(formData);
      if (error) {
        setFormError(error);
      } else {
        setSuccessMessage('Sector created successfully!');
        handleCloseDialog();
        fetchSectors();
        onRefresh();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } else {
      const { error } = await updateSector(selectedSector.id, formData);
      if (error) {
        setFormError(error);
      } else {
        setSuccessMessage('Sector updated successfully!');
        handleCloseDialog();
        fetchSectors();
        onRefresh();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sector? It will be marked as inactive.')) {
      const { error } = await deleteSector(id);
      if (!error) {
        setSuccessMessage('Sector deleted successfully!');
        fetchSectors();
        onRefresh();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleRestore = async (id) => {
    const { error } = await restoreSector(id);
    if (!error) {
      setSuccessMessage('Sector restored successfully!');
      fetchSectors();
      onRefresh();
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleViewDetails = async (sectorId) => {
    setLoadingDetails(true);
    setOpenDetailDialog(true);
    const { data } = await getCoordinatorsWithBeneficiaries(sectorId);
    if (data) {
      setCoordinatorDetails(data);
    }
    setLoadingDetails(false);
  };

  const filteredSectors = sectors.filter((sector) =>
    sector.sector_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSectorSummaryData = (sectorId) => {
    return sectorSummary.find(s => s.id === sectorId) || {
      coordinators_count: 0,
      beneficiaries_count: 0,
      coordinators: []
    };
  };

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1b5e20' }}>
            Sector Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Create, update, and manage all sectors
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpenDialog('create')}
          size="large"
          sx={{
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2e7d32 0%, #1565c0 100%)',
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1b5e20 0%, #0d47a1 100%)',
              boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
            }
          }}
        >
          Add New Sector
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <TextField
          placeholder="Search sectors by name..."
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#2e7d32" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#2e7d32',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1565c0',
              },
            },
          }}
        />
      </Paper>

      {/* Sectors Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <CircularProgress size={50} sx={{ color: '#2e7d32' }} />
        </Box>
      ) : filteredSectors.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
          <AlertCircle size={60} style={{ opacity: 0.3, marginBottom: 16, color: '#2e7d32' }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No sectors found
          </Typography>
          <Typography variant="body2" color="textSecondary" mb={3}>
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first sector'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => handleOpenDialog('create')}
              sx={{
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2e7d32 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20 0%, #0d47a1 100%)',
                }
              }}
            >
              Add New Sector
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredSectors.map((sector) => {
            const summaryData = getSectorSummaryData(sector.id);
            return (
              <Grid item xs={12} sm={6} md={4} key={sector.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(46, 125, 50, 0.2)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: sector.status === 'active' 
                        ? 'linear-gradient(90deg, #2e7d32 0%, #1565c0 100%)'
                        : 'linear-gradient(90deg, #ff9800 0%, #f57c00 100%)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Header with Icon and Status */}
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2.5,
                          background: sector.status === 'active'
                            ? 'linear-gradient(135deg, #2e7d32 0%, #1565c0 100%)'
                            : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: sector.status === 'active'
                            ? '0 4px 12px rgba(46, 125, 50, 0.3)'
                            : '0 4px 12px rgba(255, 152, 0, 0.3)',
                        }}
                      >
                        <Building2 size={28} color="white" />
                      </Box>
                      <Chip
                        label={sector.status}
                        size="small"
                        sx={{
                          textTransform: 'capitalize',
                          fontWeight: 'bold',
                          bgcolor: sector.status === 'active' ? '#e8f5e9' : '#fff3e0',
                          color: sector.status === 'active' ? '#2e7d32' : '#f57c00',
                          border: `1px solid ${sector.status === 'active' ? '#a5d6a7' : '#ffcc80'}`,
                        }}
                      />
                    </Box>

                    {/* Sector Name */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#1a237e', mb: 2 }}>
                      {sector.sector_name}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {/* Coordinators Section */}
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <UserCheck size={18} color="#1565c0" />
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1565c0' }}>
                          Coordinators ({summaryData.coordinators_count})
                        </Typography>
                      </Box>
                      
                      {summaryData.coordinators_count === 0 ? (
                        <Box 
                          sx={{ 
                            p: 2, 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 1.5,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            No coordinators assigned
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ maxHeight: '120px', overflowY: 'auto', pr: 1 }}>
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {/* Display coordinator names from API call */}
                            {[...Array(Math.min(summaryData.coordinators_count, 5))].map((_, idx) => (
                              <Box
                                key={idx}
                                display="flex"
                                alignItems="center"
                                gap={1}
                                sx={{
                                  p: 1,
                                  bgcolor: '#e3f2fd',
                                  borderRadius: 1,
                                  border: '1px solid #bbdefb',
                                }}
                              >
                                <Avatar
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    bgcolor: '#1565c0',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {idx + 1}
                                </Avatar>
                                <Typography variant="caption" sx={{ color: '#0d47a1', fontWeight: 500 }}>
                                  Coordinator {idx + 1}
                                </Typography>
                              </Box>
                            ))}
                            {summaryData.coordinators_count > 5 && (
                              <Typography variant="caption" color="textSecondary" textAlign="center" mt={0.5}>
                                +{summaryData.coordinators_count - 5} more
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>

                    {/* Beneficiaries Count */}
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#e8f5e9',
                        borderRadius: 1.5,
                        border: '1px solid #a5d6a7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Users size={18} color="#2e7d32" />
                        <Typography variant="body2" fontWeight={500} sx={{ color: '#2e7d32' }}>
                          Total Beneficiaries
                        </Typography>
                      </Box>
                      <Chip
                        label={summaryData.beneficiaries_count}
                        size="small"
                        sx={{
                          bgcolor: 'white',
                          color: '#2e7d32',
                          fontWeight: 'bold',
                          border: '1px solid #66bb6a',
                        }}
                      />
                    </Box>

                    {/* Actions */}
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(sector.id)}
                          sx={{
                            flex: 1,
                            bgcolor: '#e3f2fd',
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: '#bbdefb' }
                          }}
                        >
                          <Eye size={18} color="#1565c0" />
                        </IconButton>
                      </Tooltip>

                      {sector.status === 'active' ? (
                        <>
                          <Tooltip title="Edit Sector">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog('edit', sector)}
                              sx={{
                                flex: 1,
                                bgcolor: '#fff3e0',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#ffe0b2' }
                              }}
                            >
                              <Pencil size={18} color="#f57c00" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Sector">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(sector.id)}
                              sx={{
                                flex: 1,
                                bgcolor: '#ffebee',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#ffcdd2' }
                              }}
                            >
                              <Trash2 size={18} color="#d32f2f" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Restore Sector">
                          <IconButton
                            size="small"
                            onClick={() => handleRestore(sector.id)}
                            sx={{
                              flex: 2,
                              bgcolor: '#e8f5e9',
                              borderRadius: 1.5,
                              '&:hover': { bgcolor: '#c8e6c9' }
                            }}
                          >
                            <RotateCcw size={18} color="#2e7d32" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1b5e20' }}>
                {dialogMode === 'create' ? 'Add New Sector' : 'Edit Sector'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dialogMode === 'create' ? 'Create a new sector' : 'Update sector information'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseDialog}>
              <X size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <TextField
            autoFocus
            name="sector_name"
            label="Sector Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.sector_name}
            onChange={handleInputChange}
            error={!!formError}
            placeholder="e.g., Rice, Corn, Vegetables"
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#2e7d32',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#2e7d32',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ textTransform: 'none', px: 3, color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #2e7d32 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1b5e20 0%, #0d47a1 100%)',
              }
            }}
          >
            {dialogMode === 'create' ? 'Create Sector' : 'Update Sector'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <SectorDetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        coordinatorDetails={coordinatorDetails}
        loading={loadingDetails}
      />
    </Box>
  );
}

export default SectorList;
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Alert,
  TextField,
  InputAdornment,
  Card,
  Avatar,
  useTheme,
  alpha,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Checkbox,
  Snackbar,
  CircularProgress,
  Grid,
  Stack,
  Tooltip,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  X,
  AlertTriangle,
  Search,
  XCircle,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Send,
  RefreshCw,
  Download,
  List as ListIcon,
  LayoutGrid,
  DollarSign,
  CheckSquare,
  AlertCircle,
  PieChart,
  BarChart3,
  Award,
  Printer,
  ChevronDown,
  UserCheck,
  UserX,
  TrendingUp,
  Package
} from 'lucide-react';
import useProgramDetailsModal from './useProgramDetailsModal';
import ProgramSummaryReport from './ProgramSummaryReport';
import ProgramDocument from './ProgramDocument';
import { printElementContent } from '../../../utils/printUtils';

const ProgramDetailsModal = ({ open, onClose, program, onComplete, currentView, onRefresh, isHistoryView = false }) => {
  // FIXED: Moved all hooks to the top, before any conditional logic
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('table');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    item: null,
    beneficiary: null,
    confirming: false
  });
  const [completing, setCompleting] = useState(false);
  const [showSummaryReport, setShowSummaryReport] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showProgramDocumentDialog, setShowProgramDocumentDialog] = useState(false);
  const [distributedOverride, setDistributedOverride] = useState(new Set());
  const [unclaimedOverride, setUnclaimedOverride] = useState({});
  const [unclaimDialog, setUnclaimDialog] = useState({ open: false, item: null, reason: '' });
  const [summaryTabValue, setSummaryTabValue] = useState(0);
 
  const {
    loading,
    distributingItems,
    error,
    successMessage,
    completeProgram,
    distributeItem,
    bulkDistributeItems,
    markItemUnclaimed,
    clearMessages,
    validateApprovalStatus
  } = useProgramDetailsModal();

  // FIXED: Early return moved AFTER all hooks
  if (!program) return null;

  // Nature Theme Colors
  const forestGreen = '#2d5016';
  const leafGreen = '#4a7c59';
  const skyBlue = '#5b9aa0';
  const mintGreen = '#a8d5ba';
  const darkForest = '#1a3409';

  const canComplete = program.status === 'ongoing' &&
                     program.approval_status === 'approved'

  const canDistribute = program?.approval_status === 'approved' &&
                       program?.status !== 'completed' &&
                       program?.status !== 'cancelled';

  const isCompleted = program?.status === 'completed';
  const isCancelled = program?.status === 'cancelled';
  const isReadOnly = isCompleted || isCancelled || isHistoryView;

  const handleComplete = async () => {
    if (!canComplete) return;
    setCompleting(true);
    try {
      await completeProgram(program.id, program);
     
      const summary = {
        programTitle: program.title,
        completedDate: new Date().toISOString(),
        totalBeneficiaries: uniqueBeneficiaries,
        servedBeneficiaries: beneficiariesWithDistributedItems,
        totalItems: totalItems,
        distributedItems: distributedItems,
        pendingItems: pendingItems,
        totalValue: totalProgramValue,
        startDate: program.start_date,
        endDate: program.end_date,
        description: program.description,
        distributionRate: totalItems > 0 ? ((distributedItems / totalItems) * 100).toFixed(1) : 0,
        beneficiaryRate: uniqueBeneficiaries > 0 ? ((beneficiariesWithDistributedItems / uniqueBeneficiaries) * 100).toFixed(1) : 0,
        beneficiaryDetails: flattenedBeneficiaryItems.map(entry => ({
          id: entry.id,
          name: getBeneficiaryName(entry.beneficiary),
          rsbsaNumber: getRSBSANumber(entry.beneficiary),
          address: getBeneficiaryAddress(entry.beneficiary),
          items: entry.items.map(item => ({
            ...item,
            status: distributedOverride.has(item.id) ? 'distributed' : 
                   unclaimedOverride[item.id] ? 'unclaimed' : 
                   item.status,
            unclaimedReason: unclaimedOverride[item.id] || item.coordinator_notes
          })),
          totalValue: entry.totalValue,
          distributedItemsCount: entry.items.filter(item => 
            distributedOverride.has(item.id) || item.status === 'distributed'
          ).length,
          unclaimedItemsCount: entry.items.filter(item => 
            unclaimedOverride[item.id] || (item.status !== 'distributed' && !distributedOverride.has(item.id))
          ).length
        }))
      };
     
      setSummaryData(summary);
      setShowSummaryReport(true);
     
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error completing program:', error);
    } finally {
      setCompleting(false);
    }
  };

  const groupedBeneficiaries = program.beneficiaries?.reduce((acc, beneficiary) => {
    // FIXED: Improved RSBSA number extraction logic
    const rsbsaNumber = beneficiary.beneficiary?.system_generated_rsbsa_number ||
                       beneficiary.beneficiary?.manual_rsbsa_number ||
                       beneficiary.beneficiary?.rsbsa_number ||
                       beneficiary.rsbsa_number ||
                       beneficiary.systemGeneratedRsbaNumber ||
                       beneficiary.rsbsaNumber;
   
    const beneficiaryKey = rsbsaNumber ||
                          beneficiary.beneficiary?.user?.id ||
                          beneficiary.beneficiary?.id ||
                          beneficiary.id ||
                          `temp-${Math.random()}`;
   
    if (!acc[beneficiaryKey]) {
      acc[beneficiaryKey] = {
        ...beneficiary,
        items: [],
        rsbsaNumber: rsbsaNumber
      };
    }
   
    if (beneficiary.items && beneficiary.items.length > 0) {
      beneficiary.items.forEach(item => {
        const itemExists = acc[beneficiaryKey].items.some(existingItem =>
          existingItem.id === item.id
        );
       
        if (!itemExists) {
          acc[beneficiaryKey].items.push(item);
        }
      });
    }
   
    return acc;
  }, {}) || {};

  const flattenedBeneficiaryItems = Object.values(groupedBeneficiaries).map(beneficiary => ({
    id: beneficiary.id || `beneficiary-${Math.random()}`,
    beneficiary: beneficiary,
    items: beneficiary.items || [],
    totalValue: (beneficiary.items || []).reduce((sum, item) =>
      sum + (parseFloat(item.total_value) || 0), 0)
  }));

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getBeneficiaryName = (beneficiary) => {
    if (beneficiary.beneficiary?.user) {
      const { fname, lname, mname, extension_name } = beneficiary.beneficiary.user;
      if (fname || lname) {
        return `${fname || ''} ${mname ? mname + ' ' : ''}${lname || ''} ${extension_name || ''}`.trim();
      }
    }
    if (beneficiary.full_name) return beneficiary.full_name;
    if (beneficiary.name) return beneficiary.name;
   
    const firstName = beneficiary.firstName || beneficiary.fname;
    const middleName = beneficiary.middleName || beneficiary.mname;
    const lastName = beneficiary.lastName || beneficiary.lname;
    const extensionName = beneficiary.extension_name;
   
    if (firstName || middleName || lastName) {
      return [firstName, middleName, lastName, extensionName].filter(Boolean).join(' ');
    }
    return 'Unknown Beneficiary';
  };

  // FIXED: Improved RSBSA number extraction
  const getRSBSANumber = (beneficiary) => {
    // Try multiple possible locations for RSBSA number
    const rsbsaNumber = beneficiary.beneficiary?.system_generated_rsbsa_number ||
                       beneficiary.beneficiary?.manual_rsbsa_number ||
                       beneficiary.beneficiary?.rsbsa_number ||
                       beneficiary.rsbsa_number ||
                       beneficiary.rsbsaNumber ||
                       beneficiary.systemGeneratedRsbaNumber ||
                       beneficiary.systemGeneratedRsbsaNumber;
    
    return rsbsaNumber || 'Not Available';
  };

  const getBeneficiaryAddress = (beneficiary) => {
    if (beneficiary.beneficiary?.barangay) {
      return beneficiary.beneficiary.barangay;
    }
    return beneficiary.address ||
           beneficiary.streetPurokBarangay ||
           beneficiary.barangay ||
           '';
  };

  const totalProgramValue = flattenedBeneficiaryItems.reduce((total, entry) => {
    return total + entry.totalValue;
  }, 0);

  const uniqueBeneficiaries = flattenedBeneficiaryItems.length;

  const totalItems = flattenedBeneficiaryItems.reduce((sum, entry) =>
    sum + entry.items.length, 0);

  const distributedItems = flattenedBeneficiaryItems.reduce((sum, entry) =>
    sum + entry.items.filter(item => (distributedOverride.has(item.id) || item.status === 'distributed')).length, 0);

  const pendingItems = totalItems - distributedItems;

  const beneficiariesWithDistributedItems = flattenedBeneficiaryItems.filter(entry =>
    entry.items.some(item => (distributedOverride.has(item.id) || item.status === 'distributed'))
  ).length;

  const filteredBeneficiaryItems = flattenedBeneficiaryItems.filter(entry => {
    if (!searchQuery) return true;
   
    const beneficiaryName = getBeneficiaryName(entry.beneficiary).toLowerCase();
    const rsbsaNumber = getRSBSANumber(entry.beneficiary).toLowerCase();
    const address = getBeneficiaryAddress(entry.beneficiary).toLowerCase();
    const itemNames = entry.items.map(item => item.item_name?.toLowerCase() || '').join(' ');
    const query = searchQuery.toLowerCase();
   
    return beneficiaryName.includes(query) ||
           rsbsaNumber.includes(query) ||
           address.includes(query) ||
           itemNames.includes(query);
  });

  const handleDistributeItem = async (itemId, beneficiaryName, beneficiaryData) => {
    const item = flattenedBeneficiaryItems
      .flatMap(entry => entry.items.map(item => ({ ...item, beneficiary: entry.beneficiary })))
      .find(item => item.id === itemId);
   
    if (!item) return;

    setConfirmDialog({
      open: true,
      item: item,
      beneficiary: beneficiaryData || item.beneficiary,
      confirming: false
    });
  };

  const handleConfirmDistribution = async () => {
    if (!confirmDialog.item) return;
    setConfirmDialog(prev => ({ ...prev, confirming: true }));
   
    try {
      await distributeItem(
        confirmDialog.item.id,
        getBeneficiaryName(confirmDialog.beneficiary),
        program
      );
      setDistributedOverride(prev => new Set(prev).add(confirmDialog.item.id));
      setUnclaimedOverride(prev => {
        const next = { ...prev };
        delete next[confirmDialog.item.id];
        return next;
      });
      if (onRefresh) onRefresh();
      setConfirmDialog({ open: false, item: null, beneficiary: null, confirming: false });
    } catch (error) {
      console.error('Error distributing item:', error);
      setConfirmDialog(prev => ({ ...prev, confirming: false }));
    }
  };

  const handleCancelDistribution = () => {
    setConfirmDialog({ open: false, item: null, beneficiary: null, confirming: false });
  };

  const handleBulkDistribute = async () => {
    if (selectedItems.size === 0) return;
   
    try {
      await bulkDistributeItems(Array.from(selectedItems), program);
      setSelectedItems(new Set());
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error bulk distributing items:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === totalItems) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = flattenedBeneficiaryItems.flatMap(entry =>
        entry.items.filter(item => item.status !== 'distributed').map(item => item.id)
      );
      setSelectedItems(new Set(allItemIds));
    }
  };

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handlePrintSummary = () => {
    if (isCompleted) {
      const summary = {
        programTitle: program.title,
        completedDate: program.updated_at || new Date().toISOString(),
        totalBeneficiaries: uniqueBeneficiaries,
        servedBeneficiaries: beneficiariesWithDistributedItems,
        totalItems: totalItems,
        distributedItems: distributedItems,
        pendingItems: totalItems - distributedItems,
        totalValue: totalProgramValue,
        startDate: program.start_date,
        endDate: program.end_date,
        description: program.description,
        distributionRate: totalItems > 0 ? ((distributedItems / totalItems) * 100).toFixed(1) : 0,
        beneficiaryRate: uniqueBeneficiaries > 0 ? ((beneficiariesWithDistributedItems / uniqueBeneficiaries) * 100).toFixed(1) : 0
      };
      setSummaryData(summary);
      setShowPrintDialog(true);
    } else {
      const summary = {
        programTitle: program.title,
        completedDate: new Date().toISOString(),
        totalBeneficiaries: uniqueBeneficiaries,
        servedBeneficiaries: beneficiariesWithDistributedItems,
        totalItems: totalItems,
        distributedItems: distributedItems,
        pendingItems: totalItems - distributedItems,
        totalValue: totalProgramValue,
        startDate: program.start_date,
        endDate: program.end_date,
        description: program.description,
        distributionRate: totalItems > 0 ? ((distributedItems / totalItems) * 100).toFixed(1) : 0,
        beneficiaryRate: uniqueBeneficiaries > 0 ? ((beneficiariesWithDistributedItems / uniqueBeneficiaries) * 100).toFixed(1) : 0
      };
      setSummaryData(summary);
      setShowPrintDialog(true);
    }
  };

  const handleCloseSummary = () => {
    setShowSummaryReport(false);
    onClose();
  };

  const handlePrintProgramDocument = () => {
    setShowProgramDocumentDialog(true);
  };

  const StatusChip = ({ status, type = 'program' }) => {
    const configs = {
      program: {
        pending: { color: 'warning', label: 'Pending' },
        ongoing: { color: 'info', label: 'Ongoing' },
        completed: { color: 'success', label: 'Completed' },
        cancelled: { color: 'error', label: 'Cancelled' },
      },
      approval: {
        pending: { color: 'warning', label: 'Pending' },
        approved: { color: 'success', label: 'Approved' },
        rejected: { color: 'error', label: 'Rejected' }
      },
      item: {
        distributed: { color: 'success', label: 'Distributed' },
        pending: { color: 'default', label: 'Pending' },
        unclaimed: { color: 'warning', label: 'Unclaimed' }
      }
    };
   
    const config = configs[type][status] || { color: 'default', label: status };
   
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
      />
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%)'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          pt: 3,
          background: `linear-gradient(135deg, ${forestGreen} 0%, ${leafGreen} 50%, ${skyBlue} 100%)`,
          color: 'white'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                {program.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <StatusChip status={program.status} type="program" />
                <StatusChip status={program.approval_status} type="approval" />
                <Typography variant="caption" sx={{ ml: 1, color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(0,0,0,0.2)', px: 1.5, py: 0.5, borderRadius: 2 }}>
                  {formatDate(program.start_date)} - {formatDate(program.end_date)}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={() => onRefresh && onRefresh()} sx={{ color: 'white' }}>
                  <RefreshCw size={20} />
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                <X size={20} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>
       
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(leafGreen, 0.1)} 0%, ${alpha(leafGreen, 0.2)} 100%)`,
                border: `2px solid ${alpha(leafGreen, 0.3)}`,
                borderRadius: 2
              }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: leafGreen }}>
                  {distributedItems}/{totalItems}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>ITEMS DISTRIBUTED</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(skyBlue, 0.1)} 0%, ${alpha(skyBlue, 0.2)} 100%)`,
                border: `2px solid ${alpha(skyBlue, 0.3)}`,
                borderRadius: 2
              }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: skyBlue }}>
                  {beneficiariesWithDistributedItems}/{uniqueBeneficiaries}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>BENEFICIARIES SERVED</Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: isCompleted ? `linear-gradient(135deg, ${alpha(leafGreen, 0.1)} 0%, ${alpha(leafGreen, 0.2)} 100%)` : 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.2) 100%)',
                border: isCompleted ? `2px solid ${alpha(leafGreen, 0.3)}` : '2px solid rgba(255,152,0,0.3)',
                borderRadius: 2
              }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: isCompleted ? leafGreen : 'warning.main' }}>
                  {isCompleted ? totalItems - distributedItems : pendingItems}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {isCompleted ? 'UNDISTRIBUTED ITEMS' : 'PENDING ITEMS'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper sx={{
                p: 2,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(mintGreen, 0.3)} 0%, ${alpha(mintGreen, 0.5)} 100%)`,
                border: `2px solid ${alpha(mintGreen, 0.6)}`,
                borderRadius: 2
              }}>
                <Typography variant="h6" fontWeight={800} sx={{ color: forestGreen }}>
                  {formatCurrency(totalProgramValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>TOTAL VALUE</Typography>
              </Paper>
            </Grid>
          </Grid>

          {program.description && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                borderRadius: 2,
                border: `1px solid ${alpha(skyBlue, 0.3)}`,
                bgcolor: alpha(skyBlue, 0.05)
              }}
            >
              <Typography variant="body2">{program.description}</Typography>
            </Alert>
          )}

          {isCompleted && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                This program has been completed. View summary below.
              </Typography>
            </Alert>
          )}

          {isCancelled && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                This program has been cancelled.
              </Typography>
            </Alert>
          )}

          {!isReadOnly && program.approval_status !== 'approved' && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                Distribution Disabled: Program is {program.approval_status === 'pending' ? 'pending approval' : program.approval_status}
              </Typography>
            </Alert>
          )}

          {!isReadOnly && canComplete && pendingItems > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>{pendingItems}</strong> items pending distribution
              </Typography>
            </Alert>
          )}

          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search beneficiary, RSBSA, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isReadOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: isReadOnly ? alpha(leafGreen, 0.05) : 'white'
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={leafGreen} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && !isReadOnly && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <XCircle size={16} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            {!isReadOnly && selectedItems.size > 0 && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Send size={16} />}
                onClick={handleBulkDistribute}
                disabled={loading || !canDistribute}
                sx={{
                  whiteSpace: 'nowrap',
                  minWidth: 160,
                  background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
                  }
                }}
              >
                Distribute ({selectedItems.size})
              </Button>
            )}
            <ButtonGroup size="small">
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                disabled={isReadOnly}
                sx={{
                  ...(viewMode === 'table' && {
                    background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`
                  })
                }}
              >
                <ListIcon size={18} />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('cards')}
                disabled={isReadOnly}
                sx={{
                  ...(viewMode === 'cards' && {
                    background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`
                  })
                }}
              >
                <LayoutGrid size={18} />
              </Button>
            </ButtonGroup>
          </Stack>

          {filteredBeneficiaryItems.length > 0 ? (
            viewMode === 'table' ? (
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 450,
                  borderRadius: 2,
                  border: `1px solid ${alpha(leafGreen, 0.2)}`,
                  boxShadow: `0 4px 12px ${alpha(forestGreen, 0.1)}`
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {!isReadOnly && (
                        <TableCell padding="checkbox" sx={{ bgcolor: alpha(leafGreen, 0.05), width: 40 }}>
                          <Checkbox
                            size="small"
                            checked={selectedItems.size > 0 && selectedItems.size === flattenedBeneficiaryItems.flatMap(e => e.items.filter(i => i.status !== 'distributed')).length}
                            indeterminate={selectedItems.size > 0 && selectedItems.size < flattenedBeneficiaryItems.flatMap(e => e.items.filter(i => i.status !== 'distributed')).length}
                            onChange={handleSelectAll}
                            disabled={!canDistribute}
                            sx={{ color: leafGreen }}
                          />
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen }}>BENEFICIARY</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen }}>RSBSA</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen }}>BARANGAY</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen }}>ITEM</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen, width: 70 }}>QTY</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen, width: 110 }}>VALUE</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen, width: 100 }}>STATUS</TableCell>
                      {!isReadOnly && (
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: alpha(leafGreen, 0.05), color: forestGreen, width: 110 }}>ACTION</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBeneficiaryItems.map((entry, entryIdx) => (
                      entry.items.map((item, itemIdx) => (
                        <TableRow
                          key={`${entry.id}-${item.id}`}
                          hover
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(mintGreen, 0.15)
                            }
                          }}
                        >
                          {!isReadOnly && (
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={selectedItems.has(item.id)}
                                onChange={() => handleItemSelect(item.id)}
                                disabled={item.status === 'distributed' || !canDistribute}
                                sx={{ color: leafGreen }}
                              />
                            </TableCell>
                          )}
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {itemIdx === 0 ? (
                              <Typography variant="body2" fontWeight={600} sx={{ color: forestGreen }}>
                                {getBeneficiaryName(entry.beneficiary)}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFamily: 'monospace' }}>
                            {itemIdx === 0 ? getRSBSANumber(entry.beneficiary) : null}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                            {itemIdx === 0 ? (getBeneficiaryAddress(entry.beneficiary) || '—') : null}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{item.item_name}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {item.quantity}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 600, color: forestGreen }}>
                            {formatCurrency(item.total_value)}
                          </TableCell>
                          <TableCell align="center">
                            <StatusChip
                              status={distributedOverride.has(item.id) ? 'distributed' : (unclaimedOverride[item.id] ? 'unclaimed' : (item.status === 'distributed' ? 'distributed' : 'pending'))}
                              type="item"
                            />
                            {(unclaimedOverride[item.id] || item.coordinator_notes) && (
                              <Typography variant="caption" display="block" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                {unclaimedOverride[item.id] || item.coordinator_notes}
                              </Typography>
                            )}
                          </TableCell>
                          {!isReadOnly && (
                            <TableCell align="center">
                              {distributedOverride.has(item.id) || item.status === 'distributed' ? (
                                <CheckCircle size={18} color={leafGreen} />
                              ) : (
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleDistributeItem(item.id, getBeneficiaryName(entry.beneficiary), entry.beneficiary)}
                                    disabled={distributingItems.has(item.id) || !canDistribute}
                                    sx={{
                                      fontSize: '0.7rem',
                                      py: 0.5,
                                      px: 1.5,
                                      background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
                                      '&:hover': {
                                        background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
                                      }
                                    }}
                                  >
                                    {distributingItems.has(item.id) ? <CircularProgress size={14} sx={{ color: 'white' }} /> : 'Distribute'}
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setUnclaimDialog({ open: true, item, reason: '' })}
                                    disabled={distributingItems.has(item.id) || !canDistribute}
                                    sx={{ fontSize: '0.7rem' }}
                                  >
                                    Unclaim
                                  </Button>
                                </Stack>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
                <Stack spacing={2}>
                  {filteredBeneficiaryItems.map(entry => (
                    <Card
                      key={entry.id}
                      sx={{
                        borderRadius: 2,
                        border: `2px solid ${alpha(leafGreen, 0.2)}`,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fdf9 100%)',
                        '&:hover': {
                          boxShadow: `0 6px 20px ${alpha(forestGreen, 0.15)}`,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s ease'
                        }
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1.5}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen }}>
                                {getBeneficiaryName(entry.beneficiary)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'monospace' }}>
                                <strong>RSBSA:</strong> {getRSBSANumber(entry.beneficiary)} • <strong>Barangay:</strong> {getBeneficiaryAddress(entry.beneficiary)}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${entry.items.filter(i => i.status === 'distributed').length}/${entry.items.length} Items`}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                ...(entry.items.every(i => i.status === 'distributed')
                                  ? { bgcolor: alpha(leafGreen, 0.2), color: forestGreen }
                                  : { bgcolor: alpha('#ff9800', 0.2), color: '#e65100' })
                              }}
                            />
                          </Box>
                          <Divider />
                          <Stack spacing={1}>
                            {entry.items.map(item => (
                              <Paper
                                key={item.id}
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  bgcolor: alpha(mintGreen, 0.1),
                                  borderRadius: 1.5,
                                  border: `1px solid ${alpha(leafGreen, 0.15)}`
                                }}
                              >
                                <Box flex={1}>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: forestGreen }}>
                                    {item.item_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Qty: <strong>{item.quantity}</strong> • {formatCurrency(item.total_value)}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Stack spacing={0.5} alignItems="flex-end">
                                    <StatusChip
                                      status={distributedOverride.has(item.id) ? 'distributed' : (unclaimedOverride[item.id] ? 'unclaimed' : (item.status === 'distributed' ? 'distributed' : 'pending'))}
                                      type="item"
                                    />
                                    {(unclaimedOverride[item.id] || item.coordinator_notes) && (
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {unclaimedOverride[item.id] || item.coordinator_notes}
                                      </Typography>
                                    )}
                                  </Stack>
                                  {!isReadOnly && item.status !== 'distributed' && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleDistributeItem(item.id, getBeneficiaryName(entry.beneficiary), entry.beneficiary)}
                                      disabled={distributingItems.has(item.id) || !canDistribute}
                                      sx={{
                                        fontSize: '0.7rem',
                                        py: 0.5,
                                        px: 1.5,
                                        background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
                                        '&:hover': {
                                          background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
                                        }
                                      }}
                                    >
                                      Distribute
                                    </Button>
                                  )}
                                </Stack>
                              </Paper>
                            ))}
                          </Stack>
                        </Stack>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )
          ) : (
            <Paper sx={{
              p: 5,
              textAlign: 'center',
              bgcolor: alpha(mintGreen, 0.1),
              borderRadius: 2,
              border: `2px dashed ${alpha(leafGreen, 0.3)}`
            }}>
              <Users size={48} color={alpha(forestGreen, 0.4)} />
              <Typography variant="body1" color="text.secondary" mt={2} fontWeight={600}>
                {searchQuery ? 'No results found' : 'No beneficiaries'}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <Divider sx={{ borderColor: alpha(leafGreen, 0.2) }} />
       
        <DialogActions sx={{ px: 3, py: 2, bgcolor: alpha(mintGreen, 0.05) }}>
          {!isReadOnly && canComplete && (
            <Button
              onClick={handleComplete}
              variant="contained"
              disabled={completing}
              startIcon={completing ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <CheckCircle />}
              sx={{
                mr: 'auto',
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
                },
                '&:disabled': {
                  background: alpha(leafGreen, 0.3)
                }
              }}
            >
              {completing ? 'Completing...' : 'Complete Program'}
            </Button>
          )}
          <Button
            onClick={handlePrintProgramDocument}
            variant="outlined"
            startIcon={<Printer size={18} />}
            sx={{
              mr: 'auto',
              borderColor: leafGreen,
              color: forestGreen,
              '&:hover': {
                borderColor: forestGreen,
                bgcolor: alpha(leafGreen, 0.05)
              }
            }}
          >
            Print Program Document
          </Button>
          {isCompleted && (
            <Button
              onClick={handlePrintSummary}
              variant="outlined"
              startIcon={<Printer size={18} />}
              sx={{
                borderColor: skyBlue,
                color: skyBlue,
                '&:hover': {
                  borderColor: skyBlue,
                  bgcolor: alpha(skyBlue, 0.05)
                }
              }}
            >
              Print Summary
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: leafGreen,
              color: forestGreen,
              '&:hover': {
                borderColor: forestGreen,
                bgcolor: alpha(leafGreen, 0.05)
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unclaim Dialog */}
      <Dialog
        open={unclaimDialog.open}
        onClose={() => setUnclaimDialog({ open: false, item: null, reason: '' })}
        maxWidth="xs" fullWidth
      >
        <DialogTitle>Mark Item as Unclaimed</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason (optional)"
            value={unclaimDialog.reason}
            onChange={(e) => setUnclaimDialog(prev => ({ ...prev, reason: e.target.value }))}
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnclaimDialog({ open: false, item: null, reason: '' })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!unclaimDialog.item) return;
              try {
                const res = await markItemUnclaimed(unclaimDialog.item.id, unclaimDialog.reason, program);
                setUnclaimedOverride(prev => ({ ...prev, [unclaimDialog.item.id]: unclaimDialog.reason || 'Unclaimed' }));
                setDistributedOverride(prev => {
                  const s = new Set(prev);
                  s.delete(unclaimDialog.item.id);
                  return s;
                });
                if (onRefresh) onRefresh();
              } catch (e) {
                // error toast handled by hook
              } finally {
                setUnclaimDialog({ open: false, item: null, reason: '' });
              }
            }}
          >
            Confirm Unclaim
          </Button>
        </DialogActions>
      </Dialog>

      {/* REDESIGNED Summary Report Dialog */}
      <Dialog
        open={showSummaryReport}
        onClose={handleCloseSummary}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%)',
            minHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          background: `linear-gradient(135deg, ${forestGreen} 0%, ${leafGreen} 50%, ${skyBlue} 100%)`
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'white', width: 64, height: 64 }}>
              <Award size={36} color={forestGreen} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={800} sx={{ color: 'white' }}>
                Program Completed Successfully!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Complete Distribution Summary Report
              </Typography>
            </Box>
            <IconButton onClick={handleCloseSummary} size="small" sx={{ color: 'white' }}>
              <X size={24} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {summaryData && (
            <Box>
              {/* Program Header */}
              <Box sx={{ p: 4, bgcolor: 'white', borderBottom: `1px solid ${alpha(leafGreen, 0.2)}` }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: forestGreen }}>
                  {summaryData.programTitle}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip
                    icon={<Calendar size={16} />}
                    label={`${formatDate(summaryData.startDate)} - ${formatDate(summaryData.endDate)}`}
                    sx={{
                      bgcolor: alpha(skyBlue, 0.15),
                      color: skyBlue,
                      fontWeight: 600,
                      border: `1px solid ${alpha(skyBlue, 0.3)}`
                    }}
                  />
                  <Chip
                    icon={<Clock size={16} />}
                    label={`Completed: ${formatDate(summaryData.completedDate)}`}
                    sx={{
                      bgcolor: alpha(leafGreen, 0.15),
                      color: forestGreen,
                      fontWeight: 600,
                      border: `1px solid ${alpha(leafGreen, 0.3)}`
                    }}
                  />
                </Stack>
                {summaryData.description && (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(skyBlue, 0.3)}`,
                      bgcolor: alpha(skyBlue, 0.05)
                    }}
                  >
                    <Typography variant="body2">{summaryData.description}</Typography>
                  </Alert>
                )}
              </Box>

              {/* Summary Statistics */}
              <Box sx={{ p: 4, bgcolor: alpha(mintGreen, 0.05) }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: forestGreen, mb: 3 }}>
                  Distribution Summary
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(leafGreen, 0.1)} 0%, ${alpha(leafGreen, 0.2)} 100%)`,
                      border: `2px solid ${alpha(leafGreen, 0.3)}`,
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <Package size={40} color={leafGreen} style={{ marginBottom: 12 }} />
                      <Typography variant="h3" fontWeight={800} sx={{ color: forestGreen }}>
                        {summaryData.distributedItems}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                        ITEMS DISTRIBUTED
                      </Typography>
                      <Typography variant="h5" sx={{ color: leafGreen, fontWeight: 800 }}>
                        {summaryData.distributionRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of {summaryData.totalItems} total items
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(skyBlue, 0.1)} 0%, ${alpha(skyBlue, 0.2)} 100%)`,
                      border: `2px solid ${alpha(skyBlue, 0.3)}`,
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <UserCheck size={40} color={skyBlue} style={{ marginBottom: 12 }} />
                      <Typography variant="h3" fontWeight={800} sx={{ color: skyBlue }}>
                        {summaryData.servedBeneficiaries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                        BENEFICIARIES SERVED
                      </Typography>
                      <Typography variant="h5" sx={{ color: skyBlue, fontWeight: 800 }}>
                        {summaryData.beneficiaryRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of {summaryData.totalBeneficiaries} total beneficiaries
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{
                      p: 3,
                      textAlign: 'center',
                      background: summaryData.pendingItems > 0 ? 
                        'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.2) 100%)' :
                        `linear-gradient(135deg, ${alpha(leafGreen, 0.1)} 0%, ${alpha(leafGreen, 0.2)} 100%)`,
                      border: summaryData.pendingItems > 0 ? 
                        '2px solid rgba(255,152,0,0.3)' :
                        `2px solid ${alpha(leafGreen, 0.3)}`,
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      {summaryData.pendingItems > 0 ? (
                        <UserX size={40} color="#ff9800" style={{ marginBottom: 12 }} />
                      ) : (
                        <CheckCircle size={40} color={leafGreen} style={{ marginBottom: 12 }} />
                      )}
                      <Typography variant="h3" fontWeight={800}
sx={{ 
                        color: summaryData.pendingItems > 0 ? 'warning.main' : forestGreen 
                      }}>
                        {summaryData.pendingItems}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {summaryData.pendingItems > 0 ? 'UNCLAIMED ITEMS' : 'ALL ITEMS DISTRIBUTED'}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card sx={{
                      p: 3,
                      textAlign: 'center',
                      background: `linear-gradient(135deg, ${alpha(mintGreen, 0.3)} 0%, ${alpha(mintGreen, 0.5)} 100%)`,
                      border: `2px solid ${alpha(mintGreen, 0.6)}`,
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <DollarSign size={40} color={forestGreen} style={{ marginBottom: 12 }} />
                      <Typography variant="h5" fontWeight={800} sx={{ color: forestGreen }}>
                        {formatCurrency(summaryData.totalValue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        TOTAL PROGRAM VALUE
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              {/* Beneficiary Details with Tabs */}
              <Box sx={{ bgcolor: 'white' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4, pt: 2 }}>
                  <Tabs 
                    value={summaryTabValue} 
                    onChange={(e, newValue) => setSummaryTabValue(newValue)}
                    sx={{
                      '& .MuiTab-root': {
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      },
                      '& .Mui-selected': {
                        color: `${forestGreen} !important`
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: forestGreen
                      }
                    }}
                  >
                    <Tab label={`All Beneficiaries (${summaryData.beneficiaryDetails?.length || 0})`} />
                    <Tab label={`Distributed (${summaryData.beneficiaryDetails?.filter(b => b.distributedItemsCount > 0).length || 0})`} />
                    <Tab label={`Unclaimed (${summaryData.beneficiaryDetails?.filter(b => b.unclaimedItemsCount > 0).length || 0})`} />
                  </Tabs>
                </Box>

                <Box sx={{ p: 4, maxHeight: 600, overflow: 'auto' }}>
                  {summaryData.beneficiaryDetails && (
                    <Stack spacing={2}>
                      {summaryData.beneficiaryDetails
                        .filter(beneficiary => {
                          if (summaryTabValue === 0) return true; // All
                          if (summaryTabValue === 1) return beneficiary.distributedItemsCount > 0; // Distributed
                          if (summaryTabValue === 2) return beneficiary.unclaimedItemsCount > 0; // Unclaimed
                          return true;
                        })
                        .map((beneficiary, index) => (
                          <Accordion
                            key={beneficiary.id}
                            sx={{
                              border: `1px solid ${alpha(leafGreen, 0.2)}`,
                              borderRadius: 2,
                              '&:before': { display: 'none' },
                              boxShadow: `0 2px 8px ${alpha(forestGreen, 0.1)}`
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ChevronDown />}
                              sx={{
                                bgcolor: alpha(mintGreen, 0.05),
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: alpha(mintGreen, 0.1)
                                }
                              }}
                            >
                              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                                <Avatar sx={{ bgcolor: forestGreen, width: 40, height: 40 }}>
                                  <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                                    {index + 1}
                                  </Typography>
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen }}>
                                    {beneficiary.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                    RSBSA: {beneficiary.rsbsaNumber} • {beneficiary.address}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    size="small"
                                    label={`${beneficiary.distributedItemsCount} Distributed`}
                                    sx={{
                                      bgcolor: alpha(leafGreen, 0.15),
                                      color: forestGreen,
                                      fontWeight: 600
                                    }}
                                  />
                                  {beneficiary.unclaimedItemsCount > 0 && (
                                    <Chip
                                      size="small"
                                      label={`${beneficiary.unclaimedItemsCount} Unclaimed`}
                                      sx={{
                                        bgcolor: alpha('#ff9800', 0.15),
                                        color: '#e65100',
                                        fontWeight: 600
                                      }}
                                    />
                                  )}
                                  <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen }}>
                                    {formatCurrency(beneficiary.totalValue)}
                                  </Typography>
                                </Stack>
                              </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ pt: 0 }}>
                              <TableContainer>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>ITEM</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>QUANTITY</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>VALUE</TableCell>
                                      <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>STATUS</TableCell>
                                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>NOTES</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {beneficiary.items.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.item_name}</TableCell>
                                        <TableCell align="center">{item.quantity}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                          {formatCurrency(item.total_value)}
                                        </TableCell>
                                        <TableCell align="center">
                                          <StatusChip status={item.status} type="item" />
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="caption" color="text.secondary">
                                            {item.unclaimedReason || '—'}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                    </Stack>
                  )}
                </Box>
              </Box>

              {/* Final Status */}
              <Box sx={{ p: 4, bgcolor: alpha(leafGreen, 0.05), borderTop: `1px solid ${alpha(leafGreen, 0.2)}` }}>
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    bgcolor: alpha(leafGreen, 0.1),
                    border: `2px solid ${alpha(leafGreen, 0.3)}`
                  }}
                >
                  <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen }}>
                    Program Successfully Completed and Archived
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    All distribution records have been saved and are available for reporting and audit purposes.
                  </Typography>
                </Alert>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1.5, bgcolor: alpha(mintGreen, 0.05) }}>
          <Button
            onClick={handlePrintSummary}
            variant="outlined"
            startIcon={<Printer size={18} />}
            sx={{
              borderColor: leafGreen,
              color: forestGreen,
              '&:hover': {
                borderColor: forestGreen,
                bgcolor: alpha(leafGreen, 0.05)
              }
            }}
          >
            Print Complete Report
          </Button>
          <Button
            onClick={handleCloseSummary}
            variant="contained"
            sx={{
              px: 4,
              background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
              }
            }}
          >
            Close Summary
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={clearMessages}
          severity="success"
          variant="filled"
          sx={{
            fontSize: '0.875rem',
            background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={clearMessages}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={clearMessages} severity="error" variant="filled" sx={{ fontSize: '0.875rem' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelDistribution}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `2px solid ${alpha(leafGreen, 0.2)}`
          }
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AlertTriangle size={28} color="#ff9800" />
            <Typography variant="h6" fontWeight={700}>Confirm Distribution</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {confirmDialog.item && confirmDialog.beneficiary && (
            <Stack spacing={2}>
              <Box sx={{
                p: 2,
                bgcolor: alpha(skyBlue, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(skyBlue, 0.2)}`
              }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>BENEFICIARY</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen, mt: 0.5 }}>
                  {getBeneficiaryName(confirmDialog.beneficiary)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {getRSBSANumber(confirmDialog.beneficiary)} • {getBeneficiaryAddress(confirmDialog.beneficiary)}
                </Typography>
              </Box>
              <Box sx={{
                p: 2,
                bgcolor: alpha(mintGreen, 0.15),
                borderRadius: 2,
                border: `1px solid ${alpha(leafGreen, 0.2)}`
              }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>ITEM DETAILS</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: forestGreen, mt: 0.5 }}>
                  {confirmDialog.item.item_name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Quantity: <strong>{confirmDialog.item.quantity}</strong> • Value: <strong>{formatCurrency(confirmDialog.item.total_value)}</strong>
                </Typography>
              </Box>
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={600}>This action cannot be undone.</Typography>
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleCancelDistribution}
            disabled={confirmDialog.confirming}
            variant="outlined"
            sx={{
              borderColor: alpha(forestGreen, 0.3),
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDistribution}
            variant="contained"
            disabled={confirmDialog.confirming}
            startIcon={confirmDialog.confirming ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CheckCircle />}
            sx={{
              px: 3,
              background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
              }
            }}
          >
            {confirmDialog.confirming ? 'Confirming...' : 'Confirm Distribution'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Dialog for Completed Programs */}
      <Dialog
        open={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          background: `linear-gradient(135deg, ${forestGreen} 0%, ${leafGreen} 50%, ${skyBlue} 100%)`,
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'white', width: 48, height: 48 }}>
              <Printer size={24} color={forestGreen} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                Print Program Summary
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {program.title}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowPrintDialog(false)} size="small" sx={{ color: 'white' }}>
              <X size={24} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {summaryData && (
            <div id="program-summary-report">
              <ProgramSummaryReport
                program={program}
                summaryData={summaryData}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                beneficiaries={Object.values(groupedBeneficiaries)}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5, bgcolor: alpha(mintGreen, 0.05) }}>
          <Button
            onClick={() => {
              const reportContent = document.getElementById('program-summary-report');
              printElementContent(`Program Summary Report - ${program.title}`, reportContent, {
                stylesheets: ['/static/css/professional-print-styles.css'],
                inlineHeadCss: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body { font-family: 'Inter', Arial, sans-serif; }"
              });
            }}
            variant="contained"
            startIcon={<Printer size={18} />}
            sx={{
              px: 3,
              background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
              }
            }}
          >
            Print Report
          </Button>
          <Button
            onClick={() => setShowPrintDialog(false)}
            variant="outlined"
            sx={{
              borderColor: leafGreen,
              color: forestGreen,
              '&:hover': {
                borderColor: forestGreen,
                bgcolor: alpha(leafGreen, 0.05)
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Program Document Print Dialog */}
      <Dialog
        open={showProgramDocumentDialog}
        onClose={() => setShowProgramDocumentDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'white'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          background: `linear-gradient(135deg, ${forestGreen} 0%, ${leafGreen} 50%, ${skyBlue} 100%)`,
          color: 'white'
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'white', width: 48, height: 48 }}>
              <Printer size={24} color={forestGreen} />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={700} sx={{ color: 'white' }}>
                Print Program Document
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {program.title}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowProgramDocumentDialog(false)} size="small" sx={{ color: 'white' }}>
              <X size={24} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <div id="program-document-print">
            <ProgramDocument
              program={program}
              beneficiaries={Object.values(groupedBeneficiaries)}
              formatDate={(dateString) => {
                if (!dateString) return 'Not specified';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }}
              coordinatorName="Program Coordinator"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1.5, bgcolor: alpha(mintGreen, 0.05) }}>
          <Button
            onClick={() => {
              const documentContent = document.getElementById('program-document-print');
              printElementContent(`Program Document - ${program.title}`, documentContent, {
                stylesheets: ['/static/css/professional-print-styles.css'],
                inlineHeadCss: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body { font-family: 'Inter', Arial, sans-serif; }"
              });
            }}
            variant="contained"
            startIcon={<Printer size={18} />}
            sx={{
              px: 3,
              background: `linear-gradient(135deg, ${leafGreen} 0%, ${forestGreen} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${forestGreen} 0%, ${darkForest} 100%)`
              }
            }}
          >
            Print Document
          </Button>
          <Button
            onClick={() => setShowProgramDocumentDialog(false)}
            variant="outlined"
            sx={{
              borderColor: leafGreen,
              color: forestGreen,
              '&:hover': {
                borderColor: forestGreen,
                bgcolor: alpha(leafGreen, 0.05)
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ProgramDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onComplete: PropTypes.func,
  onRefresh: PropTypes.func,
  currentView: PropTypes.string,
  program: PropTypes.object,
  isHistoryView: PropTypes.bool
};

export default ProgramDetailsModal;
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/named */
/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-alert */
import { useState, useRef, useMemo, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import {
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
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Select,
  MenuItem,
  Typography,
  CardHeader,
  Menu,
  ListItemText,
  ListItem,
  List,
  ListItemIcon,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Chip
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

import pdfReportGenerator from './pdfReportGenerator';
import RsbsaNumberEditModal from './RsbsaNumberEditModal';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import MoreVertTwoToneIcon from '@mui/icons-material/MoreVertTwoTone';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfTwoTone';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BadgeTwoToneIcon from '@mui/icons-material/BadgeTwoTone';
import GrainIcon from '@mui/icons-material/Grain';
import PetsIcon from '@mui/icons-material/Pets';
import WaterIcon from '@mui/icons-material/Water';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

/* ----------------- Helpers ------------------ */
const formatDate = (dateValue, formatString = 'MMM dd, yyyy') => {
  if (!dateValue) return 'N/A';
  let date;
  if (typeof dateValue === 'string') {
    date = parseISO(dateValue);
    if (!isValid(date)) date = new Date(dateValue);
  } else if (dateValue instanceof Date) date = dateValue;
  else return 'N/A';
  return isValid(date) ? format(date, formatString) : 'Invalid Date';
};

const formatFullName = (b) => {
  const parts = [b.lastName, b.firstName, b.middleName, b.suffixExtension].filter(Boolean);
  return parts.join(', ') || b.name || 'N/A';
};

const formatFullAddress = (b) => {
  const parts = [b.streetPurokBarangay, b.municipality, b.province].filter(Boolean);
  return parts.join(', ') || 'N/A';
};

/* ----------------- Print & PDF ------------------ */
const printRecords = (beneficiaries, options = {}) => {
  pdfReportGenerator.printDetailedReport(beneficiaries, {
    includeStats: true,
    includeFilters: false,
    title: 'RSBSA Beneficiaries Report',
    logoPath: '/static/images/logo.png',
    ...options
  });
};

const exportToPDF = (beneficiaries, options = {}) => {
  pdfReportGenerator.exportDetailedToPDF(beneficiaries, {
    includeStats: true,
    includeFilters: false,
    title: 'RSBSA Beneficiaries PDF Export',
    logoPath: '/static/images/logo.png',
    ...options
  });
};

/* ----------------- Styled Components ------------------ */
const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText
}));

const SectorCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const SectorIcon = styled(Box)(({ theme, bgcolor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: '12px',
  backgroundColor: bgcolor || theme.palette.primary.main,
  color: '#fff',
  marginBottom: theme.spacing(1)
}));

/* ----------------- Bulk Actions ------------------ */
function BulkActions({ selectedCount = 0, onBulkAction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const moreRef = useRef(null);

  const handleBulkAction = (action) => { 
    if (onBulkAction) onBulkAction(action); 
    setMenuOpen(false); 
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" p={2} sx={{ bgcolor: 'grey.50' }}>
        <Typography variant="h6" fontSize="14px" color="text.secondary">
          {selectedCount} beneficiar{selectedCount === 1 ? 'y' : 'ies'} selected
        </Typography>
        <IconButton color="primary" onClick={() => setMenuOpen(true)} ref={moreRef}>
          <MoreVertTwoToneIcon />
        </IconButton>
      </Box>
      <Menu
        keepMounted
        anchorEl={moreRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List sx={{ p: 1 }}>
          <ListItem button onClick={() => handleBulkAction('edit')}>
            <ListItemIcon><EditTwoToneIcon fontSize="small"/></ListItemIcon>
            <ListItemText primary="Bulk Edit Information" secondary="Update multiple beneficiaries"/>
          </ListItem>
          <ListItem button onClick={() => handleBulkAction('generate-rsbsa')}>
            <ListItemIcon><AssignmentTwoToneIcon fontSize="small"/></ListItemIcon>
            <ListItemText primary="Generate RSBSA Numbers" secondary="Auto-assign RSBSA numbers"/>
          </ListItem>
          <Divider />
          <ListItem button onClick={() => handleBulkAction('print')}>
            <ListItemIcon><PrintTwoToneIcon fontSize="small"/></ListItemIcon>
            <ListItemText primary="Print Selected" secondary="Print beneficiary records"/>
          </ListItem>
          <ListItem button onClick={() => handleBulkAction('export-pdf')}>
            <ListItemIcon><PictureAsPdfTwoToneIcon fontSize="small"/></ListItemIcon>
            <ListItemText primary="Export to PDF" secondary="Generate PDF table report"/>
          </ListItem>
          <Divider />
          <ListItem button onClick={() => handleBulkAction('delete')} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteTwoToneIcon fontSize="small" color="error"/></ListItemIcon>
            <ListItemText primary="Delete Selected" secondary="Permanently remove records"/>
          </ListItem>
        </List>
      </Menu>
    </>
  );
}
BulkActions.propTypes = { selectedCount: PropTypes.number, onBulkAction: PropTypes.func };

/* ----------------- Main Table Component ------------------ */
export default function RecentBeneficiaryTable({ beneficiaries = [], statistics = null }) {
  const [selected, setSelected] = useState([]);
  const [list, setList] = useState(beneficiaries);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [barangayFilter, setBarangayFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // RSBSA Modal state
  const [rsbsaModalOpen, setRsbsaModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  // Sync local list when props change
  useEffect(() => { setList(beneficiaries); }, [beneficiaries]);

  // ✅ FIXED: Filtered data with both field name variations
  const filteredData = useMemo(() => {
    return list.filter(b => {
      if (barangayFilter && b.streetPurokBarangay !== barangayFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = formatFullName(b).toLowerCase();
        const barangay = (b.streetPurokBarangay || '').toLowerCase();
        const rsbsa = (b.rsbsaNumber || b.rsbsa_number || '').toLowerCase();
        const refCode = (b.systemGeneratedRsbaNumber || b.reference_code || '').toLowerCase();
        return fullName.includes(query) || barangay.includes(query) || 
               rsbsa.includes(query) || refCode.includes(query);
      }
      return true;
    });
  }, [list, searchQuery, barangayFilter]);

  // Pagination slice
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Calculate statistics from filtered data if not provided by API
  const totalBeneficiaries = filteredData.length;
  const totalFarmArea = filteredData.reduce((sum, b) => sum + (b.totalParcelArea || 0), 0);

  // Count farm types
  const farmTypeCounts = useMemo(() => {
    const counts = {};
    filteredData.forEach(b => {
      if (b.farmTypes) {
        b.farmTypes.forEach(ft => {
          counts[ft] = (counts[ft] || 0) + 1;
        });
      }
    });
    return counts;
  }, [filteredData]);

  const barangays = [...new Set(list.map(b => b.streetPurokBarangay).filter(Boolean))].sort();

  // Sector icon and color mapping
  const getSectorIcon = (sectorKey) => {
    const icons = {
      rice: <GrainIcon />,
      corn: <GrainIcon />,
      hvc: <LocalFloristIcon />,
      livestock: <PetsIcon />,
      fisheries: <WaterIcon />,
      other: <AgricultureIcon />
    };
    return icons[sectorKey] || <AgricultureIcon />;
  };

  const getSectorColor = (sectorKey) => {
    const colors = {
      rice: '#4caf50',
      corn: '#ff9800',
      hvc: '#e91e63',
      livestock: '#9c27b0',
      fisheries: '#2196f3',
      other: '#757575'
    };
    return colors[sectorKey] || '#1976d2';
  };

  // Handlers
  const handleSelectAll = (e) => setSelected(e.target.checked ? paginatedData.map(b => b.id) : []);
  const handleSelectOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
  const handleBarangayFilterChange = (e) => { 
    setBarangayFilter(e.target.value); 
    setPage(0); 
    setSelected([]);
  };
  const handleSearchChange = (e) => { setSearchQuery(e.target.value); setPage(0); setSelected([]); };
  const handleClearSearch = () => { setSearchQuery(''); setPage(0); setSelected([]); };

  // RSBSA Modal handlers
  const handleEditRsbsa = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setRsbsaModalOpen(true);
  };

  const handleCloseRsbsaModal = () => {
    setRsbsaModalOpen(false);
    setSelectedBeneficiary(null);
  };

  const handleRsbsaSuccess = (updatedBeneficiary) => {
    setList(prev => prev.map(b => {
      if (b.id !== updatedBeneficiary.id) return b;
      return { 
        ...b, 
        rsbsaNumber: updatedBeneficiary.rsbsa_number || updatedBeneficiary.rsbsaNumber,
        rsbsa_number: updatedBeneficiary.rsbsa_number || updatedBeneficiary.rsbsaNumber
      };
    }));
    setToast({ open: true, message: 'RSBSA number saved successfully', severity: 'success' });
    setRsbsaModalOpen(false);
    setSelectedBeneficiary(null);
  };

  const handleRsbsaError = (message) => {
    setToast({ open: true, message: message || 'Failed to save RSBSA number', severity: 'error' });
  };

  const handleBulkAction = (action) => {
    const selectedBeneficiaries = list.filter(b => selected.includes(b.id));
    switch (action) {
      case 'edit':
      case 'generate-rsbsa':
        alert(`Bulk action: ${action} on ${selected.length} records`);
        break;
      case 'print': printRecords(selectedBeneficiaries, { title: 'Selected Beneficiaries Report' }); break;
      case 'export-pdf': exportToPDF(selectedBeneficiaries, { title: 'Selected Beneficiaries PDF Export' }); break;
      case 'delete':
        if (window.confirm(`Delete ${selected.length} selected records?`)) alert('Deleted (simulate)');
        break;
      default: break;
    }
  };

  const handlePrintAll = () => {
    if (filteredData.length === 0) { alert('No data available for printing'); return; }
    printRecords(filteredData, { title: 'RSBSA Beneficiaries Complete Report' });
  };

  const handleExportAllToPDF = () => {
    if (filteredData.length === 0) { alert('No data available for export'); return; }
    exportToPDF(filteredData, { title: 'RSBSA Beneficiaries Complete PDF Export' });
  };

  return (
    <Box>
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Sector Statistics from API (if available) */}
      {statistics && statistics.sectors && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Object.entries(statistics.sectors)
            .filter(([_, sector]) => sector.count > 0)
            .map(([key, sector]) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={key}>
                <SectorCard elevation={2}>
                  <SectorIcon bgcolor={getSectorColor(key)}>
                    {getSectorIcon(key)}
                  </SectorIcon>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {sector.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: getSectorColor(key), mb: 1 }}>
                    {sector.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sector.unit === 'heads' ? (
                      `${sector.total_heads?.toLocaleString() || 0} ${sector.unit}`
                    ) : (
                      `${sector.total_area?.toFixed(2) || 0} ${sector.unit}`
                    )}
                  </Typography>
                  
                  {/* Farm types for rice/corn */}
                  {sector.farm_types && Object.keys(sector.farm_types).length > 0 && (
                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                      {Object.entries(sector.farm_types).map(([type, count]) => (
                        count > 0 && (
                          <Typography key={type} variant="caption" display="block" color="text.secondary">
                            {type}: {count}
                          </Typography>
                        )
                      ))}
                    </Box>
                  )}
                </SectorCard>
              </Grid>
            ))}
        </Grid>
      )}

      {/* Summary Statistics (fallback or filtered view) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <IconWrapper>
              <GroupIcon />
            </IconWrapper>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{totalBeneficiaries}</Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || barangayFilter ? 'Filtered' : 'Total'} Beneficiaries
              </Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'success.main' }}>
              <AgricultureIcon />
            </IconWrapper>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {totalFarmArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Farm Area</Typography>
            </Box>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard>
            <IconWrapper sx={{ bgcolor: 'warning.main' }}>
              <AgricultureIcon />
            </IconWrapper>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Farm Types</Typography>
              {Object.keys(farmTypeCounts).length > 0 ? (
                Object.entries(farmTypeCounts).map(([type, count]) => (
                  <Typography key={type} variant="body2">{type}: {count}</Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">N/A</Typography>
              )}
            </Box>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Card>
        <CardHeader 
          title={`My Beneficiaries (${list.length})`}
          action={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by name, ref code, RSBSA, or barangay..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch} edge="end">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Barangay Filter</InputLabel>
                <Select value={barangayFilter} label="Barangay Filter" onChange={handleBarangayFilterChange}>
                  <MenuItem value="">All Barangays</MenuItem>
                  {barangays.map(barangay => <MenuItem key={barangay} value={barangay}>{barangay}</MenuItem>)}
                </Select>
              </FormControl>
              
              <Tooltip title="Print All Records">
                <Button variant="outlined" size="small" onClick={handlePrintAll} startIcon={<PrintTwoToneIcon />}>Print</Button>
              </Tooltip>
              <Tooltip title="Export All to PDF">
                <Button variant="outlined" size="small" onClick={handleExportAllToPDF} startIcon={<PictureAsPdfTwoToneIcon />} color="secondary">PDF</Button>
              </Tooltip>
            </Box>
          }
        />

        {selected.length > 0 && <BulkActions selectedCount={selected.length} onBulkAction={handleBulkAction} />}

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: 50 }}>
                  <Checkbox
                    checked={selected.length === paginatedData.length && paginatedData.length > 0}
                    indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell sx={{ width: 150 }}>REFERENCE CODE</TableCell>
                <TableCell sx={{ width: 150 }}>RSBSA NUMBER</TableCell>
                <TableCell sx={{ minWidth: 180 }}>NAME</TableCell>
                <TableCell sx={{ minWidth: 200 }}>ADDRESS</TableCell>
                <TableCell sx={{ width: 60 }}>SEX</TableCell>
                <TableCell sx={{ width: 120 }}>CONTACT</TableCell>
                <TableCell sx={{ width: 100 }}>FARM TYPE</TableCell>
                <TableCell sx={{ minWidth: 200 }}>COMMODITY / AREA</TableCell>
                <TableCell sx={{ width: 120 }}>DATE ASSIGNED</TableCell>
                <TableCell sx={{ width: 80 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map(b => (
                  <TableRow key={b.id} hover selected={selected.includes(b.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.includes(b.id)} onChange={() => handleSelectOne(b.id)} />
                    </TableCell>
                    
                    {/* ✅ REFERENCE CODE - Check both field names */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'primary.main' }}>
                        {b.systemGeneratedRsbaNumber || b.reference_code || 'N/A'}
                      </Typography>
                    </TableCell>
                    
                    {/* ✅ RSBSA NUMBER - Check both field names */}
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.85rem',
                          fontWeight: (b.rsbsaNumber || b.rsbsa_number) ? 600 : 400,
                          color: (b.rsbsaNumber || b.rsbsa_number) ? 'success.main' : 'text.secondary'
                        }}
                      >
                        {b.rsbsaNumber || b.rsbsa_number || 'Not Set'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatFullName(b)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatFullAddress(b)}
                      </Typography>
                    </TableCell>
                    <TableCell>{b.sex || 'N/A'}</TableCell>
                    <TableCell>{b.contactNo || 'N/A'}</TableCell>
                    <TableCell>
                      {b.farmTypes && b.farmTypes.length > 0 ? (
                        b.farmTypes.map((ft, idx) => (
                          <Chip key={idx} label={ft} size="small" sx={{ m: 0.25, fontSize: '0.7rem' }} />
                        ))
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {b.commodities && b.commodities.length > 0 ? (
                        <Box sx={{ maxWidth: 200 }}>
                          {b.commodities.map((c, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={`${c.category}: ${c.name} (${c.parcelArea} ha)`}
                              sx={{ m: 0.25, fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(b.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit RSBSA Number">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditRsbsa(b)}
                        >
                          <BadgeTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchQuery || barangayFilter 
                        ? 'No beneficiaries match your search criteria' 
                        : 'No beneficiaries assigned yet'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </Card>

      {/* RSBSA Number Edit Modal */}
      <RsbsaNumberEditModal
        open={rsbsaModalOpen}
        onClose={handleCloseRsbsaModal}
        beneficiary={selectedBeneficiary}
        onSuccess={handleRsbsaSuccess}
        onError={handleRsbsaError}
      />
    </Box>
  );
}

RecentBeneficiaryTable.propTypes = { 
  beneficiaries: PropTypes.array,
  statistics: PropTypes.object
};
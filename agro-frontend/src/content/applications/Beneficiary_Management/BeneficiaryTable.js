/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tooltip,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Card,
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
  useTheme,
  CardHeader,
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  LinearProgress,
  Avatar,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Grid
} from '@mui/material';

import {
  Search,
  RotateCcw,
  Edit3,
  Eye,
  UserCheck,
  UserX,
  Users,
  MapPin,
  Phone,
  Mail,
  Shield,
  User,
  Calendar,
  Activity,
  Filter,
  Download,
  Plus,
  FileText,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';

// Status color mapping
const getStatusConfig = (status) => {
  const configs = {
    active: { 
      color: '#10b981', 
      bgColor: '#ecfdf5', 
      text: 'Active',
      icon: Activity
    },
    inactive: { 
      color: '#ef4444', 
      bgColor: '#fef2f2', 
      text: 'Inactive',
      icon: UserX
    },
    suspended: { 
      color: '#f59e0b', 
      bgColor: '#fffbeb', 
      text: 'Suspended',
      icon: Shield
    }
  };
  return configs[status] || { 
    color: '#6b7280', 
    bgColor: '#f9fafb', 
    text: 'Unknown',
    icon: User
  };
};

// Report Modal Component
const ReportModal = ({ open, onClose, onGenerate, totals, loading }) => {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('pdf');
  const [includeFields, setIncludeFields] = useState({
    personalInfo: true,
    contactInfo: true,
    locationInfo: true,
    statusInfo: true,
    verificationInfo: false
  });
  const [dateRange, setDateRange] = useState('all');

  const reportTypes = [
    {
      id: 'summary',
      name: 'Summary Report',
      description: 'Overview of all users with key statistics',
      icon: BarChart3
    },
    {
      id: 'detailed',
      name: 'Detailed User Report',
      description: 'Complete user information with all details',
      icon: FileText
    },
    {
      id: 'statistics',
      name: 'Statistics Report',
      description: 'Charts and analytics of user data',
      icon: PieChart
    },
    {
      id: 'status',
      name: 'Status Report',
      description: 'User status breakdown and analysis',
      icon: TrendingUp
    }
  ];

  const handleGenerate = () => {
    const reportConfig = {
      type: reportType,
      format,
      fields: includeFields,
      dateRange,
      timestamp: new Date().toISOString()
    };
    onGenerate(reportConfig);
  };

  const handleFieldChange = (field) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <FileText size={24} />
          <Typography variant="h6">Generate Report</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Report Type Selection */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Report Type
            </Typography>
            <RadioGroup value={reportType} onChange={(e) => setReportType(e.target.value)}>
              {reportTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Paper
                    key={type.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '2px solid',
                      borderColor: reportType === type.id ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.light'
                      }
                    }}
                    onClick={() => setReportType(type.id)}
                  >
                    <FormControlLabel
                      value={type.id}
                      control={<Radio />}
                      label={
                        <Box display="flex" alignItems="center" gap={2}>
                          <IconComponent size={20} />
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {type.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ margin: 0, width: '100%' }}
                    />
                  </Paper>
                );
              })}
            </RadioGroup>
          </Grid>

          {/* Data Preview */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Data Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Total Users</Typography>
                  <Typography variant="h6" color="primary.main">{totals.total}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Beneficiaries</Typography>
                  <Typography variant="h6" color="info.main">{totals.beneficiaries}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Coordinators</Typography>
                  <Typography variant="h6" color="warning.main">{totals.coordinators}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">Active Rate</Typography>
                  <Typography variant="h6" color="success.main">{totals.activeRate}%</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Include Fields */}
          {(reportType === 'detailed' || reportType === 'summary') && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Include Fields
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFields.personalInfo}
                        onChange={() => handleFieldChange('personalInfo')}
                      />
                    }
                    label="Personal Information"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFields.contactInfo}
                        onChange={() => handleFieldChange('contactInfo')}
                      />
                    }
                    label="Contact Information"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFields.locationInfo}
                        onChange={() => handleFieldChange('locationInfo')}
                      />
                    }
                    label="Location Information"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFields.statusInfo}
                        onChange={() => handleFieldChange('statusInfo')}
                      />
                    }
                    label="Status Information"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeFields.verificationInfo}
                        onChange={() => handleFieldChange('verificationInfo')}
                      />
                    }
                    label="Verification Details"
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Format and Date Range */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Export Format</InputLabel>
              <Select value={format} onChange={(e) => setFormat(e.target.value)} label="Export Format">
                <MenuItem value="pdf">
                  <Box display="flex" alignItems="center" gap={1}>
                    <FileText size={16} />
                    PDF Document
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box display="flex" alignItems="center" gap={1}>
                    <FileSpreadsheet size={16} />
                    Excel Spreadsheet
                  </Box>
                </MenuItem>
                <MenuItem value="csv">
                  <Box display="flex" alignItems="center" gap={1}>
                    <FileSpreadsheet size={16} />
                    CSV File
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} label="Date Range">
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="quarter">This Quarter</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Download size={16} />}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Custom Status Badge Component
const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  
  return (
    <Chip
      icon={<IconComponent size={12} />}
      label={config.text}
      size="small"
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}20`,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color
        }
      }}
    />
  );
};

// User Avatar Component
const UserAvatar = ({ user }) => {
  const fullName = `${user.fname || ''} ${user.lname || ''}`.trim();
  const initials = fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        bgcolor: user.role === 'coordinator' ? '#f59e0b' : '#3b82f6',
        fontSize: '0.875rem',
        fontWeight: 600
      }}
    >
      {initials || <User size={20} />}
    </Avatar>
  );
};

const EnhancedBeneficiaryTable = ({
  beneficiaries = [],
  onEdit = null,
  onStatusToggle = null,
  onViewProfile = null,
  onFiltersChange = null,
  onPaginationChange = null,
  filterOptions = { barangays: [], roles: [], statuses: [], genders: [] },
  pagination = { current_page: 1, last_page: 1, per_page: 15, total: 0 },
  loading = false,
  onRefresh = null,
  totals = { total: 0, beneficiaries: 0, coordinators: 0, active: 0, inactive: 0, suspended: 0, activeRate: 0 }
}) => {
  const [localFilters, setLocalFilters] = useState({
    status: '',
    barangay: '',
    sex: '',
    role: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState(null);

  const theme = useTheme();

  const statusOptions = [
    { id: '', name: 'All Status' },
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'suspended', name: 'Suspended' }
  ];

  const roleOptions = [
    { id: '', name: 'All Roles' },
    { id: 'beneficiary', name: 'Beneficiary' },
    { id: 'coordinator', name: 'Coordinator' }
  ];

  const sexOptions = [
    { id: '', name: 'All Genders' },
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' }
  ];

  const barangayOptions = useMemo(() => [
    { id: '', name: 'All Barangays' },
    ...(filterOptions.barangays || []).map(barangay => ({ id: barangay, name: barangay }))
  ], [filterOptions.barangays]);

  const debouncedSearch = useCallback((query) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      onFiltersChange?.({ ...localFilters, search: query });
    }, 500);
    setSearchTimeout(timeout);
  }, [localFilters, onFiltersChange, searchTimeout]);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...localFilters, [filterName]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.({ ...newFilters, search: searchQuery });
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handlePageChange = (_event, newPage) => {
    onPaginationChange?.(newPage + 1, pagination.per_page);
  };

  const handleRowsPerPageChange = (event) => {
    const newPerPage = parseInt(event.target.value, 10);
    onPaginationChange?.(1, newPerPage);
  };

  const handleEditClick = (beneficiary) => onEdit?.(beneficiary);
  const handleStatusToggleClick = (beneficiary) => onStatusToggle?.(beneficiary);
  const handleViewProfileClick = (beneficiary) => onViewProfile?.(beneficiary);

  const buildCsv = (rows, fields) => {
    const header = [
      'Full Name','Username','Email','Role','Barangay','Municipality','Sex','PWD','Verified','Status','Contact','Emergency Contact'
    ];
    const lines = [header.join(',')];
    rows.forEach((b) => {
      const fullName = `${b.fname || ''} ${b.mname || ''} ${b.lname || ''}`.trim();
      const d = b.beneficiary_detail || {};
      const values = [
        fullName,
        b.username || '',
        b.email || '',
        b.role || '',
        d.barangay || '',
        d.municipality || '',
        d.sex || '',
        d.is_pwd ? 'Yes' : 'No',
        b.email_verified_at ? 'Yes' : 'No',
        b.status || '',
        d.contact_number || '',
        d.emergency_contact_number || ''
      ];
      lines.push(values.map((v) => `"${String(v).replace(/"/g,'""')}"`).join(','));
    });
    return lines.join('\n');
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = (config) => {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setReportModalOpen(false);
      if (config.format === 'pdf') {
        setReportConfig({ ...config });
        // Create a new window with the report content for printing
        setTimeout(() => {
          const printWindow = window.open('', '_blank');
          const reportContent = document.getElementById('beneficiary-report');
          if (reportContent) {
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Beneficiary Report - ${config.type}</title>
                  <link rel="stylesheet" href="/static/css/professional-print-styles.css">
                  <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    body { font-family: 'Inter', Arial, sans-serif; }
                  </style>
                </head>
                <body>
                  ${reportContent.innerHTML}
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          }
        }, 100);
      } else {
        // Export CSV for both csv and excel (xlsx not implemented)
        const csv = buildCsv(beneficiaries, config.fields);
        const fname = `beneficiaries_${config.type}_${new Date().toISOString().slice(0,10)}.csv`;
        downloadBlob(csv, fname, 'text/csv;charset=utf-8;');
      }
    }, 500);
  };

  // ===== Helpers for report content =====
  const computeBreakdown = (keyExtractor) => {
    const map = new Map();
    (beneficiaries || []).forEach((b) => {
      const key = keyExtractor(b) || 'N/A';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  };

  const statusBreakdown = computeBreakdown((b) => b.status);
  const roleBreakdown = computeBreakdown((b) => b.role);
  const barangayBreakdown = computeBreakdown((b) => b?.beneficiary_detail?.barangay);
  const genderBreakdown = computeBreakdown((b) => b?.beneficiary_detail?.sex);

  useEffect(() => {
    return () => { if (searchTimeout) clearTimeout(searchTimeout); };
  }, [searchTimeout]);

  return (
    <>
      {/* Print styles and printable report */}
      <style>
        {`
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .non-printable, .MuiDialog-root, header, nav, footer { display: none !important; }
            .beneficiary-printable { display: block !important; padding: 16px; }
            .beneficiary-printable h2 { margin: 0 0 8px 0; }
            .beneficiary-printable .meta { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
            .beneficiary-printable table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .beneficiary-printable th, .beneficiary-printable td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
            .beneficiary-printable th { background: #f3f4f6; }
          }
          @media screen { .beneficiary-printable { display: none; } }
        `}
      </style>
      <Box id="beneficiary-report" className="beneficiary-printable">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <img src="/static/images/logo/logo.png" alt="MAO Logo" style={{ height: 48 }} />
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <h2 style={{ margin: 0 }}>Beneficiary Management Report</h2>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Municipal Agriculture Office - Opol</div>
          </Box>
          <img src="/static/images/logo/opol_logo.png" alt="Opol Logo" style={{ height: 48 }} />
        </Box>
        <h2>Beneficiary Management Report</h2>
        <div className="meta">
          <div><strong>Date:</strong> {new Date().toLocaleString()}</div>
          <div><strong>Report Type:</strong> {reportConfig?.type || 'summary'} | <strong>Date Range:</strong> {reportConfig?.dateRange || 'all'}</div>
          <div><strong>Filters:</strong> Status: {localFilters.status || 'All'}, Role: {localFilters.role || 'All'}, Barangay: {localFilters.barangay || 'All'}, Gender: {localFilters.sex || 'All'}</div>
        </div>

        {/* SUMMARY REPORT */}
        {(!reportConfig || reportConfig?.type === 'summary') && (
          <>
            <table>
              <thead>
                <tr>
                  <th colSpan="4">Key Metrics</th>
                </tr>
                <tr>
                  <th>Total Users</th>
                  <th>Beneficiaries</th>
                  <th>Coordinators</th>
                  <th>Active Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{pagination.total}</td>
                  <td>{(totals?.beneficiaries || 0)}</td>
                  <td>{(totals?.coordinators || 0)}</td>
                  <td>{(totals?.activeRate || 0)}%</td>
                </tr>
              </tbody>
            </table>

            <table style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Breakdown</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>Status</strong></td><td /></tr>
                {statusBreakdown.map(([k, v]) => (<tr key={`st-${k}`}><td>{k}</td><td>{v}</td></tr>))}
                <tr><td><strong>Role</strong></td><td /></tr>
                {roleBreakdown.map(([k, v]) => (<tr key={`rl-${k}`}><td>{k}</td><td>{v}</td></tr>))}
                <tr><td><strong>Gender</strong></td><td /></tr>
                {genderBreakdown.map(([k, v]) => (<tr key={`sx-${k}`}><td>{k}</td><td>{v}</td></tr>))}
                <tr><td><strong>Top Barangays</strong></td><td /></tr>
                {barangayBreakdown.slice(0, 10).map(([k, v]) => (<tr key={`br-${k}`}><td>{k}</td><td>{v}</td></tr>))}
              </tbody>
            </table>
          </>
        )}

        {/* DETAILED REPORT */}
        {reportConfig?.type === 'detailed' && (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                {reportConfig.fields?.personalInfo && <th>Username</th>}
                {reportConfig.fields?.personalInfo && <th>Email</th>}
                <th>Role</th>
                {reportConfig.fields?.locationInfo && <th>Barangay</th>}
                {reportConfig.fields?.locationInfo && <th>Municipality</th>}
                {reportConfig.fields?.personalInfo && <th>Sex</th>}
                {reportConfig.fields?.personalInfo && <th>PWD</th>}
                {reportConfig.fields?.verificationInfo && <th>Verified</th>}
                <th>Status</th>
                {reportConfig.fields?.contactInfo && <th>Contact</th>}
                {reportConfig.fields?.contactInfo && <th>Emergency</th>}
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b, idx) => {
                const d = b.beneficiary_detail || {};
                const fullName = `${b.fname || ''} ${b.mname || ''} ${b.lname || ''}`.trim();
                return (
                  <tr key={b.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{fullName || 'N/A'}</td>
                    {reportConfig.fields?.personalInfo && <td>{b.username || ''}</td>}
                    {reportConfig.fields?.personalInfo && <td>{b.email || ''}</td>}
                    <td>{b.role || ''}</td>
                    {reportConfig.fields?.locationInfo && <td>{d.barangay || ''}</td>}
                    {reportConfig.fields?.locationInfo && <td>{d.municipality || ''}</td>}
                    {reportConfig.fields?.personalInfo && <td>{d.sex || ''}</td>}
                    {reportConfig.fields?.personalInfo && <td>{d.is_pwd ? 'Yes' : 'No'}</td>}
                    {reportConfig.fields?.verificationInfo && <td>{b.email_verified_at ? 'Yes' : 'No'}</td>}
                    <td>{b.status || ''}</td>
                    {reportConfig.fields?.contactInfo && <td>{d.contact_number || ''}</td>}
                    {reportConfig.fields?.contactInfo && <td>{d.emergency_contact_number || ''}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* STATISTICS REPORT */}
        {reportConfig?.type === 'statistics' && (
          <>
            <table>
              <thead>
                <tr><th colSpan="2">Status Breakdown</th></tr>
                <tr><th>Status</th><th>Count</th></tr>
              </thead>
              <tbody>
                {statusBreakdown.map(([k, v]) => (<tr key={`s-${k}`}><td>{k}</td><td>{v}</td></tr>))}
              </tbody>
            </table>
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr><th colSpan="2">Role Breakdown</th></tr>
                <tr><th>Role</th><th>Count</th></tr>
              </thead>
              <tbody>
                {roleBreakdown.map(([k, v]) => (<tr key={`r-${k}`}><td>{k}</td><td>{v}</td></tr>))}
              </tbody>
            </table>
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr><th colSpan="2">Gender Breakdown</th></tr>
                <tr><th>Gender</th><th>Count</th></tr>
              </thead>
              <tbody>
                {genderBreakdown.map(([k, v]) => (<tr key={`g-${k}`}><td>{k}</td><td>{v}</td></tr>))}
              </tbody>
            </table>
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr><th colSpan="2">Top Barangays</th></tr>
                <tr><th>Barangay</th><th>Count</th></tr>
              </thead>
              <tbody>
                {barangayBreakdown.slice(0, 20).map(([k, v]) => (<tr key={`b-${k}`}><td>{k}</td><td>{v}</td></tr>))}
              </tbody>
            </table>
          </>
        )}

        {/* STATUS REPORT */}
        {reportConfig?.type === 'status' && (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Barangay</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map((b, idx) => (
                <tr key={b.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{`${b.fname || ''} ${b.mname || ''} ${b.lname || ''}`.trim() || 'N/A'}</td>
                  <td>{b.role || ''}</td>
                  <td>{b.status || ''}</td>
                  <td>{b?.beneficiary_detail?.barangay || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>

      <Card className="non-printable" elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {/* Enhanced Header Section */}
        <CardHeader
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Users size={28} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
                    User Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manage and monitor all registered users in the system
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<Download size={16} />}
                  onClick={() => setReportModalOpen(true)}
                  size="small"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Generate Report
                </Button>
              </Box>
            </Box>
          }
          sx={{ pb: 2 }}
        />

        {/* Statistics Section */}
        <Box px={3} pb={3}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.100',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {pagination.total.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="primary.dark" fontWeight={500}>
                  Total Users
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: 'info.50',
                  border: '1px solid',
                  borderColor: 'info.100',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {totals.beneficiaries.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="info.dark" fontWeight={500}>
                  Beneficiaries
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: 'warning.50',
                  border: '1px solid',
                  borderColor: 'warning.100',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {totals.coordinators.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="warning.dark" fontWeight={500}>
                  Coordinators
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.100',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {totals.activeRate}%
                </Typography>
                <Typography variant="body2" color="success.dark" fontWeight={500}>
                  Active Rate
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Filters Section */}
        <Box px={3} pb={2}>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ 
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                )
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select 
                value={localFilters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)} 
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select 
                value={localFilters.role} 
                onChange={(e) => handleFilterChange('role', e.target.value)} 
                label="Role"
                sx={{ borderRadius: 2 }}
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Barangay</InputLabel>
              <Select 
                value={localFilters.barangay} 
                onChange={(e) => handleFilterChange('barangay', e.target.value)} 
                label="Barangay"
                sx={{ borderRadius: 2 }}
              >
                {barangayOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select 
                value={localFilters.sex} 
                onChange={(e) => handleFilterChange('sex', e.target.value)} 
                label="Gender"
                sx={{ borderRadius: 2 }}
              >
                {sexOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Refresh Data">
              <IconButton
                onClick={onRefresh}
                disabled={loading}
                size="small"
                sx={{ 
                  color: theme.palette.primary.main, 
                  border: '1px solid',
                  borderColor: theme.palette.primary.main + '40',
                  '&:hover': { 
                    backgroundColor: theme.palette.primary.main + '10'
                  }
                }}
              >
                <RotateCcw size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Divider />

        {loading && <LinearProgress sx={{ height: 3 }} />}

        {/* Table Section */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Contact</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {beneficiaries.length > 0 ? (
                beneficiaries.map((beneficiary, index) => {
                  const fullName = `${beneficiary.fname || ''} ${beneficiary.mname || ''} ${beneficiary.lname || ''}`.trim();
                  const rowNumber = (pagination.current_page - 1) * pagination.per_page + index + 1;

                  return (
                    <TableRow
                      hover
                      key={beneficiary.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: theme.palette.primary.main + '08' 
                        }, 
                        opacity: loading ? 0.6 : 1,
                        borderBottom: '1px solid',
                        borderBottomColor: theme.palette.divider
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {rowNumber}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <UserAvatar user={beneficiary} />
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>
                              {fullName || 'N/A'}
                            </Typography>
                            {beneficiary.username && (
                              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <User size={12} color={theme.palette.text.secondary} />
                                <Typography variant="caption" color="text.secondary">
                                  {beneficiary.username}
                                </Typography>
                              </Box>
                            )}
                            {beneficiary.email && (
                              <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <Mail size={12} color={theme.palette.text.secondary} />
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 180 }}>
                                  {beneficiary.email}
                                </Typography>
                              </Box>
                            )}
                            <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap">
                              {beneficiary.beneficiary_detail?.sex && (
                                <Chip 
                                  label={beneficiary.beneficiary_detail.sex} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    height: '20px',
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.info.main + '10',
                                    borderColor: theme.palette.info.main + '30'
                                  }}
                                />
                              )}
                              {beneficiary.beneficiary_detail?.is_pwd && (
                                <Chip 
                                  label="PWD" 
                                  size="small" 
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    height: '20px',
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.warning.main,
                                    color: 'white'
                                  }}
                                />
                              )}
                              {beneficiary.email_verified_at && (
                                <Chip 
                                  icon={<UserCheck size={10} />}
                                  label="Verified" 
                                  size="small" 
                                  sx={{ 
                                    fontSize: '0.7rem', 
                                    height: '20px',
                                    borderRadius: 1,
                                    backgroundColor: theme.palette.success.main,
                                    color: 'white',
                                    '& .MuiChip-icon': {
                                      color: 'white'
                                    }
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={beneficiary.role ? beneficiary.role.charAt(0).toUpperCase() + beneficiary.role.slice(1) : 'N/A'}
                          size="small"
                          sx={{
                            backgroundColor: beneficiary.role === 'coordinator' 
                              ? theme.palette.warning.main + '20' 
                              : theme.palette.primary.main + '20',
                            color: beneficiary.role === 'coordinator' 
                              ? theme.palette.warning.main 
                              : theme.palette.primary.main,
                            fontWeight: 600,
                            borderRadius: 2
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <MapPin size={16} color={theme.palette.text.secondary} style={{ marginTop: 2 }} />
                          <Box>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 140 }}>
                              {beneficiary.beneficiary_detail?.barangay || 'N/A'}
                            </Typography>
                            {beneficiary.beneficiary_detail?.municipality && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {beneficiary.beneficiary_detail.municipality}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Box>
                          {beneficiary.beneficiary_detail?.contact_number && (
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Phone size={12} color={theme.palette.text.secondary} />
                              <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                                {beneficiary.beneficiary_detail.contact_number}
                              </Typography>
                            </Box>
                          )}
                          {beneficiary.beneficiary_detail?.emergency_contact_number && (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Shield size={12} color={theme.palette.error.main} />
                              <Typography variant="caption" color="error.main" noWrap sx={{ maxWidth: 140 }}>
                                {beneficiary.beneficiary_detail.emergency_contact_number}
                              </Typography>
                            </Box>
                          )}
                          {!beneficiary.beneficiary_detail?.contact_number && (
                            <Typography variant="body2" color="text.disabled">
                              N/A
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <StatusBadge status={beneficiary.status} />
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Profile" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewProfileClick(beneficiary)}
                              disabled={loading}
                              sx={{
                                color: theme.palette.info.main,
                                backgroundColor: theme.palette.info.main + '10',
                                '&:hover': {
                                  backgroundColor: theme.palette.info.main + '20'
                                }
                              }}
                            >
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit User" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(beneficiary)}
                              disabled={loading}
                              sx={{
                                color: theme.palette.primary.main,
                                backgroundColor: theme.palette.primary.main + '10',
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main + '20'
                                }
                              }}
                            >
                              <Edit3 size={16} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip 
                            title={beneficiary.status === 'active' ? 'Deactivate Account' : 'Activate Account'} 
                            arrow
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleStatusToggleClick(beneficiary)}
                              disabled={loading}
                              sx={{
                                color: beneficiary.status === 'active' 
                                  ? theme.palette.error.main 
                                  : theme.palette.success.main,
                                backgroundColor: beneficiary.status === 'active'
                                  ? theme.palette.error.main + '10'
                                  : theme.palette.success.main + '10',
                                '&:hover': {
                                  backgroundColor: beneficiary.status === 'active'
                                    ? theme.palette.error.main + '20'
                                    : theme.palette.success.main + '20'
                                }
                              }}
                            >
                              {beneficiary.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={6}>
                      {loading ? (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <CircularProgress size={32} />
                          <Typography variant="body2" color="text.secondary">
                            Loading users...
                          </Typography>
                        </Box>
                      ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <Users size={48} color={theme.palette.text.disabled} />
                          <Typography variant="h6" color="text.secondary">
                            {pagination.total === 0 ? 'No users found' : 'No users match filters'}
                          </Typography>
                          <Typography variant="body2" color="text.disabled">
                            {pagination.total === 0 
                              ? 'Get started by adding your first user' 
                              : 'Try adjusting your search criteria'
                            }
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Section */}
        {pagination.total > 0 && (
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderTopColor: 'divider' }}>
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.current_page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.per_page}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 15, 25, 50]}
              showFirstButton
              showLastButton
              disabled={loading}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  paddingLeft: 0,
                  paddingRight: 0
                },
                '& .MuiTablePagination-selectLabel': {
                  fontWeight: 500
                },
                '& .MuiTablePagination-displayedRows': {
                  fontWeight: 500
                }
              }}
            />
          </Box>
        )}
      </Card>

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onGenerate={handleGenerateReport}
        totals={totals}
        loading={reportLoading}
      />
    </>
  );
};

export default EnhancedBeneficiaryTable;
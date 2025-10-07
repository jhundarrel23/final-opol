/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { 
  Card, 
  CircularProgress, 
  Box, 
  Typography,
  Alert,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Divider,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import RecentBeneficiaryTable from './RecentBeneficiaryTable';
import axiosInstance from '../../../api/axiosInstance';

function RecentBeneficiary() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user info first to see sector
      const userRes = await axiosInstance.get('api/user');
      
      // Then fetch beneficiaries
      const res = await axiosInstance.get('api/rsbsa/coordinator-beneficiaries/my-beneficiaries');

      // ✅ Enhanced debug information with field checking
      const sampleBeneficiary = res.data?.data?.[0];
      const fieldCheck = sampleBeneficiary ? {
        has_systemGeneratedRsbaNumber: !!sampleBeneficiary.systemGeneratedRsbaNumber,
        has_reference_code: !!sampleBeneficiary.reference_code,
        has_rsbsaNumber: !!sampleBeneficiary.rsbsaNumber,
        has_rsbsa_number: !!sampleBeneficiary.rsbsa_number,
        systemGeneratedRsbaNumber_value: sampleBeneficiary.systemGeneratedRsbaNumber || 'null',
        reference_code_value: sampleBeneficiary.reference_code || 'null',
        rsbsaNumber_value: sampleBeneficiary.rsbsaNumber || 'null',
        rsbsa_number_value: sampleBeneficiary.rsbsa_number || 'null'
      } : null;

      // Store debug information
      setDebugInfo({
        user: {
          id: userRes.data?.id,
          name: `${userRes.data?.fname} ${userRes.data?.lname}`,
          email: userRes.data?.email,
          role: userRes.data?.role,
          sector: userRes.data?.sector?.sector_name || 'Not Assigned',
          sector_id: userRes.data?.sector_id,
        },
        api_response: {
          success: res.data?.success,
          message: res.data?.message,
          total_count: res.data?.total_count,
          data_count: res.data?.data?.length,
          has_statistics: !!res.data?.statistics,
        },
        statistics: res.data?.statistics || null,
        sample_beneficiary: sampleBeneficiary,
        field_check: fieldCheck,
        timestamp: new Date().toLocaleString()
      });

      console.log('=== DEBUG INFO ===');
      console.log('User Sector:', userRes.data?.sector?.sector_name);
      console.log('Sector ID:', userRes.data?.sector_id);
      console.log('API Success:', res.data?.success);
      console.log('Beneficiaries Count:', res.data?.data?.length);
      console.log('Statistics:', res.data?.statistics);
      if (fieldCheck) {
        console.log('Field Check:', fieldCheck);
      }
      console.log('==================');

      if (res.data?.success) {
        setBeneficiaries(res.data.data || []);
        setStatistics(res.data.statistics || null);
      } else {
        setBeneficiaries([]);
        setStatistics(null);
        setError(res.data?.message || 'No beneficiaries found');
      }
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
      setBeneficiaries([]);
      setStatistics(null);
      
      if (err.response?.status === 403) {
        setError('Access denied. Please check your coordinator permissions.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load beneficiaries. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleRefresh = () => {
    fetchBeneficiaries();
  };

  if (loading) {
    return (
      <Card sx={{ p: 4 }}>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight={300}
          gap={2}
        >
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading your assigned beneficiaries...
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      {/* Debug Panel */}
      {debugInfo && (
        <Accordion sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <BugReportIcon color="primary" />
              <Typography variant="h6">Debug Information</Typography>
              <Chip 
                label={`Sector: ${debugInfo.user.sector}`} 
                color="primary" 
                size="small" 
              />
              <Chip 
                label={`Count: ${debugInfo.api_response.data_count}`} 
                color="success" 
                size="small" 
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* User Info */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    👤 USER INFORMATION
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2"><strong>Name:</strong> {debugInfo.user.name}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {debugInfo.user.email}</Typography>
                  <Typography variant="body2"><strong>Role:</strong> {debugInfo.user.role}</Typography>
                  <Typography variant="body2">
                    <strong>Sector:</strong> 
                    <Chip 
                      label={debugInfo.user.sector} 
                      color={debugInfo.user.sector !== 'Not Assigned' ? 'success' : 'error'} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2"><strong>Sector ID:</strong> {debugInfo.user.sector_id || 'N/A'}</Typography>
                </Paper>
              </Grid>

              {/* API Response */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    📡 API RESPONSE
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="body2">
                    <strong>Success:</strong> 
                    <Chip 
                      label={debugInfo.api_response.success ? 'TRUE' : 'FALSE'} 
                      color={debugInfo.api_response.success ? 'success' : 'error'} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2"><strong>Message:</strong> {debugInfo.api_response.message}</Typography>
                  <Typography variant="body2"><strong>Total Count:</strong> {debugInfo.api_response.total_count}</Typography>
                  <Typography variant="body2"><strong>Data Count:</strong> {debugInfo.api_response.data_count}</Typography>
                  <Typography variant="body2">
                    <strong>Has Statistics:</strong> 
                    <Chip 
                      label={debugInfo.api_response.has_statistics ? 'YES' : 'NO'} 
                      color={debugInfo.api_response.has_statistics ? 'success' : 'warning'} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Paper>
              </Grid>

              {/* ✅ NEW: Field Check for Reference Code & RSBSA Number */}
              {debugInfo.field_check && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                      🔍 FIELD NAME CHECK (Reference Code & RSBSA Number)
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" fontWeight="bold" color="primary">Reference Code:</Typography>
                        <Typography variant="body2">
                          • systemGeneratedRsbaNumber: 
                          <Chip 
                            label={debugInfo.field_check.has_systemGeneratedRsbaNumber ? '✓ EXISTS' : '✗ MISSING'} 
                            color={debugInfo.field_check.has_systemGeneratedRsbaNumber ? 'success' : 'error'} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          Value: {debugInfo.field_check.systemGeneratedRsbaNumber_value}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          • reference_code: 
                          <Chip 
                            label={debugInfo.field_check.has_reference_code ? '✓ EXISTS' : '✗ MISSING'} 
                            color={debugInfo.field_check.has_reference_code ? 'success' : 'error'} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          Value: {debugInfo.field_check.reference_code_value}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" fontWeight="bold" color="success.main">RSBSA Number:</Typography>
                        <Typography variant="body2">
                          • rsbsaNumber: 
                          <Chip 
                            label={debugInfo.field_check.has_rsbsaNumber ? '✓ EXISTS' : '✗ MISSING'} 
                            color={debugInfo.field_check.has_rsbsaNumber ? 'success' : 'error'} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          Value: {debugInfo.field_check.rsbsaNumber_value}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          • rsbsa_number: 
                          <Chip 
                            label={debugInfo.field_check.has_rsbsa_number ? '✓ EXISTS' : '✗ MISSING'} 
                            color={debugInfo.field_check.has_rsbsa_number ? 'success' : 'error'} 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 2, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          Value: {debugInfo.field_check.rsbsa_number_value}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        The table checks both field name variations for compatibility. 
                        Ensure your backend returns either <code>systemGeneratedRsbaNumber</code> or <code>reference_code</code> for Reference Code,
                        and either <code>rsbsaNumber</code> or <code>rsbsa_number</code> for RSBSA Number.
                      </Typography>
                    </Alert>
                  </Paper>
                </Grid>
              )}

              {/* Statistics */}
              {debugInfo.statistics && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      📊 SECTOR STATISTICS
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="body2"><strong>Total Beneficiaries:</strong> {debugInfo.statistics.total_beneficiaries}</Typography>
                    <Typography variant="body2"><strong>Total Farm Area:</strong> {debugInfo.statistics.total_farm_area} hectares</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" fontWeight="bold">Sectors:</Typography>
                      {Object.entries(debugInfo.statistics.sectors).map(([key, sector]) => (
                        sector.count > 0 && (
                          <Box key={key} sx={{ ml: 2, mt: 0.5 }}>
                            <Typography variant="body2">
                              <Chip label={sector.label} size="small" sx={{ mr: 1 }} />
                              Count: {sector.count} | 
                              {sector.unit === 'heads' 
                                ? ` ${sector.total_heads} heads` 
                                : ` ${sector.total_area} ha`}
                            </Typography>
                          </Box>
                        )
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Sample Beneficiary */}
              {debugInfo.sample_beneficiary && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      📋 SAMPLE BENEFICIARY DATA (First Record)
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ bgcolor: '#fafafa', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85rem', maxHeight: 400, overflow: 'auto' }}>
                      <pre style={{ margin: 0 }}>
                        {JSON.stringify(debugInfo.sample_beneficiary, null, 2)}
                      </pre>
                    </Box>
                  </Paper>
                </Grid>
              )}

              {/* Timestamp & Refresh */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Last fetched: {debugInfo.timestamp}
                  </Typography>
                  <Button 
                    size="small" 
                    startIcon={<RefreshIcon />} 
                    onClick={handleRefresh}
                    variant="outlined"
                  >
                    Refresh Data
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Error Alert */}
      {error && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {beneficiaries.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              If you believe this is an error, please verify:
              <ul>
                <li>Your sector assignment is properly configured</li>
                <li>Your account has coordinator permissions</li>
                <li>Beneficiaries have been assigned to your sector</li>
              </ul>
            </Typography>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!error && beneficiaries.length === 0 && (
        <Card sx={{ p: 4 }}>
          <Box 
            display="flex" 
            flexDirection="column"
            alignItems="center" 
            gap={2}
          >
            <Alert severity="info" sx={{ width: '100%' }}>
              No beneficiaries assigned yet
            </Alert>
            <Typography variant="body2" color="text.secondary" align="center">
              Beneficiaries matching your sector will appear here once they are assigned to you.
              <br />
              Please check the enrollment list to add beneficiaries.
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefresh}
              sx={{ mt: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Card>
      )}

      {/* Table with Data */}
      {beneficiaries.length > 0 && (
        <RecentBeneficiaryTable 
          beneficiaries={beneficiaries} 
          statistics={statistics}
        />
      )}
    </Box>
  );
}

export default RecentBeneficiary;
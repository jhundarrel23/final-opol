/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Alert,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';

const CoordinatorProgramHistory = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/api/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load program analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const summary = data?.summary || {};
  const ongoing = data?.ongoing_programs_progress || [];
  const recent = data?.recent_distributions || [];

  return (
    <Box>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight={700}>Program Analytics</Typography>
        <Button onClick={fetchDashboard} variant="outlined" size="small">Refresh</Button>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {/* Summary cards */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Total Programs</Typography>
                <TrendingUp size={16} color={theme.palette.text.secondary} />
              </Box>
              <Typography variant="h5" fontWeight={700}>{summary.total_programs || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Ongoing</Typography>
                <Clock size={16} color={theme.palette.info.main} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="info.main">{summary.ongoing_programs || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Completed</Typography>
                <CheckCircle size={16} color={theme.palette.success.main} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="success.main">{summary.completed_programs || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Beneficiaries</Typography>
                <Users size={16} color={theme.palette.primary.main} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="primary.main">{summary.total_beneficiaries || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ongoing programs table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>Ongoing Programs</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Coordinator</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Distributed</TableCell>
                  <TableCell align="right">Pending</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ongoing.length > 0 ? ongoing.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.creator || '—'}</TableCell>
                    <TableCell>{p.start_date} - {p.end_date}</TableCell>
                    <TableCell align="right">{p.progress?.total_items || 0}</TableCell>
                    <TableCell align="right">{p.progress?.distributed_items || 0}</TableCell>
                    <TableCell align="right">{p.progress ? (p.progress.total_items - p.progress.distributed_items) : 0}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">No ongoing programs.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent distributions */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={1}>Recent Distributions</Typography>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Beneficiary</TableCell>
                  <TableCell>Barangay</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.length > 0 ? recent.map((r, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{new Date(r.released_at).toLocaleString()}</TableCell>
                    <TableCell>{r.program_title}</TableCell>
                    <TableCell>{r.beneficiary_name}</TableCell>
                    <TableCell>{r.barangay}</TableCell>
                    <TableCell>{r.item_name}</TableCell>
                    <TableCell align="right">{r.quantity}</TableCell>
                    <TableCell align="right">₱{Number(r.total_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">No recent distributions.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CoordinatorProgramHistory;



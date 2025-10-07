import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Box,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { 
  Eye, 
  Calendar,
  MapPin,
  Package,
  Users,
  Boxes,
  Search,
  FileText
} from 'lucide-react';

const ServiceEventHistoryTable = ({ events, onView, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter events based on search
  const filteredEvents = events.filter(event => {
    const searchLower = searchQuery.toLowerCase();
    return (
      event.catalog?.name?.toLowerCase().includes(searchLower) ||
      event.barangay?.toLowerCase().includes(searchLower) ||
      event.status?.toLowerCase().includes(searchLower)
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const paginatedEvents = filteredEvents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (events.length === 0 && !loading) {
    return (
      <Box p={4} textAlign="center">
        <FileText size={48} color="#ccc" style={{ marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Event History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed and cancelled events will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <Box p={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="Search event history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
          <Typography variant="body2" color="text.secondary">
            Total: {filteredEvents.length} events
          </Typography>
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Package size={16} />
                  <span>Service</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MapPin size={16} />
                  <span>Barangay</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Calendar size={16} />
                  <span>Date</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  <Users size={16} />
                  <span>Beneficiaries</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  <Boxes size={16} />
                  <span>Items</span>
                </Stack>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow key={event.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {event.catalog?.name || 'N/A'}
                  </Typography>
                  {event.catalog?.sector && (
                    <Typography variant="caption" color="text.secondary">
                      {event.catalog.sector.sector_name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {event.barangay}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(event.service_date)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {formatDate(event.updated_at)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={event.beneficiaries?.length || 0}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={event.stocks?.length || 0}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={event.status || 'completed'}
                    size="small"
                    color={getStatusColor(event.status)}
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {event.remarks || 'No remarks'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small" 
                      onClick={() => onView?.(event)}
                      sx={{ color: '#1976d2' }}
                    >
                      <Eye size={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredEvents.length === 0 && searchQuery && (
        <Box p={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            No events found matching "{searchQuery}"
          </Typography>
        </Box>
      )}

      <TablePagination
        component="div"
        count={filteredEvents.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
};

export default ServiceEventHistoryTable;

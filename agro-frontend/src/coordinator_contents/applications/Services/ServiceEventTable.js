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
  Edit3, 
  Trash2, 
  CheckCircle, 
  Calendar,
  MapPin,
  Package,
  Users,
  Boxes,
  Search
} from 'lucide-react';

const ServiceEventTable = ({ 
  events, 
  onEdit, 
  onDelete, 
  onView, 
  onComplete,
  loading 
}) => {
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
        <Calendar size={48} color="#ccc" style={{ marginBottom: 16 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Active Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first service event to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <Box p={2}>
        <TextField
          placeholder="Search by service, barangay, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
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
                  {event.catalog?.unit && (
                    <Typography variant="caption" color="text.secondary">
                      Unit: {event.catalog.unit}
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
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={event.beneficiaries?.length || 0}
                    size="small"
                    color={event.beneficiaries?.length > 0 ? 'primary' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={event.stocks?.length || 0}
                    size="small"
                    color={event.stocks?.length > 0 ? 'secondary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={event.status || 'pending'}
                    size="small"
                    color={getStatusColor(event.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={() => onView?.(event)}
                        sx={{ color: '#1976d2' }}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    
                    {event.status !== 'completed' && (
                      <>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => onEdit?.(event)}
                            sx={{ color: '#ed6c02' }}
                          >
                            <Edit3 size={18} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Complete">
                          <IconButton 
                            size="small" 
                            onClick={() => onComplete?.(event)}
                            sx={{ color: '#2e7d32' }}
                          >
                            <CheckCircle size={18} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => onDelete?.(event)}
                            sx={{ color: '#d32f2f' }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
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

export default ServiceEventTable;

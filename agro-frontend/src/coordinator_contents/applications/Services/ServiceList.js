import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Card, 
  CircularProgress, 
  Box, 
  Typography,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { useServiceEvents } from './useServiceManagement';
import ServiceEventTable from './ServiceEventTable';
import ServiceEventHistoryTable from './ServiceEventHistoryTable';
import ServiceDetailsModal from './ServiceDetailsModal';

const ServiceList = forwardRef(({ onOperation }, ref) => {
  const [activeTab, setActiveTab] = useState('active');
  const [viewEvent, setViewEvent] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const { data: events, loading, error, refresh } = useServiceEvents();

  // Filter events based on active tab
  useEffect(() => {
    if (events && events.length > 0) {
      if (activeTab === 'active') {
        // Active events: pending, ongoing, or scheduled
        setFilteredEvents(events.filter(e => 
          ['pending', 'ongoing', 'scheduled'].includes(e.status?.toLowerCase())
        ));
      } else if (activeTab === 'history') {
        // History: completed or cancelled
        setFilteredEvents(events.filter(e => 
          ['completed', 'cancelled'].includes(e.status?.toLowerCase())
        ));
      }
    } else {
      setFilteredEvents([]);
    }
  }, [events, activeTab]);

  useImperativeHandle(ref, () => ({
    refreshEvents: refresh
  }));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleView = (event) => {
    setViewEvent(event);
  };

  const handleEdit = (event) => {
    if (event.status === 'completed') {
      onOperation?.('Cannot edit completed events', 'warning');
      return;
    }
    
    console.log('Edit event:', event);
    onOperation?.('Edit functionality available in event details', 'info');
    setViewEvent(event);
  };

  const handleComplete = async (event) => {
    if (event.status !== 'ongoing' && event.status !== 'pending') {
      onOperation?.('Only ongoing or pending events can be completed', 'warning');
      return;
    }

    const confirmMessage = `Are you sure you want to complete "${event.catalog?.name}" at ${event.barangay}?\n\nThis will mark the event as completed.\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Update event status to completed
      const axiosInstance = (await import('../../../api/axiosInstance')).default;
      await axiosInstance.put(`/api/service-events/${event.id}`, {
        status: 'completed'
      });
      onOperation?.(`Service event completed successfully`, 'success');
      refresh();
    } catch (error) {
      console.error('Error completing event:', error);
      onOperation?.(error.response?.data?.message || 'Failed to complete event', 'error');
    }
  };

  const handleDelete = async (event) => {
    if (event.status === 'completed') {
      onOperation?.('Cannot delete completed events', 'warning');
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${event.catalog?.name}" at ${event.barangay}?\n\nThis action cannot be undone and will remove all associated beneficiaries and inventory items.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const axiosInstance = (await import('../../../api/axiosInstance')).default;
      await axiosInstance.delete(`/api/service-events/${event.id}`);
      onOperation?.(`Service event deleted successfully`, 'success');
      refresh();
    } catch (error) {
      console.error('Error deleting event:', error);
      onOperation?.(error.response?.data?.message || 'Failed to delete event', 'error');
    }
  };

  const handleCloseModal = () => {
    setViewEvent(null);
  };

  const isHistoryView = activeTab === 'history';

  return (
    <>
      <Card>
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="service events tabs"
          >
            <Tab 
              label="Active Events" 
              value="active"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              label="Event History" 
              value="history"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading {activeTab === 'active' ? 'active events' : 'event history'}...
            </Typography>
          </Box>
        ) : error ? (
          <Box p={3} textAlign="center">
            <Typography color="error" variant="h6" gutterBottom>
              Error Loading Events
            </Typography>
            <Typography color="text.secondary" paragraph>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={refresh}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : isHistoryView ? (
          <ServiceEventHistoryTable 
            events={filteredEvents}
            onView={handleView}
            loading={loading}
          />
        ) : (
          <ServiceEventTable 
            events={filteredEvents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onComplete={handleComplete}
            loading={loading}
          />
        )}
      </Card>

      <ServiceDetailsModal
        open={!!viewEvent}
        onClose={handleCloseModal}
        event={viewEvent}
        onComplete={handleComplete}
        onRefresh={refresh}
        isHistoryView={isHistoryView}
        onOperation={onOperation}
      />
    </>
  );
});

ServiceList.displayName = 'ServiceList';

export default ServiceList;

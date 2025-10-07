/* eslint-disable no-alert */
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
import axiosInstance from '../../../api/axiosInstance';
import ProgramTable from './ProgramTable';
import ProgramDetailsModal from './ProgramDetailsModal';
import GeneralDistributions from './GeneralDistributions';
import ProgramHistoryTable from './ProgramHistoryTable';

const ProgramList = forwardRef(({ onOperation }, ref) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });

  const [viewProgram, setViewProgram] = useState(null);
  
  // Tab state: 'active', 'distributions', or 'history'
  const [activeTab, setActiveTab] = useState('active');

  // Determine filter status based on active tab
  const getFilterStatus = () => {
    if (activeTab === 'active') {
      return ['pending', 'ongoing'];
    }
    if (activeTab === 'history') {
      return ['completed', 'cancelled'];
    }
    return null; // For distributions tab
  };

  const isHistoryView = activeTab === 'history';

  const fetchPrograms = async (page = 1, perPage = 10, filters = {}) => {
    // Don't fetch programs when on distributions tab
    if (activeTab === 'distributions') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...filters
      });

      // Use different endpoints based on tab
      let endpoint;
      if (activeTab === 'history') {
        // Use the dedicated history endpoint
        endpoint = `/api/subsidy-programs/history?${params}`;
        console.log('Fetching program history from:', endpoint);
      } else {
        // Use the main endpoint for active programs
        const filterStatus = getFilterStatus();
        if (filterStatus && filterStatus.length > 0) {
          params.append('status', filterStatus.join(','));
          console.log('Fetching active programs with status filter:', filterStatus);
        }
        endpoint = `/api/subsidy-programs?${params}`;
        console.log('Fetching active programs from:', endpoint);
      }

      const response = await axiosInstance.get(endpoint);
      
      let programsData = response.data.data || response.data;
      console.log('Programs received:', programsData);
      console.log('Program statuses:', programsData.map(p => ({ id: p.id, title: p.title, status: p.status })));
      
      setPrograms(programsData);
      
      if (response.data.data) {
        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total
        });
      }
      
    } catch (err) {
      console.error('Error fetching programs:', err);
      
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError('Unauthorized access. Please login again.');
        } else if (status === 403) {
          setError('Access forbidden. You do not have permission to view programs.');
        } else if (status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response.data?.message || `Server responded with status ${status}`);
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred while fetching programs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [activeTab]);

  useImperativeHandle(ref, () => ({
    refreshPrograms: () => fetchPrograms(pagination.current_page, pagination.per_page)
  }));

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleView = (program) => {
    setViewProgram(program);
  };

  const handleEdit = (program) => {
    if (program.approval_status === 'approved') {
      onOperation?.('Cannot edit approved programs', 'warning');
      return;
    }
    
    console.log('Edit program:', program);
    onOperation?.('Edit functionality not implemented yet', 'info');
  };

  const handleComplete = async (program) => {
    if (program.status !== 'ongoing') {
      onOperation?.('Only ongoing programs can be completed', 'warning');
      return;
    }

    const confirmMessage = `Are you sure you want to complete the program "${program.title}"?\n\nThis will:\n- Mark the program as completed\n- Distribute items from inventory\n- Move the program to history\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(`/api/subsidy-programs/${program.id}/complete`);
      onOperation?.(`Program "${program.title}" completed successfully`, 'success');
      await fetchPrograms(pagination.current_page, pagination.per_page);
    } catch (error) {
      console.error('Error completing program:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          onOperation?.(error.response.data?.error || 'Program cannot be completed', 'error');
        } else if (status === 404) {
          onOperation?.('Program not found', 'error');
        } else {
          onOperation?.(error.response.data?.message || 'Failed to complete program', 'error');
        }
      } else {
        onOperation?.('Network error while completing program', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (program) => {
    if (program.approval_status === 'approved') {
      onOperation?.('Cannot delete approved programs', 'warning');
      return;
    }

    const confirmMessage = `Are you sure you want to delete the program "${program.title}"?\n\nThis action cannot be undone and will remove all associated beneficiaries and items.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/api/subsidy-programs/${program.id}`);
      onOperation?.(`Program "${program.title}" deleted successfully`, 'success');
      await fetchPrograms(pagination.current_page, pagination.per_page);
    } catch (error) {
      console.error('Error deleting program:', error);
      
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          onOperation?.('Program not found or already deleted', 'error');
        } else if (status === 403) {
          onOperation?.('You do not have permission to delete this program', 'error');
        } else if (status === 409) {
          onOperation?.('Cannot delete program due to existing dependencies', 'error');
        } else {
          onOperation?.(error.response.data?.message || 'Failed to delete program', 'error');
        }
      } else {
        onOperation?.('Network error while deleting program', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchPrograms(newPage + 1, pagination.per_page);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    fetchPrograms(1, newRowsPerPage);
  };

  const handleFiltersChange = (filters) => {
    fetchPrograms(1, pagination.per_page, filters);
  };

  const handleCloseModal = () => {
    setViewProgram(null);
  };

  return (
    <>
      <Card>
        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="program management tabs"
          >
            <Tab 
              label="Active Programs" 
              value="active"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              label="Walk-in Distributions" 
              value="distributions"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              label="Program History" 
              value="history"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 'distributions' ? (
          // Show GeneralDistributions component
          <GeneralDistributions onOperation={onOperation} />
        ) : (
          // Show Programs Table (Active or History)
          <>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading {activeTab === 'active' ? 'active programs' : 'program history'}...
                </Typography>
              </Box>
            ) : error ? (
              <Box p={3} textAlign="center">
                <Typography color="error" variant="h6" gutterBottom>
                  Error Loading Programs
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {error}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => fetchPrograms()}
                  sx={{ mt: 2 }}
                >
                  Retry
                </Button>
              </Box>
            ) : isHistoryView ? (
              <ProgramHistoryTable 
                programs={programs}
                onView={handleView}
                pagination={pagination}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            ) : (
              <ProgramTable 
                programs={programs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onComplete={handleComplete}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onFiltersChange={handleFiltersChange}
                pagination={pagination}
                loading={loading}
                isHistoryView={isHistoryView}
              />
            )}
          </>
        )}
      </Card>

      <ProgramDetailsModal
        open={!!viewProgram}
        onClose={handleCloseModal}
        program={viewProgram}
        onComplete={handleComplete}
        onRefresh={() => fetchPrograms(pagination.current_page, pagination.per_page)}
        isHistoryView={isHistoryView}
      />
    </>
  );
});

ProgramList.displayName = 'ProgramList';

export default ProgramList;
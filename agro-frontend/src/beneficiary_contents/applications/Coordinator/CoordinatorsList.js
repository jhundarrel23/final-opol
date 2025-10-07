import { useState, useEffect } from 'react';
import { Card, CircularProgress, Box, Typography } from '@mui/material';
import axiosInstance from '../../../api/axiosInstance'; // adjust path as needed
import RecentCoordinatorTable from './RecentCoordinatorTable';

function CoordinatorList() {
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const response = await axiosInstance.get('/api/coordinators');
        setCoordinators(response.data.data); // ✅ Only the coordinators array
      } catch (err) {
        console.error('Error fetching coordinators:', {
          message: err.message,
          code: err.code,
          response: err.response,
          config: err.config,
        });

        if (err.response) {
          setError(`Server responded with status ${err.response.status}`);
        } else if (err.request) {
          setError('No response received from server');
        } else {
          setError('Error setting up the request');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinators();
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <RecentCoordinatorTable coordinators={coordinators} />
      )}
    </Card>
  );
}

export default CoordinatorList;

import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card } from '@mui/material';
import RecentSectorTable from './RecentSectorTable';

function RecentOrders() {
  const [sectors, setSectors] = useState([]);

  const fetchSectors = async () => {
    try {
      const response = await axiosInstance.get('/api/sectors');
      // ✅ Remove filtering — include all sectors regardless of status
      setSectors(response.data);
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  return (
    <Card>
      <RecentSectorTable sectors={sectors} fetchSectors={fetchSectors} />
    </Card>
  );
}

export default RecentOrders;

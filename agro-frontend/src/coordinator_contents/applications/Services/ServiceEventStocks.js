import React from 'react';
import { Typography, Box } from '@mui/material';
import { Boxes } from 'lucide-react';

const ServiceEventStocks = React.forwardRef(({ onOperation }, ref) => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Boxes size={32} />
        <Typography variant="h6" fontWeight={600}>Event Inventory</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">Manage linked inventory across events (coming soon).</Typography>
    </Box>
  );
});

ServiceEventStocks.displayName = 'ServiceEventStocks';
export default ServiceEventStocks;
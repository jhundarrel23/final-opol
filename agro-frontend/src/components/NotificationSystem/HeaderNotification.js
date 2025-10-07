import React from 'react';
import { Box, Tooltip } from '@mui/material';
import NotificationBell from './NotificationBell';

const HeaderNotification = () => {
  console.log('HeaderNotification: Rendering notification component');
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title="Notifications">
        <NotificationBell />
      </Tooltip>
    </Box>
  );
};

export default HeaderNotification;

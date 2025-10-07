import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useNotifications } from '../../contexts/NotificationContext';
import HeaderNotification from './HeaderNotification';

const NotificationTest = () => {
  const { addNotification, unreadCount, notifications } = useNotifications();

  const handleAddTestNotification = () => {
    addNotification({
      type: 'beneficiary_update',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system works',
      priority: 'high'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Notification System Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Current unread count: <strong>{unreadCount}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total notifications: {notifications.length}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <HeaderNotification />
      </Box>

      <Button 
        variant="contained" 
        onClick={handleAddTestNotification}
        sx={{ mr: 2 }}
      >
        Add Test Notification
      </Button>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Click the bell icon above to see notifications, or click the button to add a test notification.
      </Typography>
    </Box>
  );
};

export default NotificationTest;

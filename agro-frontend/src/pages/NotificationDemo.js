/* eslint-disable no-unused-vars */
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { NotificationProvider } from '../contexts/NotificationContext';
import HeaderNotification from '../components/NotificationSystem/HeaderNotification';

const NotificationDemo = () => {
  return (
    <NotificationProvider userRole="coordinator">
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Notification System Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This demo shows how the notification system works for coordinators and admins.
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Click the bell icon to see notifications:</Typography>
            <HeaderNotification />
          </Stack>
        </Paper>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Features:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                🔔 <strong>Real-time notifications</strong> - Get notified of new interview requests, beneficiary updates, and program alerts
              </Typography>
              <Typography variant="body2">
                📱 <strong>Smart routing</strong> - Click notifications to navigate directly to relevant pages
              </Typography>
              <Typography variant="body2">
                👥 <strong>Role-based</strong> - Different notifications for coordinators vs admins
              </Typography>
              <Typography variant="body2">
                🎨 <strong>Priority system</strong> - Color-coded notifications by importance
              </Typography>
              <Typography variant="body2">
                ⏰ <strong>Auto-refresh</strong> - Notifications update every 30 seconds
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Integration Steps:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                1. Wrap your app with <code>NotificationProvider</code>
              </Typography>
              <Typography variant="body2">
                2. Add <code>HeaderNotification</code> to your header/layout
              </Typography>
              <Typography variant="body2">
                3. Configure user role (coordinator/admin)
              </Typography>
              <Typography variant="body2">
                4. Set up backend API endpoints for notifications
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </NotificationProvider>
  );
};

export default NotificationDemo;

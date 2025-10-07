/* eslint-disable no-undef */
import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Stack
} from '@mui/material';
import {
  Bell,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import notificationService from '../../services/notificationService';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    formatTimestamp
  } = useNotifications();

  // Production ready - console logs removed

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (notification.unread) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    const routes = notificationService.getNotificationRoutes();
    const route = routes[notification.type];
    
    if (route) {
      navigate(route);
    }
    
    // Auto-remove action notifications after clicking (they're no longer needed)
    const actionTypes = ['program_approval', 'enrollment_approved', 'coordinator_registration', 'beneficiary_assigned'];
    if (actionTypes.includes(notification.type)) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 3000); // Remove after 3 seconds
    }
    
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    const style = notificationService.getNotificationStyle(type);
    const iconProps = { size: 20, color: style.color };
    
    switch (style.icon) {
      case 'Calendar':
        return <Calendar {...iconProps} />;
      case 'Users':
        return <Users {...iconProps} />;
      case 'AlertTriangle':
        return <AlertTriangle {...iconProps} />;
      case 'CheckCircle':
        return <CheckCircle {...iconProps} />;
      case 'Settings':
        return <Settings {...iconProps} />;
      case 'UserPlus':
        return <UserPlus {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#333333',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: '#000000'
          },
          '& svg': {
            color: 'inherit'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Bell size={24} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead} sx={{ fontSize: '0.75rem' }}>
                Mark all as read
              </Button>
            )}
            {/* Debug button removed - notification system is production ready */}
          </Stack>

          <Divider sx={{ mb: 1 }} />

          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Bell size={48} color="#ccc" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      backgroundColor: notification.unread ? '#f5f5f5' : 'transparent',
                      '&:hover': {
                        backgroundColor: notification.unread ? '#eeeeee' : '#f9f9f9'
                      },
                      cursor: 'pointer'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="body2" fontWeight={notification.unread ? 600 : 400}>
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.priority}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.65rem',
                              backgroundColor: getPriorityColor(notification.priority),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {formatTimestamp(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    {notification.unread && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#2196F3',
                          ml: 1
                        }}
                      />
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;

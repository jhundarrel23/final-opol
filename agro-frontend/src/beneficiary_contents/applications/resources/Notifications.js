import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ClearAllIcon from '@mui/icons-material/ClearAll';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(3),
  boxShadow: theme.shadows[10],
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  backgroundColor: read ? 'transparent' : theme.palette.action.hover,
  borderLeft: read ? 'none' : `4px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

// Mock notification data
const mockNotifications = [
  {
    id: 'NOT-001',
    type: 'payment',
    title: 'Payment Received',
    message: 'Your fertilizer subsidy payment of ₱5,000 has been processed and transferred to your account.',
    date: '2024-03-15T10:30:00Z',
    read: false,
    priority: 'high',
    category: 'Payment',
    actionUrl: '/beneficiary/programs/my-benefits',
    sender: 'OPOL Agricultural Office'
  },
  {
    id: 'NOT-002',
    type: 'application',
    title: 'Application Approved',
    message: 'Your application for High-Quality Seed Distribution has been approved! You can now proceed to claim your seeds.',
    date: '2024-03-14T14:20:00Z',
    read: false,
    priority: 'high',
    category: 'Application Status',
    actionUrl: '/beneficiary/applications/my-applications',
    sender: 'Coordinator Maria Cruz'
  },
  {
    id: 'NOT-003',
    type: 'reminder',
    title: 'Training Session Reminder',
    message: 'Your agricultural training session "Modern Farming Techniques" is scheduled for tomorrow at 9:00 AM.',
    date: '2024-03-13T16:45:00Z',
    read: true,
    priority: 'medium',
    category: 'Training',
    actionUrl: '/beneficiary/resources/training',
    sender: 'Training Department'
  },
  {
    id: 'NOT-004',
    type: 'deadline',
    title: 'Application Deadline Approaching',
    message: 'The deadline for Farm Equipment Assistance Program is in 3 days. Submit your application now!',
    date: '2024-03-12T09:15:00Z',
    read: true,
    priority: 'medium',
    category: 'Deadline',
    actionUrl: '/beneficiary/programs/available',
    sender: 'System'
  },
  {
    id: 'NOT-005',
    type: 'info',
    title: 'New Program Available',
    message: 'Irrigation Support Program is now accepting applications. Check if you qualify for up to ₱25,000 assistance.',
    date: '2024-03-11T11:30:00Z',
    read: true,
    priority: 'low',
    category: 'Program Update',
    actionUrl: '/beneficiary/programs/available',
    sender: 'OPOL Agricultural Office'
  },
  {
    id: 'NOT-006',
    type: 'document',
    title: 'Document Verification Required',
    message: 'Your submitted documents for Crop Insurance Program require additional verification. Please provide updated farm ownership certificate.',
    date: '2024-03-10T13:20:00Z',
    read: true,
    priority: 'high',
    category: 'Document',
    actionUrl: '/beneficiary/applications/my-applications',
    sender: 'Verification Team'
  },
  {
    id: 'NOT-007',
    type: 'system',
    title: 'System Maintenance Notice',
    message: 'The system will undergo maintenance on March 20, 2024, from 2:00 AM to 6:00 AM. Services will be temporarily unavailable.',
    date: '2024-03-09T08:00:00Z',
    read: true,
    priority: 'low',
    category: 'System',
    actionUrl: null,
    sender: 'System Administrator'
  }
];

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`notification-tabpanel-${index}`}
    aria-labelledby={`notification-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotificationForMenu, setSelectedNotificationForMenu] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNotifications(mockNotifications);
        setFilteredNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    switch (tabValue) {
      case 0: // All
        filtered = notifications;
        break;
      case 1: // Unread
        filtered = notifications.filter(n => !n.read);
        break;
      case 2: // Important
        filtered = notifications.filter(n => n.priority === 'high');
        break;
      default:
        filtered = notifications;
    }

    setFilteredNotifications(filtered);
  }, [notifications, tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    
    // Mark as read when viewing
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotificationForMenu(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotificationForMenu(null);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAsUnread = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: false } : n
      )
    );
    handleMenuClose();
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    handleMenuClose();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      sx: {
        color: priority === 'high' ? 'error.main' : 
               priority === 'medium' ? 'warning.main' : 'info.main'
      }
    };

    switch (type) {
      case 'payment':
        return <MoneyIcon {...iconProps} />;
      case 'application':
        return <CheckCircleIcon {...iconProps} />;
      case 'reminder':
        return <EventIcon {...iconProps} />;
      case 'deadline':
        return <WarningIcon {...iconProps} />;
      case 'document':
        return <InfoIcon {...iconProps} />;
      case 'system':
        return <InfoIcon {...iconProps} />;
      default:
        return <NotificationsIcon {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const important = notifications.filter(n => n.priority === 'high').length;
    const today = notifications.filter(n => {
      const notifDate = new Date(n.date);
      const today = new Date();
      return notifDate.toDateString() === today.toDateString();
    }).length;

    return { total, unread, important, today };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <StyledCard>
          <CardContent>
            <LinearProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading notifications...</Typography>
          </CardContent>
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledCard>
        <CardHeader
          avatar={
            <Badge badgeContent={stats.unread} color="error">
              <NotificationsActiveIcon />
            </Badge>
          }
          title="Notifications"
          subheader="Stay updated with your applications, payments, and important announcements"
          action={
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
            >
              Mark All Read
            </Button>
          }
        />
        <CardContent>
          {/* Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <StatsCard>
                <Typography variant="h4" color="primary">{stats.total}</Typography>
                <Typography variant="caption">Total</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard>
                <Typography variant="h4" color="error">{stats.unread}</Typography>
                <Typography variant="caption">Unread</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard>
                <Typography variant="h4" color="warning">{stats.important}</Typography>
                <Typography variant="caption">Important</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard>
                <Typography variant="h4" color="info">{stats.today}</Typography>
                <Typography variant="caption">Today</Typography>
              </StatsCard>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`All (${stats.total})`} />
              <Tab label={`Unread (${stats.unread})`} />
              <Tab label={`Important (${stats.important})`} />
            </Tabs>
          </Box>

          {/* Notifications List */}
          <TabPanel value={tabValue} index={tabValue}>
            {filteredNotifications.length === 0 ? (
              <Alert severity="info">
                {tabValue === 1 ? 'No unread notifications.' : 
                 tabValue === 2 ? 'No important notifications.' : 
                 'No notifications available.'}
              </Alert>
            ) : (
              <List>
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    read={notification.read}
                    button
                    onClick={() => handleViewDetails(notification)}
                  >
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'transparent' }}>
                        {getNotificationIcon(notification.type, notification.priority)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'bold',
                              flex: 1 
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.category}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority)}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontWeight: notification.read ? 'normal' : 'medium',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.date).toLocaleDateString()} • {notification.sender}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, notification);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </NotificationItem>
                ))}
              </List>
            )}
          </TabPanel>
        </CardContent>
      </StyledCard>

      {/* Notification Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedNotification && getNotificationIcon(selectedNotification.type, selectedNotification.priority)}
            {selectedNotification?.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="body1" paragraph>
                {selectedNotification.message}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body2">{selectedNotification.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Priority</Typography>
                  <Chip
                    label={selectedNotification.priority}
                    size="small"
                    color={getPriorityColor(selectedNotification.priority)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Date & Time</Typography>
                  <Typography variant="body2">
                    {new Date(selectedNotification.date).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">From</Typography>
                  <Typography variant="body2">{selectedNotification.sender}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedNotification?.actionUrl && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                window.location.href = selectedNotification.actionUrl;
              }}
            >
              Take Action
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => markAsUnread(selectedNotificationForMenu?.id)}>
          <MarkAsUnreadIcon sx={{ mr: 1 }} />
          Mark as Unread
        </MenuItem>
        <MenuItem onClick={() => deleteNotification(selectedNotificationForMenu?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Notifications;
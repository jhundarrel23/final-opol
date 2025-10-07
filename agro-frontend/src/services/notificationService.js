import axiosInstance from '../api/axiosInstance';

// Get notifications for current user
const getNotifications = async (userRole) => {
  try {
    const response = await axiosInstance.get(`/notifications?role=${userRole}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.patch('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Create new notification
const createNotification = async (notificationData) => {
  try {
    const response = await axiosInstance.post('/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get notification count
const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Subscribe to real-time notifications (WebSocket)
const subscribeToNotifications = (callback) => {
  // This would be implemented with WebSocket or Server-Sent Events
  // For now, we'll use polling
  const interval = setInterval(async () => {
    try {
      const count = await getUnreadCount();
      callback(count);
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }, 120000); // Poll every 2 minutes

  return () => clearInterval(interval);
};

// Notification types and their routing (based on actual router.js)
const getNotificationRoutes = () => {
  return {
    // Interview notifications - redirect to coordinator interviews page
    interview_request: '/coordinator/interviews',
    interview_completed: '/coordinator/interviews',
    
    // Beneficiary notifications - redirect to coordinator beneficiary list
    beneficiary_update: '/coordinator/Beneficiary-list',
    beneficiary_available: '/coordinator/Beneficiary-list',
    beneficiary_assigned: '/coordinator/Beneficiary-list',
    
    // Program notifications - redirect to coordinator program management
    program_alert: '/coordinator/program-management',
    program_created: '/coordinator/program-management',
    
    // Admin notifications - redirect to admin pages (using actual router paths)
    system_update: '/dashboards/Admin',
    user_registration: '/management/Coordinator',
    program_approval: '/management/Program',
    program_submitted: '/management/Program',
    enrollment_pending: '/management/enrollement-beneficary-management',
    enrollment_approved: '/management/enrollement-beneficary-management',
    coordinator_registration: '/management/Coordinator'
  };
};

// Get notification icon and color
const getNotificationStyle = (type) => {
  const styles = {
    interview_request: {
      icon: 'Calendar',
      color: '#2196F3',
      priority: 'high'
    },
    interview_completed: {
      icon: 'CheckCircle',
      color: '#4CAF50',
      priority: 'medium'
    },
    beneficiary_update: {
      icon: 'Users',
      color: '#4CAF50',
      priority: 'medium'
    },
    beneficiary_available: {
      icon: 'Users',
      color: '#2196F3',
      priority: 'medium'
    },
    beneficiary_assigned: {
      icon: 'CheckCircle',
      color: '#4CAF50',
      priority: 'medium'
    },
    program_alert: {
      icon: 'AlertTriangle',
      color: '#FF9800',
      priority: 'high'
    },
    program_created: {
      icon: 'CheckCircle',
      color: '#4CAF50',
      priority: 'medium'
    },
    system_update: {
      icon: 'Settings',
      color: '#9E9E9E',
      priority: 'low'
    },
    user_registration: {
      icon: 'UserPlus',
      color: '#9C27B0',
      priority: 'medium'
    },
    program_approval: {
      icon: 'CheckCircle',
      color: '#FF5722',
      priority: 'high'
    },
    // Admin notification styles
    program_submitted: {
      icon: 'AlertTriangle',
      color: '#FF9800',
      priority: 'high'
    },
    enrollment_pending: {
      icon: 'Users',
      color: '#2196F3',
      priority: 'high'
    },
    enrollment_approved: {
      icon: 'CheckCircle',
      color: '#4CAF50',
      priority: 'medium'
    },
    coordinator_registration: {
      icon: 'UserPlus',
      color: '#9C27B0',
      priority: 'medium'
    }
  };

  return styles[type] || {
    icon: 'Bell',
    color: '#666',
    priority: 'medium'
  };
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getUnreadCount,
  subscribeToNotifications,
  getNotificationRoutes,
  getNotificationStyle
};

export default notificationService;

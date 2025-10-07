import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, userRole = 'coordinator' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications based on user type
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          const notifications = data.data.map(notification => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
          
          // Notifications fetched from API
          setNotifications(notifications);
          setUnreadCount(notifications.filter(n => n.unread).length);
          
      // Save to both localStorage and sessionStorage for better persistence
      localStorage.setItem(`notifications_${userRole}`, JSON.stringify(notifications));
      sessionStorage.setItem(`notifications_${userRole}`, JSON.stringify(notifications));
      
      // Save timestamp for cleanup
      localStorage.setItem(`notifications_${userRole}_timestamp`, Date.now().toString());
        } else {
          throw new Error('API returned non-JSON response');
        }
      } else {
        throw new Error(`API responded with status: ${response.status}`);
      }
      } catch (error) {
        console.error('Error fetching notifications from API:', error);
        
        // Enhanced fallback: try sessionStorage first, then localStorage
        try {
          let storedNotifications = sessionStorage.getItem(`notifications_${userRole}`);
          
          // If sessionStorage is empty, try localStorage
          if (!storedNotifications) {
            storedNotifications = localStorage.getItem(`notifications_${userRole}`);
          }
          
          if (storedNotifications) {
            const notifications = JSON.parse(storedNotifications).map(notification => ({
              ...notification,
              timestamp: new Date(notification.timestamp)
            }));
            // Loaded from storage fallback
            setNotifications(notifications);
            setUnreadCount(notifications.filter(n => n.unread).length);
          } else {
            // No notifications available
            setNotifications([]);
            setUnreadCount(0);
          }
        } catch (storageError) {
          console.error('Error with storage fallback:', storageError);
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
      setLoading(false);
    }
  };


  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      );
      setUnreadCount(updated.filter(n => n.unread).length);
      
      // Save to localStorage
      localStorage.setItem(`notifications_${userRole}`, JSON.stringify(updated));
      sessionStorage.setItem(`notifications_${userRole}`, JSON.stringify(updated));
      
      return updated;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      setUnreadCount(0);
      
      // Save to localStorage
      localStorage.setItem(`notifications_${userRole}`, JSON.stringify(updated));
      sessionStorage.setItem(`notifications_${userRole}`, JSON.stringify(updated));
      
      return updated;
    });
  };

  // Add new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      unread: true,
      priority: 'medium',
      ...notification
    };
    
    setNotifications(prev => {
      // Check for duplicate notifications (same type and message)
      const isDuplicate = prev.some(existing => 
        existing.type === newNotification.type && 
        existing.message === newNotification.message &&
        (Date.now() - existing.timestamp.getTime()) < 60000 // Within last minute
      );
      
      if (isDuplicate) {
        // Duplicate notification prevented
        return prev;
      }
      
      const updated = [newNotification, ...prev];
      setUnreadCount(updated.filter(n => n.unread).length);
      
      // Save to localStorage
      localStorage.setItem(`notifications_${userRole}`, JSON.stringify(updated));
      sessionStorage.setItem(`notifications_${userRole}`, JSON.stringify(updated));
      
      return updated;
    });
    
    // Also refresh from API to get the latest dynamic notifications (but with delay)
    setTimeout(() => {
      fetchNotifications();
    }, 2000);
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && notification.unread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Clear any old mock data from localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem(`notifications_${userRole}`);
    if (storedNotifications) {
      try {
        const notifications = JSON.parse(storedNotifications);
        // Check if any notification contains mock data patterns
        const hasMockData = notifications.some(notification => 
          notification.message?.includes('Rice Sector') ||
          notification.message?.includes('8 new beneficiaries') ||
          notification.message?.includes('Rice Category')
        );
        
        if (hasMockData) {
          console.log('NotificationProvider: Clearing old mock data from localStorage');
          localStorage.removeItem(`notifications_${userRole}`);
        }
      } catch (error) {
        console.log('NotificationProvider: Clearing corrupted localStorage data');
        localStorage.removeItem(`notifications_${userRole}`);
      }
    }
  }, [userRole]);

  // Auto-refresh notifications every 2 minutes (but only if user is active)
  useEffect(() => {
    console.log('NotificationProvider: Fetching notifications for role:', userRole);
    
    // Check if this is a page refresh and restore notifications immediately
    const isPageRefresh = performance.navigation.type === 1 || performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    if (isPageRefresh) {
      console.log('NotificationProvider: Page refresh detected, restoring notifications from storage');
      // Try to restore from sessionStorage first (most recent)
      const sessionNotifications = sessionStorage.getItem(`notifications_${userRole}`);
      if (sessionNotifications) {
        try {
          const notifications = JSON.parse(sessionNotifications).map(notification => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
          setNotifications(notifications);
          setUnreadCount(notifications.filter(n => n.unread).length);
          console.log('NotificationProvider: Restored', notifications.length, 'notifications from sessionStorage');
        } catch (error) {
          console.error('Error restoring notifications from sessionStorage:', error);
          fetchNotifications();
        }
      } else {
        fetchNotifications();
      }
    } else {
      fetchNotifications();
    }
    
    // Only auto-refresh if the page is visible and user is active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };
    
    const interval = setInterval(() => {
      // Only fetch if page is visible and user hasn't been idle for too long
      if (!document.hidden) {
        fetchNotifications();
      }
    }, 120000); // 2 minutes instead of 30 seconds
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userRole]);

  // Clear all notifications (for testing/debugging)
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(`notifications_${userRole}`);
    sessionStorage.removeItem(`notifications_${userRole}`);
    localStorage.removeItem(`notifications_${userRole}_timestamp`);
    // All notifications cleared
  };

  // Clean up old notifications (older than 7 days) and action notifications (older than 1 day)
  const cleanupOldNotifications = () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    setNotifications(prev => {
      const filtered = prev.filter(notification => {
        const notificationDate = new Date(notification.timestamp);
        
        // Remove very old notifications (7 days)
        if (notificationDate < sevenDaysAgo) {
          return false;
        }
        
        // Remove action notifications that are older than 1 day
        const actionTypes = ['program_approval', 'enrollment_approved', 'coordinator_registration', 'beneficiary_assigned'];
        if (actionTypes.includes(notification.type) && notificationDate < oneDayAgo) {
          return false;
        }
        
        return true;
      });
      
      if (filtered.length !== prev.length) {
        console.log(`NotificationProvider: Cleaned up ${prev.length - filtered.length} old notifications`);
        // Save cleaned notifications to both storages
        localStorage.setItem(`notifications_${userRole}`, JSON.stringify(filtered));
        sessionStorage.setItem(`notifications_${userRole}`, JSON.stringify(filtered));
      }
      
      return filtered;
    });
  };

  // Run cleanup on component mount
  useEffect(() => {
    cleanupOldNotifications();
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    formatTimestamp,
    fetchNotifications,
    clearAllNotifications,
    cleanupOldNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

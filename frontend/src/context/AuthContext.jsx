import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('memzo_user') || localStorage.getItem('brightloop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('memzo_token') || localStorage.getItem('brightloop_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize auth state
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('memzo_user', JSON.stringify(res.data));
          fetchNotifications();
        } catch (err) {
          console.error("Auth check failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    const { user: userData, tokens } = res.data;
    
    setToken(tokens.access);
    setUser(userData);
    localStorage.setItem('memzo_token', tokens.access);
    localStorage.setItem('memzo_refresh', tokens.refresh);
    localStorage.setItem('memzo_user', JSON.stringify(userData));
    
    // Fetch notifications
    setTimeout(fetchNotifications, 200);

    return userData;
  };

  const loginAs = async (role) => {
    const credMap = {
      ADMIN: { u: 'admin', p: 'password123' },
      STAFF: { u: 'staff', p: 'password123' },
      CUSTOMER: { u: 'customer', p: 'password123' },
    };
    const cred = credMap[role];
    if (cred) {
      return await login(cred.u, cred.p);
    }
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register/', formData);
    const { user: userData, tokens } = res.data;
    
    setToken(tokens.access);
    setUser(userData);
    localStorage.setItem('memzo_token', tokens.access);
    localStorage.setItem('memzo_refresh', tokens.refresh);
    localStorage.setItem('memzo_user', JSON.stringify(userData));
    
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('memzo_token');
    localStorage.removeItem('memzo_refresh');
    localStorage.removeItem('memzo_user');
    localStorage.removeItem('brightloop_token');
    localStorage.removeItem('brightloop_refresh');
    localStorage.removeItem('brightloop_user');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/me/', data);
    setUser(res.data);
    localStorage.setItem('memzo_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAs,
        register,
        logout,
        updateProfile,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

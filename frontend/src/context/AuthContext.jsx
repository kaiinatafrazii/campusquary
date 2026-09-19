import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cq_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cq_token');
      const storedUser = localStorage.getItem('cq_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh user data from server
          const { data } = await API.get('/auth/me');
          setUser(data);
          localStorage.setItem('cq_user', JSON.stringify(data));
        } catch (err) {
          console.warn('Session verification failed, logging out');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleAuthLogout = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('cq_token', data.token);
    localStorage.setItem('cq_user', JSON.stringify(data));
    return data;
  };

  const register = async (userData) => {
    const { data } = await API.post('/auth/register', userData);
    setUser(data);
    setToken(data.token);
    localStorage.setItem('cq_token', data.token);
    localStorage.setItem('cq_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    localStorage.removeItem('cq_token');
    localStorage.removeItem('cq_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updated };
      localStorage.setItem('cq_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';
  const isStaff = isFaculty || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isStudent,
        isFaculty,
        isAdmin,
        isStaff,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

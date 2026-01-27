import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../api';

/**
 * AuthContext provides authentication state and methods
 * Handles both user and admin authentication
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      setIsInitializing(true);
      try {
        const userRes = await authAPI.userProfile();
        setUser(userRes.data);
        setAdmin(null);
        setError(null);
      } catch (userErr) {
        // If not a user session, try admin session
        try {
          const adminRes = await authAPI.adminProfile();
          setAdmin(adminRes.data);
          setUser(null);
          setError(null);
        } catch (adminErr) {
          setUser(null);
          setAdmin(null);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    loadSession();
  }, []);

  /**
   * Set user after login
   */
  const loginUser = (userData) => {
    setUser(userData);
    setAdmin(null); // Clear admin session
    setError(null);
  };

  /**
   * Set admin after login
   */
  const loginAdmin = (adminData) => {
    setAdmin(adminData);
    setUser(null); // Clear user session
    setError(null);
  };

  /**
   * Logout current user
   */
  const logout = () => {
    setUser(null);
    setAdmin(null);
    setError(null);
  };

  const refreshSession = async () => {
    setIsInitializing(true);
    try {
      const userRes = await authAPI.userProfile();
      setUser(userRes.data);
      setAdmin(null);
      return { type: 'user', data: userRes.data };
    } catch (userErr) {
      try {
        const adminRes = await authAPI.adminProfile();
        setAdmin(adminRes.data);
        setUser(null);
        return { type: 'admin', data: adminRes.data };
      } catch (adminErr) {
        setUser(null);
        setAdmin(null);
        return null;
      } finally {
        setIsInitializing(false);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  /**
   * Set authentication error
   */
  const setAuthError = (errorMessage) => {
    setError(errorMessage);
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    admin,
    isAuthenticated: !!user || !!admin,
    isAdmin: !!admin,
    isUser: !!user,
    isLoading,
    isInitializing,
    error,
    loginUser,
    loginAdmin,
    logout,
    refreshSession,
    setAuthError,
    clearError,
    setIsLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook - access auth context anywhere
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

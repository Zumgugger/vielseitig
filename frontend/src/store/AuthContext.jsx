import { createContext, useContext, useState } from 'react';

/**
 * AuthContext provides authentication state and methods
 * Handles both user and admin authentication
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
    error,
    loginUser,
    loginAdmin,
    logout,
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


import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isDemo: boolean;
  login: () => void;
  logout: () => void;
  startDemoSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
    setIsDemo(false);
  };
  const logout = () => {
    setIsAuthenticated(false);
    setIsDemo(false);
  };
  const startDemoSession = () => {
    setIsAuthenticated(true);
    setIsDemo(true);
  };
  
  // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
  return React.createElement(AuthContext.Provider, { value: { isAuthenticated, isDemo, login, logout, startDemoSession } }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

const publicRoutes = ['/', '/about', '/pricing', '/contact', '/demo', '/auth'];
const protectedRoutes = ['/dashboard', '/creator', '/tools', '/education'];

export const getRouteProtectionLevel = (path: string): 'public' | 'protected' => {
  if (publicRoutes.includes(path)) return 'public';
  if (protectedRoutes.some(r => path.startsWith(r))) return 'protected';
  return 'public';
};

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

export const AuthGuard: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Simulate checking auth state on mount
    const isProtected = getRouteProtectionLevel('/education') === 'protected';
    if (isProtected && !isAuthenticated) {
        setShowLoginPrompt(true);
    } else {
        setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);
  
  if (showLoginPrompt) {
    // In a real app, this would be a redirect. Here, we show a message.
    const encodedPath = encodeURIComponent('/education');
    // FIX: Replaced JSX with React.createElement to be valid in a .ts file.
    return (
      React.createElement('div', { className: "flex flex-col items-center justify-center h-96 bg-ff-surface rounded-lg p-8" },
        React.createElement('h2', { style: { fontFamily: 'var(--ff-font-primary)', fontSize: 'var(--ff-text-2xl)', fontWeight: 'var(--ff-weight-bold)' } },
          "Authentication Required"
        ),
        React.createElement('p', { style: { fontFamily: 'var(--ff-font-secondary)', color: 'var(--ff-text-secondary)', lineHeight: 'var(--ff-leading-relaxed)' }, className: "mt-2 text-center" },
          "Please sign in or start a demo session to access this page."
        ),
        React.createElement('p', { style: { fontFamily: 'var(--ff-font-mono)', fontSize: 'var(--ff-text-sm)', color: 'var(--ff-text-muted)' }, className: "mt-4 bg-ff-bg-dark p-2 rounded-md" },
          `Redirecting to: /auth?mode=signin&redirect=${encodedPath}`
        )
      )
    );
  }

  // FIX: Replaced JSX fragment with React.createElement to be valid in a .ts file.
  return React.createElement(React.Fragment, null, children);
};

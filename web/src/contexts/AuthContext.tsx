import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User } from '../api/auth';
import { socketManager } from '../api/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    username: string;
    displayName: string;
    age: number;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authApi.getStoredToken();
      if (token) {
        try {
          // You might want to add a /auth/me endpoint to get current user
          // For now, we'll just connect to socket if token exists
          await socketManager.connect(token);
          // Set a placeholder user - you should fetch actual user data
          setUser({
            _id: 'current-user',
            email: 'user@example.com',
            username: 'currentuser',
            displayName: 'Current User',
            age: 25,
            emailVerified: true,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          authApi.logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ email, password });
      
      // Connect to socket with the new token
      await socketManager.connect(response.accessToken);
      
      // You should fetch user data after successful login
      // For now, setting placeholder data
      setUser({
        _id: 'current-user',
        email,
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        age: 25,
        emailVerified: true,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    email: string;
    username: string;
    displayName: string;
    age: number;
    password: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authApi.signup(data);
      // After signup, user needs to verify email before logging in
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Signup failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    socketManager.disconnect();
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
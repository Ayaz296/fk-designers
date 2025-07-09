import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  getAllCustomers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on app load
    const initializeAuth = async () => {
      const storedUser = sessionStorage.getItem('auth_user');
      const storedToken = sessionStorage.getItem('auth_token');
      
      if (storedUser && storedToken) {
        try {
          // Verify token is still valid by fetching profile
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid session data
          sessionStorage.removeItem('auth_user');
          sessionStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await authService.login({ email, password });
      
      // Store user and token
      setUser(response.user);
      sessionStorage.setItem('auth_user', JSON.stringify(response.user));
      sessionStorage.setItem('auth_token', response.token);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await authService.register(userData);
      
      // Auto-login after registration
      setUser(response.user);
      sessionStorage.setItem('auth_user', JSON.stringify(response.user));
      sessionStorage.setItem('auth_token', response.token);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
    }
  };

  const getAllCustomers = async (): Promise<User[]> => {
    try {
      return await authService.getAllCustomers();
    } catch (error) {
      console.error('Get customers error:', error);
      return [];
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff' || user?.role === 'admin',
    login,
    register,
    logout,
    loading,
    getAllCustomers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
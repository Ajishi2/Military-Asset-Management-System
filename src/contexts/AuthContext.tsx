"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '../services/api.js';

interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role_id: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{user: User, token: string} | void>;
  signup: (userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_id: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Create context with a default value (null as it will be provided by the Provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook for using the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Create the provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and set user data
          const userData = await authService.verifyToken(token);
          setUser(userData);
        } else {
          // If no token, ensure user state is null
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to restore auth state from token:', error);
        // Clear invalid token and user data if verification fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting to login with username:', username);
      const { user, token } = await authService.login(username, password);
      console.log('Login successful, received user:', user);

      // Store token and user data in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set user in state
      setUser(user);

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role_id: string;
  }) => {
    try {
      await authService.signup(userData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('User logged out successfully');
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    login,
    signup,
    logout,
    loading
  }), [user, loading]); // Depend on user and loading

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
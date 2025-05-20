import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Role } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  hasPermission: (requiredRole: Role) => boolean;
  hasBaseAccess: (baseId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (requiredRole: Role): boolean => {
    if (!currentUser) return false;
    
    switch (requiredRole) {
      case 'admin':
        return currentUser.role === 'admin';
      case 'base_commander':
        return currentUser.role === 'admin' || currentUser.role === 'base_commander';
      case 'logistics_officer':
        return currentUser.role === 'admin' || currentUser.role === 'base_commander' || currentUser.role === 'logistics_officer';
      default:
        return false;
    }
  };

  const hasBaseAccess = (baseId: string): boolean => {
    if (!currentUser) return false;
    
    // Admin has access to all bases
    if (currentUser.role === 'admin') return true;
    
    // Base commanders and logistics officers have access only to their assigned base
    return currentUser.baseId === baseId;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, hasPermission, hasBaseAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
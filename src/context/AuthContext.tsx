'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthContextType, AuthState, User, LoginCredentials, RegisterData } from '@/types/auth';

// Mock user database (in real app, this would be a backend API)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@shopease.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: '/api/placeholder/100/100',
    createdAt: '2024-01-01',
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    email: 'merchant@shopease.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'merchant',
    avatar: '/api/placeholder/100/100',
    createdAt: '2024-01-02',
    lastLogin: new Date().toISOString()
  },
  {
    id: '3',
    email: 'customer@shopease.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer',
    avatar: '/api/placeholder/100/100',
    createdAt: '2024-01-03',
    lastLogin: new Date().toISOString()
  }
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  'admin@shopease.com': 'admin123',
  'merchant@shopease.com': 'merchant123',
  'customer@shopease.com': 'customer123'
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_USER'; payload: User | null };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent premature redirects
  error: null
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false // Set loading to false after checking localStorage
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      // First, try to get user from localStorage
      const storedUser = localStorage.getItem('shopease_user');
      if (storedUser) {
        try {
          const userFromStorage = JSON.parse(storedUser);
          dispatch({ type: 'SET_USER', payload: userFromStorage });

          // Optionally verify the token in the background (don't block UI)
          fetch('/api/auth/verify', {
            method: 'GET',
            credentials: 'include',
          }).then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Token invalid');
            }
          }).then(data => {
            // Update user data if token is still valid
            const user: User = {
              id: data.id.toString(),
              email: data.email,
              firstName: data.name || 'User',
              lastName: '',
              role: data.role === 'ADMIN' ? 'admin' : data.role === 'MERCHANT' ? 'merchant' : 'customer',
              avatar: '/api/placeholder/100/100',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            localStorage.setItem('shopease_user', JSON.stringify(user));
            dispatch({ type: 'SET_USER', payload: user });
          }).catch(() => {
            // Token is invalid, but keep the user in localStorage for now
            // They can continue using the app until they try to access protected resources
          });
        } catch (e) {
          // Invalid localStorage data, remove it
          localStorage.removeItem('shopease_user');
          dispatch({ type: 'SET_USER', payload: null });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch({ type: 'LOGIN_FAILURE', payload: data.message || 'Login failed' });
        return;
      }

      // Convert database user format to frontend format
      const user: User = {
        id: data.id || '1',
        email: credentials.email,
        firstName: data.name || 'User',
        lastName: '',
        role: data.role === 'ADMIN' ? 'admin' : data.role === 'MERCHANT' ? 'merchant' : 'customer',
        avatar: '/api/placeholder/100/100',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('shopease_user', JSON.stringify(user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error. Please try again.' });
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'REGISTER_START' });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    if (mockUsers.find(u => u.email === data.email)) {
      dispatch({ type: 'REGISTER_FAILURE', payload: 'User with this email already exists' });
      return;
    }

    // Check password confirmation
    if (data.password !== data.confirmPassword) {
      dispatch({ type: 'REGISTER_FAILURE', payload: 'Passwords do not match' });
      return;
    }

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Add to mock database
    mockUsers.push(newUser);
    mockPasswords[data.email] = data.password;

    // Save to localStorage
    localStorage.setItem('shopease_user', JSON.stringify(newUser));
    
    dispatch({ type: 'REGISTER_SUCCESS', payload: newUser });
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout API errors
    }

    localStorage.removeItem('shopease_user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

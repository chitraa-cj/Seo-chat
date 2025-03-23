'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthClient, User } from './auth-client';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authClient = new AuthClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authClient.login({ email, password });
      // Set cookie with token
      Cookies.set('auth_token', response.token, { 
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authClient.register({ email, password, name });
      // Set cookie with token
      Cookies.set('auth_token', response.token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth-related cookies and storage
    Cookies.remove('auth_token');
    localStorage.clear(); // Clear all localStorage data to ensure complete cleanup
    setUser(null);
    // Force navigation to login page
    router.replace('/login'); // Using replace instead of push to prevent going back
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
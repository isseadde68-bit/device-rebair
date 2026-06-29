'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrentUser } from './localStorage';
import { apiFetch, setToken, getToken } from './api';

export type LoginResult = { ok: true; user: CurrentUser } | { ok: false; error: string };

interface AuthContextType {
  user: CurrentUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiFetch('/api/auth/me', { token, method: 'GET' });
        setUser(data.user);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    if (!email.trim() || !password) {
      return { ok: false, error: 'Please enter email and password.' };
    }

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      setToken(data.token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err: unknown) {
      const status = err && typeof err === 'object' && 'status' in err ? (err as { status: number }).status : 0;
      const message =
        err && typeof err === 'object' && 'message' in err ? String((err as Error).message) : '';

      if (status === 401) {
        return { ok: false, error: 'Invalid email or password.' };
      }
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        return {
          ok: false,
          error: 'Cannot reach the server. Start the backend (port 4000) and try again.',
        };
      }
      return { ok: false, error: message || 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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

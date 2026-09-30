import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMe, getApiMessage, loginAdmin, logoutAdmin, registerAdminSessionInterceptor, type AuthUser } from '../api/adminApi';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setSessionExpiredMessage: (message: string | null) => void;
  sessionExpiredMessage: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const data = await getMe();
      setUser(data);
      setSessionExpiredMessage(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const dispose = registerAdminSessionInterceptor(() => {
      clearSession();
      setSessionExpiredMessage('Your session expired. Please sign in again.');
      window.location.assign(`${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}`);
    });
    refreshSession();
    return dispose;
  }, [clearSession, refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      await loginAdmin({ email, password });
      await refreshSession();
    } catch (error) {
      const message = getApiMessage(error);
      if (message.includes('Too many attempts') || message.includes('lock')) {
        throw new Error('Too many attempts. Please wait 15 minutes and try again.');
      }
      throw new Error('Invalid email or password');
    }
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      // ignore logout errors and clear local state
    } finally {
      clearSession();
      window.location.assign(`${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}`);
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    refreshSession,
    sessionExpiredMessage,
    setSessionExpiredMessage,
  }), [login, logout, refreshSession, user, isLoading, sessionExpiredMessage]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

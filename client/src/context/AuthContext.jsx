import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';
import { applyDocumentDirection } from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncLanguage = useCallback(
    (lang) => {
      if (!lang) return;
      localStorage.setItem('wtc_lang', lang);
      i18n.changeLanguage(lang);
      applyDocumentDirection(lang);
    },
    [i18n]
  );

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('wtc_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      if (data.user?.preferredLanguage) {
        syncLanguage(data.user.preferredLanguage);
      }
    } catch {
      localStorage.removeItem('wtc_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [syncLanguage]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('wtc_token', data.token);
    setUser(data.user);
    syncLanguage(data.user.preferredLanguage || 'en');
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem('wtc_token', data.token);
    setUser(data.user);
    syncLanguage(data.user.preferredLanguage || 'en');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('wtc_token');
    setUser(null);
  };

  const updateUser = async (updates) => {
    const { data } = await api.patch('/auth/me', updates);
    setUser(data.user);
    if (updates.preferredLanguage) {
      syncLanguage(updates.preferredLanguage);
    }
    return data.user;
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateUser, refresh: loadMe }),
    [user, loading, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

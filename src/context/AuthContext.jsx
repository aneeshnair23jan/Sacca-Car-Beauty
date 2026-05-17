import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  const clearSession = useCallback(() => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('sacca_admin_token');
    localStorage.removeItem('sacca_admin_user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // Hydrate from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('sacca_admin_token');
      const savedAdmin = localStorage.getItem('sacca_admin_user');
      if (savedToken) {
        if (isTokenExpired(savedToken)) {
          clearSession();
        } else {
          setToken(savedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
      }
      if (savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
      }
    } catch {}
    setHydrated(true);
  }, [clearSession]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.error || '';
        const isAuthError =
          status === 401 &&
          /token|auth|expired/i.test(message) &&
          typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login';

        if (isAuthError) {
          clearSession();
          window.location.href = '/admin/login';
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [clearSession]);

  const login = (newToken, username) => {
    setToken(newToken);
    setAdmin({ username });
    localStorage.setItem('sacca_admin_token', newToken);
    localStorage.setItem('sacca_admin_user', JSON.stringify({ username }));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, isAuthenticated: !!token, hydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function isTokenExpired(token) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized));
    return decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
}

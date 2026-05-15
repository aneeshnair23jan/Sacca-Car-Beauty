import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('sacca_admin_token');
      const savedAdmin = localStorage.getItem('sacca_admin_user');
      if (savedToken) {
        setToken(savedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
      if (savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
      }
    } catch {}
    setHydrated(true);
  }, []);

  const login = (newToken, username) => {
    setToken(newToken);
    setAdmin({ username });
    localStorage.setItem('sacca_admin_token', newToken);
    localStorage.setItem('sacca_admin_user', JSON.stringify({ username }));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('sacca_admin_token');
    localStorage.removeItem('sacca_admin_user');
    delete axios.defaults.headers.common['Authorization'];
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

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export function SettingsProvider({ children, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {});
  // Track whether we've done the initial client-side fetch
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once per app lifetime
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    axios.get('/api/settings')
      .then((res) => {
        // Only update state if something actually changed
        setSettings((prev) => {
          const next = res.data;
          const same = JSON.stringify(prev) === JSON.stringify(next);
          return same ? prev : next;
        });
      })
      .catch(() => {});
  }, []); // empty deps — runs once on mount

  const formatPrice = (price) =>
    `${settings.currency_symbol || ''}${Number(price).toFixed(2)}`;

  return (
    <SettingsContext.Provider value={{ settings, setSettings, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

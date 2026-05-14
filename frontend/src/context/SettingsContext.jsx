import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    shop_name: 'Sacca Car Beauty',
    shop_tagline: 'Premium Car Accessories',
    shop_description: 'Your one-stop shop for premium car accessories.',
    whatsapp_number: '+1234567890',
    currency: 'USD',
    currency_symbol: '$',
  });

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => setSettings(res.data))
      .catch(() => {});
  }, []);

  const formatPrice = (price) => {
    return `${settings.currency_symbol}${Number(price).toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

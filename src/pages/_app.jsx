import { useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { WishlistProvider } from '@/context/WishlistContext';
import MobileBottomBar from '@/components/MobileBottomBar';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  const { initialSettings, ...restPageProps } = pageProps;

  // Stabilise the initial settings reference so it never changes between renders.
  // Using a ref means the object identity is fixed for the lifetime of the app.
  const settingsRef = useRef(initialSettings || {});

  return (
    <AuthProvider>
      <SettingsProvider initialSettings={settingsRef.current}>
        <CartProvider>
          <WishlistProvider>
            <Component {...restPageProps} />
            <MobileBottomBar />
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          </WishlistProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

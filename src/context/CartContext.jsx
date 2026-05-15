import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Start with null to signal "not yet hydrated from localStorage"
  const [cart, setCart] = useState(null);

  // Load from localStorage once on mount (client only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sacca_cart');
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, []);

  // Persist whenever cart changes — but only after hydration
  useEffect(() => {
    if (cart === null) return;
    localStorage.setItem('sacca_cart', JSON.stringify(cart));
  }, [cart]);

  const safeCart = cart || [];

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const list = prev || [];
      const existing = list.find((item) => item.id === product.id);
      if (existing) {
        return list.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...list, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId) =>
    setCart((prev) => (prev || []).filter((item) => item.id !== productId));

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCart((prev) =>
      (prev || []).map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = safeCart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = safeCart.reduce((sum, item) => {
    const price = item.discount_percent > 0
      ? item.price * (1 - item.discount_percent / 100)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      cart: safeCart, addToCart, removeFromCart, updateQuantity,
      clearCart, cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

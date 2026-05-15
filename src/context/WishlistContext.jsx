import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(null);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sacca_wishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, []);

  // Persist on change, skip initial null state
  useEffect(() => {
    if (wishlist === null) return;
    localStorage.setItem('sacca_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const safeList = wishlist || [];

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      const list = prev || [];
      if (list.find((p) => p.id === product.id)) return list; // already in list, no change
      return [...list, product];
    });
    toast.success('Added to wishlist!');
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => (prev || []).filter((p) => p.id !== productId));
    toast.success('Removed from wishlist');
  };

  const isInWishlist = (productId) => safeList.some((p) => p.id === productId);

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(product);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist: safeList, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

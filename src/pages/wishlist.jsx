import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();

  const handleMoveToCart = (product) => {
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    addToCart(product);
    removeFromWishlist(product.id);
    toast.success('Moved to cart');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="bg-navy-900 py-6 sm:py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="section-label text-gold-400 mb-1">Saved</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">My Wishlist</h1>
          <p className="text-gray-400 text-sm mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full">
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <Heart className="w-16 h-16 text-gray-200 mb-6" />
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Nothing saved yet</h2>
            <p className="text-gray-500 text-sm mb-8">Tap the heart on any product to save it here</p>
            <Link href="/shop" className="btn-primary py-3 px-8">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((product) => {
              const discountedPrice = product.discount_percent > 0
                ? product.price * (1 - product.discount_percent / 100)
                : product.price;
              return (
                <div key={product.id} className="border border-gray-100 hover:border-gold-200 transition-colors flex flex-col">
                  <Link href={`/product/${product.id}`} className="relative overflow-hidden bg-gray-50 block" style={{ aspectRatio: '1/1' }}>
                    {product.primary_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 tracking-wide">SOLD OUT</span>
                      </div>
                    )}
                    {product.discount_percent > 0 && (
                      <span className="absolute top-3 left-3 bg-gold-600 text-white text-xs font-bold px-2 py-0.5">-{product.discount_percent}%</span>
                    )}
                  </Link>
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    {product.category_name && (
                      <span className="text-xs text-gold-600 font-semibold tracking-widest uppercase mb-1">{product.category_name}</span>
                    )}
                    <Link href={`/product/${product.id}`} className="font-semibold text-navy-900 text-sm line-clamp-2 mb-3 hover:text-gold-600 transition-colors flex-1">
                      {product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-bold text-navy-900">{formatPrice(discountedPrice)}</span>
                      {product.discount_percent > 0 && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 btn-dark py-2 text-xs disabled:opacity-40"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

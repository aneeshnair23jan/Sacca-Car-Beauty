import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { formatPrice } = useSettings();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <ShoppingCart className="w-16 h-16 text-gray-200 mb-6" />
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-8">Add some products to get started</p>
          <Link href="/shop" className="btn-primary py-3 px-8">Browse Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-navy-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="section-label text-gold-400 mb-1">Review</p>
          <h1 className="font-display text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="text-gray-400 text-sm mt-1">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const itemPrice = item.discount_percent > 0
                ? item.price * (1 - item.discount_percent / 100)
                : item.price;
              return (
                <div key={item.id} className="flex gap-4 border border-gray-100 p-4 hover:border-gold-200 transition-colors">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden">
                    {item.primary_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.primary_image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`} className="font-semibold text-navy-900 hover:text-gold-600 text-sm line-clamp-2 transition-colors">
                      {item.name}
                    </Link>
                    {item.category_name && <p className="text-xs text-gray-400 mt-0.5">{item.category_name}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-bold text-navy-900 text-sm">{formatPrice(itemPrice)}</span>
                      {item.discount_percent > 0 && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-navy-900 text-sm">{formatPrice(itemPrice * item.quantity)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-100 p-6 sticky top-24">
              <h2 className="font-semibold text-navy-900 text-base mb-5 pb-4 border-b border-gray-200">Order Summary</h2>
              <div className="space-y-2 mb-5">
                {cart.map((item) => {
                  const p = item.discount_percent > 0 ? item.price * (1 - item.discount_percent / 100) : item.price;
                  return (
                    <div key={item.id} className="flex justify-between text-xs text-gray-600">
                      <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="flex-shrink-0 font-medium">{formatPrice(p * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between font-bold text-navy-900">
                  <span>Total</span>
                  <span className="text-lg">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary w-full py-3 justify-center">
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/shop" className="btn-secondary w-full py-3 justify-center mt-3 text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingBag, CheckCircle, User, MapPin, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { settings, formatPrice } = useSettings();
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-4">
          <ShoppingBag className="w-20 h-20 text-gray-200 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <Link to="/shop" className="btn-primary mt-4">Browse Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const buildWhatsAppMessage = () => {
    const lines = [
      `*New Order from ${settings.shop_name}*`,
      ``,
      `*Customer Details:*`,
      `Name: ${form.name || 'Not provided'}`,
      `Phone: ${form.phone || 'Not provided'}`,
      `Address: ${form.address || 'Not provided'}`,
      ``,
      `*Order Items:*`,
    ];

    cart.forEach(item => {
      const price = item.discount_percent > 0
        ? item.price * (1 - item.discount_percent / 100)
        : item.price;
      lines.push(`• ${item.name} × ${item.quantity} = ${formatPrice(price * item.quantity)}`);
    });

    lines.push(``);
    lines.push(`*Total: ${formatPrice(cartTotal)}*`);

    if (form.notes) {
      lines.push(``);
      lines.push(`*Notes:* ${form.notes}`);
    }

    return `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '')}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleWhatsAppOrder = () => {
    window.open(buildWhatsAppMessage(), '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-500 mb-6">Fill in your details and send your order via WhatsApp</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Details Form */}
          <div>
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" /> Your Details
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                These details will be included in your WhatsApp message to help us process your order.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <textarea
                    placeholder="Your delivery address"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (optional)</label>
                  <textarea
                    placeholder="Any special requests or notes..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="card p-6 mt-4 bg-green-50 border-green-100">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> How WhatsApp Ordering Works
              </h3>
              <ol className="space-y-2 text-sm text-green-700">
                <li className="flex items-start gap-2">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  Fill in your details above (optional but helpful)
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  Click "Send Order via WhatsApp"
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  WhatsApp opens with your order pre-filled — just hit send!
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                  We'll confirm your order and arrange delivery
                </li>
              </ol>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map(item => {
                  const price = item.discount_percent > 0
                    ? item.price * (1 - item.discount_percent / 100)
                    : item.price;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {item.primary_image_url ? (
                          <img src={item.primary_image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between font-bold text-gray-900 text-xl">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-lg"
              >
                <MessageCircle className="w-6 h-6" />
                Send Order via WhatsApp
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                WhatsApp will open with your order details pre-filled
              </p>

              <Link to="/cart" className="w-full flex items-center justify-center btn-secondary py-3 mt-3 text-sm">
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

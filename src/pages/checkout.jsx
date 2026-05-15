import { useState } from 'react';
import Link from 'next/link';
import { Car, FileText, MapPin, MessageCircle, Phone, ShoppingBag, User } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { settings, formatPrice } = useSettings();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '',
    vehicle: '',
    notes: '',
  });

  const buildWhatsAppMessage = () => {
    const lines = [
      `*New Order - ${settings.shop_name || 'Sacca Car Beauty'}*`,
      '',
      '*Customer Details:*',
      `Name: ${form.name || 'Not provided'}`,
      `Phone: ${form.phone || 'Not provided'}`,
      `Address: ${form.address || 'Not provided'}`,
      `Pincode: ${form.pincode || 'Not provided'}`,
      `Vehicle: ${form.vehicle || 'Not provided'}`,
      '',
      '*Order Items:*',
    ];

    cart.forEach((item) => {
      const price = item.discount_percent > 0
        ? item.price * (1 - item.discount_percent / 100)
        : item.price;
      lines.push(`- ${item.name} x ${item.quantity} = ${formatPrice(price * item.quantity)}`);
    });

    lines.push('', `*Total: ${formatPrice(cartTotal)}*`);
    if (form.notes) lines.push('', `*Notes:* ${form.notes}`);

    return `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070707]">
        <SEO title="WhatsApp Checkout" description="Send your premium car accessories order through WhatsApp." />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <ShoppingBag className="w-16 h-16 text-zinc-700 mb-6" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 max-w-sm">Add products first and we will prepare a clean WhatsApp order message.</p>
          <Link href="/shop" className="btn-primary py-3 px-8 mt-6">Browse Products</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#070707]">
      <SEO title="WhatsApp Checkout" description="Complete your order with WhatsApp checkout, vehicle details, delivery address, and cart total." />
      <Navbar />

      <div className="bg-black border-b border-white/10 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="section-label mb-1">Almost There</p>
          <h1 className="font-display text-3xl font-bold text-white">WhatsApp Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="font-semibold text-white text-base mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-red-500" /> Your Details
              </h2>
              <p className="text-xs text-zinc-500 mb-5">These details are packed into your pre-filled WhatsApp order message.</p>

              <div className="space-y-4">
                <Input icon={User} label="Full Name" value={form.name} placeholder="Your full name" onChange={(name) => setForm((f) => ({ ...f, name }))} />
                <Input icon={Phone} label="Phone Number" value={form.phone} placeholder="Your phone number" onChange={(phone) => setForm((f) => ({ ...f, phone }))} />

                <label>
                  <span className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Delivery Address</span>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <textarea
                      placeholder="Your delivery address"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      rows={3}
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input icon={MapPin} label="Pincode" value={form.pincode} placeholder="Delivery pincode" onChange={(pincode) => setForm((f) => ({ ...f, pincode }))} />
                  <Input icon={Car} label="Vehicle Details" value={form.vehicle} placeholder="Brand, model, year" onChange={(vehicle) => setForm((f) => ({ ...f, vehicle }))} />
                </div>

                <label>
                  <span className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">Notes (optional)</span>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <textarea
                      placeholder="Any special requests or fitment questions"
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-green-950/25 border border-green-500/20 rounded-lg p-5">
              <h3 className="font-semibold text-green-300 text-sm mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> How WhatsApp Ordering Works
              </h3>
              <ol className="space-y-2">
                {[
                  'Fill your customer, delivery, and vehicle details.',
                  'Click Send Order via WhatsApp.',
                  'WhatsApp opens with the complete order message.',
                  'We confirm fitment, stock, and delivery details.',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-2 text-xs text-green-200/80">
                    <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5 text-xs">{index + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-semibold text-white text-base mb-5 pb-4 border-b border-white/10">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const price = item.discount_percent > 0
                    ? item.price * (1 - item.discount_percent / 100)
                    : item.price;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-zinc-900 border border-white/10 rounded overflow-hidden">
                        {item.primary_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.primary_image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-white flex-shrink-0">{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between font-bold text-white text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <a
                href={buildWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded text-sm uppercase transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Send Order via WhatsApp
              </a>
              <Link href="/cart" className="btn-secondary w-full py-3 justify-center mt-3 text-sm">Back to Cart</Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Input({ icon: Icon, label, value, placeholder, onChange }) {
  return (
    <label>
      <span className="block text-xs font-semibold text-zinc-400 uppercase mb-1.5">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field pl-10"
        />
      </div>
    </label>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

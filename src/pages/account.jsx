import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingBag, MessageCircle, Edit2, Save, X, Package, ChevronRight, Shield } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

const PROFILE_KEY = 'sacca_profile';

export default function AccountPage() {
  const { wishlist } = useWishlist();
  const { cartCount } = useCart();
  const { settings, formatPrice } = useSettings();
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '', address: '' });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_KEY);
      if (saved) { const p = JSON.parse(saved); setProfile(p); setDraft(p); }
    } catch {}
  }, []);

  const saveProfile = () => {
    setProfile(draft);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(draft));
    setEditing(false);
    toast.success('Profile saved');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
    { id: 'help', label: 'Help', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Header */}
      <div className="bg-navy-900 py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 bg-gold-600 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="section-label text-gold-400 mb-0.5">Welcome Back</p>
            <h1 className="font-display text-2xl font-bold text-white">{profile.name || 'My Account'}</h1>
            {profile.phone && <p className="text-gray-400 text-sm mt-0.5">{profile.phone}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Cart Items', value: cartCount, href: '/cart', color: 'text-navy-900' },
            { label: 'Wishlist', value: wishlist.length, href: '/wishlist', color: 'text-gold-600' },
            { label: 'WhatsApp', value: 'Chat', href: `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '')}`, color: 'text-green-600', external: true },
          ].map((s) => (
            s.external ? (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="border border-gray-100 hover:border-gold-200 p-4 text-center transition-colors">
                <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
              </a>
            ) : (
              <Link key={s.label} href={s.href} className="border border-gray-100 hover:border-gold-200 p-4 text-center transition-colors">
                <div className={`text-2xl font-bold ${s.color} mb-1`}>{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
              </Link>
            )
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="bg-gold-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-navy-900">Personal Information</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-semibold text-gold-600 hover:text-gold-700 uppercase tracking-wide">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveProfile} className="btn-primary py-1.5 px-4 text-xs"><Save className="w-3.5 h-3.5" /> Save</button>
                  <button onClick={() => { setDraft(profile); setEditing(false); }} className="btn-secondary py-1.5 px-4 text-xs"><X className="w-3.5 h-3.5" /> Cancel</button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'Enter your full name', type: 'text' },
                { key: 'phone', label: 'Phone Number', placeholder: 'Enter your phone number', type: 'tel' },
                { key: 'address', label: 'Delivery Address', placeholder: 'Enter your delivery address', type: 'textarea' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  {editing ? (
                    type === 'textarea' ? (
                      <textarea value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} placeholder={placeholder} rows={3} className="input-field resize-none" />
                    ) : (
                      <input type={type} value={draft[key]} onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))} placeholder={placeholder} className="input-field" />
                    )
                  ) : (
                    <p className={`py-2.5 px-3 text-sm border border-gray-100 bg-gray-50 ${profile[key] ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                      {profile[key] || placeholder}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {!editing && !profile.name && (
              <div className="mt-6 p-4 bg-gold-50 border border-gold-100">
                <p className="text-sm font-semibold text-gold-800 mb-1">Save your details for faster checkout</p>
                <p className="text-xs text-gold-700">Your info will be pre-filled when placing WhatsApp orders.</p>
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlist.length === 0 ? (
              <div className="border border-gray-100 p-12 text-center">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="font-semibold text-navy-900 mb-2">No saved items</h3>
                <p className="text-gray-500 text-sm mb-5">Tap the heart on any product to save it</p>
                <Link href="/shop" className="btn-primary py-2.5 px-6">Browse Products</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((product) => {
                  const dp = product.discount_percent > 0 ? product.price * (1 - product.discount_percent / 100) : product.price;
                  return (
                    <div key={product.id} className="flex items-center gap-4 border border-gray-100 p-4 hover:border-gold-200 transition-colors">
                      <div className="w-14 h-14 flex-shrink-0 bg-gray-50 overflow-hidden">
                        {product.primary_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><Package className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product.id}`} className="font-semibold text-navy-900 text-sm hover:text-gold-600 transition-colors line-clamp-1">{product.name}</Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-navy-900 text-sm">{formatPrice(dp)}</span>
                          {product.discount_percent > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
                        </div>
                      </div>
                      <Link href="/wishlist" className="text-gold-600 hover:text-gold-700">
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  );
                })}
                <div className="pt-2 text-center">
                  <Link href="/wishlist" className="btn-outline py-2.5 px-6 text-sm">View Full Wishlist</Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="space-y-4">
            <a
              href={`https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border border-gray-100 hover:border-green-200 p-5 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-navy-900">Chat on WhatsApp</p>
                <p className="text-sm text-gray-500">{settings.whatsapp_number}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </a>

            <div className="border border-gray-100 p-6">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-gold-600" /> How Ordering Works</h3>
              <ol className="space-y-3">
                {[
                  { t: 'Browse & Add to Cart', d: 'Find products and add them to your cart' },
                  { t: 'Go to Checkout', d: 'Fill in your delivery details' },
                  { t: 'Send via WhatsApp', d: 'Your order is sent directly to us' },
                  { t: 'We Confirm & Deliver', d: "We'll confirm and arrange delivery" },
                ].map(({ t, d }, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-gold-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <div>
                      <p className="font-medium text-navy-900 text-sm">{t}</p>
                      <p className="text-xs text-gray-500">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-gray-100 p-5">
              <h3 className="font-semibold text-navy-900 mb-3 text-sm">Quick Links</h3>
              {[{ href: '/shop', label: 'Browse All Products' }, { href: '/cart', label: 'View Cart' }, { href: '/wishlist', label: 'My Wishlist' }].map(({ href, label }) => (
                <Link key={href} href={href} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:text-gold-600 transition-colors text-sm text-gray-700">
                  {label} <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              ))}
            </div>
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

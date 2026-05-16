import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Car, Heart, Menu, MessageCircle, Search, ShoppingCart, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { parseCmsContent } from '@/lib/cms';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { settings } = useSettings();
  const cms = parseCmsContent(settings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/shop?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setMenuOpen(false);
    setSearchQuery('');
  };

  const isActive = (href) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}`;

  return (
    <>
      <div className="bg-[#111111] text-white text-[11px] sm:text-xs text-center py-2 px-4 font-semibold">
        {cms.global.announcement}
      </div>

      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'bg-white/92 backdrop-blur-xl border-[#E5E7EB] shadow-sm' : 'bg-[#F5F7F8]/95 border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-md bg-[#8DFF2F] text-[#111111] flex items-center justify-center brand-glow">
                <Car className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xl font-extrabold text-[#111111] leading-none truncate">
                  {settings.shop_name || 'Sacca Car Beauty'}
                </span>
                <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-[0.18em] truncate">
                  {settings.shop_tagline || 'Premium Accessories'}
                </span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'text-[#111111] bg-[#8DFF2F]/25'
                      : 'text-zinc-600 hover:text-[#111111] hover:bg-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <IconButton onClick={() => setSearchOpen((v) => !v)} label="Search">
                <Search className="w-5 h-5" />
              </IconButton>
              <Link href="/wishlist" className="relative w-10 h-10 rounded-md flex items-center justify-center text-zinc-600 hover:text-[#111111] hover:bg-white transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && <Badge value={wishlist.length} />}
              </Link>
              <Link href="/cart" className="relative w-10 h-10 rounded-md flex items-center justify-center text-zinc-600 hover:text-[#111111] hover:bg-white transition-colors" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <Badge value={cartCount} />}
              </Link>
              <Link href="/account" className="hidden sm:flex w-10 h-10 rounded-md items-center justify-center text-zinc-600 hover:text-[#111111] hover:bg-white transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex btn-primary py-2.5 px-4">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden w-10 h-10 rounded-md flex items-center justify-center text-zinc-600 hover:text-[#111111] hover:bg-white transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[#E5E7EB] bg-white"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2 px-4 py-4">
                <input
                  type="text"
                  placeholder="Search mats, ambient lights, organizers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="input-field"
                />
                <button type="submit" className="btn-primary px-4">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-[#E5E7EB] bg-white px-4 py-4"
            >
              <div className="space-y-1">
                {[...navLinks, { href: '/account', label: 'Account' }].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-3 rounded-md text-sm font-semibold ${
                      isActive(link.href) ? 'text-[#111111] bg-[#8DFF2F]/25' : 'text-zinc-600 hover:text-[#111111] hover:bg-[#F5F7F8]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-3">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Inquiry
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

function IconButton({ children, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-md flex items-center justify-center text-zinc-600 hover:text-[#111111] hover:bg-white transition-colors"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function Badge({ value }) {
  return (
    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#8DFF2F] text-[#111111] text-[10px] font-bold flex items-center justify-center">
      {value > 9 ? '9+' : value}
    </span>
  );
}

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Car, Heart, Menu, MessageCircle, Search, ShoppingCart, User, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import { parseCmsContent } from '@/lib/cms';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
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
    const onScroll = () => setScrolled(window.scrollY > 16);
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
      <div className="bg-red-600 text-white text-[11px] sm:text-xs text-center py-2 px-4 font-semibold uppercase">
        {cms.global.announcement}
      </div>

      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'bg-[#070707]/92 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/40' : 'bg-[#070707] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded bg-red-600 text-white flex items-center justify-center red-glow">
                <Car className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-xl font-bold text-white leading-none truncate">
                  {settings.shop_name || 'Sacca Car Beauty'}
                </span>
                <span className="block text-[10px] text-red-400 uppercase font-semibold truncate">
                  {settings.shop_tagline || 'Premium Accessories'}
                </span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'text-white bg-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="w-10 h-10 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link href="/wishlist" className="relative w-10 h-10 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && <Badge value={wishlist.length} />}
              </Link>
              <Link href="/cart" className="relative w-10 h-10 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <Badge value={cartCount} />}
              </Link>
              <Link href="/account" className="hidden sm:flex w-10 h-10 rounded items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex btn-primary py-2.5 px-4">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden w-10 h-10 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-white/10 bg-zinc-950/95 px-4 py-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                placeholder="Search interior, exterior, detailing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input-field"
              />
              <button type="submit" className="btn-primary px-4">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-zinc-950 px-4 py-4">
            <div className="space-y-1">
              {[...navLinks, { href: '/account', label: 'Account' }].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-3 rounded text-sm font-semibold ${
                    isActive(link.href) ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary w-full mt-3">
                <MessageCircle className="w-4 h-4" /> WhatsApp Inquiry
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

function Badge({ value }) {
  return (
    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
      {value > 9 ? '9+' : value}
    </span>
  );
}

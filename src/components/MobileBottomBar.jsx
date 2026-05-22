import Link from 'next/link';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSettings } from '@/context/SettingsContext';

export default function MobileBottomBar() {
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E7EB] bg-white/95 backdrop-blur-xl px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:hidden">
      <div className="grid grid-cols-2 gap-3">
        <Link href="/cart" className="btn-secondary py-3 text-xs">
          <ShoppingCart className="w-4 h-4" /> Cart {cartCount > 0 ? `(${cartCount})` : ''}
        </Link>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary py-3 text-xs">
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

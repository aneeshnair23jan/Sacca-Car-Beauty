import Link from 'next/link';
import { Heart, MessageCircle, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings, formatPrice } = useSettings();

  const discountedPrice =
    product.discount_percent > 0
      ? product.price * (1 - product.discount_percent / 100)
      : product.price;

  const wishlisted = isInWishlist(product.id);
  const whatsappHref = `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(`I want to know more about ${product.name}`)}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product);
    toast.success('Added to cart');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
      <Link href={`/product/${product.id}`} className="group card overflow-hidden flex flex-col hover:border-[#8DFF2F] transition-all duration-300">
        <div className="relative aspect-square bg-[#F5F7F8] overflow-hidden">
          {product.primary_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primary_image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/product-fallback-accessories.png"
              alt="Premium car accessories"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              {product.discount_percent > 0 && <Badge>-{product.discount_percent}%</Badge>}
              {Boolean(product.new_launch) && <Badge>New</Badge>}
              {Boolean(product.best_seller) && <Badge>Best Seller</Badge>}
              {product.stock === 0 && <Badge tone="dark">Sold Out</Badge>}
            </div>
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-md flex items-center justify-center backdrop-blur transition-colors ${
                wishlisted ? 'bg-[#111111] text-white' : 'bg-white/85 text-zinc-600 hover:text-[#111111]'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>

          <div className="absolute inset-x-3 bottom-3 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 grid grid-cols-[1fr_auto] gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-[#111111] disabled:bg-zinc-400 text-white text-xs font-bold py-3 rounded-md flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-11 bg-[#8DFF2F] text-[#111111] rounded-md flex items-center justify-center"
              aria-label="Ask on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          {product.category_name && (
            <span className="text-[11px] text-[#00A83D] font-bold uppercase tracking-[0.14em] mb-2">
              {product.category_name}
            </span>
          )}
          <h3 className="text-sm font-semibold text-[#111111] line-clamp-2 mb-3 flex-1 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-extrabold text-[#111111]">{formatPrice(discountedPrice)}</span>
              {product.discount_percent > 0 && (
                <span className="text-xs text-zinc-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[11px] text-amber-600 font-semibold">Only {product.stock} left</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Badge({ children, tone = 'green' }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
      tone === 'green' ? 'bg-[#8DFF2F] text-[#111111]' : 'bg-[#111111] text-white'
    }`}>
      {children}
    </span>
  );
}

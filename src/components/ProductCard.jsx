import Link from 'next/link';
import { Heart, MessageCircle, ShoppingCart } from 'lucide-react';
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
    <Link href={`/product/${product.id}`} className="group card-dark overflow-hidden flex flex-col hover:border-red-600/70 transition-all duration-300">
      <div className="relative aspect-square bg-zinc-900 overflow-hidden">
        {product.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full hero-visual flex items-center justify-center p-6">
            <div className="car-silhouette scale-75 w-full">
              <span className="wheel wheel-left" />
              <span className="wheel wheel-right" />
            </div>
          </div>
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
            className={`w-9 h-9 rounded flex items-center justify-center backdrop-blur transition-colors ${
              wishlisted ? 'bg-red-600 text-white' : 'bg-black/55 text-zinc-300 hover:text-white'
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 grid grid-cols-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-red-600 disabled:bg-zinc-800 text-white text-xs font-bold py-3 uppercase flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Add
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-black/90 text-white text-xs font-bold py-3 uppercase flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Ask
          </a>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {product.category_name && (
          <span className="text-[11px] text-red-500 font-bold uppercase mb-2">
            {product.category_name}
          </span>
        )}
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3 flex-1 leading-snug">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-white">{formatPrice(discountedPrice)}</span>
            {product.discount_percent > 0 && (
              <span className="text-xs text-zinc-500 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <span className="text-[11px] text-red-400 font-semibold">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Badge({ children, tone = 'red' }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
      tone === 'red' ? 'bg-red-600 text-white' : 'bg-zinc-950 text-white'
    }`}>
      {children}
    </span>
  );
}

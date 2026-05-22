import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { ShoppingCart, MessageCircle, Tag, Package, Plus, Minus, Heart, ChevronRight, Shield, RotateCcw } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSettings } from '@/context/SettingsContext';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { settings, formatPrice } = useSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/api/products/${id}`)
      .then((res) => { setProduct(res.data); setSelectedImage(0); })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEO title="Loading Product" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#8DFF2F] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEO title="Product Not Found" />
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-2xl font-extrabold text-[#111111] mb-4">Product not found</p>
          <Link href="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const buildWhatsAppMessage = () => {
    const msg = `Hi! I'd like to order:\n\n*${product.name}*\nQty: ${quantity}\nPrice: ${formatPrice(discountedPrice)} each\nTotal: ${formatPrice(discountedPrice * quantity)}\n\nPlease confirm availability.`;
    return `https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const images = product.images || [];
  const currentImage = images[selectedImage];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO
        title={product.seo_title || product.name}
        description={product.seo_description || product.description}
        type="product"
        image={product.primary_image_url || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.seo_description || product.description,
          image: product.primary_image_url ? [product.primary_image_url] : [],
          offers: {
            '@type': 'Offer',
            price: discountedPrice,
            priceCurrency: settings.currency || 'USD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
          aggregateRating: product.reviews?.length ? {
            '@type': 'AggregateRating',
            ratingValue: averageRating(product.reviews),
            reviewCount: product.reviews.length,
          } : undefined,
        }}
      />
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#00A83D] transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-[#00A83D] transition-colors">Shop</Link>
            {product.category_name && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/shop?category=${product.category_id}`} className="hover:text-[#00A83D] transition-colors">{product.category_name}</Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Images */}
          <div>
            <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: '1/1' }}>
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentImage.url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {product.discount_percent > 0 && (
                <div className="absolute top-4 left-4 bg-[#8DFF2F] text-[#111111] text-xs font-bold px-3 py-1 rounded-md tracking-wide">
                  -{product.discount_percent}% OFF
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 overflow-hidden border-2 rounded-md transition-colors ${selectedImage === i ? 'border-[#8DFF2F]' : 'border-transparent hover:border-gray-300'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category_name && (
              <p className="section-label mb-2">{product.category_name}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mb-4 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#111111]">{formatPrice(discountedPrice)}</span>
              {product.discount_percent > 0 && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-100">
              <Package className="w-4 h-4 text-gray-400" />
              {product.stock > 0 ? (
                <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                  {product.stock <= 5 ? `Only ${product.stock} left in stock` : `In Stock (${product.stock} available)`}
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.video_url && (
              <div className="mb-6">
                <a href={product.video_url} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  Watch Product Video
                </a>
              </div>
            )}

            {product.variants?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Variants</h2>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <span key={`${variant.name}-${variant.value}-${index}`} className="border border-gray-200 px-3 py-2 text-xs text-gray-700">
                      {variant.name}: {variant.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.vehicle_compatibility?.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Vehicle Compatibility</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {product.vehicle_compatibility.map((item, index) => (
                    <div key={`${item.brand}-${item.model}-${item.year}-${index}`} className="bg-gray-50 px-3 py-2 text-xs text-gray-700">
                      {[item.brand, item.model, item.year].filter(Boolean).join(' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Qty</span>
                <div className="flex items-center border border-gray-200">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-dark py-3 text-sm disabled:opacity-40"
              >
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <a
                href={buildWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-primary py-3 px-5"
              >
                <MessageCircle className="w-4 h-4" /> Order via WhatsApp
              </a>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${wishlisted ? 'bg-[#111111] border-[#111111] text-white' : 'border-[#E5E7EB] text-gray-400 hover:border-[#8DFF2F] hover:text-[#111111]'}`}
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Shield, text: 'Genuine Product' },
                { icon: RotateCcw, text: 'Easy Returns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-gray-50 px-3 py-2.5">
                  <Icon className="w-4 h-4 text-[#00A83D] flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700">{text}</span>
                </div>
              ))}
            </div>

            {product.reviews?.length > 0 && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Customer Reviews</h2>
                <div className="space-y-3">
                  {product.reviews.map((review, index) => (
                    <div key={`${review.name}-${index}`} className="bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                        <p className="text-xs text-amber-600 font-semibold">{review.rating}/5</p>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function averageRating(reviews) {
  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  return (total / reviews.length).toFixed(1);
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

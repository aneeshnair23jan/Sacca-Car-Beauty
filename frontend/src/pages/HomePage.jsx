import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, Shield, MessageCircle, ChevronRight, Flame, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';

export default function HomePage() {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newLaunches, setNewLaunches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?featured=1&limit=8'),
      axios.get('/api/products?best_seller=1&limit=8'),
      axios.get('/api/products?new_launch=1&limit=8'),
      axios.get('/api/categories'),
    ]).then(([featRes, bsRes, nlRes, catRes]) => {
      setFeaturedProducts(featRes.data.products);
      setBestSellers(bsRes.data.products);
      setNewLaunches(nlRes.data.products);
      setCategories(catRes.data.filter(c => c.product_count > 0));
    }).finally(() => setLoading(false));
  }, []);

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            {settings.shop_name}
          </h1>
          <p className="text-xl md:text-2xl text-primary-300 font-medium mb-4">{settings.shop_tagline}</p>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8 text-lg">{settings.shop_description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${settings.whatsapp_number?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg"
            >
              <MessageCircle className="w-5 h-5" /> Chat with Us
            </a>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <MessageCircle className="w-6 h-6 text-green-500" />, title: 'Order via WhatsApp', desc: 'Simple and fast ordering through WhatsApp' },
            { icon: <Shield className="w-6 h-6 text-primary-600" />, title: 'Quality Guaranteed', desc: 'Premium products for your vehicle' },
            { icon: <Star className="w-6 h-6 text-yellow-500" />, title: 'Top Rated', desc: 'Trusted by car enthusiasts everywhere' },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <div className="bg-gray-50 p-3 rounded-xl">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.id}`}
                  className="card p-4 text-center hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-100 transition-colors">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{cat.product_count} products</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {(loading || bestSellers.length > 0) && (
        <section className="py-12 px-4 bg-orange-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-xl">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
                  <p className="text-sm text-gray-500">Our most popular products</p>
                </div>
              </div>
              <Link to="/shop?best_seller=1" className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bestSellers.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* New Launches */}
      {(loading || newLaunches.length > 0) && (
        <section className="py-12 px-4 bg-green-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">New Launches</h2>
                  <p className="text-sm text-gray-500">Fresh arrivals just for you</p>
                </div>
              </div>
              <Link to="/shop?new_launch=1" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1 text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newLaunches.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {(loading || featuredProducts.length > 0) && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-xl">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                  <p className="text-sm text-gray-500">Hand-picked by our team</p>
                </div>
              </div>
              <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? <SkeletonGrid /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="bg-green-600 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Order?</h2>
          <p className="text-green-100 mb-6 text-lg">
            Add products to your cart and send your order directly via WhatsApp. Fast, easy, and personal.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-green-700 font-bold py-3 px-8 rounded-full hover:bg-green-50 transition-colors text-lg">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
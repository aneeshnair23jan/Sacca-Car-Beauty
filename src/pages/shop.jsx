import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import { getSettingsFromDb } from '@/lib/getSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const LIMIT = 12;

export default function ShopPage() {
  const router = useRouter();
  const { category: qCategory = '', search: qSearch = '', sort: qSort = 'newest', page: qPage = '1' } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/categories').then((res) => setCategories(res.data));
  }, []);

  const fetchProducts = useCallback(() => {
    if (!router.isReady) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (qCategory) params.set('category', qCategory);
    if (qSearch) params.set('search', qSearch);
    params.set('page', qPage);
    params.set('limit', LIMIT);
    axios.get(`/api/products?${params}`).then((res) => {
      let prods = res.data.products;
      if (qSort === 'price_asc') prods.sort((a, b) => a.discounted_price - b.discounted_price);
      else if (qSort === 'price_desc') prods.sort((a, b) => b.discounted_price - a.discounted_price);
      else if (qSort === 'name') prods.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(prods);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, [router.isReady, qCategory, qSearch, qSort, qPage]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const next = { ...router.query };
    if (value) next[key] = value; else delete next[key];
    delete next.page;
    router.push({ pathname: '/shop', query: next });
  };

  const clearFilters = () => router.push('/shop');
  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = parseInt(qPage);
  const hasFilters = qCategory || qSearch;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Page header */}
      <div className="bg-navy-900 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="section-label text-gold-400 mb-1">Our Collection</p>
          <h1 className="font-display text-3xl font-bold text-white">
            {qSearch ? `Results for "${qSearch}"` : qCategory ? (categories.find((c) => c.id == qCategory)?.name || 'Products') : 'All Products'}
          </h1>
          <p className="text-gray-400 text-sm mt-2">{total} product{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 uppercase tracking-wide border border-red-200 px-3 py-1.5">
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="sm:hidden flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 px-3 py-1.5">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
          <div className="relative">
            <select
              value={qSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input-field pr-8 text-sm appearance-none cursor-pointer w-48"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-56 flex-shrink-0`}>
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-4">Categories</h3>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors border-l-2 ${!qCategory ? 'border-gold-600 text-gold-700 bg-gold-50 font-semibold' : 'border-transparent text-gray-600 hover:text-gold-600 hover:bg-gray-50'}`}
                  >
                    All Products
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => updateFilter('category', cat.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-colors border-l-2 flex items-center justify-between ${qCategory == cat.id ? 'border-gold-600 text-gold-700 bg-gold-50 font-semibold' : 'border-transparent text-gray-600 hover:text-gold-600 hover:bg-gray-50'}`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.product_count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100">
                    <div className="aspect-square skeleton" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 skeleton rounded w-1/3" />
                      <div className="h-4 skeleton rounded w-3/4" />
                      <div className="h-4 skeleton rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 mt-10">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateFilter('page', i + 1)}
                        className={`w-9 h-9 text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-navy-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gold-400 hover:text-gold-600'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No products found</p>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

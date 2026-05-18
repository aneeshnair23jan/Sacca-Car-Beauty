import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { SlidersHorizontal, X, ChevronDown, Search, Sparkles } from 'lucide-react';
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
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    axios.get('/api/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setSearchInput(qSearch);
  }, [qSearch]);

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

  const submitSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const clearFilters = () => router.push('/shop');
  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = parseInt(qPage);
  const hasFilters = qCategory || qSearch;
  const activeCategory = categories.find((c) => c.id == qCategory);
  const heading = qSearch
    ? `Results for "${qSearch}"`
    : activeCategory
      ? activeCategory.name
      : 'All Products';

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F8]">
      <Navbar />

      <div className="relative overflow-hidden bg-[#111111] px-4 pb-12 pt-9 sm:pb-14 sm:pt-11">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/shop-collection-banner.png"
          alt="Premium car accessories collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/95 via-[#111111]/78 to-[#111111]/38" />
        <div className="absolute inset-0 surface-grid opacity-15" />
        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-[#8DFF2F] text-xs font-extrabold uppercase tracking-[0.22em] mb-3">Our Collection</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              {heading}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-6 mt-4 max-w-xl">
              Browse premium car accessories selected for fit, finish, protection, and daily usability.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <InfoPill label="Products" value={loading ? '...' : total} />
            <InfoPill label="Categories" value={categories.length} />
            <InfoPill label="Checkout" value="WhatsApp" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 pb-16 flex-1 w-full">
        <div className="mb-8 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_56px_rgba(17,17,17,0.08)]">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
            <form onSubmit={submitSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search mats, lighting, cameras..."
                className="input-field pl-12"
              />
            </form>
            <div className="flex items-center gap-3">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:border-[#8DFF2F] uppercase tracking-wide border border-[#E5E7EB] rounded-lg px-4 py-3">
                <X className="w-3 h-3" /> Clear Filters
              </button>
            )}
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden flex items-center gap-2 text-sm font-semibold text-gray-700 border border-[#E5E7EB] rounded-lg px-4 py-3">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
            <div className="relative">
            <select
              value={qSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
                className="input-field pr-10 text-sm appearance-none cursor-pointer w-full lg:w-52"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-28 rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_14px_44px_rgba(17,17,17,0.06)]">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xs font-extrabold tracking-[0.18em] uppercase text-gray-500">Categories</h3>
                <Sparkles className="w-4 h-4 text-[#00A83D]" />
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`w-full rounded-lg px-4 py-3 text-sm transition-colors flex items-center justify-between ${!qCategory ? 'text-[#111111] bg-[#8DFF2F] font-extrabold' : 'text-gray-600 hover:text-[#111111] hover:bg-[#F5F7F8]'}`}
                  >
                    <span>All Products</span>
                    <span className="text-xs">{categories.reduce((sum, cat) => sum + (cat.product_count || 0), 0)}</span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                  <button
                      onClick={() => updateFilter('category', cat.id)}
                      className={`w-full rounded-lg px-4 py-3 text-sm transition-colors flex items-center justify-between ${qCategory == cat.id ? 'text-[#111111] bg-[#8DFF2F] font-extrabold' : 'text-gray-600 hover:text-[#111111] hover:bg-[#F5F7F8]'}`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-gray-400">{cat.product_count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-zinc-500">
                Showing <span className="text-[#111111]">{products.length}</span> of <span className="text-[#111111]">{total}</span> products
              </p>
              {hasFilters && <span className="rounded-full bg-[#8DFF2F]/20 px-3 py-1 text-xs font-bold text-[#236f1e]">Filtered</span>}
            </div>
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card overflow-hidden">
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
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => updateFilter('page', i + 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#111111] text-white' : 'bg-white text-gray-600 border border-[#E5E7EB] hover:border-[#8DFF2F] hover:text-[#111111]'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-[#E5E7EB] bg-white text-center py-24 shadow-card">
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

function InfoPill({ label, value }) {
  return (
    <div className="rounded-lg border border-white/12 bg-white/10 px-4 py-2.5 backdrop-blur-xl">
      <p className="text-base font-extrabold text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/55 font-bold">{label}</p>
    </div>
  );
}

export async function getServerSideProps() {
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Search, Package, Eye, EyeOff, Star, X,
  SlidersHorizontal, Boxes, AlertTriangle, CheckCircle2, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { useSettings } from '@/context/SettingsContext';

const ROWS_PER_PAGE = 10;

export default function AdminProducts() {
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(() => {
    const active = products.filter((product) => product.active).length;
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length;
    const outOfStock = products.filter((product) => product.stock === 0).length;
    const featured = products.filter((product) => product.featured === 1).length;
    return { active, lowStock, outOfStock, featured };
  }, [products]);

  const activeFilters = Boolean(search || filterCategory || filterActive !== 'all');
  const selectedCategoryName = categories.find((category) => category.id === filterCategory)?.name;
  const totalPages = Math.max(1, Math.ceil(products.length / ROWS_PER_PAGE));
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedProducts = useMemo(
    () => products.slice(pageStart, pageStart + ROWS_PER_PAGE),
    [products, pageStart]
  );
  const visibleStart = products.length ? pageStart + 1 : 0;
  const visibleEnd = Math.min(pageStart + ROWS_PER_PAGE, products.length);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ active: filterActive, limit: 100 });
    if (filterCategory) params.set('category', filterCategory);
    if (search.trim()) params.set('search', search.trim());
    axios.get(`/api/products?${params}`)
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [filterCategory, filterActive, search]);

  useEffect(() => {
    axios.get('/api/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);
  useEffect(() => { setCurrentPage(1); }, [search, filterCategory, filterActive]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearch('');
    setFilterCategory('');
    setFilterActive('all');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const toggle = async (product, field) => {
    try {
      await axios.put(`/api/products/${product.id}`, { [field]: product[field] ? 0 : 1 });
      fetchProducts();
    } catch {
      toast.error('Failed to update product');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 rounded-2xl bg-gray-900 p-5 sm:p-6 text-white shadow-card overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary-500/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-300">Inventory</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Products</h1>
            <p className="text-gray-300 text-sm mt-2">
              Search, filter, and manage your store products from one place.
            </p>
          </div>
          <Link href="/admin/products/new" className="btn-primary flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Boxes} label="Showing" value={products.length} />
        <StatCard icon={CheckCircle2} label="Active" value={stats.active} tone="green" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock + stats.outOfStock} tone="amber" />
        <StatCard icon={Sparkles} label="Featured" value={stats.featured} tone="primary" />
      </div>

      <div className="card p-4 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Product Search</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_180px_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field admin-search-input h-12 text-base"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field h-12">
            <option value="">All Categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="input-field h-12">
            <option value="all">All Status</option>
            <option value="1">Active</option>
            <option value="0">Hidden</option>
          </select>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!activeFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
        {activeFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {search && <FilterPill label={`Search: ${search}`} />}
            {selectedCategoryName && <FilterPill label={`Category: ${selectedCategoryName}`} />}
            {filterActive !== 'all' && <FilterPill label={`Status: ${filterActive === '1' ? 'Active' : 'Hidden'}`} />}
          </div>
        )}
      </div>

      {loading ? (
        <div className="card p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : products.length > 0 ? (
        <div className="card overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
            <div>
              <h2 className="font-semibold text-gray-900">Product List</h2>
              <p className="text-xs text-gray-500 mt-1">
                Showing {visibleStart}-{visibleEnd} of {products.length} result{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1">
              10 rows per page
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 min-w-[320px]">Product</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">Stock</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden xl:table-cell">Status</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 w-56">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="h-[84px] hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-gray-100">
                          {product.primary_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 max-w-[260px] truncate">{product.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {product.featured === 1 && <Badge label="Featured" tone="yellow" />}
                            {product.best_seller === 1 && <Badge label="Best Seller" tone="orange" />}
                            {product.new_launch === 1 && <Badge label="New Launch" tone="green" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                      {product.category_name || <span className="text-gray-300">Uncategorized</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-900">{formatPrice(product.price)}</div>
                      {product.discount_percent > 0 && (
                        <span className="mt-1 inline-flex text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                          {product.discount_percent}% off
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <StockPill stock={product.stock} />
                    </td>
                    <td className="px-5 py-3 hidden xl:table-cell">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggle(product, 'featured')} title="Toggle featured"
                          className={`p-2 rounded-lg transition-colors ${product.featured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-yellow-400' : ''}`} />
                        </button>
                        <button onClick={() => toggle(product, 'best_seller')} title="Toggle best seller"
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${product.best_seller ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}>
                          BEST
                        </button>
                        <button onClick={() => toggle(product, 'new_launch')} title="Toggle new launch"
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${product.new_launch ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                          NEW
                        </button>
                        <button onClick={() => toggle(product, 'active')} title={product.active ? 'Hide product' : 'Show product'}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                          {product.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit product">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(product.id)}
                          title="Delete product"
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center text-gray-500 border border-gray-100">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">No products found</p>
          <p className="text-sm mt-1">Try another search or adjust the filters.</p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
            <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently delete the product and all its images. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    primary: 'bg-primary-50 text-primary-700',
  };

  return (
    <div className="card p-4 border border-gray-100">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function FilterPill({ label }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
      {label}
    </span>
  );
}

function Badge({ label, tone }) {
  const tones = {
    yellow: 'bg-yellow-50 text-yellow-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tones[tone]}`}>
      {label}
    </span>
  );
}

function StockPill({ stock }) {
  if (stock === 0) {
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">Out of stock</span>;
  }

  if (stock <= 5) {
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{stock} low stock</span>;
  }

  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">{stock} in stock</span>;
}

export async function getServerSideProps() {
  const { getSettingsFromDb } = await import('@/lib/getSettings');
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

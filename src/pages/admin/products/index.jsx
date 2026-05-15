import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Package, Eye, EyeOff, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { useSettings } from '@/context/SettingsContext';

export default function AdminProducts() {
  const { formatPrice } = useSettings();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ active: filterActive, limit: 100 });
    if (filterCategory) params.set('category', filterCategory);
    if (search) params.set('search', search);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input-field sm:w-48">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="input-field sm:w-40">
          <option value="all">All Status</option>
          <option value="1">Active</option>
          <option value="0">Hidden</option>
        </select>
      </div>

      {loading ? (
        <div className="card p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : products.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.primary_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 max-w-[200px] truncate">{product.name}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {product.featured === 1 && <span className="text-xs text-yellow-600">⭐ Featured</span>}
                            {product.best_seller === 1 && <span className="text-xs text-orange-600">🔥 Best Seller</span>}
                            {product.new_launch === 1 && <span className="text-xs text-green-600">🆕 New Launch</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {product.category_name || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      {product.discount_percent > 0 && (
                        <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                          -{product.discount_percent}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-600' :
                        product.stock <= 5 ? 'bg-amber-100 text-amber-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggle(product, 'featured')} title="Toggle featured"
                          className={`p-1.5 rounded-lg transition-colors ${product.featured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'}`}>
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-yellow-400' : ''}`} />
                        </button>
                        <button onClick={() => toggle(product, 'best_seller')} title="Toggle best seller"
                          className={`p-1.5 rounded-lg transition-colors text-sm ${product.best_seller ? 'text-orange-500' : 'text-gray-300 hover:text-orange-400'}`}>
                          🔥
                        </button>
                        <button onClick={() => toggle(product, 'new_launch')} title="Toggle new launch"
                          className={`p-1.5 rounded-lg transition-colors text-sm ${product.new_launch ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}>
                          🆕
                        </button>
                        <button onClick={() => toggle(product, 'active')} title={product.active ? 'Hide' : 'Show'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                          {product.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(product.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center text-gray-500">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or add a new product</p>
          <Link href="/admin/products/new" className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      )}

      {/* Delete Modal */}
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

export async function getServerSideProps() {
  const { getSettingsFromDb } = await import('@/lib/getSettings');
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

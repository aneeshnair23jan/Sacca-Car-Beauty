import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Package, Tag, AlertTriangle, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useSettings } from '@/context/SettingsContext';

export default function AdminDashboard() {
  const { formatPrice } = useSettings();
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?active=all&limit=100'),
      axios.get('/api/categories'),
    ]).then(([prodRes, catRes]) => {
      const products = prodRes.data.products;
      const categories = catRes.data;
      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.active).length,
        outOfStock: products.filter((p) => p.stock === 0).length,
        totalCategories: categories.length,
      });
      setLowStock(products.filter((p) => p.stock > 0 && p.stock <= 5).slice(0, 5));
      setRecentProducts(products.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts, icon: Package, color: 'bg-blue-500', link: '/admin/products' },
    { label: 'Active Products', value: stats?.activeProducts, icon: TrendingUp, color: 'bg-green-500', link: '/admin/products' },
    { label: 'Out of Stock', value: stats?.outOfStock, icon: AlertTriangle, color: 'bg-red-500', link: '/admin/products' },
    { label: 'Categories', value: stats?.totalCategories, icon: Tag, color: 'bg-purple-500', link: '/admin/categories' },
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome to your admin portal</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <Link key={i} href={card.link} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${card.color} p-2 rounded-lg`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{card.value ?? '—'}</div>
                <div className="text-sm text-gray-500 mt-1">{card.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Recent Products</h2>
                <Link href="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {recentProducts.length > 0 ? (
                <div className="space-y-3">
                  {recentProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {p.primary_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.primary_image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category_name || 'Uncategorized'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(p.price)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          p.stock === 0 ? 'bg-red-100 text-red-600' :
                          p.stock <= 5 ? 'bg-amber-100 text-amber-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No products yet</p>
              )}
            </div>

            {/* Low Stock */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Alert
              </h2>
              {lowStock.length > 0 ? (
                <div className="space-y-3">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category_name || 'Uncategorized'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                          {p.stock} left
                        </span>
                        <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-primary-600 hover:underline">
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-gray-400 text-sm">All products are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  const { getSettingsFromDb } = await import('@/lib/getSettings');
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

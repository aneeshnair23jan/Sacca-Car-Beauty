import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Plus, Edit, Trash2, Tag, Save, X, ChevronLeft, ChevronRight,
  Search, SlidersHorizontal, Layers3, Image as ImageIcon, PackageCheck, ListChecks,
  Upload, Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { getCategoryImage } from '@/lib/categoryImages';

const ROWS_PER_PAGE = 10;

export default function AdminCategories() {
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '' });
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => (
      category.name?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    ));
  }, [categories, search]);

  const stats = useMemo(() => {
    const assignedProducts = categories.reduce((total, category) => total + (category.product_count || 0), 0);
    const customImages = categories.filter((category) => category.image_url).length;
    const emptyCategories = categories.filter((category) => !category.product_count).length;
    return { assignedProducts, customImages, emptyCategories };
  }, [categories]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ROWS_PER_PAGE));
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE;
  const paginatedCategories = useMemo(
    () => filteredCategories.slice(pageStart, pageStart + ROWS_PER_PAGE),
    [filteredCategories, pageStart]
  );
  const visibleStart = filteredCategories.length ? pageStart + 1 : 0;
  const visibleEnd = Math.min(pageStart + ROWS_PER_PAGE, filteredCategories.length);

  const fetchCategories = () => {
    setLoading(true);
    axios.get('/api/categories').then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search]);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', description: '', image_url: '' });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/api/categories/${editingId}`, form);
        toast.success('Category updated');
      } else {
        await axios.post('/api/categories', form);
        toast.success('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`/api/categories/${id}`);
      toast.success(res.data?.message || 'Category deleted');
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      e.target.value = '';
      return;
    }

    const data = new FormData();
    data.append('image', file);
    setUploadingImage(true);
    try {
      const res = await axios.post('/api/uploads', data);
      setForm((current) => ({ ...current, image_url: res.data.url }));
      toast.success('Category image uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 rounded-2xl bg-gray-900 p-5 sm:p-6 text-white shadow-card overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-primary-500/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-300">Catalog</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Categories</h1>
            <p className="text-gray-300 text-sm mt-2">
              Organize storefront categories, preview images, and product assignments.
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Layers3} label="Categories" value={categories.length} />
        <StatCard icon={PackageCheck} label="Assigned Products" value={stats.assignedProducts} tone="green" />
        <StatCard icon={ImageIcon} label="Custom Images" value={stats.customImages} tone="primary" />
        <StatCard icon={ListChecks} label="Empty" value={stats.emptyCategories} tone="amber" />
      </div>

      <div className="card p-4 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Category Search</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by category name or description"
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
          <button
            type="button"
            onClick={() => setSearch('')}
            disabled={!search}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
        {search && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Search: {search}
            </span>
          </div>
        )}
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-primary-200 border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Category' : 'New Category'}</h2>
              <p className="text-xs text-gray-500 mt-1">Category changes appear on the storefront and admin lists.</p>
            </div>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Car Care, Interior, Electronics"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    placeholder="/images/categories/floor-mats.png"
                    className="input-field"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                  >
                    {uploadingImage ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingImage ? 'Uploading' : 'Upload'}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload to configured storage, or paste a local/full image URL.
                </p>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
              <p className="text-sm font-semibold text-gray-900 mb-3">Image preview</p>
              <div className="aspect-square rounded-xl overflow-hidden bg-white border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url || getCategoryImage(form.name)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Shows your custom image URL, or the matching default image when the URL is empty.
              </p>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="card p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="card overflow-hidden border border-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-gray-100 bg-white">
            <div>
              <h2 className="font-semibold text-gray-900">Category Library</h2>
              <p className="text-xs text-gray-500 mt-1">
                Showing {visibleStart}-{visibleEnd} of {filteredCategories.length} categories
              </p>
            </div>
            <span className="w-fit rounded-full bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1">
              10 rows per page
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 min-w-[320px]">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Description</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 w-40">Products</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCategories.map((cat) => (
                  <tr key={cat.id} className="h-[84px] hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-primary-100 overflow-hidden flex items-center justify-center flex-shrink-0 ring-1 ring-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cat.image_url || getCategoryImage(cat.name)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 max-w-[260px] truncate">{cat.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {cat.image_url ? <Badge label="Custom Image" tone="primary" /> : <Badge label="Default Image" tone="gray" />}
                            {!cat.product_count && <Badge label="Empty" tone="amber" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell max-w-xl">
                      <span className="line-clamp-2">
                        {cat.description || <span className="text-gray-300">No description</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        cat.product_count > 0 ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cat.product_count} product{cat.product_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          title="Edit category"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          title={cat.product_count > 0 ? 'Delete and move products to Uncategorized' : 'Delete'}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
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
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center text-gray-500 border border-gray-100">
          <Tag className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-900">No categories found</p>
          <p className="text-sm mt-1">Try another search or add a new category.</p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => setSearch('')} className="btn-secondary">Clear Search</button>
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Category?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently delete this category. Products in this category will be moved to Uncategorized.
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

function Badge({ label, tone }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    amber: 'bg-amber-50 text-amber-700',
    primary: 'bg-primary-50 text-primary-700',
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tones[tone]}`}>
      {label}
    </span>
  );
}

export async function getServerSideProps() {
  const { getSettingsFromDb } = await import('@/lib/getSettings');
  const initialSettings = await getSettingsFromDb();
  return { props: { initialSettings } };
}

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Upload, X, Star, ArrowLeft, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/AdminLayout';
import { useSettings } from '@/context/SettingsContext';

export default function AdminProductForm({ productId }) {
  const router = useRouter();
  const { formatPrice } = useSettings();
  const isEdit = Boolean(productId);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: '', description: '', price: '', discount_percent: '',
    stock: '', category_id: '', featured: false, best_seller: false,
    new_launch: false, active: true, video_url: '', seo_title: '',
    seo_description: '', variants: '[]', vehicle_compatibility: '[]',
    reviews: '[]', related_product_ids: '',
  });
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('/api/categories').then((res) => setCategories(res.data));
    if (isEdit) {
      setLoading(true);
      axios.get(`/api/products/${productId}`)
        .then((res) => {
          const p = res.data;
          setForm({
            name: p.name || '', description: p.description || '',
            price: p.price?.toString() || '',
            discount_percent: p.discount_percent?.toString() || '',
            stock: p.stock?.toString() || '',
            category_id: p.category_id?.toString() || '',
            featured: Boolean(p.featured), best_seller: Boolean(p.best_seller),
            new_launch: Boolean(p.new_launch), active: Boolean(p.active),
            video_url: p.video_url || '',
            seo_title: p.seo_title || '',
            seo_description: p.seo_description || '',
            variants: prettyJson(p.variants),
            vehicle_compatibility: prettyJson(p.vehicle_compatibility),
            reviews: prettyJson(p.reviews),
            related_product_ids: (p.related_product_ids || []).join(', '),
          });
          setExistingImages(p.images || []);
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [productId, isEdit]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.type.startsWith('image/'));
    if (valid.length !== files.length) toast.error('Some files were skipped (only images allowed)');
    setNewImages((prev) => [...prev, ...valid]);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewImagePreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    try {
      await axios.delete(`/api/products/${productId}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await axios.put(`/api/products/${productId}/images/${imageId}/primary`);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId ? 1 : 0 }))
      );
      toast.success('Primary image updated');
    } catch {
      toast.error('Failed to update primary image');
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) <= 0) errs.price = 'Valid price is required';
    if (form.discount_percent && (isNaN(form.discount_percent) || parseFloat(form.discount_percent) < 0 || parseFloat(form.discount_percent) > 100)) {
      errs.discount_percent = 'Discount must be between 0 and 100';
    }
    if (form.stock && (isNaN(form.stock) || parseInt(form.stock) < 0)) errs.stock = 'Stock must be 0 or more';
    ['variants', 'vehicle_compatibility', 'reviews'].forEach((key) => {
      try {
        const parsed = JSON.parse(form[key] || '[]');
        if (!Array.isArray(parsed)) errs[key] = 'Must be a JSON array';
      } catch {
        errs[key] = 'Must be valid JSON';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, typeof v === 'boolean' ? (v ? 1 : 0) : v));
      newImages.forEach((file) => data.append('images', file));

      if (isEdit) {
        await axios.put(`/api/products/${productId}`, data);
        toast.success('Product updated');
      } else {
        await axios.post('/api/products', data);
        toast.success('Product created');
      }
      router.push('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const discountedPrice =
    form.price && form.discount_percent
      ? (parseFloat(form.price) * (1 - parseFloat(form.discount_percent) / 100)).toFixed(2)
      : null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="text-gray-500 text-sm mt-1">{isEdit ? 'Update product details' : 'Add a new product to your store'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Product Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`input-field ${errors.name ? 'border-red-400' : ''}`}
              placeholder="e.g. Premium Car Wax"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="input-field resize-none"
              placeholder="Describe the product..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing & Stock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className={`input-field ${errors.price ? 'border-red-400' : ''}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={form.discount_percent}
                onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
                className={`input-field ${errors.discount_percent ? 'border-red-400' : ''}`}
                placeholder="0"
              />
              {errors.discount_percent && <p className="text-red-500 text-xs mt-1">{errors.discount_percent}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                className={`input-field ${errors.stock ? 'border-red-400' : ''}`}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>
          {discountedPrice && parseFloat(form.discount_percent) > 0 && (
            <p className="text-sm text-green-600 font-medium">
              Sale price: {formatPrice(discountedPrice)} ({form.discount_percent}% off)
            </p>
          )}
        </div>

        {/* Product CMS Details */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Content, SEO & Compatibility</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
            <input
              type="url"
              value={form.video_url}
              onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
              className="input-field"
              placeholder="https://..."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input
                value={form.seo_title}
                onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                className="input-field"
                placeholder="Search result title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <input
                value={form.seo_description}
                onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                className="input-field"
                placeholder="Search result description"
              />
            </div>
          </div>
          <JsonField
            label="Variants JSON"
            value={form.variants}
            error={errors.variants}
            onChange={(value) => setForm((f) => ({ ...f, variants: value }))}
            hint='Example: [{"name":"Color","value":"Black","price_delta":0,"stock":10}]'
          />
          <JsonField
            label="Vehicle Compatibility JSON"
            value={form.vehicle_compatibility}
            error={errors.vehicle_compatibility}
            onChange={(value) => setForm((f) => ({ ...f, vehicle_compatibility: value }))}
            hint='Example: [{"brand":"BMW","model":"3 Series","year":"2025"}]'
          />
          <JsonField
            label="Customer Reviews JSON"
            value={form.reviews}
            error={errors.reviews}
            onChange={(value) => setForm((f) => ({ ...f, reviews: value }))}
            hint='Example: [{"name":"Customer","rating":5,"comment":"Excellent fit."}]'
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Related Product IDs</label>
            <input
              value={form.related_product_ids}
              onChange={(e) => setForm((f) => ({ ...f, related_product_ids: e.target.value }))}
              className="input-field"
              placeholder="Comma separated Mongo product IDs"
            />
          </div>
        </div>

        {/* Images */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product Images</h2>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Current images</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className={`w-20 h-20 object-cover rounded-lg border-2 ${img.is_primary ? 'border-primary-500' : 'border-transparent'}`}
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-1 rounded">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                      {!img.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(img.id)}
                          className="p-1 bg-white rounded text-yellow-600"
                          title="Set as primary"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="p-1 bg-white rounded text-red-600"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {newImagePreviews.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">New images to upload</p>
              <div className="flex flex-wrap gap-3">
                {newImagePreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-dashed border-primary-300" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 btn-secondary text-sm"
          >
            <Upload className="w-4 h-4" /> Upload Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP — max 10MB each</p>
        </div>

        {/* Flags */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Product Flags</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: 'active', label: 'Active', desc: 'Visible in store' },
              { key: 'featured', label: 'Featured', desc: 'Show in featured' },
              { key: 'best_seller', label: 'Best Seller', desc: '🔥 badge' },
              { key: 'new_launch', label: 'New Launch', desc: '🆕 badge' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 text-primary-600 rounded"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{label}</div>
                  <div className="text-xs text-gray-400">{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary py-3 px-8 flex items-center gap-2">
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <Link href="/admin/products" className="btn-secondary py-3 px-6">Cancel</Link>
        </div>
      </form>
    </AdminLayout>
  );
}

function prettyJson(value) {
  return JSON.stringify(value || [], null, 2);
}

function JsonField({ label, value, error, onChange, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`input-field resize-y font-mono text-xs ${error ? 'border-red-400' : ''}`}
      />
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Upload, X, Star, ArrowLeft, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_percent: '',
    stock: '',
    category_id: '',
    featured: false,
    best_seller: false,
    new_launch: false,
    active: true,
  });
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data));

    if (isEdit) {
      setLoading(true);
      axios.get(`/api/products/${id}`)
        .then(res => {
          const p = res.data;
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price?.toString() || '',
            discount_percent: p.discount_percent?.toString() || '',
            stock: p.stock?.toString() || '',
            category_id: p.category_id?.toString() || '',
            featured: Boolean(p.featured),
            best_seller: Boolean(p.best_seller),
            new_launch: Boolean(p.new_launch),
            active: Boolean(p.active),
          });
          setExistingImages(p.images || []);
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Some files were skipped (only images allowed)');
    }
    setNewImages(prev => [...prev, ...validFiles]);
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setNewImagePreviews(prev => [...prev, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    try {
      await axios.delete(`/api/products/${id}/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const setPrimaryImage = async (imageId) => {
    try {
      await axios.put(`/api/products/${id}/images/${imageId}/primary`);
      setExistingImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId ? 1 : 0 })));
      toast.success('Primary image updated');
    } catch {
      toast.error('Failed to update primary image');
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.price || isNaN(form.price) || parseFloat(form.price) < 0) errs.price = 'Valid price is required';
    if (form.discount_percent && (isNaN(form.discount_percent) || parseFloat(form.discount_percent) < 0 || parseFloat(form.discount_percent) > 100)) {
      errs.discount_percent = 'Discount must be between 0 and 100';
    }
    if (form.stock && (isNaN(form.stock) || parseInt(form.stock) < 0)) errs.stock = 'Stock must be a positive number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', form.price);
      formData.append('discount_percent', form.discount_percent || '0');
      formData.append('stock', form.stock || '0');
      formData.append('category_id', form.category_id || '');
      formData.append('featured', form.featured ? '1' : '0');
      formData.append('best_seller', form.best_seller ? '1' : '0');
      formData.append('new_launch', form.new_launch ? '1' : '0');
      formData.append('active', form.active ? '1' : '0');
      newImages.forEach(file => formData.append('images', file));

      if (isEdit) {
        await axios.put(`/api/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isEdit ? 'Update product details' : 'Fill in the details for your new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Premium Car Wax Polish"
                    className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the product, its features, and benefits..."
                    rows={5}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">Select a category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                      className={`input-field pl-7 ${errors.price ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.discount_percent}
                      onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                      placeholder="0"
                      className={`input-field pr-7 ${errors.discount_percent ? 'border-red-400' : ''}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  {errors.discount_percent && <p className="text-red-500 text-xs mt-1">{errors.discount_percent}</p>}
                  {form.price && form.discount_percent > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Sale price: ${(parseFloat(form.price) * (1 - parseFloat(form.discount_percent) / 100)).toFixed(2)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="0"
                    className={`input-field ${errors.stock ? 'border-red-400' : ''}`}
                  />
                  {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Product Images</h2>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Current images (click star to set as primary)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {existingImages.map(img => (
                      <div key={img.id} className="relative group aspect-square">
                        <img
                          src={img.url}
                          alt=""
                          className={`w-full h-full object-cover rounded-lg border-2 ${img.is_primary ? 'border-primary-500' : 'border-transparent'}`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(img.id)}
                            title="Set as primary"
                            className={`p-1 rounded-full ${img.is_primary ? 'bg-yellow-400' : 'bg-white/80 hover:bg-yellow-400'} transition-colors`}
                          >
                            <Star className={`w-3 h-3 ${img.is_primary ? 'text-white fill-white' : 'text-gray-700'}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                        {img.is_primary === 1 && (
                          <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-xs px-1 rounded">Main</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">New images to upload</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {newImagePreviews.map((preview, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={preview} alt="" className="w-full h-full object-cover rounded-lg border-2 border-dashed border-primary-300" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors group"
              >
                <Upload className="w-8 h-8 text-gray-300 group-hover:text-primary-500 mx-auto mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-500 group-hover:text-primary-600">Click to upload images</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP up to 10MB each</p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Product Status</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Active / Visible</p>
                    <p className="text-xs text-gray-500">Show this product in the store</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.active ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Featured</p>
                    <p className="text-xs text-gray-500">Show on homepage</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.featured ? 'bg-yellow-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">🔥 Best Seller</p>
                    <p className="text-xs text-gray-500">Show Best Seller badge</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, best_seller: !f.best_seller }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.best_seller ? 'bg-orange-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.best_seller ? 'translate-x-5' : ''}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">🆕 New Launch</p>
                    <p className="text-xs text-gray-500">Show New Launch badge</p>
                  </div>
                  <div
                    onClick={() => setForm(f => ({ ...f, new_launch: !f.new_launch }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.new_launch ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.new_launch ? 'translate-x-5' : ''}`} />
                  </div>
                </label>
              </div>
            </div>

            {/* Preview */}
            {form.price && (
              <div className="card p-6 bg-gray-50">
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">Price Preview</h2>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Original Price</span>
                    <span className="font-medium">${parseFloat(form.price || 0).toFixed(2)}</span>
                  </div>
                  {form.discount_percent > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-red-500">-{form.discount_percent}%</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1 mt-1">
                        <span>Sale Price</span>
                        <span className="text-green-600">${(parseFloat(form.price) * (1 - parseFloat(form.discount_percent) / 100)).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <Link to="/admin/products" className="w-full btn-secondary py-3 flex items-center justify-center">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

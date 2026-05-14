import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader, MessageCircle, Store, DollarSign, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { setSettings } = useSettings();
  const [form, setForm] = useState({
    shop_name: '',
    shop_tagline: '',
    shop_description: '',
    whatsapp_number: '',
    currency: '',
    currency_symbol: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    axios.get('/api/settings')
      .then(res => setForm(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/api/settings', form);
      setSettings(res.data);
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwSaving(true);
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your store settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Store Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-600" /> Store Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={form.shop_name || ''}
                  onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                  className="input-field"
                  placeholder="Sacca Car Beauty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.shop_tagline || ''}
                  onChange={e => setForm(f => ({ ...f, shop_tagline: e.target.value }))}
                  className="input-field"
                  placeholder="Premium Car Accessories"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                <textarea
                  value={form.shop_description || ''}
                  onChange={e => setForm(f => ({ ...f, shop_description: e.target.value }))}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Brief description of your store..."
                />
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp Contact
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp_number || ''}
                onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                className="input-field"
                placeholder="+1234567890"
              />
              <p className="text-xs text-gray-400 mt-1">
                Include country code (e.g. +91 for India, +1 for US). Customers will send orders to this number.
              </p>
              {form.whatsapp_number && (
                <a
                  href={`https://wa.me/${form.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-2"
                >
                  <MessageCircle className="w-3 h-3" /> Test this number
                </a>
              )}
            </div>
          </div>

          {/* Currency */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary-600" /> Currency
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  value={form.currency || ''}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  className="input-field"
                  placeholder="USD"
                  maxLength={5}
                />
                <p className="text-xs text-gray-400 mt-1">e.g. USD, EUR, GBP, INR</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={form.currency_symbol || ''}
                  onChange={e => setForm(f => ({ ...f, currency_symbol: e.target.value }))}
                  className="input-field"
                  placeholder="$"
                  maxLength={5}
                />
                <p className="text-xs text-gray-400 mt-1">e.g. $, €, £, ₹</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 flex items-center gap-2"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" /> Change Password
          </h2>
          <p className="text-sm text-gray-500 mb-4">Update your admin login password</p>
          <div className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password', showKey: 'current' },
              { key: 'newPassword', label: 'New Password', placeholder: 'At least 6 characters', showKey: 'new' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password', showKey: 'confirm' },
            ].map(({ key, label, placeholder, showKey }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={showPw[showKey] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => ({ ...s, [showKey]: !s[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="mt-4 btn-primary py-2.5 px-6 flex items-center gap-2"
          >
            {pwSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {pwSaving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

function MaskedInput({ value, onChange, placeholder, revealed, onToggleReveal, type = 'text', ...props }) {
  const showReveal = typeof onToggleReveal === 'function';
  return (
    <div className="relative">
      <input
        type={showReveal && !revealed ? 'password' : type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stone-300 px-4 py-2 pr-20 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        autoComplete="off"
        {...props}
      />
      {showReveal && (
        <button
          type="button"
          onClick={onToggleReveal}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-amber-600 hover:underline"
        >
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      )}
    </div>
  );
}

function SectionCard({ title, children, onSave, saving, success, error }) {
  return (
    <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-stone-800">{title}</h2>
      {children}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">Saved successfully.</p>}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [revealed, setRevealed] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [error, setError] = useState({});

  const fetchSettings = useCallback(() => {
    axios.get(`${API_BASE}/admin/settings`, { headers: headers() })
      .then(({ data }) => {
        setSettings(data.data || {});
        setForm(data.data || {});
      })
      .catch(() => setSettings({}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateForm = (group, key, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: { ...(prev[group] || {}), [key]: value },
    }));
    setError((e) => ({ ...e, [group]: null }));
  };

  const saveSection = (group) => {
    setSaving((s) => ({ ...s, [group]: true }));
    setError((e) => ({ ...e, [group]: null }));
    setSuccess((s) => ({ ...s, [group]: false }));
    const payload = { group, ...(form[group] || {}) };
    axios.put(`${API_BASE}/admin/settings`, payload, { headers: headers() })
      .then(({ data }) => {
        setSettings((prev) => ({ ...prev, [group]: data.data || {} }));
        setForm((prev) => ({ ...prev, [group]: data.data || {} }));
        setSuccess((s) => ({ ...s, [group]: true }));
        setTimeout(() => setSuccess((s) => ({ ...s, [group]: false })), 3000);
      })
      .catch((err) => setError((e) => ({ ...e, [group]: err.response?.data?.message || 'Save failed.' })))
      .finally(() => setSaving((s) => ({ ...s, [group]: false })));
  };

  const logoEndpoints = {
    site_logo: 'settings/upload-logo',
    header_logo: 'settings/upload-header-logo',
    footer_logo: 'settings/upload-footer-logo',
    site_favicon: 'settings/upload-favicon',
  };

  const uploadFile = (endpoint, file, groupKey) => {
    const fd = new FormData();
    fd.append('file', file);
    setSaving((s) => ({ ...s, [groupKey]: true }));
    setError((e) => ({ ...e, general: null }));
    axios.post(`${API_BASE}/admin/${endpoint}`, fd, { headers: headers() })
      .then(({ data }) => {
        updateForm('general', groupKey, data.url);
        setSettings((prev) => ({ ...prev, general: { ...(prev.general || {}), [groupKey]: data.url } }));
        setForm((prev) => ({ ...prev, general: { ...(prev.general || {}), [groupKey]: data.url } }));
        setSuccess((s) => ({ ...s, general: true }));
        setTimeout(() => setSuccess((s) => ({ ...s, general: false })), 3000);
        window.dispatchEvent(new Event('admin-settings-logos-updated'));
      })
      .catch((err) => setError((e) => ({ ...e, general: err.response?.data?.message || 'Upload failed.' })))
      .finally(() => setSaving((s) => ({ ...s, [groupKey]: false })));
  };

  const toggleReveal = (key) => setRevealed((r) => ({ ...r, [key]: !r[key] }));

  const g = (group) => form[group] || settings[group] || {};
  const v = (group, key) => g(group)[key] ?? '';

  if (loading) return <div className="text-stone-600">Loading settings...</div>;

  return (
    <div className="mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Admin Settings</h1>
      <p className="mb-6 text-sm text-stone-500">Super Admin only. Sensitive fields are masked; use Reveal to view.</p>

      {/* Logos & Favicon — used across site and admin dashboard; uploads save immediately */}
      <div className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-stone-800">Logos & Favicon</h2>
        <p className="mb-4 text-sm text-stone-500">Uploaded images are saved immediately and used across the public site and admin dashboard.</p>
        {error.general && <p className="mb-2 text-sm text-red-600">{error.general}</p>}
        {success.general && <p className="mb-2 text-sm text-green-600">Upload saved.</p>}
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { key: 'site_logo', label: 'Site Logo', accept: '.png,.jpg,.jpeg,.svg', hint: 'Main logo (e.g. homepage)' },
            { key: 'header_logo', label: 'Header Logo', accept: '.png,.jpg,.jpeg,.svg', hint: 'Logo in header/nav and admin sidebar' },
            { key: 'footer_logo', label: 'Footer Logo', accept: '.png,.jpg,.jpeg,.svg', hint: 'Logo in footer' },
            { key: 'site_favicon', label: 'Favicon', accept: '.ico,.png', hint: 'Browser tab icon' },
          ].map(({ key, label, accept, hint }) => (
            <div key={key} className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
              <label className="mb-1 block text-sm font-medium text-stone-700">{label}</label>
              <p className="mb-2 text-xs text-stone-500">{hint}</p>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept={accept}
                  disabled={saving[key]}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(logoEndpoints[key], file, key);
                    e.target.value = '';
                  }}
                  className="text-sm text-stone-600 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:hover:bg-amber-600"
                />
                {v('general', key) && (
                  <span className="inline-flex items-center gap-2">
                    {key === 'site_favicon' ? (
                      <img src={v('general', key)} alt="Favicon" className="h-8 w-8 rounded border border-stone-200 object-contain" />
                    ) : (
                      <img src={v('general', key)} alt={label} className="h-10 max-w-[180px] rounded border border-stone-200 object-contain" />
                    )}
                  </span>
                )}
                {saving[key] && <span className="text-xs text-amber-600">Uploading…</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Site Settings */}
      <SectionCard
        title="General Site Settings"
        onSave={() => saveSection('general')}
        saving={saving.general}
        success={success.general}
        error={error.general}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Site Title</label>
            <input
              type="text"
              value={v('general', 'site_title')}
              onChange={(e) => updateForm('general', 'site_title', e.target.value)}
              placeholder="Site Title"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Site Tagline</label>
            <input
              type="text"
              value={v('general', 'site_tagline')}
              onChange={(e) => updateForm('general', 'site_tagline', e.target.value)}
              placeholder="Tagline"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Site Email</label>
            <input
              type="email"
              value={v('general', 'site_email')}
              onChange={(e) => updateForm('general', 'site_email', e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Site Phone</label>
            <input
              type="text"
              value={v('general', 'site_phone')}
              onChange={(e) => updateForm('general', 'site_phone', e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-stone-700">Site Address</label>
            <input
              type="text"
              value={v('general', 'site_address')}
              onChange={(e) => updateForm('general', 'site_address', e.target.value)}
              placeholder="123 Main St, City, State ZIP"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </SectionCard>

      {/* Social Media Links */}
      <SectionCard
        title="Social Media Links"
        onSave={() => saveSection('social')}
        saving={saving.social}
        success={success.social}
        error={error.social}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {['facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url', 'youtube_url', 'tiktok_url'].map((key) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                {key.replace(/_url$/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} URL
              </label>
              <input
                type="url"
                value={v('social', key)}
                onChange={(e) => updateForm('social', key, e.target.value)}
                placeholder={`https://${key.replace('_url', '')}.com/...`}
                className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Payment Gateway (Stripe) */}
      <SectionCard
        title="Payment Gateway (Stripe)"
        onSave={() => saveSection('stripe')}
        saving={saving.stripe}
        success={success.stripe}
        error={error.stripe}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Stripe Publishable Key</label>
            <input
              type="text"
              value={v('stripe', 'stripe_publishable_key')}
              onChange={(e) => updateForm('stripe', 'stripe_publishable_key', e.target.value)}
              placeholder="pk_..."
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Stripe Secret Key</label>
            <MaskedInput
              value={v('stripe', 'stripe_secret_key')}
              onChange={(val) => updateForm('stripe', 'stripe_secret_key', val)}
              placeholder="sk_..."
              revealed={revealed.stripe_secret_key}
              onToggleReveal={() => toggleReveal('stripe_secret_key')}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-stone-700">Webhook Secret Key</label>
            <MaskedInput
              value={v('stripe', 'stripe_webhook_secret')}
              onChange={(val) => updateForm('stripe', 'stripe_webhook_secret', val)}
              placeholder="whsec_..."
              revealed={revealed.stripe_webhook_secret}
              onToggleReveal={() => toggleReveal('stripe_webhook_secret')}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="stripe_enabled"
              checked={v('stripe', 'stripe_enabled') === '1' || v('stripe', 'stripe_enabled') === true}
              onChange={(e) => updateForm('stripe', 'stripe_enabled', e.target.checked ? '1' : '0')}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="stripe_enabled" className="text-sm font-medium text-stone-700">Enable Stripe Payments</label>
          </div>
        </div>
      </SectionCard>

      {/* Google Services */}
      <SectionCard
        title="Google Services"
        onSave={() => saveSection('google')}
        saving={saving.google}
        success={success.google}
        error={error.google}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-stone-700">Google Maps API Key</label>
            <MaskedInput
              value={v('google', 'google_maps_api_key')}
              onChange={(val) => updateForm('google', 'google_maps_api_key', val)}
              placeholder="API key"
              revealed={revealed.google_maps_api_key}
              onToggleReveal={() => toggleReveal('google_maps_api_key')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Google Analytics Measurement ID</label>
            <input
              type="text"
              value={v('google', 'google_analytics_id')}
              onChange={(e) => updateForm('google', 'google_analytics_id', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Google Tag Manager ID</label>
            <input
              type="text"
              value={v('google', 'google_tag_manager_id')}
              onChange={(e) => updateForm('google', 'google_tag_manager_id', e.target.value)}
              placeholder="GTM-XXXXXXX"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </SectionCard>

      {/* AI / ChatGPT Integration */}
      <SectionCard
        title="AI / ChatGPT Integration"
        onSave={() => saveSection('ai')}
        saving={saving.ai}
        success={success.ai}
        error={error.ai}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-stone-700">OpenAI API Key</label>
            <MaskedInput
              value={v('ai', 'openai_api_key')}
              onChange={(val) => updateForm('ai', 'openai_api_key', val)}
              placeholder="sk-..."
              revealed={revealed.openai_api_key}
              onToggleReveal={() => toggleReveal('openai_api_key')}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Model</label>
            <select
              value={v('ai', 'ai_model')}
              onChange={(e) => updateForm('ai', 'ai_model', e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select model</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Max Tokens</label>
            <input
              type="number"
              min={1}
              max={128000}
              value={v('ai', 'ai_max_tokens') || ''}
              onChange={(e) => updateForm('ai', 'ai_max_tokens', e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 1000"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Temperature (0–2)</label>
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={v('ai', 'ai_temperature') ?? ''}
              onChange={(e) => updateForm('ai', 'ai_temperature', e.target.value ? Number(e.target.value) : '')}
              placeholder="0.7"
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              id="ai_enabled"
              checked={v('ai', 'ai_enabled') === '1' || v('ai', 'ai_enabled') === true}
              onChange={(e) => updateForm('ai', 'ai_enabled', e.target.checked ? '1' : '0')}
              className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="ai_enabled" className="text-sm font-medium text-stone-700">Enable AI Features</label>
          </div>
        </div>
      </SectionCard>

      {/* SEO Defaults */}
      <SectionCard
        title="SEO Defaults"
        onSave={() => saveSection('seo')}
        saving={saving.seo}
        success={success.seo}
        error={error.seo}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Default Meta Title</label>
            <input
              type="text"
              value={v('seo', 'default_meta_title')}
              onChange={(e) => updateForm('seo', 'default_meta_title', e.target.value)}
              placeholder="Site name | Tagline"
              maxLength={255}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Default Meta Description</label>
            <textarea
              value={v('seo', 'default_meta_description')}
              onChange={(e) => updateForm('seo', 'default_meta_description', e.target.value)}
              placeholder="Brief description for search results"
              rows={2}
              maxLength={500}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Default Meta Keywords</label>
            <input
              type="text"
              value={v('seo', 'default_meta_keywords')}
              onChange={(e) => updateForm('seo', 'default_meta_keywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              maxLength={500}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

const token = () => localStorage.getItem('driver_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CameraIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V11z" />
    </svg>
  );
}

function KeyIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2a1 1 0 011-1h2v-2h2v-2h2l2.257-2.257a6 6 0 017.743-7.743M17 14a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function formatDate(d) {
  if (!d) return null;
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function DriverProfile() {
  const DUMMY_PROFILE = {
    name: 'Driver',
    email: 'driver@icecreamtruck.com',
    phone: '',
    role: 'driver',
    avatar_url: null,
    created_at: null,
  };

  const [profile, setProfile] = useState(DUMMY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [removeAvatarLoading, setRemoveAvatarLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    name: DUMMY_PROFILE.name,
    email: DUMMY_PROFILE.email,
    phone: DUMMY_PROFILE.phone,
    password: '',
    password_confirmation: '',
    current_password: '',
  });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const load = useCallback(() => {
    axios
      .get(`${API_BASE}/driver/profile`, { headers: headers() })
      .then(({ data }) => {
        const u = data.data || data;
        setProfile(u);
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          password: '',
          password_confirmation: '',
          current_password: '',
        });
        setAvatarPreview(u.avatar_url || null);
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!token()) return;
    load();
  }, [load]);

  const clearMessage = useCallback(() => {
    setMessage({ type: '', text: '' });
  }, []);

  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(clearMessage, 5000);
    return () => clearTimeout(t);
  }, [message.text, clearMessage]);

  const notifyProfileUpdated = useCallback(() => {
    window.dispatchEvent(new Event('driver-profile-updated'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const next = {};
    if (!form.name?.trim()) next.name = 'Name is required.';
    if (!form.email?.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password) {
      if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
      if (form.password !== form.password_confirmation) next.password_confirmation = 'Passwords do not match.';
      if (form.password && !form.current_password) next.current_password = 'Current password is required to change password.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAvatarFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please choose an image (JPEG, PNG, GIF, WebP).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 2 MB.' });
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setMessage({ type: '', text: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleAvatarFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const uploadAvatar = () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setMessage({ type: '', text: '' });
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    axios
      .post(`${API_BASE}/driver/profile/avatar`, fd, {
        headers: { ...headers(), 'Content-Type': 'multipart/form-data' },
      })
      .then(({ data }) => {
        setProfile(data.data || data);
        setAvatarPreview((data.data || data).avatar_url || null);
        setAvatarFile(null);
        setMessage({ type: 'success', text: 'Profile picture updated.' });
        notifyProfileUpdated();
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' }))
      .finally(() => setAvatarLoading(false));
  };

  const removeAvatar = () => {
    if (!profile?.avatar_url && !avatarPreview) return;
    setRemoveAvatarLoading(true);
    setMessage({ type: '', text: '' });
    axios
      .delete(`${API_BASE}/driver/profile/avatar`, { headers: headers() })
      .then(({ data }) => {
        setProfile(data.data || data);
        setAvatarPreview(null);
        setAvatarFile(null);
        setMessage({ type: 'success', text: 'Profile picture removed.' });
        notifyProfileUpdated();
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to remove picture.' }))
      .finally(() => setRemoveAvatarLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setMessage({ type: '', text: '' });
    setErrors({});
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || null,
    };
    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
      payload.current_password = form.current_password;
    }
    axios
      .put(`${API_BASE}/driver/profile`, payload, { headers: headers() })
      .then(({ data }) => {
        setProfile(data.data || data);
        setForm((prev) => ({ ...prev, password: '', password_confirmation: '', current_password: '' }));
        setShowPasswordSection(false);
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        notifyProfileUpdated();
      })
      .catch((err) => {
        const msg = err.response?.data?.message;
        const errs = err.response?.data?.errors;
        if (errs && typeof errs === 'object') {
          const flat = {};
          Object.entries(errs).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : v; });
          setErrors(flat);
        }
        setMessage({ type: 'error', text: msg || (errs ? Object.values(errs).flat().join(' ') : 'Update failed.') });
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-stone-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || form.name || 'Driver';
  const hasAvatar = !!(avatarPreview || profile?.avatar_url);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-stone-100 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Profile</h1>
            <p className="mt-1 text-stone-600">Manage your account and preferences.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 shadow-sm">
            <UserIcon className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-medium capitalize text-stone-600">{(profile?.role || 'driver').replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Message alert */}
      {message.text && (
        <div
          role="alert"
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 shrink-0" /> : <XCircleIcon className="h-5 w-5 shrink-0" />}
          <span className="flex-1">{message.text}</span>
          <button type="button" onClick={clearMessage} className="shrink-0 rounded p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Avatar + account card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-900">
              <CameraIcon className="h-5 w-5 text-amber-600" />
              Profile picture
            </h2>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col items-center rounded-xl border-2 border-dashed p-6 transition-colors ${
                dragOver ? 'border-amber-400 bg-amber-50/50' : 'border-stone-200 bg-stone-50/30'
              }`}
            >
              <div className="relative mb-4 flex h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-stone-100 shadow-md ring-2 ring-amber-500/20">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-amber-600">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                {avatarLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              <p className="mb-3 text-center text-sm text-stone-600">
                {avatarFile ? 'New image selected' : 'Drag and drop or choose a file'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="cursor-pointer rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50">
                  Choose image
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={avatarLoading}
                  />
                </label>
                {avatarFile && (
                  <button
                    type="button"
                    disabled={avatarLoading}
                    onClick={uploadAvatar}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {avatarLoading ? 'Uploading…' : 'Upload'}
                  </button>
                )}
                {hasAvatar && !avatarFile && (
                  <button
                    type="button"
                    disabled={removeAvatarLoading}
                    onClick={removeAvatar}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {removeAvatarLoading ? '…' : 'Remove'}
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-stone-500">JPEG, PNG, GIF or WebP. Max 2 MB.</p>
            </div>
          </div>

          {/* Account info card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-stone-900">Account</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-stone-500">Email</dt>
                <dd className="font-medium text-stone-800">{profile?.email || form.email || '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Role</dt>
                <dd className="font-medium capitalize text-stone-800">{(profile?.role || 'driver').replace('_', ' ')}</dd>
              </div>
              {profile?.created_at && (
                <div>
                  <dt className="text-stone-500">Member since</dt>
                  <dd className="font-medium text-stone-800">{formatDate(profile.created_at)}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Right: Profile form + password */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-900">
                <UserIcon className="h-5 w-5 text-amber-600" />
                Profile details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-xl border px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                      errors.name ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-amber-500'
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-xl border px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                      errors.email ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-amber-500'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Password section */}
            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
                  <KeyIcon className="h-5 w-5 text-amber-600" />
                  Change password
                </h2>
                <span className="text-sm text-stone-500">{showPasswordSection ? 'Hide' : 'Show'}</span>
              </button>
              {showPasswordSection && (
                <div className="border-t border-stone-100 px-6 pb-6 pt-4">
                  <p className="mb-4 text-sm text-stone-500">Leave blank to keep your current password.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">Current password</label>
                      <input
                        type="password"
                        name="current_password"
                        value={form.current_password}
                        onChange={handleChange}
                        placeholder="Required only if changing password"
                        autoComplete="current-password"
                        className={`w-full rounded-xl border px-4 py-2.5 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                          errors.current_password ? 'border-red-300' : 'border-stone-200 focus:border-amber-500'
                        }`}
                      />
                      {errors.current_password && <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">New password</label>
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min 8 characters"
                        autoComplete="new-password"
                        className={`w-full rounded-xl border px-4 py-2.5 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                          errors.password ? 'border-red-300' : 'border-stone-200 focus:border-amber-500'
                        }`}
                      />
                      {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">Confirm new password</label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        placeholder="Confirm"
                        autoComplete="new-password"
                        className={`w-full rounded-xl border px-4 py-2.5 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                          errors.password_confirmation ? 'border-red-300' : 'border-stone-200 focus:border-amber-500'
                        }`}
                      />
                      {errors.password_confirmation && <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-500 px-6 py-3 font-medium text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

function useAuth() {
  return localStorage.getItem('admin_token');
}

export default function AdminCmsPages() {
  const token = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', meta_title: '', meta_description: '', published_at: '', sort_order: 0 });
  const [error, setError] = useState('');

  const fetchPages = () => {
    axios.get(`${API_BASE}/admin/cms-pages`, { headers })
      .then(({ data }) => setPages(data.data || []))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return;
    fetchPages();
  }, [token]);

  const openCreate = () => {
    setEditing('new');
    setForm({ slug: '', title: '', content: '', meta_title: '', meta_description: '', published_at: '', sort_order: 0 });
    setError('');
  };

  const openEdit = (page) => {
    setEditing(page.id);
    setForm({
      slug: page.slug || '',
      title: page.title || '',
      content: page.content || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      published_at: page.published_at ? page.published_at.slice(0, 10) : '',
      sort_order: page.sort_order ?? 0,
    });
    setError('');
  };

  const cancel = () => setEditing(null);

  const save = () => {
    setError('');
    const payload = { ...form };
    if (payload.published_at === '') delete payload.published_at;
    if (editing === 'new') {
      axios.post(`${API_BASE}/admin/cms-pages`, payload, { headers })
        .then(() => { fetchPages(); setEditing(null); })
        .catch((err) => setError(err.response?.data?.message || 'Failed to create.'));
    } else {
      axios.put(`${API_BASE}/admin/cms-pages/${editing}`, payload, { headers })
        .then(() => { fetchPages(); setEditing(null); })
        .catch((err) => setError(err.response?.data?.message || 'Failed to update.'));
    }
  };

  const remove = (id) => {
    if (!window.confirm('Delete this page?')) return;
    axios.delete(`${API_BASE}/admin/cms-pages/${id}`, { headers })
      .then(() => fetchPages())
      .catch((err) => setError(err.response?.data?.message || 'Failed.'));
  };

  if (loading) return <div className="text-stone-600">Loading pages...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">CMS Pages</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
        >
          Add page
        </button>
      </div>

      {editing && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-stone-800">{editing === 'new' ? 'New page' : 'Edit page'}</h2>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Slug (e.g. home)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="rounded-lg border border-stone-300 px-3 py-2" />
              <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-lg border border-stone-300 px-3 py-2" />
            </div>
            <textarea placeholder="Content (HTML ok)" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={4} className="w-full rounded-lg border border-stone-300 px-3 py-2" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="Meta title" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} className="rounded-lg border border-stone-300 px-3 py-2" />
              <input type="text" placeholder="Meta description" value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} className="rounded-lg border border-stone-300 px-3 py-2" />
            </div>
            <div className="flex gap-4">
              <input type="date" placeholder="Published at" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} className="rounded-lg border border-stone-300 px-3 py-2" />
              <input type="number" placeholder="Sort order" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))} className="w-24 rounded-lg border border-stone-300 px-3 py-2" />
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={save} className="rounded bg-amber-500 px-3 py-1 text-white hover:bg-amber-600">Save</button>
            <button type="button" onClick={cancel} className="rounded border border-stone-300 px-3 py-1 hover:bg-stone-100">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Slug</th>
              <th className="px-4 py-3 font-medium text-stone-700">Title</th>
              <th className="px-4 py-3 font-medium text-stone-700">Published</th>
              <th className="px-4 py-3 font-medium text-stone-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-mono text-stone-700">{p.slug}</td>
                <td className="px-4 py-3 text-stone-800">{p.title}</td>
                <td className="px-4 py-3 text-stone-600">{p.published_at ? new Date(p.published_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openEdit(p)} className="text-amber-600 hover:underline">Edit</button>
                  {' '}
                  <button type="button" onClick={() => remove(p.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && <div className="px-4 py-8 text-center text-stone-500">No pages.</div>}
      </div>
    </div>
  );
}

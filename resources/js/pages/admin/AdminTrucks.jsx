import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

function useAuth() {
  return localStorage.getItem('admin_token');
}

export default function AdminTrucks() {
  const token = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', plate_number: '', is_active: true });
  const [error, setError] = useState('');

  const fetchTrucks = () => {
    axios.get(`${API_BASE}/admin/trucks`, { headers })
      .then(({ data }) => setTrucks(data.data || []))
      .catch(() => setTrucks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token) return;
    fetchTrucks();
  }, [token]);

  const openCreate = () => {
    setEditing('new');
    setForm({ name: '', plate_number: '', is_active: true });
    setError('');
  };

  const openEdit = (truck) => {
    setEditing(truck.id);
    setForm({ name: truck.name, plate_number: truck.plate_number || '', is_active: truck.is_active ?? true });
    setError('');
  };

  const cancel = () => {
    setEditing(null);
  };

  const save = () => {
    setError('');
    if (editing === 'new') {
      axios.post(`${API_BASE}/admin/trucks`, form, { headers })
        .then(() => { fetchTrucks(); setEditing(null); })
        .catch((err) => setError(err.response?.data?.message || 'Failed to create.'));
    } else {
      axios.put(`${API_BASE}/admin/trucks/${editing}`, form, { headers })
        .then(() => { fetchTrucks(); setEditing(null); })
        .catch((err) => setError(err.response?.data?.message || 'Failed to update.'));
    }
  };

  const deactivate = (id) => {
    if (!window.confirm('Deactivate this truck?')) return;
    axios.delete(`${API_BASE}/admin/trucks/${id}`, { headers })
      .then(() => fetchTrucks())
      .catch((err) => setError(err.response?.data?.message || 'Failed.'));
  };

  if (loading) return <div className="text-stone-600">Loading trucks...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Trucks</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
        >
          Add truck
        </button>
      </div>

      {editing && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold text-stone-800">{editing === 'new' ? 'New truck' : 'Edit truck'}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <input
              type="text"
              placeholder="Plate number"
              value={form.plate_number}
              onChange={(e) => setForm((f) => ({ ...f, plate_number: e.target.value }))}
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Active
            </label>
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
              <th className="px-4 py-3 font-medium text-stone-700">Name</th>
              <th className="px-4 py-3 font-medium text-stone-700">Plate</th>
              <th className="px-4 py-3 font-medium text-stone-700">Active</th>
              <th className="px-4 py-3 font-medium text-stone-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {trucks.map((t) => (
              <tr key={t.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-800">{t.name}</td>
                <td className="px-4 py-3 text-stone-600">{t.plate_number || '—'}</td>
                <td className="px-4 py-3">{t.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openEdit(t)} className="text-amber-600 hover:underline">Edit</button>
                  {t.is_active && (
                    <>
                      {' '}
                      <button type="button" onClick={() => deactivate(t.id)} className="text-red-600 hover:underline">Deactivate</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trucks.length === 0 && <div className="px-4 py-8 text-center text-stone-500">No trucks.</div>}
      </div>
    </div>
  );
}

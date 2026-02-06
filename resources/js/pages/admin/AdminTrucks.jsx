import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../app';
import axios from 'axios';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

function TruckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function PencilIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828L15.586 6.586z" />
    </svg>
  );
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

const TRUCK_MODELS = [
  { value: '', label: 'Select model' },
  { value: 'Standard Van', label: 'Standard Van' },
  { value: 'Large Van', label: 'Large Van' },
  { value: 'Mini Truck', label: 'Mini Truck' },
  { value: 'Custom', label: 'Custom' },
];

export default function AdminTrucks() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusCounts, setStatusCounts] = useState({ total: 0, available_count: 0, booked_count: 0, on_route_count: 0 });
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [removeImageLoading, setRemoveImageLoading] = useState(null);

  const load = useCallback((page = 1, overrides = {}) => {
    if (!token()) return;
    setLoading(true);
    const searchTerm = overrides.search !== undefined ? overrides.search : search;
    const status = overrides.status !== undefined ? overrides.status : statusFilter;
    const params = {
      page,
      per_page: overrides.per_page !== undefined ? overrides.per_page : perPage,
      ...(searchTerm && String(searchTerm).trim() && { search: String(searchTerm).trim() }),
      ...(status && { status }),
    };
    axios
      .get(`${API_BASE}/admin/trucks`, { headers: headers(), params })
      .then((res) => {
        const data = res.data;
        setList(data.data || []);
        setPagination({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
        });
        if (data.meta) {
          setStatusCounts({
            total: data.meta.total ?? 0,
            available_count: data.meta.available_count ?? 0,
            booked_count: data.meta.booked_count ?? 0,
            on_route_count: data.meta.on_route_count ?? 0,
          });
        }
      })
      .catch(() => {
        setList([]);
        setMessage({ type: 'error', text: 'Failed to load trucks.' });
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, perPage]);

  useEffect(() => {
    if (!token()) return;
    load(pagination.current_page || 1);
  }, [load]);

  const applySearch = () => {
    setSearch(searchInput);
    load(1, { search: searchInput, status: statusFilter });
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    load(1);
  };

  const clearMessage = useCallback(() => setMessage({ type: '', text: '' }), []);
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(clearMessage, 5000);
    return () => clearTimeout(t);
  }, [message.text, clearMessage]);

  const uploadTruckImage = (truckId, file) => {
    const fd = new FormData();
    fd.append('image', file);
    return axios.post(`${API_BASE}/admin/trucks/${truckId}/image`, fd, {
      headers: { ...headers(), 'Content-Type': 'multipart/form-data' },
    });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name?.value?.trim();
    const truck_number = form.truck_number?.value?.trim() || '';
    const model = form.model?.value?.trim() || '';
    const capacity = form.capacity?.value?.trim() ? parseInt(form.capacity.value, 10) : null;
    const description = form.description?.value?.trim() || '';
    const is_active = form.is_active?.checked ?? true;
    if (!name) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    setSaving(true);
    axios
      .post(`${API_BASE}/admin/trucks`, { name, truck_number, model, capacity, description, is_active }, { headers: headers() })
      .then(({ data }) => {
        const truck = data.data;
        if (addImageFile) {
          setImageUploading(true);
          uploadTruckImage(truck.id, addImageFile)
            .then((res) => {
              setList((prev) => [res.data.data, ...prev]);
              setMessage({ type: 'success', text: 'Truck and image added.' });
              load(1);
            })
            .catch((err) => {
              setList((prev) => [...prev, truck]);
              setMessage({ type: 'error', text: err.response?.data?.message || 'Truck added but image upload failed.' });
            })
            .finally(() => {
              setImageUploading(false);
              setSaving(false);
              setAddModal(false);
              setAddImageFile(null);
              setAddImagePreview(null);
            });
        } else {
          setAddModal(false);
          setAddImageFile(null);
          setAddImagePreview(null);
          setMessage({ type: 'success', text: 'Truck added.' });
          load(1);
        }
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add.' }))
      .finally(() => { if (!addImageFile) setSaving(false); });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editModal) return;
    const form = e.target;
    const name = form.name?.value?.trim();
    const truck_number = form.truck_number?.value?.trim() || '';
    const model = form.model?.value?.trim() || '';
    const capacity = form.capacity?.value?.trim() ? parseInt(form.capacity.value, 10) : null;
    const description = form.description?.value?.trim() || '';
    const is_active = form.is_active?.checked ?? true;
    if (!name) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    setSaving(true);
    axios
      .put(`${API_BASE}/admin/trucks/${editModal.id}`, { name, truck_number, model, capacity, description, is_active }, { headers: headers() })
      .then(({ data }) => {
        let updated = data.data;
        setList((prev) => prev.map((t) => (t.id === editModal.id ? updated : t)));
        if (editImageFile) {
          setImageUploading(true);
          uploadTruckImage(editModal.id, editImageFile)
            .then((res) => {
              setList((prev) => prev.map((t) => (t.id === editModal.id ? res.data.data : t)));
              setMessage({ type: 'success', text: 'Truck and image updated.' });
            })
            .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Truck saved but image upload failed.' }))
            .finally(() => {
              setImageUploading(false);
              setSaving(false);
              setEditModal(null);
              setEditImageFile(null);
              setEditImagePreview(null);
            });
        } else {
          setEditModal(null);
          setEditImageFile(null);
          setEditImagePreview(null);
          setMessage({ type: 'success', text: 'Truck updated.' });
        }
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update.' }))
      .finally(() => { if (!editImageFile) setSaving(false); });
  };

  const handleRemoveImage = (truck) => {
    setRemoveImageLoading(truck.id);
    axios
      .delete(`${API_BASE}/admin/trucks/${truck.id}/image`, { headers: headers() })
      .then(({ data }) => {
        setList((prev) => prev.map((t) => (t.id === truck.id ? data.data : t)));
        if (editModal?.id === truck.id) {
          setEditModal(data.data);
          setEditImagePreview(null);
          setEditImageFile(null);
        }
        setMessage({ type: 'success', text: 'Truck image removed.' });
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to remove image.' }))
      .finally(() => setRemoveImageLoading(null));
  };

  const handleDeactivate = (truck) => {
    if (!window.confirm(`Deactivate "${truck.name}"? It will no longer be available for assignments.`)) return;
    setSaving(true);
    axios
      .delete(`${API_BASE}/admin/trucks/${truck.id}`, { headers: headers() })
      .then(() => {
        setList((prev) => prev.map((t) => (t.id === truck.id ? { ...t, is_active: false } : t)));
        setMessage({ type: 'success', text: 'Truck deactivated.' });
        if (editModal?.id === truck.id) setEditModal(null);
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to deactivate.' }))
      .finally(() => setSaving(false));
  };

  const currentPage = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;
  const total = pagination.total || 0;
  const hasFilters = search || statusFilter;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-stone-100 p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl">Trucks</h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Manage ice cream trucks. Add photo and description for each truck.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => load(currentPage)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50 sm:px-4 sm:py-2.5">
              <RefreshIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button type="button" onClick={() => setAddModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 sm:px-4 sm:py-2.5">
              <PlusIcon className="h-4 w-4" />
              Add truck
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div role="alert" className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm sm:px-4 sm:py-3 ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5 shrink-0" /> : <XCircleIcon className="h-5 w-5 shrink-0" />}
          <span className="flex-1 min-w-0">{message.text}</span>
          <button type="button" onClick={clearMessage} className="shrink-0 rounded p-1 opacity-70 hover:opacity-100" aria-label="Dismiss">×</button>
        </div>
      )}

      {/* Search + filters */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Search by name, truck number or model…"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={applySearch} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600">
              Search
            </button>
            {hasFilters && (
              <button type="button" onClick={clearSearch} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status tabs: All, Available, Booked, On Route */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setStatusFilter(''); load(1, { status: '' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === '' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          All ({statusCounts.total})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('available'); load(1, { status: 'available' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'available' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Available ({statusCounts.available_count})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('booked'); load(1, { status: 'booked' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'booked' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Booked ({statusCounts.booked_count})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('on_route'); load(1, { status: 'on_route' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'on_route' ? 'border-blue-500 bg-blue-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          On Route ({statusCounts.on_route_count})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Total trucks</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{total}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">This page</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{list.length}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:col-span-1">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Page</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{currentPage} / {lastPage || 1}</p>
        </div>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading && list.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="text-sm text-stone-500">Loading trucks…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Image</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Name</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Truck #</th>
                    <th className="hidden px-4 py-3.5 font-semibold text-stone-700 sm:table-cell">Model</th>
                    <th className="hidden px-4 py-3.5 font-semibold text-stone-700 sm:table-cell">Capacity</th>
                    <th className="hidden px-4 py-3.5 font-semibold text-stone-700 lg:table-cell">Description</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Status</th>
                    <th className="px-6 py-3.5 font-semibold text-stone-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {list.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="w-14 px-3 py-3 sm:w-16 sm:px-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50 sm:h-12 sm:w-12">
                          {t.image_url ? (
                            <img src={t.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <TruckIcon className="h-5 w-5 text-stone-400 sm:h-6 sm:w-6" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-stone-900 sm:px-4">{t.name}</td>
                      <td className="px-3 py-3 text-stone-600 sm:px-4">{t.truck_number || '—'}</td>
                      <td className="hidden px-4 py-3 text-stone-600 sm:table-cell">{t.model || '—'}</td>
                      <td className="hidden px-4 py-3 text-stone-600 sm:table-cell">{t.capacity != null ? t.capacity : '—'}</td>
                      <td className="hidden max-w-[200px] truncate px-4 py-3 text-stone-600 lg:table-cell">{t.description || '—'}</td>
                      <td className="px-4 py-3">
                        {t.is_active !== false ? (
                          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">Active</span>
                        ) : (
                          <span className="rounded-lg border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">Inactive</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right sm:px-6">
                        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                          <button type="button" onClick={() => setEditModal(t)} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50">
                            <PencilIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Edit
                          </button>
                          {t.is_active !== false && (
                            <button type="button" onClick={() => handleDeactivate(t)} disabled={saving} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stone-100 md:hidden">
              {list.map((t) => (
                <div key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                      {t.image_url ? <img src={t.image_url} alt="" className="h-full w-full object-cover" /> : <TruckIcon className="h-7 w-7 text-stone-400" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900 truncate">{t.name}</p>
                      <p className="text-xs text-stone-500">{t.truck_number ? `#${t.truck_number}` : '—'}</p>
                      {(t.model || t.capacity != null) && <p className="text-xs text-stone-500">{t.model || '—'} {t.capacity != null ? `· Cap. ${t.capacity}` : ''}</p>}
                      {t.description && <p className="mt-1 line-clamp-2 text-xs text-stone-600">{t.description}</p>}
                      {t.is_active !== false ? (
                        <span className="mt-1 inline-block rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-800">Active</span>
                      ) : (
                        <span className="mt-1 inline-block rounded border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs text-stone-600">Inactive</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <button type="button" onClick={() => setEditModal(t)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">Edit</button>
                    {t.is_active !== false && <button type="button" onClick={() => handleDeactivate(t)} disabled={saving} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">Deactivate</button>}
                  </div>
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="px-4 py-12 text-center sm:px-6">
                <TruckIcon className="mx-auto h-12 w-12 text-stone-300" />
                <p className="mt-3 text-stone-500">No trucks match your search or filters.</p>
                <button type="button" onClick={clearSearch} className="mt-2 text-sm font-medium text-amber-600 hover:underline">Clear filters</button>
                <button type="button" onClick={() => setAddModal(true)} className="mt-4 block w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 sm:inline-block sm:w-auto">
                  Add truck
                </button>
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex flex-col gap-3 border-t border-stone-200 bg-stone-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-stone-600">
                    Showing page <strong>{currentPage}</strong> of <strong>{lastPage}</strong> · <strong>{total}</strong> total
                  </p>
                  <select
                    value={perPage}
                    onChange={(e) => { setPerPage(Number(e.target.value)); load(1); }}
                    className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm text-stone-800"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n} per page</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => load(currentPage - 1)} disabled={currentPage <= 1} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none">
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </button>
                  <button type="button" onClick={() => load(currentPage + 1)} disabled={currentPage >= lastPage} className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none">
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-3 sm:p-4" onClick={() => !saving && !imageUploading && setAddModal(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">Add truck</h2>
              <button type="button" onClick={() => { setAddModal(false); setAddImageFile(null); setAddImagePreview(null); }} disabled={saving || imageUploading} className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30" aria-label="Close">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-4 sm:p-6">
              {/* Photo row - full width */}
              <div className="mb-6 rounded-xl border border-stone-100 bg-stone-50/50 p-4 sm:p-5">
                <label className="mb-3 block text-sm font-medium text-stone-700">Photo (optional)</label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-stone-200 bg-white shadow-inner sm:h-20 sm:w-20">
                    {addImagePreview ? <img src={addImagePreview} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><TruckIcon className="h-10 w-10 text-stone-300 sm:h-8 sm:w-8" /></div>}
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-50/50">
                      Choose image
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
                          setAddImageFile(file);
                          const reader = new FileReader();
                          reader.onload = () => setAddImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        } else if (file) setMessage({ type: 'error', text: 'Use JPEG, PNG, GIF or WebP. Max 2 MB.' });
                      }} />
                    </label>
                    {addImageFile && (
                      <button type="button" onClick={() => { setAddImageFile(null); setAddImagePreview(null); }} className="text-sm text-stone-500 underline hover:text-stone-700">
                        Clear
                      </button>
                    )}
                    <span className="text-xs text-stone-500">JPEG, PNG, GIF or WebP · Max 2 MB</span>
                  </div>
                </div>
              </div>

              {/* Two columns: Name | Truck number, Model | Capacity, Active */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Name</label>
                  <input type="text" name="name" required className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. Van 1" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Truck number</label>
                  <input type="text" name="truck_number" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. FT-021" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Model</label>
                  <select name="model" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    {TRUCK_MODELS.map((opt) => <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Capacity</label>
                  <input type="number" name="capacity" min="0" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. 20" />
                </div>
                <div className="flex items-end pb-0.5 sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:bg-stone-50/50">
                    <input type="checkbox" name="is_active" id="add_is_active" defaultChecked className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    <span className="text-sm font-medium text-stone-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Description (optional)</label>
                <textarea name="description" rows={3} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Notes about this truck" />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={() => { setAddModal(false); setAddImageFile(null); setAddImagePreview(null); }} disabled={saving || imageUploading} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50 sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={saving || imageUploading} className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 sm:w-auto">
                  {saving || imageUploading ? 'Adding…' : 'Add truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-3 sm:p-4" onClick={() => !saving && !imageUploading && setEditModal(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">Edit truck</h2>
              <button type="button" onClick={() => { setEditModal(null); setEditImageFile(null); setEditImagePreview(null); }} disabled={saving || imageUploading} className="rounded-xl p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30" aria-label="Close">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-4 sm:p-6">
              <div className="mb-6 rounded-xl border border-stone-100 bg-stone-50/50 p-4 sm:p-5">
                <label className="mb-3 block text-sm font-medium text-stone-700">Photo</label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-stone-200 bg-white shadow-inner sm:h-20 sm:w-20">
                    {editImagePreview ? <img src={editImagePreview} alt="" className="h-full w-full object-cover" /> : editModal.image_url ? <img src={editModal.image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><TruckIcon className="h-10 w-10 text-stone-300 sm:h-8 sm:w-8" /></div>}
                  </div>
                  <div className="flex flex-1 flex-wrap items-center gap-3">
                    <label className="cursor-pointer rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-amber-400 hover:bg-amber-50/50">
                      {editModal.image_url || editImageFile ? 'Change image' : 'Choose image'}
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
                          setEditImageFile(file);
                          const reader = new FileReader();
                          reader.onload = () => setEditImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        } else if (file) setMessage({ type: 'error', text: 'Use JPEG, PNG, GIF or WebP. Max 2 MB.' });
                      }} />
                    </label>
                    {(editModal.image_url || editImageFile) && (
                      <button type="button" onClick={() => handleRemoveImage(editModal)} disabled={removeImageLoading === editModal.id} className="text-sm text-red-600 underline hover:text-red-700 disabled:opacity-50">
                        {removeImageLoading === editModal.id ? 'Removing…' : 'Remove image'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Name</label>
                  <input type="text" name="name" required defaultValue={editModal.name} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Truck number</label>
                  <input type="text" name="truck_number" defaultValue={editModal.truck_number || ''} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. FT-021" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Model</label>
                  <select name="model" defaultValue={editModal.model || ''} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
                    {TRUCK_MODELS.map((opt) => <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Capacity</label>
                  <input type="number" name="capacity" min="0" defaultValue={editModal.capacity ?? ''} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. 20" />
                </div>
                <div className="flex items-end pb-0.5 sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm transition-colors hover:bg-stone-50/50">
                    <input type="checkbox" name="is_active" id="edit_is_active" defaultChecked={editModal.is_active !== false} className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-2 focus:ring-amber-500/20" />
                    <span className="text-sm font-medium text-stone-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 sm:mt-5">
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Description (optional)</label>
                <textarea name="description" rows={3} defaultValue={editModal.description || ''} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm transition-colors placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Notes about this truck" />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={() => { setEditModal(null); setEditImageFile(null); setEditImagePreview(null); }} disabled={saving || imageUploading} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50 sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={saving || imageUploading} className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 sm:w-auto">
                  {saving || imageUploading ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

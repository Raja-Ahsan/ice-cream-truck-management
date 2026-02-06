import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

export default function AdminDrivers() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [statusCounts, setStatusCounts] = useState({ total: 0, active_today_count: 0, available_count: 0 });
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addModal, setAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

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
      .get(`${API_BASE}/admin/drivers`, { headers: headers(), params })
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
            active_today_count: data.meta.active_today_count ?? 0,
            available_count: data.meta.available_count ?? 0,
          });
        }
      })
      .catch(() => {
        setList([]);
        setMessage({ type: 'error', text: 'Failed to load drivers.' });
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

  const handleAddDriver = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name?.value?.trim();
    const email = form.email?.value?.trim();
    const password = form.password?.value;
    const phone = form.phone?.value?.trim() || '';
    const license = form.license?.value?.trim() || '';
    if (!name || !email || !password) {
      setMessage({ type: 'error', text: 'Name, email and password are required.' });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    setSaving(true);
    axios
      .post(`${API_BASE}/admin/drivers`, { name, email, password, phone, license }, { headers: headers() })
      .then(({ data }) => {
        setList((prev) => [data.data, ...prev]);
        setAddModal(false);
        setMessage({ type: 'success', text: 'Driver added.' });
        load(1);
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add driver.' }))
      .finally(() => setSaving(false));
  };

  const currentPage = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;
  const total = pagination.total || 0;
  const hasFilters = search || statusFilter;
  const assignedCount = statusCounts.active_today_count ?? 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-stone-100 p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl">Driver Management</h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              {statusCounts.total} drivers, {assignedCount} currently assigned
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => load(currentPage)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50 sm:px-4 sm:py-2.5">
              <RefreshIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button type="button" onClick={() => setAddModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-600 sm:px-4 sm:py-2.5">
              <PlusIcon className="h-4 w-4" />
              Add Driver
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
              placeholder="Search by name, email, phone or license…"
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

      {/* Status tabs */}
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
          onClick={() => { setStatusFilter('active_today'); load(1, { status: 'active_today' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'active_today' ? 'border-blue-500 bg-blue-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Active Today ({statusCounts.active_today_count})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('available'); load(1, { status: 'available' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'available' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Available ({statusCounts.available_count})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Total Drivers</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{statusCounts.total}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Active Today</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{statusCounts.active_today_count}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Available</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{statusCounts.available_count}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
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
              <p className="text-sm text-stone-500">Loading drivers…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Driver</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Contact</th>
                    <th className="hidden px-4 py-3.5 font-semibold text-stone-700 lg:table-cell">License</th>
                    <th className="hidden px-4 py-3.5 font-semibold text-stone-700 lg:table-cell">Assigned Truck</th>
                    <th className="hidden px-4 py-3.5 font-semibold text-stone-700 xl:table-cell">Current Event</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {list.map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50">
                            <UserIcon className="h-5 w-5 text-stone-400" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{d.name}</p>
                            <p className="text-xs text-stone-500">ID: {d.driver_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stone-800">{d.email}</p>
                        <p className="text-xs text-stone-500">{d.phone || '—'}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-stone-600 lg:table-cell">{d.license || '—'}</td>
                      <td className="hidden px-4 py-3 text-stone-600 lg:table-cell">
                        {d.current_booking?.truck_name || d.current_booking?.truck_number
                          ? [d.current_booking.truck_number, d.current_booking.truck_name].filter(Boolean).join(' · ')
                          : '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-stone-600 xl:table-cell">{d.current_booking?.event_label || '—'}</td>
                      <td className="px-4 py-3">
                        {d.status_label === 'Available' && (
                          <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">Available</span>
                        )}
                        {d.status_label === 'Assigned' && (
                          <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Assigned</span>
                        )}
                        {d.status_label === 'On Route' && (
                          <span className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">On Route</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stone-100 md:hidden">
              {list.map((d) => (
                <div key={d.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-50">
                      <UserIcon className="h-6 w-6 text-stone-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900">{d.name}</p>
                      <p className="text-xs text-stone-500">ID: {d.driver_id}</p>
                      <p className="text-xs text-stone-600">{d.email}</p>
                      <p className="text-xs text-stone-500">{d.phone || '—'} {d.license ? `· ${d.license}` : ''}</p>
                    </div>
                    <span className={`shrink-0 rounded-lg border px-2 py-0.5 text-xs font-medium ${d.status_label === 'Available' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : d.status_label === 'On Route' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {d.status_label}
                    </span>
                  </div>
                  {(d.current_booking?.truck_name || d.current_booking?.event_label) && (
                    <div className="rounded-lg border border-stone-100 bg-stone-50/50 px-3 py-2 text-xs text-stone-600">
                      <p><span className="font-medium text-stone-700">Truck:</span> {d.current_booking?.truck_name || d.current_booking?.truck_number || '—'}</p>
                      <p><span className="font-medium text-stone-700">Event:</span> {d.current_booking?.event_label || '—'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="px-4 py-12 text-center sm:px-6">
                <UserIcon className="mx-auto h-12 w-12 text-stone-300" />
                <p className="mt-3 text-stone-500">No drivers match your search or filters.</p>
                <button type="button" onClick={clearSearch} className="mt-2 text-sm font-medium text-amber-600 hover:underline">Clear filters</button>
                <button type="button" onClick={() => setAddModal(true)} className="mt-4 block w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 sm:inline-block sm:w-auto">
                  Add Driver
                </button>
              </div>
            )}

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

      {/* Add Driver modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-3 sm:p-4" onClick={() => !saving && setAddModal(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
              <h2 className="text-lg font-semibold text-stone-900">Add Driver</h2>
              <button type="button" onClick={() => setAddModal(false)} disabled={saving} className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600" aria-label="Close">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddDriver} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Name</label>
                <input type="text" name="name" required className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. Marcus Johnson" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Email</label>
                <input type="email" name="email" required className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. marcus@fleet.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">Password</label>
                <input type="password" name="password" required minLength={8} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Min 8 characters" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone</label>
                  <input type="text" name="phone" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. 555-0101" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-stone-700">License</label>
                  <input type="text" name="license" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-stone-800 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="e.g. DL-001" />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" onClick={() => setAddModal(false)} disabled={saving} className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50 sm:w-auto">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-50 sm:w-auto">
                  {saving ? 'Adding…' : 'Add Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

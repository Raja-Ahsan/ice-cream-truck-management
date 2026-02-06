import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../app';
import axios from 'axios';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

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

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CurrencyIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount ?? 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminPayments() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [meta, setMeta] = useState({
    total_revenue: 0,
    collected: 0,
    pending: 0,
    this_month: 0,
    total_count: 0,
    paid_count: 0,
    partial_count: 0,
    unpaid_count: 0,
  });
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [actionOpenId, setActionOpenId] = useState(null);

  const load = useCallback((page = 1, overrides = {}) => {
    if (!token()) {
      setLoading(false);
      return;
    }
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
      .get(`${API_BASE}/admin/payments`, { headers: headers(), params })
      .then((res) => {
        const body = res.data;
        if (!body || typeof body !== 'object') {
          setList([]);
          setLoading(false);
          return;
        }
        // Backend returns { data: [...], current_page, last_page, total, meta } (same shape as admin/bookings)
        // Handle direct array, single wrap, or double wrap (e.g. some proxies)
        let listData = [];
        if (Array.isArray(body.data)) {
          listData = body.data;
        } else if (Array.isArray(body)) {
          listData = body;
        } else if (body.data && typeof body.data === 'object' && Array.isArray(body.data.data)) {
          listData = body.data.data;
        }
        setList(listData);
        const pag = body.data && typeof body.data === 'object' && (body.data.current_page !== undefined || body.data.total !== undefined) ? body.data : body;
        setPagination({
          current_page: Number(pag.current_page) || 1,
          last_page: Number(pag.last_page) || 1,
          total: Number(pag.total) || 0,
        });
        const metaSource = body.meta || (body.data && body.data.meta);
        if (metaSource && typeof metaSource === 'object') {
          const m = metaSource;
          setMeta((prev) => ({
            ...prev,
            total_revenue: Number(m.total_revenue) || 0,
            collected: Number(m.collected) || 0,
            pending: Number(m.pending) || 0,
            this_month: Number(m.this_month) || 0,
            total_count: Number(m.total_count) || 0,
            paid_count: Number(m.paid_count) || 0,
            partial_count: Number(m.partial_count) || 0,
            unpaid_count: Number(m.unpaid_count) || 0,
          }));
        }
      })
      .catch((err) => {
        setList([]);
        const msg = err.response?.data?.message ?? err.response?.statusText ?? err.message ?? 'Failed to load payments.';
        setMessage({ type: 'error', text: msg });
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, perPage]);

  const currentPage = pagination.current_page || 1;

  useEffect(() => {
    if (!token()) {
      setLoading(false);
      return;
    }
    load(currentPage);
  }, [load]);

  // Auto-refresh to keep data in sync (e.g. when payment status changes elsewhere)
  useEffect(() => {
    if (!token()) return;
    const interval = setInterval(() => load(currentPage), 30000);
    return () => clearInterval(interval);
  }, [load, currentPage]);

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

  const updatePaymentStatus = (bookingId, paymentStatus) => {
    setSavingId(bookingId);
    setActionOpenId(null);
    axios
      .put(`${API_BASE}/admin/bookings/${bookingId}/payment-status`, { payment_status: paymentStatus }, { headers: headers() })
      .then(({ data }) => {
        setList((prev) => prev.map((row) => (row.id === bookingId ? { ...row, payment_status: data.data?.payment_status ?? paymentStatus, status_label: data.data?.status_label ?? row.status_label } : row)));
        setMessage({ type: 'success', text: 'Payment status updated.' });
        // Refetch list + meta so stats (Collected, Pending, This Month) and tab counts stay in sync
        load(currentPage);
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' }))
      .finally(() => setSavingId(null));
  };

  const lastPage = pagination.last_page || 1;
  const total = pagination.total || 0;
  const hasFilters = search || statusFilter;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-stone-100 p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl">Payments</h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Track and manage booking payments
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => load(currentPage)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50 sm:px-4 sm:py-2.5">
              <RefreshIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
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

      {/* Stats - all from API meta, update when filters/search change */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Total Revenue</p>
          <p className="mt-1 text-xl font-bold text-stone-900 sm:text-2xl">{formatCurrency(meta.total_revenue)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-700 sm:text-sm">Collected</p>
          <p className="mt-1 text-xl font-bold text-emerald-800 sm:text-2xl">{formatCurrency(meta.collected)}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-700 sm:text-sm">Pending</p>
          <p className="mt-1 text-xl font-bold text-amber-800 sm:text-2xl">{formatCurrency(meta.pending)}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">This Month</p>
          <p className="mt-1 text-xl font-bold text-stone-900 sm:text-2xl">{formatCurrency(meta.this_month)}</p>
        </div>
      </div>

      {/* Page summary - from API pagination (dynamic) */}
      <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-stone-600">
          Showing <strong>{list.length}</strong> booking{list.length !== 1 ? 's' : ''} on this page
          {lastPage > 1 && (
            <> · Page <strong>{currentPage}</strong> of <strong>{lastPage}</strong></>
          )}
          {' '}· <strong>{total}</strong> total matching
        </p>
      </div>

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
              placeholder="Search by client, email, phone or address…"
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

      {/* Status tabs - counts from API */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setStatusFilter(''); load(1, { status: '' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === '' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          All ({meta.total_count})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('paid'); load(1, { status: 'paid' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'paid' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Paid ({meta.paid_count})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('partial'); load(1, { status: 'partial' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'partial' ? 'border-amber-500 bg-amber-100 text-amber-800' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Partial ({meta.partial_count})
        </button>
        <button
          type="button"
          onClick={() => { setStatusFilter('unpaid'); load(1, { status: 'unpaid' }); }}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${statusFilter === 'unpaid' ? 'border-red-500 bg-red-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
        >
          Unpaid ({meta.unpaid_count})
        </button>
      </div>

      {/* Table (desktop) / Cards (mobile) */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading && list.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="text-sm text-stone-500">Loading payments…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Event Booking</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Client</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Date</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700 text-right">Amount</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {list.map((row) => (
                    <tr key={row.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-stone-500">#{row.booking_ref}</p>
                        <p className="mt-0.5 font-medium text-stone-900">{row.event_label}</p>
                        {row.event_address && <p className="mt-0.5 text-xs text-stone-500 truncate max-w-[200px]">{row.event_address}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-stone-800">{row.customer_name || '—'}</p>
                        <p className="text-xs text-stone-500">{row.customer_phone || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-600">{formatDate(row.event_date)}</td>
                      <td className="px-4 py-3 text-right font-medium text-stone-900">{formatCurrency(row.total_amount)}</td>
                      <td className="px-4 py-3">
                        {row.status_label === 'Paid' && <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">Paid</span>}
                        {row.status_label === 'Partial' && <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">Partial</span>}
                        {row.status_label === 'Unpaid' && <span className="rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">Unpaid</span>}
                        {row.status_label === 'Refunded' && <span className="rounded-lg border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">Refunded</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setActionOpenId(actionOpenId === row.id ? null : row.id)}
                            disabled={savingId === row.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                          >
                            {savingId === row.id ? 'Updating…' : 'Actions'}
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${actionOpenId === row.id ? 'rotate-180' : ''}`} />
                          </button>
                          {actionOpenId === row.id && (
                            <>
                              <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setActionOpenId(null)} />
                              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                                <button type="button" onClick={() => updatePaymentStatus(row.id, 'paid')} className="block w-full px-3 py-2 text-left text-xs font-medium text-emerald-700 hover:bg-emerald-50">
                                  Paid
                                </button>
                                <button type="button" onClick={() => updatePaymentStatus(row.id, 'authorized')} className="block w-full px-3 py-2 text-left text-xs font-medium text-amber-700 hover:bg-amber-50">
                                  Partial
                                </button>
                                <button type="button" onClick={() => updatePaymentStatus(row.id, 'pending')} className="block w-full px-3 py-2 text-left text-xs font-medium text-red-700 hover:bg-red-50">
                                  Unpaid
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stone-100 md:hidden">
              {list.map((row) => (
                <div key={row.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-stone-500">#{row.booking_ref}</p>
                      <p className="font-medium text-stone-900">{row.event_label}</p>
                      {row.event_address && <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">{row.event_address}</p>}
                      <p className="mt-1 text-sm text-stone-600">{row.customer_name || '—'} · {row.customer_phone || '—'}</p>
                      <p className="text-xs text-stone-500">{formatDate(row.event_date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-stone-900">{formatCurrency(row.total_amount)}</p>
                      <span className={`mt-1 inline-block rounded-lg border px-2 py-0.5 text-xs font-medium ${row.status_label === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : row.status_label === 'Partial' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                        {row.status_label}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => updatePaymentStatus(row.id, 'paid')} disabled={savingId === row.id} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">
                      Paid
                    </button>
                    <button type="button" onClick={() => updatePaymentStatus(row.id, 'authorized')} disabled={savingId === row.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                      Partial
                    </button>
                    <button type="button" onClick={() => updatePaymentStatus(row.id, 'pending')} disabled={savingId === row.id} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50">
                      Unpaid
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {list.length === 0 && (
              <div className="px-4 py-12 text-center sm:px-6">
                <CurrencyIcon className="mx-auto h-12 w-12 text-stone-300" />
                <p className="mt-3 text-stone-500">
                  {hasFilters ? 'No booking payments match your search or filters.' : 'No bookings yet. Bookings appear here once created (e.g. from the public booking page).'}
                </p>
                {hasFilters ? (
                  <button type="button" onClick={clearSearch} className="mt-2 text-sm font-medium text-amber-600 hover:underline">Clear filters</button>
                ) : (
                  <p className="mt-2 text-xs text-stone-400">Run <code className="rounded bg-stone-100 px-1 py-0.5">php artisan db:seed --class=BookingSeeder</code> to add sample bookings.</p>
                )}
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
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setPerPage(next);
                      load(1, { per_page: next });
                    }}
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
    </div>
  );
}

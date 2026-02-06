import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_OPTIONS = [
  { value: '', label: 'All payments' },
  { value: 'pending', label: 'Pending' },
  { value: 'authorized', label: 'Authorized' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  assigned: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  dispatched: 'bg-purple-100 text-purple-800 border-purple-200',
  in_progress: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-stone-100 text-stone-600 border-stone-200',
};

const paymentColors = {
  pending: 'bg-stone-100 text-stone-700 border-stone-200',
  authorized: 'bg-sky-100 text-sky-800 border-sky-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-amber-100 text-amber-800 border-amber-200',
};

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '';
  const s = String(t);
  if (s.length >= 5) return s.slice(0, 5);
  return s;
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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

function XIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DocumentTextIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function MapPinIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function TruckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1h9m4-1a1 1 0 001-1v-3a1 1 0 00-1-1h-2m-4-1V8a1 1 0 011-1h2m-4-1v8a1 1 0 001 1h2" />
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
function CubeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function ClipboardListIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState({ data: [], current_page: 1, last_page: 1, total: 0 });
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [assignTruck, setAssignTruck] = useState('');
  const [assignDriver, setAssignDriver] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [inventoryModal, setInventoryModal] = useState(null);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryLines, setInventoryLines] = useState([]);
  const [inventorySaving, setInventorySaving] = useState(false);
  const [inventoryError, setInventoryError] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const fetchBookings = useCallback((page = 1, overrides = {}) => {
    setLoading(true);
    const searchTerm = overrides.search !== undefined ? overrides.search : search;
    const params = {
      page,
      per_page: 15,
      ...(searchTerm && searchTerm.trim() && { search: searchTerm.trim() }),
      ...(overrides.status !== undefined ? (overrides.status && { status: overrides.status }) : (statusFilter && { status: statusFilter })),
      ...(overrides.payment_status !== undefined ? (overrides.payment_status && { payment_status: overrides.payment_status }) : (paymentFilter && { payment_status: paymentFilter })),
      ...(overrides.from_date !== undefined ? (overrides.from_date && { from_date: overrides.from_date }) : (fromDate && { from_date: fromDate })),
      ...(overrides.to_date !== undefined ? (overrides.to_date && { to_date: overrides.to_date }) : (toDate && { to_date: toDate })),
    };
    axios
      .get(`${API_BASE}/admin/bookings`, { headers: headers(), params })
      .then((res) => setBookings(res.data || { data: [], current_page: 1, last_page: 1, total: 0 }))
      .catch(() => setBookings({ data: [], current_page: 1, last_page: 1, total: 0 }))
      .finally(() => setLoading(false));
  }, [search, statusFilter, paymentFilter, fromDate, toDate]);

  useEffect(() => {
    if (!token()) return;
    fetchBookings(1);
  }, [fetchBookings]);

  useEffect(() => {
    if (!token() || !assignModal) return;
    axios.get(`${API_BASE}/admin/trucks`, { headers: headers() }).then(({ data }) => setTrucks(data.data || []));
    axios.get(`${API_BASE}/admin/drivers`, { headers: headers() }).then(({ data }) => setDrivers(data.data || []));
  }, [assignModal]);

  useEffect(() => {
    if (!token() || !inventoryModal) return;
    axios
      .get(`${API_BASE}/admin/inventory-products`, { headers: headers() })
      .then(({ data }) => {
        const products = data.data || data || [];
        const arr = Array.isArray(products) ? products : [];
        setInventoryProducts(arr);
        setInventoryLines(arr.map((p) => ({ inventory_product_id: p.id, quantity_assigned: 0 })));
      })
      .catch(() => setInventoryProducts([]));
  }, [inventoryModal]);

  const applySearch = () => {
    setSearch(searchInput);
    fetchBookings(1, { search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('');
    setPaymentFilter('');
    setFromDate('');
    setToDate('');
    setShowFilters(false);
    setTimeout(() => fetchBookings(1), 0);
  };

  const openAssign = (b) => {
    setAssignModal(b);
    setAssignTruck(b.truck_id?.toString() || '');
    setAssignDriver(b.driver_id?.toString() || '');
    setAssignError('');
  };

  const saveAssign = () => {
    if (!assignModal || !assignTruck || !assignDriver) return;
    setAssignSaving(true);
    setAssignError('');
    axios
      .put(`${API_BASE}/admin/bookings/${assignModal.id}/assign`, { truck_id: Number(assignTruck), driver_id: Number(assignDriver) }, { headers: headers() })
      .then((res) => {
        const updated = res.data?.data || { ...assignModal, truck_id: Number(assignTruck), driver_id: Number(assignDriver), status: 'assigned' };
        setBookings((prev) => ({
          ...prev,
          data: (prev.data || []).map((b) => (b.id === assignModal.id ? { ...b, ...updated, inventory_snapshots: updated.inventory_snapshots || [] } : b)),
        }));
        setAssignModal(null);
      })
      .catch((err) => setAssignError(err.response?.data?.message || 'Failed to assign.'))
      .finally(() => setAssignSaving(false));
  };

  const saveInventory = () => {
    if (!inventoryModal) return;
    const lines = inventoryLines
      .filter((l) => Number(l.quantity_assigned) > 0)
      .map((l) => ({ inventory_product_id: l.inventory_product_id, quantity_assigned: Number(l.quantity_assigned) }));
    if (lines.length === 0) {
      setInventoryError('Add at least one product with quantity.');
      return;
    }
    setInventorySaving(true);
    setInventoryError('');
    axios
      .put(`${API_BASE}/admin/bookings/${inventoryModal.id}/inventory-snapshot`, { lines }, { headers: headers() })
      .then((res) => {
        const snap = res.data?.data;
        setBookings((prev) => ({
          ...prev,
          data: (prev.data || []).map((b) => (b.id === inventoryModal.id ? { ...b, inventory_snapshots: snap ? [snap] : b.inventory_snapshots || [] } : b)),
        }));
        setInventoryModal(null);
      })
      .catch((err) => setInventoryError(err.response?.data?.message || 'Failed to save snapshot.'))
      .finally(() => setInventorySaving(false));
  };

  const handleDispatch = (b) => {
    setDispatchLoading(b.id);
    axios
      .put(`${API_BASE}/admin/bookings/${b.id}/dispatch`, {}, { headers: headers() })
      .then(() => {
        setBookings((prev) => ({
          ...prev,
          data: (prev.data || []).map((x) => (x.id === b.id ? { ...x, status: 'dispatched' } : x)),
        }));
      })
      .catch((err) => alert(err.response?.data?.message || 'Dispatch failed'))
      .finally(() => setDispatchLoading(null));
  };

  const list = Array.isArray(bookings.data) ? bookings.data : [];
  const currentPage = bookings.current_page || 1;
  const lastPage = bookings.last_page || 1;
  const total = bookings.total || 0;
  const hasFilters = search || statusFilter || paymentFilter || fromDate || toDate;

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Bookings</h1>
          <p className="mt-1 text-sm text-stone-500">
            {total} {total === 1 ? 'booking' : 'bookings'} total
          </p>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Search by name, email, phone, address, or booking ID…"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={applySearch}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-amber-600"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                showFilters || hasFilters ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <FilterIcon className="h-4 w-4" />
              Filters
              {hasFilters && <span className="rounded-full bg-amber-200 px-1.5 text-xs">{[search, statusFilter, paymentFilter, fromDate, toDate].filter(Boolean).length}</span>}
            </button>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">
                Clear all
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">Payment</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {PAYMENT_OPTIONS.map((o) => (
                  <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">From date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-500">To date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button type="button" onClick={() => fetchBookings(1)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
                Apply filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <p className="text-sm text-stone-500">Loading bookings…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                <thead className="bg-stone-50/80">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Event</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Customer</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Package</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Total</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Payment</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Inventory</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {list.map((b) => {
                    const snapshot = b.inventory_snapshots?.[0];
                    const lineCount = snapshot?.lines?.length ?? 0;
                    return (
                    <tr key={b.id} className="transition-colors hover:bg-amber-50/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{formatDate(b.event_date)}</div>
                        <div className="text-xs text-stone-500">{formatTime(b.event_time)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-800">{b.customer_name}</div>
                        <div className="text-xs text-stone-500">{b.customer_email || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-700">{b.package?.name || '—'}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">{formatCurrency(b.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                          {(b.status || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-medium ${paymentColors[b.payment_status] || 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                          {(b.payment_status || '—').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 text-xs">
                        {lineCount > 0 ? (
                          <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700" title="Assigned inventory set">
                            Set ({lineCount} item{lineCount !== 1 ? 's' : ''})
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailModal(b)}
                            className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                          >
                            <DocumentTextIcon className="h-3.5 w-3.5" />
                            Details
                          </button>
                          {b.status === 'pending' && (
                            <button type="button" onClick={() => openAssign(b)} className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600">
                              Assign
                            </button>
                          )}
                          {b.status === 'assigned' && (!b.inventory_snapshots || b.inventory_snapshots.length === 0) && (
                            <button type="button" onClick={() => { setInventoryModal(b); setInventoryError(''); }} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600">
                              Set inventory
                            </button>
                          )}
                          {b.status === 'assigned' && b.inventory_snapshots?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleDispatch(b)}
                              disabled={dispatchLoading === b.id}
                              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                            >
                              {dispatchLoading === b.id ? '…' : 'Dispatch'}
                            </button>
                          )}
                          {(b.status === 'confirmed' || (b.status !== 'pending' && b.status !== 'assigned')) && (
                            <button type="button" onClick={() => openAssign(b)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50">
                              Re-assign
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
            {list.length === 0 && (
              <div className="px-4 py-16 text-center">
                <p className="text-stone-500">No bookings match your search or filters.</p>
                <button type="button" onClick={clearFilters} className="mt-2 text-sm font-medium text-amber-600 hover:underline">
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50/50 px-4 py-3">
                <p className="text-sm text-stone-600">
                  Page {currentPage} of {lastPage}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fetchBookings(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchBookings(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    className="rounded-lg border border-stone-200 bg-white p-2 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal — advanced layout */}
      {detailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
          onClick={() => setDetailModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-2xl ring-1 ring-stone-900/5 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="shrink-0 border-b border-stone-100 bg-gradient-to-br from-amber-50 via-white to-orange-50/30 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-stone-900 tracking-tight">Booking details</h3>
                  <p className="mt-0.5 font-mono text-xs text-stone-500 truncate" title={detailModal.uuid || detailModal.id}>
                    {detailModal.uuid || detailModal.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailModal(null)}
                  className="shrink-0 rounded-xl p-2.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                  aria-label="Close"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusColors[detailModal.status] || 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                  {(detailModal.status || '').replace('_', ' ')}
                </span>
                <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${paymentColors[detailModal.payment_status] || 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                  {(detailModal.payment_status || '').replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Customer hero */}
                <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <UserIcon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-stone-900">{detailModal.customer_name}</p>
                      <p className="text-sm text-stone-500">{detailModal.package?.name || 'Event'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {detailModal.customer_email && (
                      <a href={`mailto:${detailModal.customer_email}`} className="text-amber-600 hover:text-amber-700 hover:underline">
                        {detailModal.customer_email}
                      </a>
                    )}
                    {detailModal.customer_phone && (
                      <a href={`tel:${detailModal.customer_phone}`} className="text-amber-600 hover:text-amber-700 hover:underline">
                        {detailModal.customer_phone}
                      </a>
                    )}
                    {!detailModal.customer_email && !detailModal.customer_phone && <span className="text-stone-400">—</span>}
                  </div>
                </div>

                {/* Event */}
                <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    Event
                  </h4>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-stone-400">Date & time</dt>
                      <dd className="mt-0.5 font-medium text-stone-800">
                        {formatDate(detailModal.event_date)} · {formatTime(detailModal.event_time)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-stone-400">Duration</dt>
                      <dd className="mt-0.5 font-medium text-stone-800">{detailModal.duration_minutes || 60} min</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium text-stone-400">Address</dt>
                      <dd className="mt-0.5 font-medium text-stone-800">{detailModal.event_address || '—'}</dd>
                    </div>
                    {detailModal.arrived_at && (
                      <div className="sm:col-span-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Driver arrived at</dt>
                        <dd className="mt-0.5 font-medium text-emerald-800">
                          {formatDate(detailModal.arrived_at)} · {formatTime(detailModal.arrived_at)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Add-ons */}
                {((detailModal.add_ons || detailModal.addOns)?.length > 0) && (
                  <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Add-ons</h4>
                    <ul className="flex flex-wrap gap-2">
                      {(detailModal.add_ons || detailModal.addOns).map((ao, i) => (
                        <li key={i} className="rounded-lg bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700">
                          {ao.add_on?.name || ao.addOn?.name || 'Add-on'} × {ao.quantity ?? 1}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Assignment */}
                {(detailModal.truck || detailModal.driver) && (
                  <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                      <TruckIcon className="h-4 w-4 text-amber-500" />
                      Assignment
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="rounded-xl bg-stone-50 px-4 py-3">
                        <p className="text-xs font-medium text-stone-400">Truck</p>
                        <p className="mt-0.5 font-semibold text-stone-800">{detailModal.truck?.name || '—'}</p>
                      </div>
                      <div className="rounded-xl bg-stone-50 px-4 py-3">
                        <p className="text-xs font-medium text-stone-400">Driver</p>
                        <p className="mt-0.5 font-semibold text-stone-800">{detailModal.driver?.name || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial */}
                <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                    <CurrencyIcon className="h-4 w-4 text-amber-500" />
                    Payment
                  </h4>
                  <p className="text-2xl font-bold text-stone-900">{formatCurrency(detailModal.total_amount)}</p>
                </div>

                {/* Assigned inventory */}
                {(() => {
                  const snap = detailModal.inventory_snapshots?.[0] ?? detailModal.inventorySnapshots?.[0];
                  const lines = snap?.lines ?? [];
                  if (lines.length === 0) return null;
                  return (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5">
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-700">
                        <CubeIcon className="h-4 w-4 text-indigo-500" />
                        Assigned inventory
                      </h4>
                      <ul className="space-y-2">
                        {lines.map((line) => {
                          const product = line.inventory_product ?? line.inventoryProduct;
                          return (
                            <li
                              key={line.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm shadow-sm border border-indigo-100/50"
                            >
                              <span className="font-medium text-stone-800">{product?.name || 'Product'}</span>
                              <span className="text-stone-500">({product?.unit || 'unit'})</span>
                              <span className="text-stone-600">Assigned: <strong>{line.quantity_assigned}</strong></span>
                              {(line.quantity_used != null || line.quantity_remaining != null || line.quantity_waste != null) && (
                                <span className="text-stone-500">
                                  Used: {line.quantity_used ?? '—'} · Remaining: {line.quantity_remaining ?? '—'}
                                  {line.quantity_waste != null ? ` · Waste: ${line.quantity_waste}` : ''}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}

                {/* Special notes */}
                {detailModal.special_notes && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
                      <ClipboardListIcon className="h-4 w-4 text-amber-600" />
                      Special notes
                    </h4>
                    <p className="text-stone-700 leading-relaxed">{detailModal.special_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onClick={() => !assignSaving && setAssignModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Assign truck & driver</h3>
              <button type="button" onClick={() => !assignSaving && setAssignModal(null)} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-stone-600">
              {assignModal.customer_name} · {formatDate(assignModal.event_date)}
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Truck</label>
                <select
                  value={assignTruck}
                  onChange={(e) => setAssignTruck(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Select truck</option>
                  {trucks.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Driver</label>
                <select
                  value={assignDriver}
                  onChange={(e) => setAssignDriver(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">Select driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {assignError && <p className="mt-3 text-sm text-red-600">{assignError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setAssignModal(null)} disabled={assignSaving} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAssign}
                disabled={assignSaving || !assignTruck || !assignDriver}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {assignSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory modal */}
      {inventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" onClick={() => !inventorySaving && setInventoryModal(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Set inventory (before event)</h3>
              <button type="button" onClick={() => !inventorySaving && setInventoryModal(null)} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-stone-500">{inventoryModal.customer_name}. Assign quantities per product for this truck.</p>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {inventoryProducts.map((p) => {
                const idx = inventoryLines.findIndex((l) => l.inventory_product_id === p.id);
                const line = idx >= 0 ? inventoryLines[idx] : { inventory_product_id: p.id, quantity_assigned: 0 };
                return (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3">
                    <span className="flex-1 text-sm font-medium text-stone-800">{p.name}</span>
                    <input
                      type="number"
                      min="0"
                      value={line.quantity_assigned}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10) || 0;
                        setInventoryLines((prev) => {
                          const i = prev.findIndex((l) => l.inventory_product_id === p.id);
                          const next = i >= 0 ? [...prev] : [...prev, { inventory_product_id: p.id, quantity_assigned: 0 }];
                          const j = i >= 0 ? i : next.length - 1;
                          next[j] = { ...next[j], quantity_assigned: v };
                          return next;
                        });
                      }}
                      className="w-24 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                );
              })}
            </div>
            {inventoryProducts.length === 0 && (
              <p className="py-6 text-center text-sm text-stone-500">No inventory products. Add products in Settings or Inventory.</p>
            )}
            {inventoryError && <p className="mt-3 text-sm text-red-600">{inventoryError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setInventoryModal(null)} disabled={inventorySaving} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                type="button"
                onClick={saveInventory}
                disabled={inventorySaving}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {inventorySaving ? 'Saving…' : 'Save snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

const token = () => localStorage.getItem('admin_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ClipboardListIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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

function ExclamationIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

function TruckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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

function XCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** Expected remaining = assigned - used. Discrepancy = reported remaining - expected. */
function getDiscrepancy(assigned, used, remaining) {
  const a = Number(assigned) || 0;
  const u = Number(used) ?? 0;
  const r = Number(remaining) ?? 0;
  const expectedRemaining = a - u;
  return r - expectedRemaining;
}

/** Dummy data for demo when no pending reviews from API */
const DUMMY_LIST = [
  {
    _isDummy: true,
    snapshot: { id: 9001 },
    booking: {
      id: 99901,
      customer_name: 'Sarah Johnson',
      event_date: '2025-02-15',
      truck: { name: 'Truck A - Sweet Van' },
      driver: { name: 'Mike Davis' },
    },
    lines_with_discrepancy: [
      { id: 90011, inventory_product_id: 1, product: { name: 'Vanilla Ice Cream' }, quantity_assigned: 50, quantity_used: 42, quantity_remaining: 8, discrepancy: 0 },
      { id: 90012, inventory_product_id: 2, product: { name: 'Chocolate Ice Cream' }, quantity_assigned: 40, quantity_used: 35, quantity_remaining: 4, discrepancy: -1 },
      { id: 90013, inventory_product_id: 3, product: { name: 'Strawberry Topping' }, quantity_assigned: 20, quantity_used: 18, quantity_remaining: 2, discrepancy: 0 },
    ],
  },
  {
    _isDummy: true,
    snapshot: { id: 9002 },
    booking: {
      id: 99902,
      customer_name: 'James Wilson',
      event_date: '2025-02-14',
      truck: { name: 'Truck B - Frosty Wheels' },
      driver: { name: 'Emma Brown' },
    },
    lines_with_discrepancy: [
      { id: 90021, inventory_product_id: 1, product: { name: 'Vanilla Ice Cream' }, quantity_assigned: 60, quantity_used: 55, quantity_remaining: 5, discrepancy: 0 },
      { id: 90022, inventory_product_id: 2, product: { name: 'Chocolate Ice Cream' }, quantity_assigned: 50, quantity_used: 48, quantity_remaining: 2, discrepancy: 0 },
    ],
  },
];

export default function AdminInventoryReview() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [note, setNote] = useState({});
  const [lineEdits, setLineEdits] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/admin/inventory-review/pending`, { headers: headers() })
      .then(({ data }) => {
        const items = data.data || [];
        const listToShow = items.length > 0 ? items : DUMMY_LIST;
        setList(listToShow);
        setLineEdits((prev) => {
          const next = { ...prev };
          listToShow.forEach((item) => {
            const bookingId = item.booking?.id;
            if (!bookingId) return;
            (item.lines_with_discrepancy || []).forEach((line) => {
              const key = `${bookingId}-${line.id}`;
              next[key] = {
                quantity_used: line.quantity_used ?? '',
                quantity_remaining: line.quantity_remaining ?? '',
              };
            });
          });
          return next;
        });
      })
      .catch(() => {
        setList(DUMMY_LIST);
        setLineEdits((prev) => {
          const next = { ...prev };
          DUMMY_LIST.forEach((item) => {
            const bookingId = item.booking?.id;
            (item.lines_with_discrepancy || []).forEach((line) => {
              next[`${bookingId}-${line.id}`] = {
                quantity_used: line.quantity_used ?? '',
                quantity_remaining: line.quantity_remaining ?? '',
              };
            });
          });
          return next;
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!token()) return;
    load();
  }, [load]);

  const clearMessage = useCallback(() => setMessage({ type: '', text: '' }), []);
  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(clearMessage, 5000);
    return () => clearTimeout(t);
  }, [message.text, clearMessage]);

  const getLineEdit = (bookingId, lineId) => {
    const key = `${bookingId}-${lineId}`;
    return lineEdits[key] || { quantity_used: '', quantity_remaining: '' };
  };

  const setLineEdit = (bookingId, lineId, field, value) => {
    const key = `${bookingId}-${lineId}`;
    setLineEdits((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value === '' ? '' : (typeof value === 'number' ? value : parseInt(value, 10)),
      },
    }));
  };

  const handleReview = (item, status) => {
    const booking = item.booking;
    const bookingId = booking?.id;
    const lines = item.lines_with_discrepancy || [];

    if (item._isDummy) {
      setList((prev) => prev.filter((i) => i.booking?.id !== bookingId));
      setNote((n) => ({ ...n, [bookingId]: '' }));
      setMessage({ type: 'success', text: 'Demo item removed. Real reviews will come from completed bookings.' });
      return;
    }

    setActionLoading(bookingId);

    const adjustments = lines.map((line) => {
      const edit = getLineEdit(bookingId, line.id);
      const used = edit.quantity_used === '' ? (line.quantity_used ?? 0) : Number(edit.quantity_used) || 0;
      const remaining = edit.quantity_remaining === '' ? (line.quantity_remaining ?? 0) : Number(edit.quantity_remaining) || 0;
      return {
        truck_inventory_snapshot_line_id: line.id,
        quantity_used: Math.max(0, used),
        quantity_remaining: Math.max(0, remaining),
      };
    });

    const payload = {
      status,
      note: (note[bookingId] || '').trim() || null,
      ...(adjustments.length > 0 && { adjustments }),
    };

    axios
      .put(`${API_BASE}/admin/bookings/${bookingId}/inventory-review`, payload, { headers: headers() })
      .then(() => {
        setList((prev) => prev.filter((i) => i.booking?.id !== bookingId));
        setNote((n) => ({ ...n, [bookingId]: '' }));
        setMessage({
          type: 'success',
          text: status === 'approved' ? 'Inventory approved and stock updated.' : 'Inventory flagged for follow-up.',
        });
      })
      .catch((err) => {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed.' });
      })
      .finally(() => setActionLoading(null));
  };

  if (loading && list.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-stone-500">Loading pending reviews…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-stone-100 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Inventory Review</h1>
            <p className="mt-1 text-stone-600">
              After events, drivers submit used and remaining quantities. Review and approve or flag mismatches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {list.some((i) => i._isDummy) && (
              <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                Demo data
              </span>
            )}
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-2xl font-bold text-stone-900">{list.length}</span>
              <span className="ml-2 text-sm text-stone-500">pending</span>
            </div>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50"
            >
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Message */}
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

      {list.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
          <ClipboardListIcon className="mx-auto h-14 w-14 text-stone-300" />
          <h2 className="mt-4 text-lg font-semibold text-stone-800">No pending reviews</h2>
          <p className="mt-2 text-sm text-stone-500">
            When drivers complete events and submit inventory, their snapshots will appear here for review.
          </p>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="mt-6 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((item) => {
            const booking = item.booking;
            const snapshot = item.snapshot;
            const lines = item.lines_with_discrepancy || [];
            const hasDiscrepancy = lines.some((l) => {
              const edit = getLineEdit(booking?.id, l.id);
              const used = edit.quantity_used === '' ? (l.quantity_used ?? 0) : Number(edit.quantity_used) || 0;
              const rem = edit.quantity_remaining === '' ? (l.quantity_remaining ?? 0) : Number(edit.quantity_remaining) || 0;
              return getDiscrepancy(l.quantity_assigned, used, rem) !== 0;
            });
            const loadingThis = actionLoading === booking?.id;

            return (
              <div
                key={snapshot?.id || booking?.id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
              >
                {/* Card header */}
                <div className="border-b border-stone-100 bg-stone-50/50 px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="font-semibold text-stone-900">
                        {booking?.customer_name}
                      </p>
                      <span className="text-stone-400">·</span>
                      <p className="text-stone-600">{formatDate(booking?.event_date)}</p>
                      <span className="text-stone-400">·</span>
                      <p className="text-sm text-stone-500">Booking #{booking?.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {booking?.truck && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600">
                          <TruckIcon className="h-3.5 w-3.5" />
                          {booking.truck.name}
                        </span>
                      )}
                      {booking?.driver && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600">
                          <UserIcon className="h-3.5 w-3.5" />
                          {booking.driver.name}
                        </span>
                      )}
                      {hasDiscrepancy && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                          <ExclamationIcon className="h-3.5 w-3.5" />
                          Discrepancy
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50/80 text-stone-600">
                        <th className="px-6 py-3 font-semibold">Product</th>
                        <th className="px-6 py-3 font-semibold text-right">Assigned</th>
                        <th className="px-6 py-3 font-semibold text-right">Used</th>
                        <th className="px-6 py-3 font-semibold text-right">Remaining</th>
                        <th className="px-6 py-3 font-semibold text-right">Discrepancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {lines.map((line) => {
                        const edit = getLineEdit(booking?.id, line.id);
                        const used = edit.quantity_used === '' ? (line.quantity_used ?? '') : edit.quantity_used;
                        const remaining = edit.quantity_remaining === '' ? (line.quantity_remaining ?? '') : edit.quantity_remaining;
                        const usedNum = used === '' ? (line.quantity_used ?? 0) : Number(used) || 0;
                        const remainingNum = remaining === '' ? (line.quantity_remaining ?? 0) : Number(remaining) || 0;
                        const disc = getDiscrepancy(line.quantity_assigned, usedNum, remainingNum);
                        return (
                          <tr key={line.id} className="hover:bg-stone-50/50">
                            <td className="px-6 py-3 font-medium text-stone-900">
                              {line.product?.name || '—'}
                            </td>
                            <td className="px-6 py-3 text-right text-stone-600">{line.quantity_assigned}</td>
                            <td className="px-6 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={used}
                                onChange={(e) => setLineEdit(booking?.id, line.id, 'quantity_used', e.target.value)}
                                className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-right text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </td>
                            <td className="px-6 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                value={remaining}
                                onChange={(e) => setLineEdit(booking?.id, line.id, 'quantity_remaining', e.target.value)}
                                className="w-20 rounded-lg border border-stone-200 px-2 py-1.5 text-right text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </td>
                            <td className="px-6 py-3 text-right">
                              {disc !== 0 ? (
                                <span className={disc > 0 ? 'font-medium text-emerald-600' : 'font-medium text-red-600'}>
                                  {disc > 0 ? '+' : ''}{disc}
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 border-t border-stone-100 bg-stone-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <label className="sr-only">Note (optional)</label>
                    <input
                      type="text"
                      placeholder="Note (optional)"
                      value={note[booking?.id] || ''}
                      onChange={(e) => setNote((n) => ({ ...n, [booking?.id]: e.target.value }))}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 sm:max-w-xs"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={loadingThis}
                      onClick={() => handleReview(item, 'approved')}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {loadingThis ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={loadingThis}
                      onClick={() => handleReview(item, 'flagged')}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                    >
                      {loadingThis ? null : <ExclamationIcon className="h-4 w-4" />}
                      Flag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

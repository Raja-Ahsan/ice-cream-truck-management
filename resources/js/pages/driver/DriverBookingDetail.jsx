import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../../app';
import axios from 'axios';

const token = () => localStorage.getItem('driver_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDateTime(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n));
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  dispatched: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-stone-100 text-stone-600',
};

// API may return camelCase (inventorySnapshots, inventoryProduct) or snake_case
function getSnapshots(booking) {
  return booking?.inventory_snapshots ?? booking?.inventorySnapshots ?? [];
}
function getLines(snapshot) {
  return snapshot?.lines ?? [];
}
function getProduct(line) {
  return line?.inventory_product ?? line?.inventoryProduct;
}
function getAddOns(booking) {
  return booking?.add_ons ?? booking?.addOns ?? [];
}
function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
function CurrencyIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function DriverBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeInventoryLines, setCompleteInventoryLines] = useState([]);

  const load = (showLoading = true) => {
    if (!token() || !id) return;
    if (showLoading) setLoading(true);
    axios
      .get(`${API_BASE}/driver/bookings/${id}`, { headers: headers() })
      .then(({ data }) => setBooking(data.data))
      .catch(() => setBooking(null))
      .finally(() => { if (showLoading) setLoading(false); });
  };

  useEffect(() => load(), [id]);

  useEffect(() => {
    if (!message.text) return;
    const t = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    return () => clearTimeout(t);
  }, [message.text]);

  const action = (name, method, url, body = {}) => {
    setActionLoading(name);
    setMessage({ type: '', text: '' });
    const req = method === 'post' ? axios.post(url, body, { headers: headers() }) : axios.get(url, { headers: headers() });
    req
      .then(({ data }) => {
        setBooking(data.data || booking);
        setMessage({ type: 'success', text: data.message || 'Done.' });
        if (name === 'complete') setCompleteModalOpen(false);
        // Refetch booking so status and all fields stay in sync with the server
        load(false);
      })
      .catch((err) => setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed.' }))
      .finally(() => setActionLoading(null));
  };

  const startRoute = () => action('start', 'post', `${API_BASE}/driver/bookings/${id}/start-route`);
  const arrive = () => action('arrive', 'post', `${API_BASE}/driver/bookings/${id}/arrive`);

  const openCompleteModal = () => {
    const snap = getSnapshots(booking)[0];
    const lines = getLines(snap);
    setCompleteInventoryLines(
      lines.map((line) => ({
        truck_inventory_snapshot_line_id: line.id,
        quantity_used: line.quantity_used ?? 0,
        quantity_remaining: line.quantity_remaining ?? line.quantity_assigned ?? 0,
        quantity_waste: line.quantity_waste ?? 0,
        _product: getProduct(line),
        _quantity_assigned: line.quantity_assigned,
      }))
    );
    setCompleteModalOpen(true);
  };

  const complete = () => {
    const payload = { notes: completeNotes || null };
    if (completeInventoryLines.length > 0) {
      payload.inventory = completeInventoryLines.map((l) => ({
        truck_inventory_snapshot_line_id: l.truck_inventory_snapshot_line_id,
        quantity_used: Number(l.quantity_used) || 0,
        quantity_remaining: Number(l.quantity_remaining) || 0,
        quantity_waste: Number(l.quantity_waste) || 0,
      }));
    }
    action('complete', 'post', `${API_BASE}/driver/bookings/${id}/complete`, payload);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <p>Booking not found or you don’t have access.</p>
        <Link to="/driver/bookings" className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline">
          ← Back to My Bookings
        </Link>
      </div>
    );
  }

  const canStartRoute = booking.status === 'dispatched';
  const canArrive = (booking.status === 'in_progress' || booking.status === 'dispatched') && !booking.arrived_at;
  const canComplete = booking.status === 'in_progress';
  const isCompleted = booking.status === 'completed';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/driver/bookings" className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:underline">
          ← Back to My Bookings
        </Link>
      </div>

      {message.text && (
        <div
          role="alert"
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white shadow-lg overflow-hidden ring-1 ring-stone-900/5">
        {/* Header with gradient */}
        <div className="border-b border-stone-100 bg-gradient-to-br from-amber-50 via-white to-orange-50/30 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">{booking.customer_name}</h1>
              <p className="mt-0.5 text-sm text-stone-500">{booking.package?.name || 'Event'}</p>
            </div>
            <span className={`rounded-lg border px-3 py-1.5 text-sm font-semibold uppercase tracking-wide ${statusColors[booking.status] || 'bg-stone-100 text-stone-600'}`}>
              {booking.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Event section */}
          <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
              <CalendarIcon className="h-4 w-4 text-amber-500" />
              Event
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-stone-400">Date & time</dt>
                <dd className="mt-0.5 font-medium text-stone-800">{formatDate(booking.event_date)} · {formatTime(booking.event_time)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-stone-400">Duration</dt>
                <dd className="mt-0.5 font-medium text-stone-800">{booking.duration_minutes || 60} min</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-stone-400">Address</dt>
                <dd className="mt-0.5 flex items-start gap-2 font-medium text-stone-800">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  {booking.event_address || '—'}
                </dd>
              </div>
              {booking.arrived_at && (
                <div className="sm:col-span-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Arrived at</dt>
                  <dd className="mt-0.5 font-medium text-emerald-800">{formatDateTime(booking.arrived_at)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Customer contact */}
          <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Customer contact</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {booking.customer_phone && (
                <a href={`tel:${booking.customer_phone}`} className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
                  {booking.customer_phone}
                </a>
              )}
              {booking.customer_email && (
                <a href={`mailto:${booking.customer_email}`} className="font-medium text-amber-600 hover:text-amber-700 hover:underline">
                  {booking.customer_email}
                </a>
              )}
              {!booking.customer_phone && !booking.customer_email && <span className="text-stone-400">—</span>}
            </div>
          </div>

          {/* Truck & total */}
          <div className="grid gap-4 sm:grid-cols-2">
            {booking.truck && (
              <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                  <TruckIcon className="h-4 w-4 text-amber-500" />
                  Assigned truck
                </h2>
                <p className="font-medium text-stone-800">{booking.truck.name || booking.truck.truck_number || '—'}</p>
              </div>
            )}
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-500">
                <CurrencyIcon className="h-4 w-4 text-amber-500" />
                Total
              </h2>
              <p className="text-xl font-bold text-stone-900">{formatCurrency(booking.total_amount)}</p>
            </div>
          </div>

          {/* Assigned inventory — always visible section */}
          {(() => {
            const snap = getSnapshots(booking)[0];
            const lines = getLines(snap);
            return (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-800">
                  <CubeIcon className="h-4 w-4 text-indigo-500" />
                  Assigned inventory (for this event)
                </h2>
                {lines.length === 0 ? (
                  <p className="text-sm text-indigo-700">No inventory assigned for this event. If you expect items, ask admin to set inventory on the booking before dispatch.</p>
                ) : (
                  <>
                    <p className="mb-3 text-xs text-indigo-700">When you finish the event, click <strong>Complete event</strong> and enter <strong>Used</strong>, <strong>Remaining</strong>, and <strong>Waste</strong> for each item.</p>
                    <ul className="space-y-2">
                      {lines.map((line) => {
                        const product = getProduct(line);
                        return (
                          <li key={line.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/90 px-4 py-3 text-sm shadow-sm border border-indigo-100/50">
                            <span className="font-medium text-stone-800">{product?.name || 'Product'}</span>
                            <span className="text-stone-500">({product?.unit || 'unit'})</span>
                            <span className="text-stone-700">Assigned: <strong>{line.quantity_assigned}</strong></span>
                            {(line.quantity_used != null || line.quantity_waste != null) && (
                              <span className="text-stone-600">
                                Used: {line.quantity_used ?? '—'} · Remaining: {line.quantity_remaining ?? '—'}
                                {line.quantity_waste != null && line.quantity_waste !== '' ? ` · Waste: ${line.quantity_waste}` : ''}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            );
          })()}

          {/* Add-ons */}
          {getAddOns(booking).length > 0 && (
            <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Add-ons</h2>
              <ul className="flex flex-wrap gap-2">
                {getAddOns(booking).map((ao, i) => (
                  <li key={i} className="rounded-lg bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-700">
                    {ao.add_on?.name || ao.addOn?.name || 'Add-on'} × {ao.quantity ?? 1}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Special notes */}
          {booking.special_notes && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
                <ClipboardListIcon className="h-4 w-4 text-amber-600" />
                Special notes
              </h2>
              <p className="text-stone-700 leading-relaxed">{booking.special_notes}</p>
            </div>
          )}

          {/* In progress: show hint to complete and report inventory */}
          {canComplete && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
              You’ve arrived. When the event is finished, click <strong>Complete event</strong> to report inventory (used, remaining, waste) and close the booking.
            </div>
          )}

          {/* Actions */}
          {!isCompleted && (
            <div className="flex flex-wrap gap-3 border-t border-stone-200 pt-6">
              {canStartRoute && (
                <button
                  type="button"
                  onClick={startRoute}
                  disabled={!!actionLoading}
                  className="rounded-xl bg-purple-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-purple-600 disabled:opacity-50"
                >
                  {actionLoading === 'start' ? 'Starting…' : 'Start route'}
                </button>
              )}
              {canArrive && (
                <button
                  type="button"
                  onClick={arrive}
                  disabled={!!actionLoading}
                  className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-cyan-600 disabled:opacity-50"
                >
                  {actionLoading === 'arrive' ? 'Recording…' : 'I’ve arrived'}
                </button>
              )}
              {canComplete && (
                <button
                  type="button"
                  onClick={openCompleteModal}
                  disabled={!!actionLoading}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50"
                >
                  Complete event
                </button>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-5 py-4 text-center">
              <p className="text-base font-semibold text-emerald-800">Event booking is completed</p>
              <p className="mt-1 text-sm text-emerald-700">You cannot change this booking. All details are final.</p>
            </div>
          )}
        </div>
      </div>

      {completeModalOpen && (
        <>
          <div className="fixed inset-0 z-20 bg-stone-900/50" onClick={() => setCompleteModalOpen(false)} aria-hidden="true" />
          <div className="fixed left-1/2 top-1/2 z-30 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-stone-900">Complete event</h2>
            <p className="mt-1 text-sm text-stone-500">Confirm that this event is finished. Report inventory used, remaining, and waste below if applicable.</p>

            {completeInventoryLines.length > 0 && (
              <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                <p className="text-sm font-medium text-stone-700">Inventory (used / remaining / waste)</p>
                <div className="mt-3 space-y-3">
                  {completeInventoryLines.map((line, idx) => (
                    <div key={line.truck_inventory_snapshot_line_id} className="flex flex-wrap items-center gap-3 rounded-lg bg-white px-3 py-2 border border-stone-100">
                      <span className="w-32 shrink-0 text-sm font-medium text-stone-800">{line._product?.name || 'Product'}</span>
                      <span className="text-xs text-stone-500">Assigned: {line._quantity_assigned}</span>
                      <label className="flex items-center gap-1.5 text-sm">
                        <span className="text-stone-600">Used</span>
                        <input
                          type="number"
                          min="0"
                          value={line.quantity_used}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10) || 0;
                            setCompleteInventoryLines((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], quantity_used: v };
                              return next;
                            });
                          }}
                          className="w-16 rounded-lg border border-stone-200 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <span className="text-stone-600">Remaining</span>
                        <input
                          type="number"
                          min="0"
                          value={line.quantity_remaining}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10) || 0;
                            setCompleteInventoryLines((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], quantity_remaining: v };
                              return next;
                            });
                          }}
                          className="w-16 rounded-lg border border-stone-200 px-2 py-1 text-sm"
                        />
                      </label>
                      <label className="flex items-center gap-1.5 text-sm">
                        <span className="text-stone-600">Waste</span>
                        <input
                          type="number"
                          min="0"
                          value={line.quantity_waste ?? ''}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setCompleteInventoryLines((prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], quantity_waste: isNaN(v) ? 0 : v };
                              return next;
                            });
                          }}
                          className="w-16 rounded-lg border border-stone-200 px-2 py-1 text-sm"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-700">Notes (optional)</label>
              <textarea
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="Any notes about the event…"
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={complete}
                disabled={actionLoading === 'complete'}
                className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {actionLoading === 'complete' ? 'Completing…' : 'Complete event'}
              </button>
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                disabled={!!actionLoading}
                className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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

export default function DriverBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = useCallback(() => {
    if (!token()) return;
    setLoading(true);
    axios
      .get(`${API_BASE}/driver/bookings`, { headers: headers() })
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const list = Array.isArray(bookings) ? bookings : [];
  const filtered =
    statusFilter === ''
      ? list
      : list.filter((b) => b.status === statusFilter);
  const today = new Date().toDateString();
  const todayCount = list.filter((b) => new Date(b.event_date).toDateString() === today).length;
  const upcomingCount = list.filter((b) => new Date(b.event_date + 'T' + (b.event_time || '00:00')) > new Date() && !['completed', 'cancelled'].includes(b.status)).length;
  const completedCount = list.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-stone-100 p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">My Bookings</h1>
        <p className="mt-1 text-sm text-stone-600">View and manage your assigned events.</p>
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            statusFilter === '' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          All ({list.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('dispatched')}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            statusFilter === 'dispatched' ? 'border-purple-500 bg-purple-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          Dispatched
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('in_progress')}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            statusFilter === 'in_progress' ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          In progress
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            statusFilter === 'completed' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-stone-600">
          Showing <strong>{filtered.length}</strong> booking{filtered.length !== 1 ? 's' : ''} · Today: <strong>{todayCount}</strong> · Upcoming: <strong>{upcomingCount}</strong>
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-stone-500 sm:px-6">No bookings match the selected filter.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80">
                  <tr>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Customer / Event</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Date & time</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Address</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700">Status</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700 text-right">Amount</th>
                    <th className="px-4 py-3.5 font-semibold text-stone-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-900">{b.customer_name}</p>
                        <p className="text-xs text-stone-500">{b.package?.name || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {formatDate(b.event_date)} · {formatTime(b.event_time)}
                      </td>
                      <td className="px-4 py-3 text-stone-600 max-w-[200px] truncate">{b.event_address || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-stone-100 text-stone-600'}`}>
                          {b.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-stone-900">{formatCurrency(b.total_amount)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/driver/bookings/${b.id}`}
                          className="inline-flex items-center rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stone-100 md:hidden">
              {filtered.map((b) => (
                <Link key={b.id} to={`/driver/bookings/${b.id}`} className="block p-4 hover:bg-stone-50/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stone-900">{b.customer_name}</p>
                      <p className="text-sm text-stone-600">{formatDate(b.event_date)} · {formatTime(b.event_time)}</p>
                      <p className="mt-0.5 text-xs text-stone-500 line-clamp-2">{b.event_address}</p>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-stone-100 text-stone-600'}`}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{formatCurrency(b.total_amount)}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

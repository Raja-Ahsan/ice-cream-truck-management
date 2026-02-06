import React, { useEffect, useState } from 'react';
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

const StatCard = ({ title, value, subtext, href, icon: Icon, accent = 'amber' }) => {
  const accents = {
    amber: 'from-amber-500/10 to-orange-500/5 border-amber-200/50 text-amber-700',
    blue: 'from-blue-500/10 to-indigo-500/5 border-blue-200/50 text-blue-700',
    emerald: 'from-emerald-500/10 to-teal-500/5 border-emerald-200/50 text-emerald-700',
    purple: 'from-purple-500/10 to-violet-500/5 border-purple-200/50 text-purple-700',
  };
  const c = accents[accent] || accents.amber;
  return (
    <Link
      to={href}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${c} p-5 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]`}
    >
      {Icon && (
        <span className="absolute right-4 top-4 opacity-20 group-hover:opacity-30">
          <Icon className="h-12 w-12" />
        </span>
      )}
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
      {subtext && <p className="mt-1 text-xs opacity-75">{subtext}</p>}
      <span className="mt-3 inline-block text-sm font-medium opacity-90 group-hover:underline">View →</span>
    </Link>
  );
};

function BookingsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function CalendarIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function DriverDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token()) return;
    axios
      .get(`${API_BASE}/driver/bookings`, { headers: headers() })
      .then(({ data }) => setBookings(data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const list = Array.isArray(bookings) ? bookings : [];
  const todayBookings = list.filter((b) => new Date(b.event_date).toDateString() === today);
  const upcoming = list.filter((b) => new Date(b.event_date + 'T' + (b.event_time || '00:00')) > new Date() && b.status !== 'completed' && b.status !== 'cancelled');
  const inProgress = list.filter((b) => b.status === 'in_progress' || b.status === 'dispatched');
  const completed = list.filter((b) => b.status === 'completed');
  const recent = list.slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-stone-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-stone-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">Welcome back</h1>
        <p className="mt-1 text-stone-600">Here are your assigned bookings and today’s schedule.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today" value={todayBookings.length} subtext="Events today" href="/driver/bookings" icon={CalendarIcon} accent="amber" />
        <StatCard title="Upcoming" value={upcoming.length} subtext="Scheduled" href="/driver/bookings" icon={ClockIcon} accent="blue" />
        <StatCard title="In progress" value={inProgress.length} subtext="Active now" href="/driver/bookings" icon={BookingsIcon} accent="purple" />
        <StatCard title="Completed" value={completed.length} subtext="Done" href="/driver/bookings" icon={CheckIcon} accent="emerald" />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-4 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Recent bookings</h2>
            <p className="text-sm text-stone-500">Your assigned events</p>
          </div>
          <Link to="/driver/bookings" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="px-4 py-12 text-center text-stone-500 md:px-6">No bookings assigned yet.</div>
          ) : (
            <div className="grid gap-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recent.map((b) => (
                <Link
                  key={b.id}
                  to={`/driver/bookings/${b.id}`}
                  className="flex flex-col gap-2 border-b border-stone-100 p-4 transition-colors hover:bg-stone-50/80 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{b.customer_name}</p>
                      <p className="truncate text-xs text-stone-500">{b.event_address}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[b.status] || 'bg-stone-100 text-stone-600'}`}>
                      {b.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">
                    {formatDate(b.event_date)} · {formatTime(b.event_time)}
                  </p>
                  <p className="text-sm font-semibold text-stone-900">{formatCurrency(b.total_amount)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

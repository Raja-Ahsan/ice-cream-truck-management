import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { API_BASE } from '../../app';
import axios from 'axios';

function useAuth() {
  return localStorage.getItem('admin_token');
}

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

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#6b7280', '#ef4444'];

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
      <span className="mt-3 inline-block text-sm font-medium opacity-90 group-hover:underline">
        View →
      </span>
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
function CurrencyIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function AdminDashboard() {
  const token = useAuth();
  const headers = () => ({ Authorization: `Bearer ${token}` });
  const [bookings, setBookings] = useState({ data: [] });
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    Promise.all([
      axios.get(`${API_BASE}/admin/bookings`, { headers: headers(), params: { per_page: 100 } }),
      axios.get(`${API_BASE}/admin/reports/revenue`, { headers: headers(), params: { from_date: from, to_date: to } }).catch(() => ({ data: null })),
    ])
      .then(([bookingsRes, revenueRes]) => {
        setBookings(bookingsRes.data || { data: [] });
        setRevenue(revenueRes.data);
      })
      .catch(() => setBookings({ data: [] }))
      .finally(() => setLoading(false));
  }, [token]);

  const list = bookings?.data ?? [];
  const pending = list.filter((b) => b.status === 'pending');
  const today = new Date().toDateString();
  const todayBookings = list.filter((b) => new Date(b.event_date).toDateString() === today);
  const totalRevenue = revenue?.total_revenue ?? list.filter((b) => b.payment_status === 'paid').reduce((s, b) => s + Number(b.total_amount || 0), 0);
  const recent = list.slice(0, 6);

  const revenueChartData = (revenue?.by_day || []).map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Number(d.total ?? 0),
    fullDate: d.date,
  }));

  const statusCounts = list.reduce((acc, b) => {
    const s = b.status || 'unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = Object.entries(statusCounts).map(([name, count], i) => ({
    name: name.replace('_', ' '),
    value: count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const bookingsByDayData = last7Days.map((date) => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    bookings: list.filter((b) => (b.event_date || '').toString().slice(0, 10) === date).length,
  }));

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
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-stone-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">Welcome back</h1>
        <p className="mt-1 text-stone-600">Here’s what’s happening with your ice cream truck operations today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={list.length}
          subtext="All time"
          href="/admin/bookings"
          icon={BookingsIcon}
          accent="amber"
        />
        <StatCard
          title="Pending"
          value={pending.length}
          subtext="Need assignment"
          href="/admin/bookings"
          icon={ClockIcon}
          accent="blue"
        />
        <StatCard
          title="Today"
          value={todayBookings.length}
          subtext="Events today"
          href="/admin/bookings"
          icon={CalendarIcon}
          accent="purple"
        />
        <StatCard
          title="Revenue (Paid)"
          value={formatCurrency(totalRevenue)}
          subtext="This period"
          href="/admin/bookings"
          icon={CurrencyIcon}
          accent="emerald"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue over time */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-stone-900">Revenue by day</h2>
          <p className="text-sm text-stone-500">Paid bookings (current period)</p>
          <div className="mt-4 h-64 md:h-72">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#78716c" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#78716c" tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate && formatDate(payload[0].payload.fullDate)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-stone-50 text-stone-500">
                No revenue data for this period
              </div>
            )}
          </div>
        </div>

        {/* Bookings by status */}
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
          <h2 className="text-lg font-semibold text-stone-900">Bookings by status</h2>
          <p className="text-sm text-stone-500">Distribution</p>
          <div className="mt-4 h-64 md:h-72">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={statusChartData[i].fill} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Bookings']} contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-xl bg-stone-50 text-stone-500">
                No bookings yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookings last 7 days (bar) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-stone-900">Bookings (last 7 days)</h2>
        <p className="text-sm text-stone-500">Events by day</p>
        <div className="mt-4 h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingsByDayData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#78716c" />
              <YAxis tick={{ fontSize: 12 }} stroke="#78716c" allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4' }} />
              <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 px-4 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Recent bookings</h2>
            <p className="text-sm text-stone-500">Latest customer bookings</p>
          </div>
          <Link
            to="/admin/bookings"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <div className="px-4 py-12 text-center text-stone-500 md:px-6">No bookings yet.</div>
          ) : (
            <div className="grid gap-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {recent.map((b) => (
                <Link
                  key={b.id}
                  to="/admin/bookings"
                  className="flex flex-col gap-2 border-b border-stone-100 p-4 transition-colors hover:bg-stone-50/80 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-stone-900">{b.customer_name}</p>
                      <p className="truncate text-xs text-stone-500">{b.customer_email}</p>
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

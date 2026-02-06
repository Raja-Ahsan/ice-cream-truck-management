import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../app';

const SIDEBAR_COLLAPSED_KEY = 'driver_sidebar_collapsed';

function ProfileIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

const navItems = [
  { to: '/driver', end: true, label: 'Dashboard', icon: DashboardIcon },
  { to: '/driver/bookings', end: false, label: 'My Bookings', icon: BookingsIcon },
  { to: '/driver/profile', end: false, label: 'Profile', icon: ProfileIcon },
];

const titles = {
  '/driver': 'Dashboard',
  '/driver/bookings': 'My Bookings',
  '/driver/bookings/': 'Booking',
  '/driver/profile': 'Profile',
};

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM16 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM16 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function BookingsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function MenuIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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

const token = () => localStorage.getItem('driver_token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

export default function DriverLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false');
    } catch {
      return false;
    }
  });
  const [profile, setProfile] = useState(null);

  const loadProfile = () => {
    if (!token()) return;
    axios
      .get(`${API_BASE}/driver/profile`, { headers: headers() })
      .then(({ data }) => setProfile(data.data || data))
      .catch(() => setProfile({ name: localStorage.getItem('driver_name') || 'Driver', email: '' }));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const onProfileUpdated = () => loadProfile();
    window.addEventListener('driver-profile-updated', onProfileUpdated);
    return () => window.removeEventListener('driver-profile-updated', onProfileUpdated);
  }, []);

  const toggleSidebarCollapsed = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
    } catch (_) {}
  };

  const handleLogout = () => {
    localStorage.removeItem('driver_token');
    navigate('/driver/login', { replace: true });
  };

  const pathname = location.pathname.replace(/\/$/, '') || '/driver';
  const isBookingDetail = /^\/driver\/bookings\/\d+$/.test(pathname);
  const pageTitle = titles[pathname] || (isBookingDetail ? 'Booking' : 'Driver');

  return (
    <div className="flex min-h-screen bg-stone-50">
      <div
        className={`fixed inset-0 z-20 bg-stone-900/50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-700/50 bg-slate-800 text-white shadow-xl transition-[transform,width] duration-200 ease-out lg:translate-x-0 lg:duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700/50 px-3">
          <Link
            to="/driver"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center font-semibold text-white ${sidebarCollapsed ? 'w-full justify-center px-0' : 'gap-2'}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-900">
              <span className="text-lg">🍦</span>
            </span>
            {!sidebarCollapsed && <span className="truncate">Driver</span>}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-3">
          {navItems.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  sidebarCollapsed ? 'justify-center' : 'gap-3'
                } ${isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-700/80 hover:text-white'}`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-slate-700/50 p-3">
          <Link
            to="/driver/profile"
            onClick={() => setSidebarOpen(false)}
            title={sidebarCollapsed ? (profile?.name || 'Profile') : undefined}
            className={`flex items-center rounded-lg px-3 py-2.5 text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-amber-500/30"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-sm font-semibold text-amber-400">
                {(profile?.name || 'D').charAt(0).toUpperCase()}
              </span>
            )}
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{profile?.name || 'Driver'}</p>
                <p className="truncate text-xs text-slate-400">{profile?.email || ''}</p>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          >
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} pl-0`}>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 lg:hidden"
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="hidden rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-700 lg:block"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
            </button>
            <h1 className="text-lg font-semibold text-stone-900">{pageTitle}</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../App';

const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';

const navItems = [
  { to: '/admin', end: true, label: 'Dashboard', icon: DashboardIcon },
  { to: '/admin/bookings', end: false, label: 'Bookings', icon: BookingsIcon },
  { to: '/admin/inventory', end: false, label: 'Inventory', icon: CubeIcon },
  { to: '/admin/inventory-review', end: false, label: 'Inventory Review', icon: InventoryIcon },
  { to: '/admin/map', end: false, label: 'Live Map', icon: MapIcon },
  { to: '/admin/trucks', end: false, label: 'Trucks', icon: TruckIcon },
  { to: '/admin/drivers', end: false, label: 'Drivers', icon: DriversIcon },
  { to: '/admin/payments', end: false, label: 'Payments', icon: PaymentsIcon },
  { to: '/admin/cms-pages', end: false, label: 'CMS Pages', icon: CmsIcon },
  { to: '/admin/settings', end: false, label: 'Settings', icon: SettingsIcon },
  { to: '/admin/profile', end: false, label: 'Profile', icon: ProfileIcon },
];

const titles = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/inventory': 'Inventory',
  '/admin/inventory-review': 'Inventory Review',
  '/admin/map': 'Live Map',
  '/admin/trucks': 'Trucks',
  '/admin/drivers': 'Drivers',
  '/admin/payments': 'Payments',
  '/admin/cms-pages': 'CMS Pages',
  '/admin/settings': 'Settings',
  '/admin/profile': 'Profile',
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
function CubeIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function InventoryIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}
function MapIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
function DriversIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function PaymentsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function CmsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function SettingsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function ProfileIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
function ChevronDownIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const headers = () => ({ Authorization: `Bearer ${token}` });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false');
    } catch {
      return false;
    }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({ general: {} });

  const loadSettings = () => {
    if (!token) return;
    axios
      .get(`${API_BASE}/admin/settings`, { headers: headers() })
      .then(({ data }) => setSettings(data.data || { general: {} }))
      .catch(() => setSettings({ general: {} }));
  };

  const toggleSidebarCollapsed = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
    } catch (_) {}
  };

  const loadProfile = () => {
    if (!token) return;
    axios
      .get(`${API_BASE}/admin/profile`, { headers: headers() })
      .then(({ data }) => setProfile(data.data || data))
      .catch(() => setProfile(null));
  };

  useEffect(() => {
    loadProfile();
    loadSettings();
  }, [token]);

  useEffect(() => {
    const onProfileUpdated = () => loadProfile();
    window.addEventListener('admin-profile-updated', onProfileUpdated);
    return () => window.removeEventListener('admin-profile-updated', onProfileUpdated);
  }, []);

  useEffect(() => {
    const onLogosUpdated = () => loadSettings();
    window.addEventListener('admin-settings-logos-updated', onLogosUpdated);
    return () => window.removeEventListener('admin-settings-logos-updated', onLogosUpdated);
  }, []);

  const headerLogo = settings.general?.header_logo || settings.general?.site_logo;
  const siteTitle = settings.general?.site_title || 'Admin';

  useEffect(() => {
    const favicon = settings.general?.site_favicon;
    if (!favicon) return;
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
    return () => {};
  }, [settings.general?.site_favicon]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUserMenuOpen(false);
    navigate('/admin/login', { replace: true });
  };

  const pathname = location.pathname.replace(/\/$/, '') || '/admin';
  const pageTitle = titles[pathname] || 'Admin';
  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';
  const mainPl = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64';

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`fixed inset-0 z-20 bg-stone-900/50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-700/50 bg-slate-800 text-white shadow-xl transition-[transform,width] duration-200 ease-out lg:translate-x-0 lg:duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700/50 px-3">
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center font-semibold text-white ${sidebarCollapsed ? 'w-full justify-center px-0' : 'gap-2'}`}
          >
            {headerLogo ? (
              <img src={headerLogo} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-slate-600 object-contain bg-white" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-slate-900">
                <span className="text-lg">🍦</span>
              </span>
            )}
            {!sidebarCollapsed && <span className="truncate">{siteTitle}</span>}
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
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            title={sidebarCollapsed ? (profile?.name || 'Profile') : undefined}
            className={`flex items-center rounded-lg px-3 py-2.5 text-slate-300 transition-colors hover:bg-slate-700/80 hover:text-white ${
              sidebarCollapsed ? 'justify-center' : 'gap-3'
            }`}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full border-2 border-slate-600 object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-sm font-semibold text-amber-400">
                {(profile?.name || 'A').charAt(0).toUpperCase()}
              </span>
            )}
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{profile?.name || 'Admin'}</p>
                <p className="truncate text-xs text-slate-400">{profile?.email || ''}</p>
              </div>
            )}
          </Link>
        </div>
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col ${mainPl} pl-0`}>
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
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-stone-900">{pageTitle}</h1>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50"
            >
              View site →
            </Link>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm hover:bg-stone-50"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-stone-200 object-cover"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold">
                  {(profile?.name || 'A').charAt(0).toUpperCase()}
                </span>
              )}
              <ChevronDownIcon className="h-4 w-4 text-stone-500" />
            </button>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden="true"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <ProfileIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

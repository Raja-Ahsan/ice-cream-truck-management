import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-semibold text-stone-800">Admin</span>
          <nav className="flex items-center gap-4">
            <Link to="/admin/bookings" className="text-stone-600 hover:text-stone-900">Bookings</Link>
            <Link to="/admin/map" className="text-stone-600 hover:text-stone-900">Live Map</Link>
            <Link to="/admin/trucks" className="text-stone-600 hover:text-stone-900">Trucks</Link>
            <Link to="/admin/drivers" className="text-stone-600 hover:text-stone-900">Drivers</Link>
            <Link to="/admin/cms-pages" className="text-stone-600 hover:text-stone-900">CMS</Link>
            <Link to="/admin/settings" className="text-stone-600 hover:text-stone-900">Settings</Link>
            <button type="button" onClick={logout} className="text-sm text-stone-500 hover:text-stone-700">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

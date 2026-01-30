import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold text-amber-600">
            Ice Cream Truck
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-stone-600 hover:text-stone-900">Home</Link>
            <Link to="/pricing" className="text-stone-600 hover:text-stone-900">Pricing</Link>
            <Link to="/packages" className="text-stone-600 hover:text-stone-900">Packages</Link>
            <Link to="/faqs" className="text-stone-600 hover:text-stone-900">FAQs</Link>
            <Link to="/book" className="rounded bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600">
              Book Now
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} Ice Cream Truck. Book your event today.
      </footer>
    </div>
  );
}

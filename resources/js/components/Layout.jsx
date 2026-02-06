import React, { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { API_BASE } from '../App';
import axios from 'axios';

const defaultTitle = 'Ice Cream Truck';

export default function Layout() {
  const [publicSettings, setPublicSettings] = useState({
    site_title: defaultTitle,
    header_logo: null,
    footer_logo: null,
    site_favicon: null,
  });

  useEffect(() => {
    axios.get(`${API_BASE}/settings/public`).then(({ data }) => {
      const d = data?.data || {};
      setPublicSettings({
        site_title: d.site_title || defaultTitle,
        header_logo: d.header_logo || d.site_logo || null,
        footer_logo: d.footer_logo || d.site_logo || null,
        site_favicon: d.site_favicon || null,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (publicSettings.site_title) document.title = publicSettings.site_title;
  }, [publicSettings.site_title]);

  useEffect(() => {
    const favicon = publicSettings.site_favicon;
    if (!favicon) return;
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = favicon;
  }, [publicSettings.site_favicon]);

  const headerLogo = publicSettings.header_logo;
  const footerLogo = publicSettings.footer_logo;
  const siteTitle = publicSettings.site_title;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-amber-600">
            {headerLogo ? (
              <img src={headerLogo} alt="" className="h-9 w-9 object-contain" />
            ) : null}
            <span>{siteTitle}</span>
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
        {footerLogo && (
          <div className="mb-3 flex justify-center">
            <img src={footerLogo} alt="" className="h-10 object-contain opacity-80" />
          </div>
        )}
        © {new Date().getFullYear()} {siteTitle}. Book your event today.
      </footer>
    </div>
  );
}

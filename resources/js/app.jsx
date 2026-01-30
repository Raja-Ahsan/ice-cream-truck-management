import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Packages from './pages/Packages';
import FAQs from './pages/FAQs';
import Booking from './pages/Booking';
import BookingConfirm from './pages/BookingConfirm';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminBookings from './pages/admin/AdminBookings';
import AdminLiveMap from './pages/admin/AdminLiveMap';
import AdminTrucks from './pages/admin/AdminTrucks';
import AdminDrivers from './pages/admin/AdminDrivers';
import AdminCmsPages from './pages/admin/AdminCmsPages';
import AdminSettings from './pages/admin/AdminSettings';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export { API_BASE };

function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="packages" element={<Packages />} />
        <Route path="faqs" element={<FAQs />} />
        <Route path="book" element={<Booking />} />
        <Route path="book/confirm/:uuid" element={<BookingConfirm />} />
      </Route>
      <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/admin/bookings" replace />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="map" element={<AdminLiveMap />} />
        <Route path="trucks" element={<AdminTrucks />} />
        <Route path="drivers" element={<AdminDrivers />} />
        <Route path="cms-pages" element={<AdminCmsPages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  );
}

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

function useAuth() {
  return localStorage.getItem('admin_token');
}

export default function AdminDrivers() {
  const token = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE}/admin/drivers`, { headers })
      .then(({ data }) => setDrivers(data.data || []))
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-stone-600">Loading drivers...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Drivers</h1>
      <p className="mb-4 text-sm text-stone-500">Drivers are users with role &quot;driver&quot;. Assign them to bookings from the Bookings page.</p>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Name</th>
              <th className="px-4 py-3 font-medium text-stone-700">Email</th>
              <th className="px-4 py-3 font-medium text-stone-700">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-800">{d.name}</td>
                <td className="px-4 py-3 text-stone-600">{d.email}</td>
                <td className="px-4 py-3 text-stone-600">{d.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {drivers.length === 0 && <div className="px-4 py-8 text-center text-stone-500">No drivers.</div>}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';

function useAuth() {
  return localStorage.getItem('admin_token');
}

export default function AdminBookings() {
  const token = useAuth();
  const headers = () => ({ Authorization: `Bearer ${token}` });
  const [bookings, setBookings] = useState({ data: [] });
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(null);
  const [assignTruck, setAssignTruck] = useState('');
  const [assignDriver, setAssignDriver] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE}/admin/bookings`, { headers: headers() })
      .then((res) => setBookings(res.data || { data: [] }))
      .catch(() => setBookings({ data: [] }))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !assignModal) return;
    axios.get(`${API_BASE}/admin/trucks`, { headers: headers() }).then(({ data }) => setTrucks(data.data || []));
    axios.get(`${API_BASE}/admin/drivers`, { headers: headers() }).then(({ data }) => setDrivers(data.data || []));
  }, [token, assignModal]);

  const openAssign = (b) => {
    setAssignModal(b);
    setAssignTruck(b.truck_id?.toString() || '');
    setAssignDriver(b.driver_id?.toString() || '');
    setAssignError('');
  };

  const saveAssign = () => {
    if (!assignModal || !assignTruck || !assignDriver) return;
    setAssignSaving(true);
    setAssignError('');
    axios.put(`${API_BASE}/admin/bookings/${assignModal.id}/assign`, { truck_id: Number(assignTruck), driver_id: Number(assignDriver) }, { headers: headers() })
      .then(() => {
        setBookings((prev) => ({
          ...prev,
          data: (prev.data || []).map((b) => (b.id === assignModal.id ? { ...b, truck_id: Number(assignTruck), driver_id: Number(assignDriver), status: 'assigned' } : b)),
        }));
        setAssignModal(null);
      })
      .catch((err) => setAssignError(err.response?.data?.message || 'Failed to assign.'))
      .finally(() => setAssignSaving(false));
  };

  if (loading) return <div className="text-stone-600">Loading bookings...</div>;

  const list = Array.isArray(bookings) ? bookings : (bookings.data || []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Bookings</h1>
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-4 py-3 font-medium text-stone-700">Date</th>
              <th className="px-4 py-3 font-medium text-stone-700">Customer</th>
              <th className="px-4 py-3 font-medium text-stone-700">Package</th>
              <th className="px-4 py-3 font-medium text-stone-700">Total</th>
              <th className="px-4 py-3 font-medium text-stone-700">Status</th>
              <th className="px-4 py-3 font-medium text-stone-700">Payment</th>
              <th className="px-4 py-3 font-medium text-stone-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {list.map((b) => (
              <tr key={b.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-800">{b.event_date} {b.event_time && String(b.event_time).slice(0, 5)}</td>
                <td className="px-4 py-3 text-stone-800">{b.customer_name}</td>
                <td className="px-4 py-3 text-stone-600">{b.package?.name}</td>
                <td className="px-4 py-3 text-stone-800">${Number(b.total_amount).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-700">{b.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-stone-200 px-2 py-0.5 text-xs text-stone-700">{b.payment_status}</span>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => openAssign(b)} className="text-amber-600 hover:underline">Assign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <div className="px-4 py-8 text-center text-stone-500">No bookings yet.</div>
        )}
      </div>

      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !assignSaving && setAssignModal(null)}>
          <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold text-stone-800">Assign truck & driver</h3>
            <p className="mb-3 text-sm text-stone-600">Booking: {assignModal.customer_name} – {assignModal.event_date}</p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Truck</label>
                <select value={assignTruck} onChange={(e) => setAssignTruck(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="">Select truck</option>
                  {trucks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700">Driver</label>
                <select value={assignDriver} onChange={(e) => setAssignDriver(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="">Select driver</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            {assignError && <p className="mt-2 text-sm text-red-600">{assignError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setAssignModal(null)} disabled={assignSaving} className="rounded-lg border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-100 disabled:opacity-50">Cancel</button>
              <button type="button" onClick={saveAssign} disabled={assignSaving || !assignTruck || !assignDriver} className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50">{assignSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

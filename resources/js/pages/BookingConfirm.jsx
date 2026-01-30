import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE } from '../App';
import axios from 'axios';

export default function BookingConfirm() {
  const { uuid } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;
    axios
      .get(`${API_BASE}/bookings/${uuid}`)
      .then(({ data }) => setBooking(data.data))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) return <div className="text-center text-stone-600">Loading...</div>;
  if (!booking)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Booking not found. <Link to="/book" className="underline">Book again</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-stone-800">Booking confirmed</h1>
        <p className="mt-2 text-stone-600">Reference: {booking.uuid}</p>
      </div>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-stone-800">Details</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-stone-500">Event date</dt>
            <dd className="font-medium text-stone-800">{booking.event_date} at {String(booking.event_time).slice(0, 5)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Package</dt>
            <dd className="font-medium text-stone-800">{booking.package?.name}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Customer</dt>
            <dd className="font-medium text-stone-800">{booking.customer_name} – {booking.customer_email}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Address</dt>
            <dd className="font-medium text-stone-800">{booking.event_address}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Total</dt>
            <dd className="font-medium text-stone-800">${Number(booking.total_amount).toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Payment status</dt>
            <dd className="font-medium text-stone-800">{booking.payment_status}</dd>
          </div>
        </dl>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600">
          Back to home
        </Link>
      </div>
    </div>
  );
}

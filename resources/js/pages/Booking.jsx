import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../App';
import axios from 'axios';
import StripePaymentForm from '../components/StripePaymentForm';

const STEPS = ['Service area', 'Event details', 'Customer info', 'Payment'];

export default function Booking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [zip, setZip] = useState('');
  const [covered, setCovered] = useState(null);
  const [checking, setChecking] = useState(false);
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [form, setForm] = useState({
    package_id: '',
    event_date: '',
    event_time: '14:00',
    duration_minutes: 60,
    add_ons: [],
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    event_address: '',
    special_notes: '',
  });
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE}/packages`).then(({ data }) => setPackages(data.data || []));
    axios.get(`${API_BASE}/add-ons`).then(({ data }) => setAddOns(data.data || []));
  }, []);

  const checkArea = () => {
    setChecking(true);
    setCovered(null);
    axios
      .post(`${API_BASE}/service-area/check`, { zip: zip.trim() })
      .then(({ data }) => setCovered(data.covered))
      .catch(() => setCovered(false))
      .finally(() => setChecking(false));
  };

  const updateForm = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError('');
  };

  const addAddOn = (addOnId, quantity = 1) => {
    const addOn = addOns.find((a) => a.id === addOnId);
    if (!addOn) return;
    setForm((f) => {
      const existing = f.add_ons.find((a) => a.add_on_id === addOnId);
      const newQty = existing ? existing.quantity + quantity : quantity;
      return {
        ...f,
        add_ons: [...(f.add_ons.filter((a) => a.add_on_id !== addOnId)), { add_on_id: addOnId, quantity: newQty }],
      };
    });
  };

  const submitBooking = () => {
    setSubmitting(true);
    setError('');
    const payload = {
      event_date: form.event_date,
      event_time: form.event_time,
      duration_minutes: Number(form.duration_minutes),
      package_id: Number(form.package_id),
      add_ons: form.add_ons,
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      event_address: form.event_address,
      special_notes: form.special_notes || undefined,
    };
    axios
      .post(`${API_BASE}/bookings`, payload)
      .then(({ data }) => {
        setBooking(data.data);
        setStep(4);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Booking failed. Please try again.');
      })
      .finally(() => setSubmitting(false));
  };

  const canProceedStep1 = covered === true;
  const canProceedStep2 = form.package_id && form.event_date && form.event_time;
  const canProceedStep3 =
    form.customer_name && form.customer_phone && form.customer_email && form.event_address;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-stone-800">Book an Event</h1>
      <div className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`rounded px-3 py-1 text-sm ${step >= i + 1 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-stone-800">Check service area</h2>
          <p className="mb-4 text-stone-600">Enter your ZIP code to see if we serve your area.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="ZIP code"
              className="rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={checkArea}
              disabled={checking || !zip.trim()}
              className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Check'}
            </button>
          </div>
          {covered === true && (
            <p className="mt-4 text-green-600">We serve your area! Click Next to continue.</p>
          )}
          {covered === false && (
            <p className="mt-4 text-red-600">Sorry, we don&apos;t currently serve this area.</p>
          )}
          {canProceedStep1 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-6 rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600"
            >
              Next
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-stone-800">Event details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Package</label>
              <select
                value={form.package_id}
                onChange={(e) => updateForm('package_id', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select package</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} – ${Number(pkg.price).toFixed(2)} ({pkg.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700">Event date</label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => updateForm('event_date', e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Event time</label>
                <input
                  type="time"
                  value={form.event_time}
                  onChange={(e) => updateForm('event_time', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Duration (minutes)</label>
              <input
                type="number"
                min={30}
                max={480}
                value={form.duration_minutes}
                onChange={(e) => updateForm('duration_minutes', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Add-ons</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {addOns.map((addon) => (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => addAddOn(addon.id)}
                    className="rounded border border-stone-300 bg-white px-3 py-1 text-sm hover:bg-stone-100"
                  >
                    {addon.name} +${Number(addon.price).toFixed(2)}
                  </button>
                ))}
              </div>
              {form.add_ons.length > 0 && (
                <ul className="mt-2 text-sm text-stone-600">
                  {form.add_ons.map((a) => {
                    const addon = addOns.find((x) => x.id === a.add_on_id);
                    return addon ? (
                      <li key={a.add_on_id}>
                        {addon.name} × {a.quantity}
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-stone-800">Your information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Name</label>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => updateForm('customer_name', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Phone</label>
              <input
                type="tel"
                value={form.customer_phone}
                onChange={(e) => updateForm('customer_phone', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Email</label>
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => updateForm('customer_email', e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Event address</label>
              <textarea
                value={form.event_address}
                onChange={(e) => updateForm('event_address', e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Special notes (optional)</label>
              <textarea
                value={form.special_notes}
                onChange={(e) => updateForm('special_notes', e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
          {error && <p className="mt-4 text-red-600">{error}</p>}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-100"
            >
              Back
            </button>
            <button
              type="button"
              onClick={submitBooking}
              disabled={submitting || !canProceedStep3}
              className="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create booking & go to payment'}
            </button>
          </div>
        </div>
      )}

      {step === 4 && booking && (
        <StripePaymentForm booking={booking} />
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { API_BASE } from '../App';

const stripePromise = (() => {
  const key = import.meta.env.VITE_STRIPE_KEY;
  if (!key || key === '') return null;
  return loadStripe(key);
})();

function PaymentForm({ bookingUuid, onSuccess, onSkip }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/book/confirm/${bookingUuid}`,
          receipt_email: undefined,
        },
      });
      if (submitError) {
        setError(submitError.message || 'Payment failed.');
        setLoading(false);
        return;
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay now'}
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="rounded-lg border border-stone-300 px-4 py-2 text-stone-700 hover:bg-stone-100"
          >
            Skip / View confirmation
          </button>
        )}
      </div>
    </form>
  );
}

export default function StripePaymentForm({ booking, onPaid }) {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!booking?.uuid) return;
    axios
      .post(`${API_BASE}/bookings/${booking.uuid}/payment-intent`)
      .then(({ data }) => setClientSecret(data.client_secret || null))
      .catch(() => setClientSecret(null))
      .finally(() => setLoading(false));
  }, [booking?.uuid]);

  if (loading) {
    return <p className="text-stone-600">Loading payment...</p>;
  }

  if (!clientSecret) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-stone-800">Payment</h2>
        <p className="mb-4 text-stone-600">
          Total: <strong>${Number(booking?.total_amount || 0).toFixed(2)}</strong>
        </p>
        <p className="mb-4 text-sm text-stone-500">
          Stripe is not configured. Your booking is saved. You can view the confirmation below.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/book/confirm/${booking.uuid}`)}
          className="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600"
        >
          View confirmation
        </button>
      </div>
    );
  }

  const options = { clientSecret, appearance: { theme: 'stripe' } };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-stone-800">Payment</h2>
      <p className="mb-4 text-stone-600">
        Total: <strong>${Number(booking?.total_amount || 0).toFixed(2)}</strong>
      </p>
      {stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            bookingUuid={booking.uuid}
            onSuccess={() => onPaid?.() || navigate(`/book/confirm/${booking.uuid}`)}
            onSkip={() => navigate(`/book/confirm/${booking.uuid}`)}
          />
        </Elements>
      ) : (
        <>
          <p className="text-sm text-stone-500">Add VITE_STRIPE_KEY to .env for Stripe.</p>
          <button
            type="button"
            onClick={() => navigate(`/book/confirm/${booking.uuid}`)}
            className="mt-4 rounded-lg bg-amber-500 px-6 py-2 font-medium text-white hover:bg-amber-600"
          >
            View confirmation
          </button>
        </>
      )}
    </div>
  );
}

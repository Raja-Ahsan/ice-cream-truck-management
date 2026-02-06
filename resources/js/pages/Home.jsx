import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../app';
import axios from 'axios';

export default function Home() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/cms/pages/home`).then(({ data }) => setPage(data.data)).catch(() => setPage(null));
  }, []);

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-stone-800 md:text-5xl">
          Bring the Ice Cream Truck to Your Event
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-stone-600">
          {page?.content ? (
            <span dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            'Book our ice cream truck for birthdays, parties, and corporate events. Fun for all ages!'
          )}
        </p>
        <Link
          to="/book"
          className="mt-6 inline-block rounded-lg bg-amber-500 px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-amber-600"
        >
          Book Now
        </Link>
      </section>
      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-stone-800">Choose a Package</h2>
          <p className="text-stone-600">Pick from our party packages and add-ons to match your event.</p>
          <Link to="/packages" className="mt-3 inline-block text-amber-600 hover:underline">View packages →</Link>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-stone-800">Check Your Area</h2>
          <p className="text-stone-600">Enter your ZIP to see if we serve your location.</p>
          <Link to="/book" className="mt-3 inline-block text-amber-600 hover:underline">Check coverage →</Link>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-stone-800">Questions?</h2>
          <p className="text-stone-600">Read our FAQs or chat with our bot for quick answers.</p>
          <Link to="/faqs" className="mt-3 inline-block text-amber-600 hover:underline">FAQs →</Link>
        </div>
      </section>
    </div>
  );
}

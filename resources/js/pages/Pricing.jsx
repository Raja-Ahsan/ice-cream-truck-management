import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../App';
import axios from 'axios';

export default function Pricing() {
  const [page, setPage] = useState(null);
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/cms/pages/pricing`).then(({ data }) => setPage(data.data)).catch(() => setPage(null));
    axios.get(`${API_BASE}/packages`).then(({ data }) => setPackages(data.data || [])).catch(() => setPackages([]));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-stone-800">Pricing</h1>
      {page?.content && (
        <div className="prose prose-stone mb-8 max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <div key={pkg.id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-stone-800">{pkg.name}</h2>
            <p className="mt-1 text-2xl font-bold text-amber-600">${Number(pkg.price).toFixed(2)}</p>
            <p className="mt-2 text-stone-600">{pkg.duration_minutes} min</p>
            {pkg.description && <p className="mt-2 text-sm text-stone-500">{pkg.description}</p>}
            <Link to="/book" className="mt-4 inline-block rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">
              Book
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

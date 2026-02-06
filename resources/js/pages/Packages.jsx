import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../app';
import axios from 'axios';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/packages`).then(({ data }) => setPackages(data.data || [])).catch(() => setPackages([]));
    axios.get(`${API_BASE}/add-ons`).then(({ data }) => setAddOns(data.data || [])).catch(() => setAddOns([]));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-stone-800">Packages & Add-ons</h1>
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-stone-700">Packages</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-800">{pkg.name}</h3>
              <p className="mt-1 text-2xl font-bold text-amber-600">${Number(pkg.price).toFixed(2)}</p>
              <p className="mt-2 text-stone-600">{pkg.duration_minutes} minutes</p>
              {pkg.description && <p className="mt-2 text-sm text-stone-500">{pkg.description}</p>}
              <Link to="/book" className="mt-4 inline-block rounded bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">
                Select
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold text-stone-700">Add-ons</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addOns.map((addon) => (
            <div key={addon.id} className="rounded-lg border border-stone-200 bg-white p-4">
              <span className="font-medium text-stone-800">{addon.name}</span>
              <span className="ml-2 text-amber-600">+${Number(addon.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

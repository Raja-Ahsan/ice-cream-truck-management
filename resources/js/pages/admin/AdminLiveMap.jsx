import React, { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE } from '../../app';
import axios from 'axios';
import { subscribeLiveLocations, getEcho } from '../../echo';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const POLL_INTERVAL_MS = 15000;

function useAuth() {
  return localStorage.getItem('admin_token');
}

function mergeLocation(list, payload) {
  const existing = list.find((l) => l.driver_id === payload.driver_id);
  const merged = {
    ...(existing || {}),
    driver_id: payload.driver_id,
    driver_name: payload.driver_name ?? existing?.driver_name,
    latitude: payload.latitude,
    longitude: payload.longitude,
    recorded_at: payload.recorded_at,
    booking_id: payload.booking_id,
  };
  return list.filter((l) => l.driver_id !== payload.driver_id).concat(merged);
}

function RefreshIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function MapPinIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TruckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );
}

function FlyToSelected({ locations, selectedDriverId }) {
  const map = useMap();
  const prevId = useRef(null);
  useEffect(() => {
    if (!selectedDriverId || selectedDriverId === prevId.current) return;
    prevId.current = selectedDriverId;
    const loc = locations.find((l) => l.driver_id === selectedDriverId);
    if (loc?.latitude != null && loc?.longitude != null) {
      map.flyTo([Number(loc.latitude), Number(loc.longitude)], 14, { duration: 0.5 });
    }
  }, [selectedDriverId, locations, map]);
  return null;
}

export default function AdminLiveMap() {
  const token = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtime, setRealtime] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [locationFilter, setLocationFilter] = useState(''); // '' | 'has_location' | 'no_location'
  const [selectedDriverId, setSelectedDriverId] = useState(null);

  const fetchLocations = useCallback(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    axios
      .get(`${API_BASE}/admin/live/locations`, { headers })
      .then(({ data }) => setLocations(data.data || []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchLocations]);

  useEffect(() => {
    if (!getEcho()) return;
    setRealtime(true);
    const unsubscribe = subscribeLiveLocations((payload) => {
      setLocations((prev) => mergeLocation(prev, payload));
    });
    return unsubscribe;
  }, []);

  const searchLower = searchInput.trim().toLowerCase();
  const filtered = locations.filter((loc) => {
    const matchSearch =
      !searchLower ||
      (loc.driver_name || '').toLowerCase().includes(searchLower) ||
      (loc.truck_name || '').toLowerCase().includes(searchLower) ||
      (loc.plate_number || '').toLowerCase().includes(searchLower);
    const hasCoords = loc.latitude != null && loc.longitude != null;
    const matchLocation =
      locationFilter === '' ||
      (locationFilter === 'has_location' && hasCoords) ||
      (locationFilter === 'no_location' && !hasCoords);
    return matchSearch && matchLocation;
  });

  const withCoords = locations.filter((l) => l.latitude != null && l.longitude != null);
  const defaultCenter = withCoords.length ? [withCoords[0].latitude, withCoords[0].longitude] : [40, -98];
  const defaultZoom = withCoords.length ? 10 : 4;

  const hasFilters = searchInput.trim() || locationFilter;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-stone-100 p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 sm:text-2xl md:text-3xl">Live Map</h1>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Truck and driver locations. Synced with drivers and assigned trucks. Updates every {POLL_INTERVAL_MS / 1000}s.
              {realtime && ' Live via WebSocket when Reverb is running.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {realtime && (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-800">Live</span>
            )}
            <button
              type="button"
              onClick={() => fetchLocations()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 disabled:opacity-50 sm:px-4 sm:py-2.5"
            >
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by driver or truck name, plate…"
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="">All drivers</option>
              <option value="has_location">Has location</option>
              <option value="no_location">No location yet</option>
            </select>
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setLocationFilter(''); }}
                className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Drivers</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{locations.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">With location</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{withCoords.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Showing</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{filtered.length}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-stone-500 sm:text-sm">Status</p>
          <p className="mt-1 text-lg font-semibold text-stone-700">{realtime ? 'Live (WebSocket)' : 'Polling'}</p>
        </div>
      </div>

      {/* Map + List */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Map - 2 cols on lg */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {loading && locations.length === 0 ? (
            <div className="flex min-h-[320px] sm:min-h-[420px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <p className="text-sm text-stone-500">Loading locations…</p>
              </div>
            </div>
          ) : (
            <div className="h-[320px] w-full sm:h-[420px] lg:h-[500px]">
              <MapContainer center={defaultCenter} zoom={defaultZoom} className="h-full w-full" scrollWheelZoom>
                <FlyToSelected locations={locations} selectedDriverId={selectedDriverId} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {withCoords.map((loc) => (
                  <Marker key={loc.driver_id} position={[Number(loc.latitude), Number(loc.longitude)]}>
                    <Popup>
                      <div className="min-w-[180px] text-left">
                        <p className="font-semibold text-stone-900">{loc.driver_name || `Driver #${loc.driver_id}`}</p>
                        {(loc.truck_name || loc.plate_number) && (
                          <p className="mt-1 text-sm text-stone-600">
                            <TruckIcon className="mr-1 inline h-4 w-4" />
                            {loc.truck_name || ''} {loc.plate_number ? `(${loc.plate_number})` : ''}
                          </p>
                        )}
                        {loc.booking_status && (
                          <span className="mt-1 inline-block rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                            {loc.booking_status.replace('_', ' ')}
                          </span>
                        )}
                        {loc.recorded_at && (
                          <p className="mt-2 text-xs text-stone-400">
                            Updated: {new Date(loc.recorded_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>

        {/* List panel */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 bg-stone-50/80 px-4 py-3">
            <h2 className="text-sm font-semibold text-stone-700">Drivers & trucks</h2>
            <p className="text-xs text-stone-500">Click a row to focus on map</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto sm:max-h-[420px] lg:max-h-[500px]">
            {loading && locations.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center p-4">
                <p className="text-sm text-stone-500">Loading…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-stone-500">
                <MapPinIcon className="mx-auto h-10 w-10 text-stone-300" />
                <p className="mt-2 text-sm">No drivers match your search or filters.</p>
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setLocationFilter(''); }}
                  className="mt-2 text-sm font-medium text-amber-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {filtered.map((loc) => {
                  const hasCoords = loc.latitude != null && loc.longitude != null;
                  const isSelected = selectedDriverId === loc.driver_id;
                  return (
                    <li key={loc.driver_id}>
                      <button
                        type="button"
                        onClick={() => setSelectedDriverId(hasCoords ? loc.driver_id : null)}
                        disabled={!hasCoords}
                        className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-amber-50' : 'hover:bg-stone-50'} ${!hasCoords ? 'cursor-default opacity-70' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900 truncate">
                            {loc.driver_name || `Driver #${loc.driver_id}`}
                          </span>
                          {hasCoords && (
                            <MapPinIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                          )}
                        </div>
                        {(loc.truck_name || loc.plate_number) && (
                          <p className="text-xs text-stone-600">
                            <TruckIcon className="mr-1 inline h-3.5 w-3.5" />
                            {loc.truck_name || '—'} {loc.plate_number ? ` · ${loc.plate_number}` : ''}
                          </p>
                        )}
                        {loc.booking_status && (
                          <span className="self-start rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-xs text-stone-600">
                            {loc.booking_status.replace('_', ' ')}
                          </span>
                        )}
                        {loc.recorded_at ? (
                          <p className="text-xs text-stone-400">Updated {new Date(loc.recorded_at).toLocaleString()}</p>
                        ) : (
                          <p className="text-xs text-stone-400">No location yet</p>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {locations.length === 0 && !loading && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <MapPinIcon className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-3 text-stone-500">No drivers yet. Drivers will appear here when they are assigned and send location updates.</p>
        </div>
      )}
    </div>
  );
}

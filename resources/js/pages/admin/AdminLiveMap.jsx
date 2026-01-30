import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../../App';
import axios from 'axios';
import { subscribeLiveLocations, getEcho } from '../../echo';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function useAuth() {
  return localStorage.getItem('admin_token');
}

function mergeLocation(list, payload) {
  const next = list.filter((l) => l.driver_id !== payload.driver_id);
  next.push({
    driver_id: payload.driver_id,
    driver_name: payload.driver_name,
    latitude: payload.latitude,
    longitude: payload.longitude,
    recorded_at: payload.recorded_at,
    booking_id: payload.booking_id,
  });
  return next;
}

export default function AdminLiveMap() {
  const token = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtime, setRealtime] = useState(false);

  const fetchLocations = useCallback(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${API_BASE}/admin/live/locations`, { headers })
      .then(({ data }) => setLocations(data.data || []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
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

  const withCoords = locations.filter((loc) => loc.latitude != null && loc.longitude != null);
  const defaultCenter = withCoords.length ? [withCoords[0].latitude, withCoords[0].longitude] : [40, -98];
  const defaultZoom = withCoords.length ? 10 : 4;

  if (loading) return <div className="text-stone-600">Loading live locations...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Live truck locations</h1>
      <p className="mb-4 text-sm text-stone-500">
        {realtime ? 'Live via WebSocket (Reverb).' : 'Updates every 10 seconds. Set VITE_REVERB_APP_KEY and run Reverb for real-time updates.'}
      </p>

      {withCoords.length > 0 && (
        <div className="mb-6 h-[400px] w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <MapContainer center={defaultCenter} zoom={defaultZoom} className="h-full w-full" scrollWheelZoom>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {withCoords.map((loc) => (
              <Marker key={loc.driver_id} position={[Number(loc.latitude), Number(loc.longitude)]}>
                <Popup>
                  <strong>{loc.driver_name || `Driver #${loc.driver_id}`}</strong>
                  {loc.recorded_at && <br />}
                  {loc.recorded_at && <span className="text-xs text-stone-500">Updated: {new Date(loc.recorded_at).toLocaleString()}</span>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <div
            key={loc.driver_id}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <h3 className="font-semibold text-stone-800">{loc.driver_name || `Driver #${loc.driver_id}`}</h3>
            {loc.latitude != null && loc.longitude != null ? (
              <p className="mt-2 text-sm text-stone-600">
                {Number(loc.latitude).toFixed(5)}, {Number(loc.longitude).toFixed(5)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-stone-500">No location yet</p>
            )}
            {loc.recorded_at && (
              <p className="mt-1 text-xs text-stone-400">Last update: {new Date(loc.recorded_at).toLocaleString()}</p>
            )}
          </div>
        ))}
      </div>
      {locations.length === 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500">
          No driver locations yet. Drivers will appear here when they send location updates.
        </div>
      )}
    </div>
  );
}

/**
 * Laravel Echo (Reverb) for real-time updates.
 * Set VITE_REVERB_APP_KEY, VITE_REVERB_HOST, VITE_REVERB_PORT in .env and run `php artisan reverb:start`.
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const key = import.meta.env.VITE_REVERB_APP_KEY;
const host = import.meta.env.VITE_REVERB_HOST || 'localhost';
const port = import.meta.env.VITE_REVERB_PORT || '8080';
const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
const forceTLS = scheme === 'https';

export function getEcho() {
  if (!key) return null;
  if (window.__echo) return window.__echo;
  window.__echo = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS,
    enabledTransports: ['ws', 'wss'],
  });
  return window.__echo;
}

export function subscribeLiveLocations(onEvent) {
  const echo = getEcho();
  if (!echo) return () => {};
  const channel = echo.channel('live-locations');
  channel.listen('.location.updated', (e) => onEvent(e));
  return () => channel.stopListening('.location.updated');
}

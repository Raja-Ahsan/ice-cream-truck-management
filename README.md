# Ice Cream Truck – Automated Booking & Operations Platform

Laravel (API) + React app: customer booking, admin operations, driver mobile workflow, live tracking, inventory, CMS, FAQ chatbot, reporting.

## Stack

- **Backend:** Laravel 12, MySQL (port 3307), Sanctum (API auth)
- **DB:** `ice_cream_truck`, port `3307`
- **Payments:** Stripe (optional; set `STRIPE_SECRET` and run `composer require stripe/stripe-php`)

## Setup

### 1. Backend

```bash
cd D:\xampp\htdocs\ice-cream-truck
copy .env.example .env
# Edit .env: DB_DATABASE=ice_cream_truck, DB_PORT=3307
php artisan key:generate
composer install
# If composer install fails with "Could not delete vendor/laravel/sanctum", close other apps and retry, or run from an elevated prompt.
php artisan migrate
php artisan db:seed
```

### 2. Optional: Stripe (payments)

```bash
composer require stripe/stripe-php
# In .env set: STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET, STRIPE_CURRENCY=usd
# In .env set: VITE_STRIPE_KEY=<publishable key> (for frontend Stripe Elements)
# Webhook URL: POST https://your-domain/api/v1/stripe/webhook
```

### 2b. Optional: Reverb (real-time live map)

```bash
php artisan install:broadcasting
# In .env set: BROADCAST_CONNECTION=reverb, REVERB_APP_ID, REVERB_APP_KEY, REVERB_APP_SECRET
# In .env set: VITE_REVERB_APP_KEY, VITE_REVERB_HOST, VITE_REVERB_PORT, VITE_REVERB_SCHEME
# Start: php artisan reverb:start
# Admin Live Map will then update in real time when drivers send location.
```

### 3. React frontend

```bash
npm install
npm run dev
# Frontend: http://localhost:5173 (Vite)
# Public: Home, Pricing, Packages, FAQs, Book flow
# Admin: http://localhost:5173/admin/login (admin@icecreamtruck.com / password)
# Admin pages: Bookings (with Assign truck/driver), Live Map (Leaflet + Reverb), Trucks, Drivers, CMS, Settings
```

Build for production: `npm run build`. Laravel will serve the built assets when you load the app route.

### 4. Run API

```bash
php artisan serve
# API: http://localhost:8000
# SPA: http://localhost:8000 (same app via Laravel after build, or use Vite dev with proxy)
```

## API Overview

- **Base URL:** `http://localhost:8000/api/v1`
- **Auth:** `POST /login` (email, password) → returns `token` (Bearer).
- **Public:** `GET /cms/pages`, `GET /cms/pages/{slug}`, `GET /packages`, `GET /add-ons`, `POST /service-area/check`, `POST /bookings`, `GET /bookings/{uuid}`, `POST /bookings/{uuid}/payment-intent`, `POST /faq/chat`, `POST /stripe/webhook`
- **Admin** (header: `Authorization: Bearer {token}`, role=admin): `/admin/bookings` (with assign), `/admin/trucks`, `/admin/drivers`, `/admin/live/locations`, `/admin/settings`, CRUD `cms-pages`, `faqs`, `service-areas`, `packages`, `add-ons`, `trucks`, `inventory-products`, `/admin/reports/*`
- **Driver** (role=driver): `/driver/bookings`, `/driver/bookings/{id}/start-route`, `arrive`, `complete`, `POST /driver/location`

## Seeded Users

- **Admin:** `admin@icecreamtruck.com` / `password`
- **Driver:** `driver@icecreamtruck.com` / `password`

## Database

- **Name:** `ice_cream_truck`
- **Port:** `3307`
- Create the database in MySQL before running `migrate`.

## Live map (WebSockets)

When a driver posts location via `POST /api/v1/driver/location`, the app broadcasts a `DriverLocationUpdated` event on channel `live-locations`. To enable real-time updates in the admin map:

```bash
php artisan install:broadcasting
# Then set in .env: BROADCAST_CONNECTION=reverb, and run php artisan reverb:start
```

Admin can also poll `GET /api/v1/admin/live/locations` every 5–10 seconds.

## Automation (scheduled jobs)

- **Daily summary:** 07:00 – yesterday’s bookings and revenue (log; wire to email when mail is configured).
- **GPS cleanup:** 03:00 – delete driver location records older than 7 days.

Run the scheduler: `php artisan schedule:work` (or add a cron entry for `php artisan schedule:run`).

## Admin Settings

- **Route:** `/admin/settings` (Super Admin / Admin only).
- **Sections:** General (title, tagline, logo, favicon, email, phone, address), Social links, Stripe (keys, webhook, enable toggle), Google (Maps API, Analytics, GTM), AI (OpenAI key, model, max tokens, temperature, enable toggle), SEO defaults.
- **Security:** Sensitive keys stored encrypted in DB; masked in API response; Reveal/Hide in UI. See `docs/ADMIN_SETTINGS.md`.

**Storage link for logo/favicon uploads:** `php artisan storage:link`

## Next Steps

- Run `npm install` (adds Stripe, Echo, Leaflet deps)

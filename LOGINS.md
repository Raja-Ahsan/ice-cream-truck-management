# Ice Cream Truck – Login Details (All Roles)

Use these credentials after running **`php artisan db:seed`** (or **`php artisan migrate:fresh --seed`**).

---

## Admin

| Email | Password | Role |
|-------|----------|------|
| **admin@icecreamtruck.com** | **password** | Admin |

- **Where to log in:** Admin panel → **http://localhost:8000/admin/login** (or `/admin` then redirect to login).
- **Access:** Full admin – bookings, trucks, drivers, CMS, FAQs, settings, live map, reports.

---

## Drivers

| Email | Password | Role |
|-------|----------|------|
| **driver@icecreamtruck.com** | **password** | Driver |
| **driver2@icecreamtruck.com** | **password** | Driver |

- **Where to log in:** Driver app / API (e.g. mobile or driver portal if you add one).
- **Access:** View assigned bookings, update status (start route, arrive, complete), send GPS location.

---

## Customer

| Email | Password | Role |
|-------|----------|------|
| **customer@example.com** | **password** | Customer |

- **Note:** The public site uses **guest checkout** – customers do not log in to make a booking. This user is for dummy data and for any future “customer account” features (e.g. order history).
- **Access:** If you add customer login later, this account can be used for testing.

---

## Quick reference

| Role    | Email                     | Password  |
|---------|---------------------------|-----------|
| Admin   | admin@icecreamtruck.com   | password  |
| Driver  | driver@icecreamtruck.com  | password  |
| Driver  | driver2@icecreamtruck.com | password  |
| Customer| customer@example.com     | password  |

All passwords are: **password**

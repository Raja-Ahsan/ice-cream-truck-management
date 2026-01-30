# Admin Settings – Technical Spec

## Page layout

- **Route:** `/admin/settings` (admin only).
- **Layout:** Section-based cards; one card per group. Each card has a **Save changes** button for that section.
- **Sections:** General, Social, Stripe, Google, AI, SEO.

## Field list & types

| Section | Key | Type | Validation | Encrypted |
|--------|-----|------|------------|-----------|
| **General** | site_title | text | string, max 255 | No |
| | site_tagline | text | nullable, max 500 | No |
| | site_logo | file/url | PNG, JPG, SVG, max 2MB; stored as URL | No |
| | site_favicon | file/url | ICO, PNG, max 512KB; stored as URL | No |
| | site_email | email | nullable, email | No |
| | site_phone | text | nullable, max 50 | No |
| | site_address | text | nullable, max 500 | No |
| **Social** | facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url, tiktok_url | url | nullable, url, max 500 | No |
| **Stripe** | stripe_publishable_key | text | nullable, max 500 | No |
| | stripe_secret_key | text | nullable, max 500 | **Yes** |
| | stripe_webhook_secret | text | nullable, max 500 | **Yes** |
| | stripe_enabled | boolean | boolean | No |
| **Google** | google_maps_api_key | text | nullable, max 500 | **Yes** |
| | google_analytics_id | text | nullable, max 255 | No |
| | google_tag_manager_id | text | nullable, max 255 | No |
| **AI** | openai_api_key | text | nullable, max 500 | **Yes** |
| | ai_model | select | nullable, max 100 (e.g. gpt-4, gpt-4o, gpt-3.5-turbo) | No |
| | ai_max_tokens | number | nullable, 1–128000 | No |
| | ai_temperature | number | nullable, 0–2 | No |
| | ai_enabled | boolean | boolean | No |
| **SEO** | default_meta_title | text | nullable, max 255 | No |
| | default_meta_description | text | nullable, max 500 | No |
| | default_meta_keywords | text | nullable, max 500 | No |

## Validation rules (backend)

- **General:** site_title required string; others nullable per table. Logo/favicon via separate upload endpoints.
- **Social:** all nullable URLs.
- **Stripe / Google / AI:** keys nullable string; booleans cast to `'1'`/`'0'`.
- **SEO:** all nullable string with max lengths.
- Masked values (containing `••••••••`) are not written to DB so existing secrets are not overwritten.

## Database structure

**Table: `settings`**

| Column | Type | Description |
|--------|------|-------------|
| id | bigint PK | |
| key | string(100), unique | e.g. `site_title`, `stripe_secret_key` |
| value | text, nullable | Plain or encrypted (see below) |
| is_encrypted | boolean | If true, `value` is stored encrypted (Laravel `Crypt`) |
| group | string(50) | general, social, stripe, google, ai, seo |
| created_at, updated_at | timestamps | |

**Storage:** Key-value; one row per setting. Sensitive keys use `Crypt::encryptString()` / `decryptString()`.

## .env mapping (optional)

Settings are stored in the database. For reference, equivalent .env keys would be:

- General: `APP_NAME`, site_email/phone/address (custom).
- Stripe: `STRIPE_KEY`, `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`.
- Google: `GOOGLE_MAPS_API_KEY`, etc.
- AI: `OPENAI_API_KEY`, etc.

The app can be extended to sync DB settings to config/env on save if desired.

## Security best practices

1. **Access:** Settings API and page are behind `auth:sanctum` and `role:admin`.
2. **Secrets:** Stripe secret, webhook secret, OpenAI key, Google Maps key stored encrypted in DB (`is_encrypted` + Laravel Crypt).
3. **API response:** GET `/admin/settings` returns masked values for encrypted keys (e.g. `sk_l••••••••abcd`) so keys are never sent in full in responses unless decrypted for server-side use.
4. **Reveal/hide:** Frontend shows Reveal/Hide only for sensitive fields; input type toggles between password/text.
5. **No overwrite with mask:** If the client sends a value containing `••••••••`, the backend does not update that key.
6. **HTTPS:** Use HTTPS in production for all admin and API requests.
7. **File uploads:** Logo/favicon validated by mime and size; stored under `storage/app/public/settings`.

## API

- **GET** `/api/v1/admin/settings` – Returns all groups; encrypted keys masked.
- **PUT** `/api/v1/admin/settings` – Body: `{ "group": "general"|"social"|"stripe"|"google"|"ai"|"seo", ...keys }`. Validates and saves; encrypted keys encrypted before save.
- **POST** `/api/v1/admin/settings/upload-logo` – `multipart/form-data`, field `file`. Returns `{ "url": "..." }`.
- **POST** `/api/v1/admin/settings/upload-favicon` – Same for favicon.

## UI/UX

- Clean admin layout with section cards.
- Per-section **Save changes** (no full-page submit).
- Success message per section after save; errors shown per section.
- Responsive grid (e.g. 2 columns on desktop, 1 on mobile).
- Sensitive fields: masked by default, Reveal/Hide toggle to show/hide value.

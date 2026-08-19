# AJG Seaside Caravans

A holiday-let advertising & booking site, built to run entirely on Cloudflare's free tier:

- **Cloudflare Workers** — hosts the Next.js site, built with the OpenNext Cloudflare adapter
- **Cloudflare D1** — SQLite-compatible database (properties, gallery, bookings)
- **Cloudflare R2** — stores gallery photos uploaded from the admin page
- **Stripe Checkout** — takes payment for a booking
- **SendGrid** (optional) — sends a confirmation email once payment succeeds

Sage green + red "seaside flag" accent theme, an availability calendar guests book
directly against, and an admin area to manage the gallery, listing details and bookings.

## Project structure

- `pages/` — the site (landing page, booking page, admin pages) and API routes under `pages/api/`
- `components/` — `Layout`, `Gallery`, `BookingWidget` (calendar + payment), `AdminGate`
- `lib/` — Cloudflare bindings (`env.ts`), Prisma/D1 client, R2 image storage, admin auth, email, iCal, pricing
- `prisma/schema.prisma` — data model (kept in sync with `migrations/0001_init.sql`)
- `migrations/` — D1 SQL migrations (applied with `wrangler d1 migrations apply`)
- `wrangler.jsonc` — Worker entry point plus D1/R2 bindings

The app is deployed with **[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)**,
which builds standard Next.js (Node.js runtime API routes, `getCloudflareContext()` for
bindings) into a Cloudflare Worker — this is Cloudflare's current recommended path for
Next.js; the older `@cloudflare/next-on-pages`/Pages approach is deprecated.

## First-time setup

```bash
npm install
npx prisma generate
```

### 1. Create the Cloudflare resources

```bash
npx wrangler login

# Database
npx wrangler d1 create ajg-seaside-caravans
# copy the returned database_id into wrangler.jsonc (d1_databases[0].database_id)

# Gallery storage
npx wrangler r2 bucket create ajg-seaside-caravans-gallery
```

### 2. Apply the schema and seed a sample property

```bash
npm run db:migrate:local   # local dev database
npm run db:seed:local

npm run db:migrate:remote  # the real Cloudflare D1 database
npm run db:seed:remote
```

Edit the seeded property's name, description and nightly rate afterwards from
`/admin/property`, or edit `migrations/seed.sql` before seeding.

### 3. Environment variables

Copy `.dev.vars.example` to `.dev.vars` for local dev (Miniflare reads it automatically;
it's gitignored). In production these are set as Worker secrets instead (never committed):

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SENDGRID_API_KEY   # optional
npx wrangler secret put SENDGRID_FROM      # optional
```

Also set `NEXT_PUBLIC_SITE_URL` in `wrangler.jsonc`'s `vars` to your real site URL
once you have one — it's used for Stripe redirect URLs and the gallery image URLs.

### 4. Run it locally

Plain `next dev` has no access to D1/R2 bindings unless OpenNext's dev shim is active
(wired up in `next.config.js` via `initOpenNextCloudflareForDev()`), which gives
`next dev` the same bindings through Miniflare:

```bash
npm run dev
```

For a closer-to-production check (build + run the actual Worker locally):

```bash
npm run preview
```

## Deploying to Cloudflare Workers

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` (produces `.open-next/`) then
`opennextjs-cloudflare deploy`, which wraps `wrangler deploy`. For CI/CD, connect the
GitHub repo in the Cloudflare dashboard's Workers Builds instead, with build command
`npm run deploy` (or split into `opennextjs-cloudflare build` + `wrangler deploy`).

After the first deploy:

1. Confirm the Worker has the same D1 database and R2 bucket bindings as in
   `wrangler.jsonc` (the dashboard's Worker settings mirror `d1_databases` /
   `r2_buckets`, and `wrangler deploy` applies them automatically from the file).
2. Add the secrets from step 3 above with `wrangler secret put` if you haven't already
   — they attach to the deployed Worker.
3. In the Stripe dashboard, add a webhook endpoint pointing to
   `https://<your-site>/api/webhook` for the `checkout.session.completed` event, and
   set `STRIPE_WEBHOOK_SECRET` to the signing secret it gives you.

## Admin area

Visit `/admin` and sign in with the `ADMIN_PASSWORD` secret (username is always
"admin" under the hood, but the sign-in box is just a password field).

- **`/admin/images`** — upload, caption, reorder and delete gallery photos (stored in R2)
- **`/admin/bookings`** — view bookings and manually confirm/cancel
- **`/admin/property`** — edit the listing's name, description, tagline and pricing

## How booking & payment works

1. A guest picks a date range on the calendar (`components/BookingWidget.tsx`), which
   disables nights that are already `CONFIRMED` or mid-checkout (`PENDING` in the last
   20 minutes), fetched from `GET /api/availability`.
2. `POST /api/book` re-validates the range against the database, computes the total
   **server-side** from the property's `nightlyRate`/`cleaningFee` (the client-side
   total shown is only a preview — never trusted for payment), creates a `PENDING`
   booking, and starts a Stripe Checkout session.
3. Stripe redirects the guest to `/booking/success` or `/booking/cancel`.
4. Stripe's `checkout.session.completed` webhook (`/api/webhook`) marks the booking
   `CONFIRMED` and sends a confirmation email if SendGrid is configured.
5. `GET /api/ical?propertyId=1` exposes confirmed bookings as an ICS feed, e.g. for
   syncing into another calendar or a channel manager.

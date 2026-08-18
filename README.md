# Holiday Let Site (starter)

This repository contains a starter Next.js app for a holiday let with a gallery, availability API, booking flow using Stripe Checkout, a webhook to confirm bookings, and an iCal feed endpoint.

Quick start:

1. Copy .env.example to .env and set values (DATABASE_URL defaults to SQLite dev.db).
2. Install:
   npm install
3. Initialize Prisma and the database:
   npx prisma generate
   npx prisma migrate dev --name init
4. Run dev server:
   npm run dev

Set the following environment variables (see .env.example):
- NEXT_PUBLIC_SITE_URL (e.g. http://localhost:3000)
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (register webhook endpoint after deploying)
- Optional: Cloudinary and SendGrid keys

What's included:
- pages/api/book - creates a pending booking and returns a Stripe Checkout URL
- pages/api/webhook - Stripe webhook to mark bookings CONFIRMED
- pages/api/availability - check date availability
- pages/api/ical - iCal feed of confirmed bookings
- components/Gallery and BookingForm

Next steps I can take for you:
- Wire up Cloudinary uploads for images
- Add an admin UI to view/manage bookings
- Deploy to Vercel and register Stripe webhook
- Add email confirmations (SendGrid)

If you want, I can now connect this to your GitHub repo (create files here) and then add more features.

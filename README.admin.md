## Admin and webhook usage

This project includes a lightweight admin bookings view and webhook email sending.

Admin UI
- Route: /admin/bookings
- Protected by HTTP Basic auth. Username is `admin` and the password is the `ADMIN_PASSWORD` environment variable.
- To view the admin page locally using curl-style Basic auth:
  - If ADMIN_PASSWORD is `password123`:
    - The header is: `Authorization: Basic ` + base64('admin:password123')
  - Example (macOS / Linux):
    curl -u admin:password123 http://localhost:3000/admin/bookings

Webhook & emails
- After a Checkout session completes, Stripe sends a `checkout.session.completed` event which the webhook endpoint (`/api/webhook`) consumes.
- The webhook will mark the booking status `CONFIRMED` and, if `SENDGRID_API_KEY` is set, will send a confirmation email to the guest.
- For local testing, use the Stripe CLI to forward webhooks to your local server:
  stripe listen --forward-to localhost:3000/api/webhook

Environment variables to set (examples in .env.example)
- ADMIN_PASSWORD=your_admin_password
- SENDGRID_API_KEY=...
- SENDGRID_FROM=optional-from-address


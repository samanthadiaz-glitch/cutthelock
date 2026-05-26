# Cut The Lock

## What this app does
Online storage-auction recovery business. Buys out abandoned storage units, resells items in a marketplace, reunites customers with lost belongings, and manages payment arrangements (buy-backs, POPP deals) with customers.

## Stack
Node.js · Express · PostgreSQL (Neon) · Render · OpenAI GPT-4o · Polsia R2 (file storage) · Stripe payment links

## Directory map
- `server.js` — entire application (20k-line legacy god file; all routes, DB queries, page HTML inline)
- `migrations/` — node-pg-migrate migration files (JS modules with up/down)
- `public/` — static HTML print collateral (flyers, brochures), shared CSS, logo
- `debug/` — one-off diagnostic scripts (not deployed)

## Database
- `listings` — marketplace items for sale; photos, pricing, Stripe payment links, views
- `orders` — purchase records linking listings to buyers
- `lost_items` — recovery claims submitted by customers
- `claim_documents` — files attached to recovery claims
- `units` — acquired storage units; bid/cost tracking
- `subscribers` — email list for new-listing notifications
- `analytics_events` — funnel tracking (page view, checkout, etc.)
- `notifications` — subscriber notification history
- `agreements` (buyback/popp/payment_plan) — signed agreement records with file URLs
- `payment_plans` — structured installment plans with scheduler
- `payment_arrangements` — ad-hoc payment arrangements; invoice_number CTL-XXXX, description, payment_link, payoff_date
- `arrangement_payments` — individual payment records against a payment_arrangement; receipt_number (CTL-YYYYMMDD-XXXX, unique)
- `invoices` — general invoice records
- `inventory` — unit inventory items linked to listings
- `recovery_items` — sentimental items from storage units displayed in public gallery; status (available/claimed/reunited)

## External integrations
- **Stripe** — pre-built payment links (buy.stripe.com/…) stored per listing/arrangement; ⚡ Generate button calls Stripe API directly via `STRIPE_SECRET_KEY` env var (set in Render); falls back to Polsia API if key absent; no SDK
- **OpenAI (Polsia proxy)** — GPT-4o for AI listing description generation; base URL via OPENAI_BASE_URL
- **Polsia R2** — file/photo storage proxy at POLSIA_R2_BASE_URL/r2/upload; upload via /api/proxy/
- **Polsia email proxy** — transactional email at POLSIA_R2_BASE_URL/api/email

## Recent changes
- 2026-05-03: Added site-wide service area banner above nav (serving ~150mi of Austin); updated OG meta tags on homepage, /listings, /recovery-items, /get-your-stuff-back; confirmed claim form accepts all TX ZIPs (no gate)
- 2026-05-02: Added "Linked Gallery Item" section in claims modal — shows photo, description, status badge, and gallery link when claim has `recovery_item_id`; also added `recovery_item_status` to claims API
- 2026-05-01: Added Recovery Items gallery at `/recovery-items`; admin "🔍 Recovery Items" tab; `recovery_items` table (migration 1746500000000); `/report-lost?item=ID` claim flow with item preview; `recovery_item_id` FK on `lost_items`; claims table shows linked gallery item badge
- 2026-04-30: Switched ⚡ Generate button to call Stripe API directly (STRIPE_SECRET_KEY env var); changed receipt prefix from RCT to CTL (existing RCT receipts unchanged in DB)
- 2026-04-30: Added Buy Now button to all listing cards (grid view) + sticky mobile bar on detail pages; created Stripe payment links for 5 previously-unlisted items (IDs 30,32,33,34,36); added ⚡ Generate button in admin form to auto-create payment links for future listings via POST /api/admin/generate-payment-link
- 2026-04-30: Added branded receipt numbers (CTL-YYYYMMDD-XXXX) to arrangement_payments; visible in admin history + customer /pay portal
- 2026-04-30: Added customer payment portal at `/pay` — invoice lookup + Stripe Pay Now button

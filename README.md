# Cut The Lock Local Setup

This project is now configured to run locally on your Mac without requiring Polsia hosting.

## Requirements

- Node.js 18+ (installed via Homebrew or similar)
- PostgreSQL running locally

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
- `PORT` - Server port (default: 3000)
- `STRIPE_SECRET_KEY` - Optional Stripe secret key for generating payment links

## Local development

Install dependencies:

```bash
npm install
```

Start the app locally:

```bash
DATABASE_URL="postgresql://localhost:5432/refound" PORT=3000 npm run dev
```

If you want to use Stripe payment links, also set `STRIPE_SECRET_KEY`:

```bash
DATABASE_URL="postgresql://localhost:5432/refound" STRIPE_SECRET_KEY="sk_test_..." PORT=3000 npm run dev
```

## Notes

- The app no longer depends on Polsia for hosting or storage by default.
- File uploads and email relay still work if an external storage or relay token is configured, but they are not required for local development.
- Visit `http://localhost:3000` after starting the server.

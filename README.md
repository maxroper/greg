# Greg Pryor — Royals '85

Personal site for Greg Pryor: book sales, memorabilia, "sit next to me" applications,
speaking inquiries, and a Stripe-powered shopping cart.

- **Stack:** React 18 + Vite (no TypeScript, no framework lock-in)
- **Hosting:** Cloudflare Pages (static SPA + Pages Functions for the API)
- **Payments:** Stripe Checkout (hosted page, PCI-compliant)

## Getting started

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

The frontend works standalone in `npm run dev`. To exercise the `/api/*` endpoints
locally you need Wrangler:

```bash
cp .dev.vars.example .dev.vars
# edit .dev.vars and paste your Stripe test secret key (sk_test_...)
npm run pages:dev
```

## Project layout

```
.
├── index.html                       # Vite entry
├── src/
│   ├── main.jsx                     # React mount
│   ├── App.jsx                      # Section composition
│   ├── styles.css                   # Design system (tokens, utilities, .grain, .reveal)
│   ├── data.js                      # All content (stats, quotes, memorabilia, etc.)
│   └── components/                  # One file per section, scoped CSS injected at module load
│       ├── primitives.jsx           # Reveal, Btn, Eyebrow, ScrollProgress, hooks
│       ├── nav.jsx, hero.jsx, book.jsx, memorabilia.jsx, mytake.jsx,
│       │ apply.jsx, podcast.jsx, about.jsx, footer.jsx
│       ├── checkout.jsx             # 4-step modal that POSTs to /api/create-checkout-session
│       ├── checkout-banner.jsx      # ?checkout=success|cancel toast on return from Stripe
│       └── request-date-modal.jsx   # Speaking-inquiry form
├── public/
│   ├── assets/                      # Greg photos + memorabilia/*.jpg, served at /assets/...
│   └── _redirects                   # SPA fallback for Cloudflare Pages
├── functions/api/                   # Cloudflare Pages Functions (one file = one route)
│   ├── create-checkout-session.js   # POST -> creates Stripe session, returns hosted URL
│   ├── apply.js                     # POST -> Diamond Club seat application
│   └── speaking-request.js          # POST -> speaking-engagement inquiry
├── .dev.vars.example                # Template for local secrets (.dev.vars is gitignored)
└── design/                          # Original HTML/CSS/JS handoff bundle (gitignored)
```

## Cloudflare Pages — first-time deploy

The repo is structured so Cloudflare Pages auto-deploys on every push to `main`.

1. **Push to GitHub.** Create a new repo, then:
   ```bash
   git remote add origin git@github.com:<you>/gregpryor.git
   git push -u origin main
   ```
2. **Create the Pages project.**
   In the Cloudflare dashboard: Workers & Pages → Create → Pages → Connect to Git →
   pick the repo. Build settings:
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
3. **Set environment variables.**
   Settings → Environment variables → Production:
   - `STRIPE_SECRET_KEY` — your Stripe live secret key (encrypted)
   - *(optional)* `RESEND_API_KEY`, `APPLY_NOTIFY_TO`, `APPLY_NOTIFY_FROM`
   - *(optional)* `PUBLIC_BASE_URL` if the canonical origin differs from the
     Pages-served URL (e.g. when fronted by a custom domain).
   Add the same vars under "Preview" with `sk_test_...` for branch deploys.
4. **Custom domain.** Pages → Custom domains → add `gregpryor.com`. Cloudflare
   issues the cert automatically; DNS just needs the existing A/CNAME records
   pointed at Pages.
5. **Stripe webhook (optional but recommended).**
   In the Stripe dashboard, add an endpoint at `https://<your-domain>/api/stripe-webhook`
   for `checkout.session.completed`. (Webhook handler isn't wired up yet — add a file at
   `functions/api/stripe-webhook.js` when you're ready to send order-confirmation
   emails or sync to a fulfilment system.)

After step 1 every `git push origin main` produces a production deploy; pushes to
other branches produce preview deploys with a unique URL — useful for review.

## Stripe flow

1. User completes steps 1–3 in the in-page modal (edition / personalization / shipping).
2. On step 4 ("Pay"), the client POSTs the order to `/api/create-checkout-session`.
3. The Pages Function recomputes prices from a trusted catalog (the client cannot
   alter the amount), creates a Stripe Checkout Session with personalization stored
   as session `metadata`, and returns the hosted-page URL.
4. The browser redirects to Stripe Checkout. Stripe handles card collection,
   3DS, Apple Pay, and PCI compliance.
5. On completion Stripe redirects back to `/?checkout=success&session_id=…`.
   `CheckoutBanner` reads the query string and shows a confirmation toast.

To switch from test to live mode: replace `STRIPE_SECRET_KEY` in Cloudflare's
Production environment with `sk_live_…`.

## Editing content

Every piece of static copy — book quotes, memorabilia descriptions, podcast episode
list, hot take, playlists, nav items — lives in `src/data.js`. Edit there; no other
file changes needed.

## Design source

The original Claude Design handoff bundle lives in `design/` (gitignored). It
contains the HTML/CSS/JS prototype the user iterated on, the chat transcripts that
captured the intent, and screenshots of every iteration. Keep it around for future
visual reference; don't ship it.

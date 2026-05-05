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
   Settings → Variables and Secrets → Production:
   - `STRIPE_SECRET_KEY` — Stripe live secret key (Encrypt before saving)
   - `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (set after step 6 below)
   - `RESEND_API_KEY` — Resend API key for email notifications (Encrypt)
   - `NOTIFY_TO` — `gpryor@lifepriority.com` (where Greg gets notifications)
   - `NOTIFY_FROM` — `Greg's Site <noreply@yourdomain.com>` (must be a domain
     verified in Resend, OR `Greg's Site <onboarding@resend.dev>` for sandbox)
   - *(optional)* `PUBLIC_BASE_URL` if the canonical origin differs from the
     served URL (e.g. when fronted by a custom domain).

   Repeat under "Preview" with `sk_test_…` keys for branch deploys.
4. **Custom domain.** Workers & Pages → your project → Settings → Domains. Cloudflare
   issues the cert automatically.
5. **Resend (email notifications).**
   Sign up at https://resend.com (free tier: 3,000 emails/month). To send from a
   real address rather than the sandbox, add and verify a domain (e.g.
   `lifepriority.com` or `gregpryor.com`) under Domains in the Resend dashboard.
   This requires adding the SPF/DKIM/DMARC DNS records they show you. Once
   verified, set `NOTIFY_FROM=Greg's Site <noreply@<your-verified-domain>>`.
6. **Stripe webhook (recommended for order alerts).**
   Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - Endpoint URL: `https://<your-domain>/api/stripe-webhook`
   - Events: `checkout.session.completed`
   Copy the signing secret (starts with `whsec_`) and paste it into the
   Cloudflare `STRIPE_WEBHOOK_SECRET` env var. Without this, orders still
   process but Greg won't get an email per order.
7. **Facebook live posts (optional).**
   Without setup, the Facebook section uses a static fallback. To pull real
   posts from `@GregPryor85`:
   1. Go to https://developers.facebook.com/apps → **Create App** → "Other" →
      "Business" → name it (e.g. "Greg Pryor Site").
   2. In the app dashboard go to **Tools → Graph API Explorer**.
   3. Top right, "Meta App" dropdown → select your new app.
   4. "User or Page" dropdown → **User Token** → click **Generate Access Token**,
      grant `pages_show_list`, `pages_read_engagement`, `pages_read_user_content`.
   5. Switch the dropdown to **Page Token** → pick the **Greg Pryor 85** page.
      Copy the token shown.
   6. **Make it long-lived.** That token expires in an hour. Run, replacing
      `<short_token>` and `<app_id>`/`<app_secret>` (from app dashboard → Settings → Basic):
      ```bash
      curl "https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<app_id>&client_secret=<app_secret>&fb_exchange_token=<short_token>"
      ```
      That returns a 60-day user token. Then call this with the user token to
      get a never-expiring Page Token:
      ```bash
      curl "https://graph.facebook.com/v23.0/me/accounts?access_token=<long_user_token>"
      ```
      Find Greg Pryor 85 in the response, copy its `access_token`.
   7. Add the Cloudflare env vars:
      ```
      FB_PAGE_ID            = GregPryor85          (or the numeric page ID)
      FB_PAGE_ACCESS_TOKEN  = <never-expiring page token>     (Encrypt)
      ```
   Posts are cached at the edge for 10 minutes so the page stays fast and we
   don't hit Graph API rate limits.

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

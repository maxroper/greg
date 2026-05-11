# Greg Pryor — Royals '85

Personal site for Greg Pryor: book sales (Stripe), memorabilia gallery, "sit
next to me" Diamond Club applications, speaking-engagement inquiries, live
Facebook posts, Spotify playlists, podcast teaser, contact.

- **Stack:** React 18 + Vite (no TypeScript, no framework lock-in)
- **Hosting:** Cloudflare Workers + Static Assets (auto-deploys from GitHub)
- **Payments:** Stripe Payment Element + Express Checkout Element (PCI-compliant)
- **Email:** Resend (form submissions + order alerts to gpryor@lifepriority.com)
- **Analytics:** Google Analytics 4 (opt-in via env var)

> **Setting up the live site for the first time?** See [SETUP.md](SETUP.md) — the
> end-to-end checklist for getting Stripe, Resend, Facebook, Spotify, GA, and a
> custom domain configured. This README covers code and architecture; SETUP.md
> covers credentials.

---

## Getting started

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
```

The frontend works standalone in `npm run dev` (API calls fall back gracefully
to static placeholder data). To exercise the `/api/*` endpoints locally you
need Wrangler:

```bash
cp .dev.vars.example .dev.vars
# fill in the keys you want to test against (Stripe test key, Resend, etc.)
npm run worker:dev   # builds + serves the Worker on http://localhost:8787
```

---

## Project layout

```
.
├── index.html                       # Vite entry, with OG / Twitter / JSON-LD meta
├── worker.js                        # Cloudflare Worker entry — routes /api/*,
│                                    #   serves dist/ via the assets binding,
│                                    #   falls back to index.html for SPA routes
├── wrangler.jsonc                   # Workers + Static Assets config
│
├── src/
│   ├── main.jsx                     # React mount
│   ├── App.jsx                      # Section composition + tiny pathname router
│   ├── styles.css                   # Design system (tokens, .grain, .reveal)
│   ├── data.js                      # All static content (stats, quotes, items)
│   └── components/
│       ├── primitives.jsx           # Reveal, Btn, Eyebrow, ScrollProgress, hooks
│       ├── nav.jsx                  # Top nav with active-section indicator
│       ├── hero.jsx                 # Greg Pryor / № 4 hero with sweep animation
│       ├── book.jsx                 # Book section (opens Checkout modal)
│       ├── checkout.jsx             # 4-step modal → POST /api/create-payment-intent
│       ├── checkout-banner.jsx      # ?checkout=success|cancel toast on return
│       ├── memorabilia.jsx          # Bento grid + detail modal
│       ├── mytake.jsx               # Hot takes
│       ├── apply.jsx                # Diamond Club application form
│       ├── podcast.jsx              # Baseball Town teaser
│       ├── about.jsx                # Bio, stats, speaking, music (Spotify),
│       │                            #   Life Priority, Facebook posts, contact
│       ├── request-date-modal.jsx   # Speaking-inquiry form
│       ├── privacy.jsx              # /privacy legal page
│       ├── analytics.jsx            # GA4 (no-op if env var unset)
│       └── footer.jsx
│
├── public/
│   ├── favicon.svg                  # GP avatar mark
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/                      # Photos, served at /assets/...
│       ├── greg-yankees.jpg
│       ├── greg-fielding.jpg
│       ├── greg-kids.jpg
│       └── memorabilia/             # 10 jpgs of Greg's items
│
├── functions/api/                   # Route handlers, dispatched by worker.js
│   ├── create-payment-intent.js     # POST → creates Stripe PaymentIntent
│   ├── create-checkout-session.js   # Legacy POST → creates Stripe session
│   ├── stripe-webhook.js            # POST ← Stripe (signed); emails Greg per order
│   ├── apply.js                     # POST → Diamond Club application
│   ├── speaking-request.js          # POST → speaking-engagement inquiry
│   ├── facebook-posts.js            # GET → live FB posts (10-min edge cache)
│   └── spotify-playlists.js         # GET → live Spotify playlists (30-min cache)
│
├── SETUP.md                         # Credentials checklist for production
├── .dev.vars.example                # Template for local secrets (.dev.vars is gitignored)
└── design/                          # Original handoff bundle (gitignored, kept for reference)
```

---

## Deploy

The repo is wired to **Cloudflare Workers Builds**. Every push to `main`
auto-deploys to production; pushes to other branches produce preview URLs
that Greg never sees.

**Workflow: push directly to `main`.** Don't route routine changes through
feature branches or PRs — they won't deploy until merged, which adds a step
without buying anything for a single-maintainer site. From a worktree
branch: `git push origin HEAD:main`.

What happens on a push:
1. Cloudflare clones the repo.
2. Runs `npm clean-install`.
3. Runs `npm run build` → Vite produces `dist/`.
4. Runs `npx wrangler deploy` → reads `wrangler.jsonc`, uploads `worker.js` +
   `dist/` as static assets, binds env vars, swaps live traffic.

To deploy from your local machine instead (e.g. for testing):
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... npm run deploy
```

or put the public Stripe key in an ignored `.env.production` file before
running:

```bash
npm run deploy
```

`npm run deploy` intentionally refuses to build if
`VITE_STRIPE_PUBLISHABLE_KEY` is missing or malformed. Wrangler secrets cover
runtime values like `STRIPE_SECRET_KEY`; the publishable key is needed by Vite
at build time so the checkout can initialize Stripe.js.

For the full credential setup walkthrough — Stripe, Resend, Facebook, Spotify,
GA4, custom domain — see **[SETUP.md](SETUP.md)**.

---

## How requests get served

```
                        Cloudflare edge
   ┌─────────────────────────────────────────────────────┐
   │                                                     │
   │  /assets/* /favicon.svg /sitemap.xml /robots.txt    │
   │  /index.html /privacy → STATIC ASSET (from dist/)   │
   │                                                     │
   │  /api/*                → worker.js dispatches to    │
   │                          functions/api/<route>.js   │
   │                                                     │
   │  /anything-else        → worker.js serves           │
   │                          index.html (SPA fallback)  │
   │                                                     │
   └─────────────────────────────────────────────────────┘
```

`functions/api/*.js` files are imported by `worker.js` and dispatched by
URL path. They each export `onRequestPost` / `onRequestGet` functions that
take `{ request, env, ctx }`.

---

## Stripe checkout flow

1. User picks edition + personalisation + shipping in the in-page modal
   (`src/components/checkout.jsx`, steps 1–3).
2. Before rendering the payment step, the client POSTs the order to
   `/api/create-payment-intent`.
3. The Worker recomputes prices from a server-side trusted catalog (the client
   cannot alter the amount), creates a Stripe PaymentIntent, stores
   personalisation as intent `metadata`, and returns the `client_secret`.
4. The modal renders Stripe's Payment Element plus Express Checkout buttons.
   Stripe handles card collection, 3DS, wallets, and PCI scope.
5. On completion Stripe redirects back to `/?checkout=success`.
   `CheckoutBanner` reads the query string and shows a confirmation toast.
6. Stripe also fires `payment_intent.succeeded` to `/api/stripe-webhook`,
   which verifies the signature and emails Greg the full order details
   (recipient name, inscription, ball inscription, shipping address).

Switching test → live: replace `STRIPE_SECRET_KEY` and
`VITE_STRIPE_PUBLISHABLE_KEY` in Cloudflare with live-mode keys, update the
webhook signing secret, and register the production domain in Stripe's payment
method domains so Apple Pay / Google Pay / Link can appear.

---

## Form submissions

Both `/api/apply` and `/api/speaking-request` log to the Cloudflare console
and (if `RESEND_API_KEY` is set) email **gpryor@lifepriority.com** via Resend.
The `Reply-To` header is the applicant's email, so hitting Reply in Greg's
inbox responds directly to them.

---

## Live Facebook + Spotify

Both sections fall back to static placeholder data (defined in
`functions/api/<service>.js` and `src/data.js`) until the env vars are set.
Once configured:

- **Facebook**: pulls Greg's latest 3 posts (text + photos + counts) from
  the Graph API. Edge-cached 10 min.
- **Spotify**: pulls 4 of Greg's public playlists (cover art + track count +
  link). Edge-cached 30 min. Optional `SPOTIFY_PLAYLIST_IDS` env var pins
  exactly which 4 to show.

See SETUP.md for the token/key generation steps.

---

## Editing content

Static copy lives in `src/data.js`:

| Constant | What it controls |
|---|---|
| `BOOK_QUOTES` | Endorsement blurbs in the book section |
| `PRYOR_STATS` | Career stats (highlights, by-year, totals) |
| `MEMORABILIA` | The 10 items in the bento grid + their descriptions |
| `TAKES` | "My Take" hot takes (5 baseball-rule opinions) |
| `HOT_TAKE_ROYALS` | The pinned "hot take of the week" callout |
| `PODCAST_EPS` | Podcast episode list (currently shown as "coming soon") |
| `PLAYLISTS` | Static fallback playlists (real ones come from Spotify when configured) |
| `FB_POSTS` | Static fallback posts (real ones come from Facebook when configured) |
| `NAV_ITEMS` | Top nav labels + section IDs |
| `ASSETS` | Hero/about photo paths (point at files in `/public/assets/`) |

To update **upcoming Royals home games** for the apply form, edit the
`upcoming` array in `src/components/apply.jsx`.

---

## Design source

The original Claude Design handoff bundle lives in `design/` (gitignored).
It contains the HTML/CSS/JS prototype, the chat transcripts that captured
the intent, and screenshots of every iteration. Keep it around for future
visual reference; don't ship it.

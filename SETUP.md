# Greg Pryor site — setup checklist

Everything Greg (or you) needs to obtain to make the production site fully
functional. Each section ends with the env vars to add in
**Cloudflare Workers & Pages → greg → Settings → Variables and Secrets**.

Keys marked **Encrypt** in the Cloudflare UI should be saved as encrypted
secrets, not plaintext vars. Vars beginning with `VITE_` are build-time values:
after changing one, redeploy so Vite can bake the public value into the client
bundle.

---

## 1. Stripe — book + signed-ball orders

**Account:** https://dashboard.stripe.com (sign up if needed)

**To do:**
- [ ] Verify business identity in Stripe (required to accept live payments)
- [ ] Add Greg's bank account for payouts
- [ ] Decide: launch with **Test mode** keys (no real charges) or **Live mode**
- [ ] Get API keys: Developers → API keys
  - Test: starts with `sk_test_…`
  - Live: starts with `sk_live_…`
  - Publishable keys start with `pk_test_…` or `pk_live_…`
- [ ] Add a webhook: Developers → Webhooks → Add endpoint
  - Endpoint URL: `https://<your-domain>/api/stripe-webhook`
  - Event to send: `payment_intent.succeeded`
  - Copy the signing secret it gives you (`whsec_…`)
- [ ] Register the site under Stripe → Settings → Payment method domains
  - Add `thedaytheyankeesmademeshave.com`
  - Add `www.thedaytheyankeesmademeshave.com` if the `www` host is enabled
  - Register in both sandbox/test mode and live mode so wallet buttons can show

**Cloudflare env vars:**
| Variable | Value | Encrypt |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` (or `sk_test_…` to start) | ✓ |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_…` (or `pk_test_…`) — meant to be public, do **not** encrypt |   |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the webhook page | ✓ |

> The current checkout uses Stripe Payment Element, so the webhook event that
> fulfills/orders emails is `payment_intent.succeeded`. The code can still
> understand the older `checkout.session.completed` shape, but the live webhook
> should include `payment_intent.succeeded`.

---

## 2. Resend — email notifications

**Account:** https://resend.com (free tier: 3,000 emails/month)

Used for: every "Sit next to me" submission, every speaking inquiry, every
Stripe order — all email gpryor@lifepriority.com.

**To do:**
- [ ] Create a Resend account
- [ ] Verify a sender domain (so emails come from a real address, not a sandbox):
  - Domains → Add Domain → enter `lifepriority.com` (or `thedaytheyankeesmademeshave.com`
    if that's where the site lives)
  - Resend shows DNS records (SPF, DKIM, DMARC) — paste them at the DNS
    provider for that domain
  - Wait for "Verified" status (usually < 30 min)
- [ ] API Keys → Create API key → copy it (starts with `re_…`)

**Cloudflare env vars:**
| Variable | Value | Encrypt |
|---|---|---|
| `RESEND_API_KEY` | `re_…` | ✓ |
| `NOTIFY_TO` | `gpryor@lifepriority.com` |   |
| `NOTIFY_FROM` | `Greg's Site <noreply@lifepriority.com>` (must use a verified domain) |   |

> **Quick start without verifying a domain:** set `NOTIFY_FROM=Greg's Site <onboarding@resend.dev>`. Emails will only deliver to the email address that registered the Resend account, so it's testing-only.

---

## 3. Facebook — pull live posts into the page

**Account:** https://developers.facebook.com (Greg signs in with the Facebook
account that admins the **Greg Pryor 85** page)

**To do:**
- [ ] Apps → **Create App** → "Business" type → name it ("Greg Pryor Site" works)
- [ ] In Tools → **Graph API Explorer**, top-right "Meta App" dropdown → select the new app
- [ ] "User or Page" dropdown → **User Token** → Generate Access Token. Approve
      the requested permissions: `pages_show_list`, `pages_read_engagement`,
      `pages_read_user_content`
- [ ] Switch dropdown to **Page Token** → pick **Greg Pryor 85** → copy the token
- [ ] **Make it long-lived** (the one above expires in an hour). Run in a terminal,
      with the App ID + App Secret from the app's Settings → Basic page:
      ```bash
      curl "https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<SHORT_TOKEN>"
      ```
      That returns a 60-day **user** token. Now exchange it for a **never-
      expiring page** token:
      ```bash
      curl "https://graph.facebook.com/v23.0/me/accounts?access_token=<LONG_USER_TOKEN>"
      ```
      Find Greg Pryor 85 in the response — copy its `access_token` field.

**Cloudflare env vars:**
| Variable | Value | Encrypt |
|---|---|---|
| `FB_PAGE_ID` | `GregPryor85` |   |
| `FB_PAGE_ACCESS_TOKEN` | the never-expiring page token | ✓ |

> Posts auto-refresh every 10 minutes. No further action needed when Greg
> posts something new.

---

## 4. Spotify — Greg's playlists

**Account:** https://developer.spotify.com/dashboard (sign in with Greg's
Spotify account)

**To do:**
- [ ] Create app → name "Greg Pryor Site" → redirect URI can be
      `https://<your-domain>/` (we don't actually use OAuth redirect, just
      Client Credentials). Accept the terms.
- [ ] Copy the **Client ID**
- [ ] **View client secret** → copy that too
- [ ] Get Greg's **Spotify user ID**: open Spotify, go to his profile, the URL
      looks like `open.spotify.com/user/<USER_ID>` — that last segment.
- [ ] **Make sure the playlists you want shown are set to Public** in Spotify
      (Right-click playlist → Share → "Make Public"). Only public playlists
      are visible to the API.
- [ ] *(Optional)* If you want to pin exactly which 4 show, copy each
      playlist's URL — the ID is the part after `/playlist/`. List them
      comma-separated in `SPOTIFY_PLAYLIST_IDS`. Otherwise the first 4
      public playlists in Greg's library show.

**Cloudflare env vars:**
| Variable | Value | Encrypt |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | from app dashboard | ✓ |
| `SPOTIFY_CLIENT_SECRET` | from app dashboard | ✓ |
| `SPOTIFY_USER_ID` | Greg's Spotify username |   |
| `SPOTIFY_PLAYLIST_IDS` | *(optional)* `id1,id2,id3,id4` |   |

> Cached at the edge for 30 min. Updates Greg makes in Spotify show up within
> half an hour.

---

## 5. Google Analytics — page-view tracking

**Account:** https://analytics.google.com

**To do:**
- [ ] Sign in (use Greg's Google account, or yours if you'll be the analytics admin)
- [ ] **Admin → Create → Account** → name it "Greg Pryor"
- [ ] Inside that account: **Create → Property** → name it "Greg Pryor Site"
      → set time zone + currency
- [ ] **Data streams → Add stream → Web** → enter the live URL
      (e.g. `https://thedaytheyankeesmademeshave.com`) and a stream name
- [ ] Copy the **Measurement ID** at the top right — it starts with `G-`
- [ ] *(Recommended)* Set the data retention to 14 months under
      Admin → Data Settings → Data Retention

**Cloudflare env var:**
| Variable | Value | Encrypt |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` |   |

> The `VITE_` prefix matters — that's what tells the build to inline the value
> into the client bundle. After adding the var, click **Retry deployment**
> (build-time vars don't apply to the existing build).
>
> Without this var, no GA script is loaded at all — no cookies, no requests
> to googletagmanager.com, nothing. Setting it later just turns tracking on.

---

## 6. Custom domain

Right now the site lives at `greg.4rq8k9tm7t.workers.dev` (or similar
auto-generated URL). For launch the site will live at
`thedaytheyankeesmademeshave.com`.

As of the last check, `thedaytheyankeesmademeshave.com` uses GoDaddy
nameservers (`ns35.domaincontrol.com`, `ns36.domaincontrol.com`) and points at
the existing WP Engine/WordPress site. The domain also has an Outlook MX record,
so preserve email DNS before changing nameservers.

**To do:**
- [ ] In Cloudflare, add `thedaytheyankeesmademeshave.com` as a site/zone and
      review the DNS records Cloudflare imports from GoDaddy.
- [ ] Before switching nameservers, confirm these records exist in Cloudflare:
  - Apex/root website record (will be replaced by the Worker custom domain)
  - `www` record or redirect target
  - Existing MX record:
    `0 thedaytheyankeesmademeshave-com.mail.protection.outlook.com`
  - Existing TXT records, including Microsoft verification and SPF
- [ ] In GoDaddy Domain Portfolio → domain → DNS → Nameservers, choose
      **I'll use my own nameservers** and enter the two nameservers Cloudflare
      assigned for the zone.
- [ ] Wait for Cloudflare to mark the zone active. GoDaddy says nameserver
      updates often take about an hour, but can take up to 48 hours globally.
- [ ] Point the domain at the Worker (Cloudflare → Workers & Pages → `greg` →
      Settings → Domains & Routes → Add → Custom Domain)
  - Add `thedaytheyankeesmademeshave.com`
  - Add `www.thedaytheyankeesmademeshave.com` or create a redirect from `www`
    to the apex domain
- [ ] Once live, set `PUBLIC_BASE_URL=https://thedaytheyankeesmademeshave.com` so
      Stripe success/cancel URLs use the canonical origin.
- [ ] Update the Stripe webhook endpoint URL (Section 1) to use the new domain.
- [ ] Register the same domain(s) in Stripe payment method domains (Section 1).

---

## Full env-var reference (in one place)

| Variable | Required by | Encrypt? | What it's for |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe checkout | ✓ | Creating Checkout Sessions (server-side) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe embedded checkout |   | Client-side; build-time inlined into the bundle |
| `STRIPE_WEBHOOK_SECRET` | Stripe order alerts | ✓ | Verifying webhook signatures |
| `RESEND_API_KEY` | All email notifications | ✓ | Sending emails via Resend |
| `NOTIFY_TO` | All email notifications |   | Where Greg gets emails (default `gpryor@lifepriority.com`) |
| `NOTIFY_FROM` | All email notifications |   | Email "From" header (must be a verified domain) |
| `FB_PAGE_ID` | Facebook section |   | Page slug (default `GregPryor85`) |
| `FB_PAGE_ACCESS_TOKEN` | Facebook section | ✓ | Never-expiring Page Access Token |
| `SPOTIFY_CLIENT_ID` | Music section | ✓ | Spotify app credentials |
| `SPOTIFY_CLIENT_SECRET` | Music section | ✓ | Spotify app credentials |
| `SPOTIFY_USER_ID` | Music section |   | Greg's Spotify username |
| `SPOTIFY_PLAYLIST_IDS` | Music section *(optional)* |   | Pin exactly which 4 playlists to show |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics |   | GA4 measurement ID (`G-…`); build-time var |
| `PUBLIC_BASE_URL` | Stripe URLs *(optional)* |   | Override origin for Stripe redirects |

> Without any of these set, the site still works — every API endpoint falls
> back to a sensible default (static FB posts, static playlists, console-only
> form submissions). You can wire them up incrementally.

---

## What works without any setup

- The full visual site (every section renders)
- The book purchase modal flow (UI only — needs Stripe key to actually charge)
- The "Sit next to me" and speaking forms (submissions log to the Cloudflare
  console; without `RESEND_API_KEY` no email is sent)
- Facebook + Spotify sections (use static fallback data that matches the design)

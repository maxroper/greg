# Greg Pryor site — setup checklist

Everything Greg (or you) needs to obtain to make the production site fully
functional. Each section ends with the env vars to add in
**Cloudflare Pages → your project → Settings → Variables and Secrets → Production**.

Keys marked **Encrypt** in the Cloudflare UI should be saved as encrypted
secrets, not plaintext vars. After adding any new vars, click **Retry
deployment** so they bind to a fresh build.

---

## 1. Stripe — book + signed-ball orders

**Account:** https://dashboard.stripe.com (sign up if needed)

**To do:**
- [ ] Verify business identity in Stripe (required to accept live payments)
- [ ] Add Greg's bank account for payouts
- [ ] Decide: launch with **Test mode** keys (no real charges) or **Live mode**
- [ ] Get the secret key: Developers → API keys → reveal "Secret key"
  - Test: starts with `sk_test_…`
  - Live: starts with `sk_live_…`
- [ ] Add a webhook: Developers → Webhooks → Add endpoint
  - Endpoint URL: `https://<your-domain>/api/stripe-webhook`
  - Event to send: `checkout.session.completed`
  - Copy the signing secret it gives you (`whsec_…`)

**Cloudflare env vars:**
| Variable | Value | Encrypt |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_…` (or `sk_test_…` to start) | ✓ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the webhook page | ✓ |

---

## 2. Resend — email notifications

**Account:** https://resend.com (free tier: 3,000 emails/month)

Used for: every "Sit next to me" submission, every speaking inquiry, every
Stripe order — all email gpryor@lifepriority.com.

**To do:**
- [ ] Create a Resend account
- [ ] Verify a sender domain (so emails come from a real address, not a sandbox):
  - Domains → Add Domain → enter `lifepriority.com` (or `gregpryor.com` if
    that's where the site lives)
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

## 5. Custom domain (optional but recommended)

Right now the site lives at `greg.maxroper-greg.workers.dev` (or similar
auto-generated URL). For a real launch you want `gregpryor.com`.

**To do:**
- [ ] Buy `gregpryor.com` (or use a domain Greg already owns)
- [ ] In Cloudflare Pages → your project → **Settings → Domains** → Add Domain
- [ ] Cloudflare walks you through DNS config (CNAME or A records). If the
      domain is registered through Cloudflare, it's one click. Cert is auto-
      issued.
- [ ] Once live, set `PUBLIC_BASE_URL=https://gregpryor.com` so Stripe success/
      cancel URLs use the canonical origin.
- [ ] Update the Stripe webhook endpoint URL (Section 1) to use the new domain.

---

## Full env-var reference (in one place)

| Variable | Required by | Encrypt? | What it's for |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe checkout | ✓ | Creating Checkout Sessions |
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

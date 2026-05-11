// Single Worker entry-point for the new Cloudflare "Workers + Static Assets"
// deployment model. Static files in /dist are matched first by the asset
// runtime; only requests that don't match a file fall through to this fetch
// handler. We dispatch /api/* to the existing route handlers and serve
// index.html for any other miss (SPA deep-link fallback).

import * as createCheckoutSession from "./functions/api/create-checkout-session.js";
import * as createPaymentIntent from "./functions/api/create-payment-intent.js";
import * as apply from "./functions/api/apply.js";
import * as speakingRequest from "./functions/api/speaking-request.js";
import * as stripeWebhook from "./functions/api/stripe-webhook.js";
import * as facebookPosts from "./functions/api/facebook-posts.js";
import * as spotifyPlaylists from "./functions/api/spotify-playlists.js";
import * as adminLogin from "./functions/api/admin-login.js";
import * as adminContent from "./functions/api/admin-content.js";
import * as adminOrders from "./functions/api/admin-orders.js";

const ROUTES = {
  "/api/create-checkout-session": createCheckoutSession,
  "/api/create-payment-intent": createPaymentIntent,
  "/api/apply": apply,
  "/api/speaking-request": speakingRequest,
  "/api/stripe-webhook": stripeWebhook,
  "/api/facebook-posts": facebookPosts,
  "/api/spotify-playlists": spotifyPlaylists,
  "/api/admin/login": adminLogin,
  "/api/admin/content": adminContent,
  "/api/admin/orders": adminOrders,
};

// Permissive CSP — allows the third parties this site actually uses (Stripe,
// Google Fonts, GA4) plus inline styles (React style props + injected <style>
// blocks). Tighten once we observe what's actually loaded in production.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://m.stripe.network https://*.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://api.stripe.com https://m.stripe.network https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://m.stripe.network",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://hooks.stripe.com",
].join("; ");

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": CSP,
};

function withSecurityHeaders(response, extra = {}) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const handler = ROUTES[url.pathname];
    if (handler) {
      const method = request.method;
      const fnName = `onRequest${method[0].toUpperCase()}${method.slice(1).toLowerCase()}`;
      const fn = handler[fnName] || handler.onRequest;
      if (typeof fn === "function") {
        const res = await fn({ request, env, ctx });
        return withSecurityHeaders(res);
      }
      return withSecurityHeaders(new Response("Method Not Allowed", { status: 405 }));
    }

    // SPA fallback: serve the app shell for any non-asset, non-API request so
    // refreshed deep links (#book etc.) still resolve. Force a revalidation
    // so deploys propagate fast — the page is small and any cached copy is
    // already nullified by hashed asset URLs inside it.
    // Fetch "/" instead of "/index.html": the static-asset runtime redirects
    // /index.html to /, which would erase deep links like /admin.
    const indexRequest = new Request(new URL("/", url), request);
    const res = await env.ASSETS.fetch(indexRequest);
    return withSecurityHeaders(res, {
      "Cache-Control": "public, max-age=0, must-revalidate",
    });
  },
};

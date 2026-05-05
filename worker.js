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

const ROUTES = {
  "/api/create-checkout-session": createCheckoutSession,
  "/api/create-payment-intent": createPaymentIntent,
  "/api/apply": apply,
  "/api/speaking-request": speakingRequest,
  "/api/stripe-webhook": stripeWebhook,
  "/api/facebook-posts": facebookPosts,
  "/api/spotify-playlists": spotifyPlaylists,
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const handler = ROUTES[url.pathname];
    if (handler) {
      const method = request.method;
      const fnName = `onRequest${method[0].toUpperCase()}${method.slice(1).toLowerCase()}`;
      const fn = handler[fnName] || handler.onRequest;
      if (typeof fn === "function") {
        return fn({ request, env, ctx });
      }
      return new Response("Method Not Allowed", { status: 405 });
    }

    // SPA fallback: serve index.html for any non-asset, non-API request so
    // refreshed deep links (#book etc.) still resolve.
    const indexRequest = new Request(new URL("/index.html", url), request);
    return env.ASSETS.fetch(indexRequest);
  },
};

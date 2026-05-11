// POST /api/stripe-webhook - receives Stripe events.
//
// Verifies the signature on every request (rejects unsigned/spoofed calls), then
// emails Greg the full order details including the personalization metadata
// (recipient, inscription, ball inscription, shipping address) attached to the
// PaymentIntent. It also still understands the older Checkout Session shape.
//
// Required env vars:
//   STRIPE_WEBHOOK_SECRET  - whsec_... from the Stripe dashboard webhook
//
// Optional (same as the form endpoints):
//   RESEND_API_KEY  NOTIFY_TO  NOTIFY_FROM
//
// Setup: in Stripe dashboard -> Developers -> Webhooks -> Add endpoint:
//   URL:    https://<your-domain>/api/stripe-webhook
//   Events: payment_intent.succeeded
// Copy the signing secret to the Cloudflare env var STRIPE_WEBHOOK_SECRET.

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return text("Webhook secret not configured", 500);
  }

  const sigHeader = request.headers.get("stripe-signature");
  if (!sigHeader) return text("Missing stripe-signature", 400);

  const rawBody = await request.text();
  const verified = await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!verified) return text("Invalid signature", 400);

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return text("Invalid JSON", 400);
  }

  // Handle both event shapes: checkout.session.completed (legacy CheckoutSession
  // flow) and payment_intent.succeeded (current Payment Element flow).
  let order = null;
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    order = {
      name: s.customer_details?.name || s.metadata?.ship_name,
      email: s.customer_details?.email || s.customer_email,
      phone: s.customer_details?.phone || s.metadata?.ship_phone,
      amount: s.amount_total,
      currency: s.currency,
      ship: s.shipping_details?.address || {},
      metadata: s.metadata || {},
      stripe_id: s.id,
    };
  } else if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    order = {
      name: pi.shipping?.name || pi.metadata?.ship_name,
      email: pi.receipt_email || pi.metadata?.ship_email,
      phone: pi.shipping?.phone || pi.metadata?.ship_phone,
      amount: pi.amount,
      currency: pi.currency,
      ship: pi.shipping?.address || {},
      metadata: pi.metadata || {},
      stripe_id: pi.id,
    };
  }

  if (order) {
    const m = order.metadata;
    const ship = order.ship;

    const lines = [
      `New order from ${order.name || "—"}`,
      `Total charged: $${(order.amount / 100).toFixed(2)} ${order.currency?.toUpperCase()}`,
      `Email: ${order.email || "—"}`,
      `Phone: ${order.phone || "—"}`,
      "",
      `Edition: ${m.edition || "—"}${m.quantity ? ` × ${m.quantity}` : ""}`,
      m.add_ball === "yes" ? "Add-on: signed MLB ball" : null,
      m.recipient ? `Inscribe to: ${m.recipient}` : null,
      m.inscription ? `Inscription: "${m.inscription}"` : null,
      m.ball_inscription ? `Ball inscription: "${m.ball_inscription}"` : null,
      "",
      "Ship to:",
      `  ${ship.line1 || m.ship_address || "—"}`,
      ship.line2 ? `  ${ship.line2}` : null,
      `  ${ship.city || m.ship_city || "—"}, ${ship.state || m.ship_state || "—"} ${ship.postal_code || m.ship_zip || "—"}`,
      ship.country ? `  ${ship.country}` : null,
      "",
      `Method: ${m.ship_method === "express" ? "Express (UPS 2-day)" : "Standard (USPS Priority)"}`,
      "",
      `Stripe ID: ${order.stripe_id}`,
    ]
      .filter(Boolean)
      .join("\n");

    if (env.RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: env.NOTIFY_FROM || "Greg's Site <onboarding@resend.dev>",
            to: env.NOTIFY_TO || "gpryor@lifepriority.com",
            reply_to: order.email || undefined,
            subject: `New order - ${m.edition === "signed" ? "Signed " : ""}book${m.add_ball === "yes" ? " + ball" : ""} - $${(order.amount / 100).toFixed(2)}`,
            text: lines,
          }),
        });
        if (!res.ok) console.error("Resend non-2xx", res.status, await res.text());
      } catch (err) {
        console.error("Resend failed", err);
      }
    } else {
      console.log("[order]", lines);
    }
  }

  return text("ok", 200);
}

// Stripe signs webhook bodies HMAC-SHA256 with `t=<timestamp>,v1=<sig>`.
// We recompute the HMAC and compare. Tolerate up to 5 minutes of clock skew.
async function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((s) => s.split("=").map((p) => p.trim())),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const tolerance = 5 * 60;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(t, 10)) > tolerance) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${rawBody}`));
  const expected = bufToHex(sigBytes);

  return timingSafeEqual(expected, v1);
}

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

function text(body, status) {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}

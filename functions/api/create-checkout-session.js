// Cloudflare Pages Function: POST /api/create-checkout-session
//
// Creates a Stripe Checkout Session and returns its hosted-payment URL.
// The client redirects the browser to that URL; Stripe handles card collection,
// PCI compliance, 3DS, Apple Pay, etc.
//
// Required env vars (set in Cloudflare Pages -> Settings -> Environment Variables):
//   STRIPE_SECRET_KEY  - your Stripe secret key (sk_test_... or sk_live_...)
//
// Optional:
//   PUBLIC_BASE_URL    - overrides the auto-detected origin used for return URLs.
//
// Server recomputes prices from a small, trusted catalog. The client cannot
// influence the amount charged - it only chooses an edition, quantity, ship method,
// and addons that map to fixed prices below.

const CATALOG = {
  editions: {
    standard: { name: "The Day The Yankees Made Me Shave - Hardcover, unsigned", unit_amount: 2495 },
    signed:   { name: "The Day The Yankees Made Me Shave - Hardcover, signed by Greg", unit_amount: 3200 },
  },
  ball: { name: "Official MLB ball, signed by Greg Pryor", unit_amount: 8900 },
  shipping: {
    standard: { name: "Standard shipping (USPS Priority, 3-5 days)", amount: 595, freeOver: 5000 },
    express:  { name: "Express shipping (UPS 2-day)", amount: 1495 },
  },
};

const CTRL_RE = /[\x00-\x1f\x7f]/g;
function sanitize(s, max = 200) {
  if (typeof s !== "string") return "";
  return s.replace(CTRL_RE, " ").slice(0, max);
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY." }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const edition = body.edition === "standard" ? "standard" : "signed";
  const quantity = clampInt(body.quantity, 1, 25);
  const addBall = !!body.addBall;
  const shipMethod = body.shipMethod === "express" ? "express" : "standard";
  const contact = body.contact || {};
  if (!contact.email || !contact.name) {
    return json({ error: "Email and name are required." }, 400);
  }

  const ed = CATALOG.editions[edition];
  const lineItems = [
    {
      quantity,
      price_data: {
        currency: "usd",
        product_data: { name: ed.name },
        unit_amount: ed.unit_amount,
      },
    },
  ];
  if (addBall) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        product_data: { name: CATALOG.ball.name },
        unit_amount: CATALOG.ball.unit_amount,
      },
    });
  }

  const subtotal = ed.unit_amount * quantity + (addBall ? CATALOG.ball.unit_amount : 0);
  const ship = CATALOG.shipping[shipMethod];
  const shippingAmount =
    shipMethod === "standard" && subtotal >= ship.freeOver ? 0 : ship.amount;

  const origin = env.PUBLIC_BASE_URL || new URL(request.url).origin;

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${origin}/?checkout=cancel`);
  params.append("customer_email", sanitize(contact.email, 254));
  params.append("billing_address_collection", "required");
  params.append("phone_number_collection[enabled]", "true");
  params.append("shipping_address_collection[allowed_countries][0]", "US");

  lineItems.forEach((li, i) => {
    params.append(`line_items[${i}][quantity]`, String(li.quantity));
    params.append(`line_items[${i}][price_data][currency]`, li.price_data.currency);
    params.append(`line_items[${i}][price_data][product_data][name]`, li.price_data.product_data.name);
    params.append(`line_items[${i}][price_data][unit_amount]`, String(li.price_data.unit_amount));
  });

  params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.append("shipping_options[0][shipping_rate_data][display_name]", ship.name);
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shippingAmount));
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");

  // Personalization travels with the order as metadata so Greg can read it on the
  // Stripe dashboard / webhook before mailing the book.
  const meta = {
    edition,
    quantity: String(quantity),
    add_ball: addBall ? "yes" : "no",
    ship_method: shipMethod,
    recipient: sanitize(body.recipient, 60),
    inscription: sanitize(body.inscription, 200),
    ball_inscription: sanitize(body.ballInscription, 80),
    ship_name: sanitize(contact.name, 100),
    ship_address: sanitize(contact.address1, 200),
    ship_city: sanitize(contact.city, 80),
    ship_state: sanitize(contact.state, 4),
    ship_zip: sanitize(contact.zip, 16),
  };
  Object.entries(meta).forEach(([k, v]) => {
    if (v) params.append(`metadata[${k}]`, v);
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await stripeRes.json();
  if (!stripeRes.ok) {
    console.error("Stripe error", data);
    return json({ error: data.error?.message || "Stripe API error" }, 502);
  }

  return json({ url: data.url, id: data.id });
}

function clampInt(v, min, max) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

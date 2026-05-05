// Cloudflare Pages Function: POST /api/create-payment-intent
//
// Creates a Stripe PaymentIntent for a fully custom in-page checkout (using
// the Payment Element + Express Checkout Element on the client). Server
// computes the price from a trusted catalog so the client cannot manipulate
// the amount. Personalisation + shipping live in the intent's metadata so
// they show on every charge in Stripe and travel through the webhook.

const CATALOG = {
  editions: {
    standard: { name: "Hardcover, unsigned", unit_amount: 2495 },
    signed:   { name: "Hardcover, signed by Greg", unit_amount: 3200 },
  },
  ball: { name: "Signed MLB ball", unit_amount: 8900 },
  shipping: {
    standard: { amount: 595, freeOver: 5000 },
    express:  { amount: 1495 },
  },
  taxRate: 0.082,
};

function sanitize(s, max = 200) {
  if (typeof s !== "string") return "";
  let out = "";
  for (let i = 0; i < s.length && out.length < max; i++) {
    const code = s.charCodeAt(i);
    if (code < 32 || code === 127) out += " ";
    else out += s[i];
  }
  return out;
}

function clampInt(v, min, max) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Stripe is not configured." }, 500);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }

  const edition = body.edition === "standard" ? "standard" : "signed";
  const quantity = clampInt(body.quantity, 1, 25);
  const addBall = !!body.addBall;
  const shipMethod = body.shipMethod === "express" ? "express" : "standard";
  const contact = body.contact || {};
  if (!contact.email || !contact.name) {
    return json({ error: "Email and name are required." }, 400);
  }

  const ed = CATALOG.editions[edition];
  const subtotal = ed.unit_amount * quantity + (addBall ? CATALOG.ball.unit_amount : 0);
  const ship = CATALOG.shipping[shipMethod];
  const shippingAmount =
    shipMethod === "standard" && subtotal >= ship.freeOver ? 0 : ship.amount;
  const tax = Math.round(subtotal * CATALOG.taxRate);
  const total = subtotal + shippingAmount + tax;

  const meta = {
    edition,
    quantity: String(quantity),
    add_ball: addBall ? "yes" : "no",
    ship_method: shipMethod,
    recipient: sanitize(body.recipient, 60),
    inscription: sanitize(body.inscription, 200),
    ball_inscription: sanitize(body.ballInscription, 80),
    ship_name: sanitize(contact.name, 100),
    ship_email: sanitize(contact.email, 254),
    ship_address: sanitize(contact.address1, 200),
    ship_city: sanitize(contact.city, 80),
    ship_state: sanitize(contact.state, 4),
    ship_zip: sanitize(contact.zip, 16),
    subtotal_cents: String(subtotal),
    shipping_cents: String(shippingAmount),
    tax_cents: String(tax),
    total_cents: String(total),
  };

  const params = new URLSearchParams();
  params.append("amount", String(total));
  params.append("currency", "usd");
  params.append("automatic_payment_methods[enabled]", "true");
  params.append("receipt_email", sanitize(contact.email, 254));
  params.append("description", `Order: ${quantity} × ${ed.name}${addBall ? " + signed ball" : ""}`);
  params.append("shipping[name]", sanitize(contact.name, 100));
  params.append("shipping[address][line1]", sanitize(contact.address1, 200));
  params.append("shipping[address][city]", sanitize(contact.city, 80));
  params.append("shipping[address][state]", sanitize(contact.state, 4));
  params.append("shipping[address][postal_code]", sanitize(contact.zip, 16));
  params.append("shipping[address][country]", "US");
  Object.entries(meta).forEach(([k, v]) => {
    if (v !== "" && v != null) params.append(`metadata[${k}]`, String(v));
  });

  const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await stripeRes.json();
  if (!stripeRes.ok) {
    console.error("PaymentIntent creation failed", data);
    return json({ error: data.error?.message || "Stripe API error" }, 502);
  }

  return json({
    client_secret: data.client_secret,
    id: data.id,
    amount: total,
  });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

import { badRequest, json, readJson, requireAdmin, str } from "./admin-shared.js";

const ORDER_METADATA_KEYS = new Set([
  "edition",
  "quantity",
  "add_ball",
  "ship_method",
  "recipient",
  "inscription",
  "ball_inscription",
  "ship_name",
  "ship_email",
  "ship_phone",
  "ship_address",
  "ship_city",
  "ship_state",
  "ship_zip",
]);

const STATUS_LABELS = new Set(["new", "processing", "shipped", "cancelled", "refunded"]);

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (!env.STRIPE_SECRET_KEY) return badRequest("Stripe is not configured.", 503);

  try {
    const orders = await listPaymentIntentOrders(env);
    return json({ ok: true, orders });
  } catch (err) {
    return badRequest(err.message || "Unable to load Stripe orders.", 502);
  }
}

export async function onRequestPatch({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (!env.STRIPE_SECRET_KEY) return badRequest("Stripe is not configured.", 503);

  let body;
  try {
    body = await readJson(request);
  } catch (err) {
    return badRequest(err.message);
  }

  const id = str(body.id, 120);
  if (!id.startsWith("pi_")) return badRequest("A PaymentIntent id is required.");

  const fulfillmentStatus = STATUS_LABELS.has(body.fulfillmentStatus) ? body.fulfillmentStatus : "processing";
  const trackingNumber = str(body.trackingNumber, 120);
  const carrier = str(body.carrier, 80);
  const notes = str(body.notes, 2000);
  const shippedAt = fulfillmentStatus === "shipped"
    ? (str(body.shippedAt, 80) || new Date().toISOString())
    : str(body.shippedAt, 80);
  const updatedAt = new Date().toISOString();

  const params = new URLSearchParams();
  params.append("metadata[fulfillment_status]", fulfillmentStatus);
  params.append("metadata[tracking_number]", trackingNumber);
  params.append("metadata[tracking_carrier]", carrier);
  params.append("metadata[admin_notes]", notes);
  params.append("metadata[shipped_at]", shippedAt);
  params.append("metadata[fulfillment_updated_at]", updatedAt);

  const stripeRes = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: stripeHeaders(env),
    body: params.toString(),
  });

  const data = await stripeRes.json().catch(() => ({}));
  if (!stripeRes.ok) {
    console.error("Stripe order update failed", stripeRes.status, data);
    return badRequest(data.error?.message || "Stripe update failed.", stripeRes.status);
  }

  return json({ ok: true, order: normalizePaymentIntent(data) });
}

async function listPaymentIntentOrders(env) {
  const orders = [];
  let startingAfter = "";

  for (let page = 0; page < 3; page++) {
    const params = new URLSearchParams();
    params.set("limit", "100");
    params.append("expand[]", "data.latest_charge");
    if (startingAfter) params.set("starting_after", startingAfter);

    const res = await fetch(`https://api.stripe.com/v1/payment_intents?${params.toString()}`, {
      headers: stripeHeaders(env),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Stripe order list failed", res.status, data);
      throw new Error(data.error?.message || "Stripe list failed.");
    }

    for (const pi of data.data || []) {
      if (looksLikeOrder(pi)) orders.push(normalizePaymentIntent(pi));
    }

    if (!data.has_more || !data.data?.length) break;
    startingAfter = data.data[data.data.length - 1].id;
  }

  return orders.sort((a, b) => b.created - a.created);
}

function looksLikeOrder(pi) {
  const metadata = pi.metadata || {};
  if (Object.keys(metadata).some((key) => ORDER_METADATA_KEYS.has(key))) return true;
  return typeof pi.description === "string" && pi.description.toLowerCase().startsWith("order:");
}

function normalizePaymentIntent(pi) {
  const m = pi.metadata || {};
  const charge = typeof pi.latest_charge === "object" && pi.latest_charge ? pi.latest_charge : {};
  const billing = charge.billing_details || {};
  const shipping = pi.shipping || {};
  const shipAddress = shipping.address || {};
  const billingAddress = billing.address || {};
  const address = {
    line1: shipAddress.line1 || m.ship_address || billingAddress.line1 || "",
    line2: shipAddress.line2 || billingAddress.line2 || "",
    city: shipAddress.city || m.ship_city || billingAddress.city || "",
    state: shipAddress.state || m.ship_state || billingAddress.state || "",
    postalCode: shipAddress.postal_code || m.ship_zip || billingAddress.postal_code || "",
    country: shipAddress.country || billingAddress.country || "US",
  };
  const subtotal = cents(m.subtotal_cents);
  const shippingAmount = cents(m.shipping_cents);
  const tax = cents(m.tax_cents);

  return {
    id: pi.id,
    created: pi.created || 0,
    createdAt: pi.created ? new Date(pi.created * 1000).toISOString() : "",
    amount: pi.amount_received || pi.amount || 0,
    currency: (pi.currency || "usd").toUpperCase(),
    stripeStatus: pi.status,
    paymentMethod: charge.payment_method_details?.type || "",
    receiptUrl: charge.receipt_url || "",
    description: pi.description || "",
    payment: {
      chargeId: charge.id || "",
      method: charge.payment_method_details?.type || "",
      status: charge.status || pi.status || "",
      paid: !!charge.paid || pi.status === "succeeded",
      refunded: !!charge.refunded,
      amountRefunded: charge.amount_refunded || 0,
      receiptUrl: charge.receipt_url || "",
      riskLevel: charge.outcome?.risk_level || "",
      failureMessage: pi.last_payment_error?.message || charge.failure_message || "",
    },
    customer: {
      name: shipping.name || m.ship_name || billing.name || "",
      email: pi.receipt_email || m.ship_email || billing.email || "",
      phone: shipping.phone || m.ship_phone || billing.phone || "",
    },
    address,
    items: {
      edition: m.edition || "",
      quantity: number(m.quantity, 1),
      addBall: m.add_ball === "yes",
      shipMethod: m.ship_method || "standard",
      recipient: m.recipient || "",
      inscription: m.inscription || "",
      ballInscription: m.ball_inscription || "",
    },
    totals: {
      subtotal,
      shipping: shippingAmount,
      tax,
      total: pi.amount_received || pi.amount || cents(m.total_cents),
    },
    fulfillment: {
      status: m.fulfillment_status || "new",
      trackingNumber: m.tracking_number || "",
      carrier: m.tracking_carrier || "",
      notes: m.admin_notes || "",
      shippedAt: m.shipped_at || "",
      updatedAt: m.fulfillment_updated_at || "",
    },
    metadata: m,
  };
}

function stripeHeaders(env) {
  return {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

function cents(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function number(v, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

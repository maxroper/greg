// POST /api/speaking-request - booking inquiry from the speaking modal.
// Logs + (optional) Resend email; always returns ok.
//
// Env vars: see functions/api/apply.js (same NOTIFY_TO/NOTIFY_FROM/RESEND_API_KEY).

function str(v, max) {
  if (typeof v !== "string") return "";
  let out = "";
  for (let i = 0; i < v.length && out.length < max; i++) {
    const code = v.charCodeAt(i);
    if (code < 32 || code === 127) out += " ";
    else out += v[i];
  }
  return out.trim();
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const payload = {
    name: str(body.name, 120),
    email: str(body.email, 254),
    organization: str(body.organization, 200),
    eventType: str(body.eventType, 40),
    timeline: str(body.timeline, 40),
    eventDate: str(body.eventDate, 40),
    city: str(body.city, 120),
    audienceSize: typeof body.audienceSize === "number" ? body.audienceSize : null,
    budget: str(body.budget, 120),
    details: str(body.details, 4000),
    receivedAt: new Date().toISOString(),
  };
  const id = "req-" + crypto.randomUUID().slice(0, 8);
  console.log("[speaking-request]", id, payload);

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
          reply_to: payload.email || undefined,
          subject: `Speaking inquiry - ${payload.name} - ${payload.eventType} - ${payload.city || "-"}`,
          text: [
            `Reference: ${id}`,
            "",
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            `Organization: ${payload.organization || "-"}`,
            `Event type: ${payload.eventType}`,
            `Timeline: ${payload.timeline}`,
            `Preferred date: ${payload.eventDate || "-"}`,
            `City: ${payload.city || "-"}`,
            `Audience size: ${payload.audienceSize ?? "-"}`,
            `Budget: ${payload.budget || "-"}`,
            "",
            "Details:",
            payload.details,
            "",
            `Submitted: ${payload.receivedAt}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) console.error("Resend non-2xx", res.status, await res.text());
    } catch (err) {
      console.error("Resend failed", err);
    }
  }

  return json({ ok: true, id });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

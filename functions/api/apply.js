// POST /api/apply - Diamond Club seat application.
// Logs to the Cloudflare console and (if RESEND_API_KEY is set) emails Greg.
// Returns ok: true so the client always shows the success ticket.
//
// Env vars:
//   RESEND_API_KEY      - enable email delivery via Resend
//   NOTIFY_TO           - destination (defaults to gpryor@lifepriority.com)
//   NOTIFY_FROM         - verified sender (e.g. "Greg's Site <noreply@lifepriority.com>")

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
    date: str(body.date, 80),
    group: str(body.group, 4),
    about: str(body.about, 2000),
    how: str(body.how, 200),
    receivedAt: new Date().toISOString(),
  };
  console.log("[apply]", payload);

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
          subject: `Diamond Club application - ${payload.name} (${payload.date})`,
          text: [
            `Name: ${payload.name}`,
            `Email: ${payload.email}`,
            `Date: ${payload.date}`,
            `Group size: ${payload.group}`,
            "",
            `Why they want to come:`,
            payload.about,
            "",
            `How they found Greg: ${payload.how || "-"}`,
            `Submitted: ${payload.receivedAt}`,
          ].join("\n"),
        }),
      });
      if (!res.ok) console.error("Resend non-2xx", res.status, await res.text());
    } catch (err) {
      console.error("Resend failed", err);
    }
  }

  return json({ ok: true });
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

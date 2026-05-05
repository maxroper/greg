// POST /api/apply - Diamond Club seat application.
// Stores nothing yet; logs to the Cloudflare console and (if configured) emails
// Greg via Resend. Returns ok: true so the client always shows the success ticket.
//
// Optional env vars:
//   RESEND_API_KEY     - to enable email delivery via Resend
//   APPLY_NOTIFY_TO    - destination address (defaults to gpryor@lifepriority.com)
//   APPLY_NOTIFY_FROM  - verified sender address (defaults to no-reply@gregpryor.com)

const CTRL_RE = /[\x00-\x1f\x7f]/g;
function str(v, max) {
  if (typeof v !== "string") return "";
  return v.replace(CTRL_RE, " ").trim().slice(0, max);
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
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.APPLY_NOTIFY_FROM || "no-reply@gregpryor.com",
          to: env.APPLY_NOTIFY_TO || "gpryor@lifepriority.com",
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

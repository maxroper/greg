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
      const groupLabel =
        payload.group === "1" ? "1 person" :
        payload.group === "2" ? "2 people" :
        payload.group || "—";

      const fields = [
        { label: "Name",          value: payload.name },
        { label: "Email",         value: payload.email },
        { label: "Game date",     value: payload.date },
        { label: "Party size",    value: groupLabel },
      ];

      const longFields = [
        { label: "Why they want to come", value: payload.about },
        { label: "How they found Greg",   value: payload.how || "—" },
      ];

      const text = [
        "New Diamond Club seat application",
        "================================",
        "",
        ...fields.map((f) => `${f.label}: ${f.value || "—"}`),
        "",
        ...longFields.flatMap((f) => [`${f.label}:`, f.value, ""]),
        `Submitted: ${payload.receivedAt}`,
        "",
        "Reply to this email to respond directly to the applicant.",
      ].join("\n");

      const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;color:#0a1929">
  <h2 style="margin:0 0 4px;font-size:18px">New Diamond Club seat application</h2>
  <p style="margin:0 0 20px;color:#5a6a7a;font-size:13px">Submitted ${escapeHtml(payload.receivedAt)}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    ${fields.map((f) => `
      <tr>
        <td style="padding:8px 12px 8px 0;color:#5a6a7a;width:120px;vertical-align:top">${escapeHtml(f.label)}</td>
        <td style="padding:8px 0;font-weight:500">${escapeHtml(f.value || "—")}</td>
      </tr>`).join("")}
  </table>
  ${longFields.map((f) => `
    <div style="margin-top:20px">
      <div style="color:#5a6a7a;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">${escapeHtml(f.label)}</div>
      <div style="white-space:pre-wrap;line-height:1.5;font-size:14px">${escapeHtml(f.value)}</div>
    </div>`).join("")}
  <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e6e6e6;color:#5a6a7a;font-size:12px">
    Hit reply to respond directly to ${escapeHtml(payload.name)}.
  </p>
</div>`.trim();

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
          subject: `Diamond Club application — ${payload.name} (${payload.date}, ${groupLabel})`,
          text,
          html,
        }),
      });
      if (!res.ok) console.error("Resend non-2xx", res.status, await res.text());
    } catch (err) {
      console.error("Resend failed", err);
    }
  }

  return json({ ok: true });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

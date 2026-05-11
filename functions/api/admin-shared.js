const TOKEN_TTL_SECONDS = 12 * 60 * 60;
const JSON_HEADERS = {
  "content-type": "application/json",
  "cache-control": "no-store",
};

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export function badRequest(message, status = 400) {
  return json({ ok: false, error: message }, status);
}

export function getAdminSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || env.ADMIN_API_TOKEN || "";
}

export function adminConfigured(env) {
  return !!(env.ADMIN_PASSWORD || env.ADMIN_API_TOKEN);
}

export async function issueAdminToken(env) {
  const secret = getAdminSecret(env);
  if (!secret) throw new Error("Admin auth is not configured.");
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: 1,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await sign(encoded, secret);
  return `${encoded}.${sig}`;
}

export async function requireAdmin(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, response: badRequest("Missing admin token.", 401) };

  if (env.ADMIN_API_TOKEN && timingSafeEqual(token, env.ADMIN_API_TOKEN)) {
    return { ok: true };
  }

  const secret = getAdminSecret(env);
  if (!secret) return { ok: false, response: badRequest("Admin auth is not configured.", 503) };

  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return { ok: false, response: badRequest("Invalid admin token.", 401) };

  const expected = await sign(encoded, secret);
  if (!timingSafeEqual(sig, expected)) {
    return { ok: false, response: badRequest("Invalid admin token.", 401) };
  }

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded)));
  } catch {
    return { ok: false, response: badRequest("Invalid admin token.", 401) };
  }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, response: badRequest("Admin session expired.", 401) };
  }

  return { ok: true };
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON body.");
  }
}

export function str(v, max = 500) {
  if (typeof v !== "string") return "";
  let out = "";
  for (let i = 0; i < v.length && out.length < max; i++) {
    const code = v.charCodeAt(i);
    if (code < 32 || code === 127) out += " ";
    else out += v[i];
  }
  return out.trim();
}

async function sign(value, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return base64UrlEncode(new Uint8Array(sig));
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(i, i + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  const max = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let i = 0; i < max; i++) {
    mismatch |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}


import { adminConfigured, badRequest, issueAdminToken, json, readJson } from "./admin-shared.js";

export async function onRequestPost({ request, env }) {
  if (!adminConfigured(env)) {
    return badRequest("Set ADMIN_PASSWORD or ADMIN_API_TOKEN before using /admin.", 503);
  }

  let body;
  try {
    body = await readJson(request);
  } catch (err) {
    return badRequest(err.message);
  }

  const password = typeof body.password === "string" ? body.password : "";
  const validPassword = env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD;
  const validToken = env.ADMIN_API_TOKEN && password === env.ADMIN_API_TOKEN;
  if (!validPassword && !validToken) {
    return badRequest("Incorrect admin password.", 401);
  }

  const token = await issueAdminToken(env);
  return json({ ok: true, token, expiresIn: 12 * 60 * 60 });
}


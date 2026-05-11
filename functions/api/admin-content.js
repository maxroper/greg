import { badRequest, json, readJson, requireAdmin } from "./admin-shared.js";

const DEFAULT_REPO = "maxroper/greg";
const DEFAULT_BRANCH = "main";
const DEFAULT_PATH = "public/site-content.json";

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  const content = await readCurrentContent(env);
  return json({
    ok: true,
    content: content.content,
    source: content.source,
    canSave: !!getGithubToken(env),
    repo: getRepo(env),
    branch: getBranch(env),
    path: getContentPath(env),
  });
}

export async function onRequestPut({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  const token = getGithubToken(env);
  if (!token) {
    return badRequest("Set GITHUB_ADMIN_TOKEN to save copy changes from /admin.", 503);
  }

  let body;
  try {
    body = await readJson(request);
  } catch (err) {
    return badRequest(err.message);
  }

  const content = body.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return badRequest("Content must be a JSON object.");
  }

  const repo = getRepo(env);
  const branch = getBranch(env);
  const path = getContentPath(env);
  const pretty = `${JSON.stringify({
    ...content,
    _meta: {
      ...(content._meta || {}),
      updatedAt: new Date().toISOString(),
      updatedBy: "admin",
    },
  }, null, 2)}\n`;

  if (pretty.length > 400_000) {
    return badRequest("Content file is too large.");
  }

  let sha = null;
  try {
    sha = await getGithubFileSha({ token, repo, branch, path });
  } catch (err) {
    return badRequest(err.message || "Unable to read current GitHub file.", 502);
  }
  const saveRes = await fetch(`https://api.github.com/repos/${repo}/contents/${encodePath(path)}`, {
    method: "PUT",
    headers: githubHeaders(token),
    body: JSON.stringify({
      message: "Update site copy from admin",
      branch,
      content: toBase64(pretty),
      ...(sha ? { sha } : {}),
    }),
  });

  const data = await saveRes.json().catch(() => ({}));
  if (!saveRes.ok) {
    console.error("GitHub content save failed", saveRes.status, data);
    return badRequest(data.message || "GitHub save failed.", saveRes.status);
  }

  return json({
    ok: true,
    commit: data.commit?.sha,
    url: data.commit?.html_url,
    content: JSON.parse(pretty),
  });
}

async function readCurrentContent(env) {
  const token = getGithubToken(env);
  if (token) {
    const repo = getRepo(env);
    const branch = getBranch(env);
    const path = getContentPath(env);
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`, {
      headers: githubHeaders(token),
    });
    if (res.ok) {
      const data = await res.json();
      try {
        const decoded = fromBase64(data.content || "");
        return { source: "github", content: JSON.parse(decoded) };
      } catch (err) {
        console.error("Failed to decode GitHub content", err);
      }
    } else if (res.status !== 404) {
      console.error("GitHub content read failed", res.status, await res.text());
    }
  }

  if (env.ASSETS) {
    try {
      const assetRes = await env.ASSETS.fetch("https://assets.local/site-content.json");
      if (assetRes.ok) {
        return { source: "asset", content: await assetRes.json() };
      }
    } catch (err) {
      console.error("Asset content read failed", err);
    }
  }

  return { source: "empty", content: {} };
}

async function getGithubFileSha({ token, repo, branch, path }) {
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`, {
    headers: githubHeaders(token),
  });
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Unable to read current GitHub file.");
  }
  return data.sha || null;
}

function getGithubToken(env) {
  return env.GITHUB_ADMIN_TOKEN || env.GITHUB_TOKEN || "";
}

function getRepo(env) {
  return env.GITHUB_REPO || DEFAULT_REPO;
}

function getBranch(env) {
  return env.GITHUB_BRANCH || DEFAULT_BRANCH;
}

function getContentPath(env) {
  return env.GITHUB_CONTENT_PATH || DEFAULT_PATH;
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "greg-pryor-admin",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(i, i + 0x8000));
  }
  return btoa(binary);
}

function fromBase64(value) {
  const clean = String(value || "").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

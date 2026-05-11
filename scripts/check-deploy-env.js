import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envFiles = [".env", ".env.local", ".env.production", ".env.production.local"];
const values = { ...process.env };

for (const file of envFiles) {
  const fullPath = path.join(cwd, file);
  if (!fs.existsSync(fullPath)) continue;

  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (values[key]) continue;
    values[key] = stripQuotes(rawValue.trim());
  }
}

const publishableKey = values.VITE_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  fail([
    "Missing VITE_STRIPE_PUBLISHABLE_KEY for production deploy.",
    "Set it in the shell or in .env.production before running npm run deploy.",
    "Wrangler secrets are runtime-only; Vite needs this public key at build time.",
  ]);
}

if (!/^pk_(test|live)_/.test(publishableKey)) {
  fail([
    "VITE_STRIPE_PUBLISHABLE_KEY does not look like a Stripe publishable key.",
    "Expected a value beginning with pk_test_ or pk_live_.",
  ]);
}

if (publishableKey.startsWith("pk_test_")) {
  console.warn("Warning: deploying with a Stripe test-mode publishable key.");
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

#!/usr/bin/env node
// One-off: write a .webp next to every .jpg under public/assets/
// Run with `node scripts/optimize-images.js`. Idempotent.
import { readdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public/assets/", import.meta.url).pathname;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const fmt = (n) => `${(n / 1024).toFixed(0)} KB`;
let totalIn = 0, totalOut = 0;

for await (const file of walk(ROOT)) {
  if (extname(file).toLowerCase() !== ".jpg") continue;
  const out = file.replace(/\.jpg$/i, ".webp");
  const inSize = (await stat(file)).size;
  await sharp(file).webp({ quality: 82, effort: 6 }).toFile(out);
  const outSize = (await stat(out)).size;
  totalIn += inSize;
  totalOut += outSize;
  const pct = ((1 - outSize / inSize) * 100).toFixed(0);
  console.log(`${file.replace(ROOT, "")}: ${fmt(inSize)} → ${fmt(outSize)} (-${pct}%)`);
}

console.log(`\nTotal: ${fmt(totalIn)} → ${fmt(totalOut)} (-${((1 - totalOut / totalIn) * 100).toFixed(0)}%)`);

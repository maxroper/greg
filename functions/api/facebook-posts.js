// GET /api/facebook-posts
//
// Returns Greg's latest 3 Facebook posts in the shape the FB section expects.
// Cached at Cloudflare's edge for 10 minutes so we don't hit Graph API rate
// limits (and so the section is fast).
//
// Required env vars:
//   FB_PAGE_ID            - the page ID or slug (e.g. "GregPryor85" or numeric)
//   FB_PAGE_ACCESS_TOKEN  - long-lived Page Access Token (see README)
//
// If either is missing the endpoint returns the static FALLBACK array so the
// section never renders empty.

const FALLBACK = [
  {
    id: "static-1",
    when: "2 days ago",
    text: "Forty-one years ago today I made my Royals debut in spring training. Fans still send me cards from that '85 club to sign. I sign every one. Keep 'em coming.",
    likes: 318, comments: 47, shares: 22,
    tag: "MEMORY",
    permalink: "https://www.facebook.com/GregPryor85/",
  },
  {
    id: "static-2",
    when: "1 week ago",
    text: "Headed to Indian Valley last weekend to talk baseball with the kids. They asked me which was scarier — facing Nolan Ryan or signing the contract that meant I had to shave. I told them the truth.",
    likes: 642, comments: 89, shares: 41,
    tag: "EVENT",
    permalink: "https://www.facebook.com/GregPryor85/",
  },
  {
    id: "static-3",
    when: "2 weeks ago",
    text: "Bret Saberhagen called me yesterday. He's still mad I didn't catch that ball in Game 7. I told him to read Chapter 11. We laughed for an hour.",
    likes: 1240, comments: 156, shares: 88,
    tag: "STORY",
    permalink: "https://www.facebook.com/GregPryor85/",
  },
];

const GRAPH_VERSION = "v23.0";
const CACHE_SECONDS = 600;

export async function onRequestGet({ request, env, ctx }) {
  const url = new URL(request.url);
  url.searchParams.delete("_"); // strip cache-busting param if any
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let posts = FALLBACK;
  let source = "fallback";

  if (env.FB_PAGE_ID && env.FB_PAGE_ACCESS_TOKEN) {
    try {
      const fields = [
        "id",
        "message",
        "created_time",
        "permalink_url",
        "reactions.summary(true)",
        "comments.summary(true)",
        "shares",
      ].join(",");

      const graphUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${env.FB_PAGE_ID}/posts`);
      graphUrl.searchParams.set("fields", fields);
      graphUrl.searchParams.set("limit", "6");
      graphUrl.searchParams.set("access_token", env.FB_PAGE_ACCESS_TOKEN);

      const res = await fetch(graphUrl, { cf: { cacheTtl: CACHE_SECONDS } });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Graph API error", res.status, errText.slice(0, 200));
      } else {
        const data = await res.json();
        const fetched = (data.data || [])
          .filter((p) => p && p.message)
          .slice(0, 3)
          .map(normalize);
        if (fetched.length > 0) {
          posts = fetched;
          source = "facebook";
        }
      }
    } catch (err) {
      console.error("Graph API fetch failed", err);
    }
  }

  const response = new Response(JSON.stringify({ posts, source }), {
    headers: {
      "content-type": "application/json",
      "cache-control": `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

function normalize(p) {
  return {
    id: String(p.id || ""),
    text: p.message,
    when: humanizeRelative(p.created_time),
    likes: p.reactions?.summary?.total_count ?? 0,
    comments: p.comments?.summary?.total_count ?? 0,
    shares: p.shares?.count ?? 0,
    permalink: p.permalink_url || "https://www.facebook.com/GregPryor85/",
    tag: detectTag(p.message),
  };
}

function humanizeRelative(iso) {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diffSec = Math.max(0, (Date.now() - ts) / 1000);
  const min = diffSec / 60;
  if (min < 1) return "just now";
  if (min < 60) return `${Math.floor(min)} ${plural(Math.floor(min), "minute")} ago`;
  const hr = min / 60;
  if (hr < 24) return `${Math.floor(hr)} ${plural(Math.floor(hr), "hour")} ago`;
  const day = hr / 24;
  if (day < 7) return `${Math.floor(day)} ${plural(Math.floor(day), "day")} ago`;
  const wk = day / 7;
  if (wk < 5) return `${Math.floor(wk)} ${plural(Math.floor(wk), "week")} ago`;
  const mo = day / 30;
  if (mo < 12) return `${Math.floor(mo)} ${plural(Math.floor(mo), "month")} ago`;
  const yr = day / 365;
  return `${Math.floor(yr)} ${plural(Math.floor(yr), "year")} ago`;
}

function plural(n, word) {
  return n === 1 ? word : `${word}s`;
}

function detectTag(message) {
  if (!message) return "POST";
  const m = message.toLowerCase();
  if (/\b(today|debut|years ago|memory|remember|back when)\b/.test(m)) return "MEMORY";
  if (/\b(event|appearance|signing|game|tonight|tomorrow|this weekend|join me)\b/.test(m)) return "EVENT";
  return "STORY";
}

// GET /api/spotify-playlists
//
// Returns Greg's 4 Spotify playlists (cover art + track count + link). Uses
// the Client Credentials OAuth flow so no user-facing redirect is needed —
// only public playlists are visible (which is what we want for a public site).
//
// Cached at the Cloudflare edge for 30 minutes.
//
// Env vars:
//   SPOTIFY_CLIENT_ID       - from https://developer.spotify.com/dashboard
//   SPOTIFY_CLIENT_SECRET   - from the same app dashboard
//   SPOTIFY_USER_ID         - Greg's Spotify username (from his profile URL)
//   SPOTIFY_PLAYLIST_IDS    - optional, comma-separated playlist IDs to pin
//                             a specific 4 (otherwise we take the first 4)
//
// Falls back to the static FALLBACK array when env vars aren't set.

const FALLBACK = [
  { id: "static-1", name: "Yacht Rock Essentials", count: 87, image: null, color: "#7a3b2e", emoji: "⛵", externalUrl: "https://open.spotify.com/" },
  { id: "static-2", name: "Psychedelic '70s",      count: 64, image: null, color: "#BD9B60", emoji: "🌀", externalUrl: "https://open.spotify.com/" },
  { id: "static-3", name: "Bus Ride Mixtape '85",  count: 42, image: null, color: "#004687", emoji: "📻", externalUrl: "https://open.spotify.com/" },
  { id: "static-4", name: "Slow Burn Sundays",     count: 51, image: null, color: "#2d4a3e", emoji: "🌅", externalUrl: "https://open.spotify.com/" },
];

const CACHE_SECONDS = 1800;

export async function onRequestGet({ request, env, ctx }) {
  const url = new URL(request.url);
  url.searchParams.delete("_");
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let playlists = FALLBACK;
  let source = "fallback";

  if (env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET && env.SPOTIFY_USER_ID) {
    try {
      const credentials = btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`);
      const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      if (!tokenRes.ok) throw new Error(`Token fetch ${tokenRes.status}`);
      const { access_token } = await tokenRes.json();

      const listUrl = new URL(`https://api.spotify.com/v1/users/${encodeURIComponent(env.SPOTIFY_USER_ID)}/playlists`);
      listUrl.searchParams.set("limit", "50");
      const listRes = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!listRes.ok) throw new Error(`Playlist fetch ${listRes.status}`);
      const data = await listRes.json();

      let items = (data.items || []).filter(Boolean);

      // Optional: pin a specific 4 by ID via SPOTIFY_PLAYLIST_IDS
      if (env.SPOTIFY_PLAYLIST_IDS) {
        const ids = env.SPOTIFY_PLAYLIST_IDS.split(",").map((s) => s.trim()).filter(Boolean);
        const map = new Map(items.map((p) => [p.id, p]));
        items = ids.map((id) => map.get(id)).filter(Boolean);
      }

      const fetched = items.slice(0, 4).map(normalize);
      if (fetched.length > 0) {
        playlists = fetched;
        source = "spotify";
      }
    } catch (err) {
      console.error("Spotify fetch failed", err);
    }
  }

  const response = new Response(JSON.stringify({ playlists, source }), {
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
    id: p.id,
    name: p.name,
    count: p.tracks?.total ?? 0,
    image: p.images?.[0]?.url || null,
    description: p.description || "",
    externalUrl: p.external_urls?.spotify || `https://open.spotify.com/playlist/${p.id}`,
  };
}

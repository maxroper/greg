import { useEffect } from "react";

// VITE_GA_MEASUREMENT_ID is read at build time. If unset, this component is a
// no-op — no script tag, no console noise, no GA cookies. Set it in Cloudflare
// Pages -> Settings -> Variables and Secrets and redeploy to enable tracking.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    if (window.gtag) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, {
      // SPA: we manually fire page_view on internal anchor jumps below.
      send_page_view: true,
    });
  }, []);

  // Re-fire a page_view when the URL hash changes (the only client-side
  // navigation this site does is anchor jumps via the nav).
  useEffect(() => {
    if (!GA_ID) return;
    const onHash = () => {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.hash,
        page_title: document.title,
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return null;
}

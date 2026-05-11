import React, { useEffect, useState } from "react";
import { SiteContentProvider, useSiteContent } from "./content.js";
import { ScrollProgress, useActiveSection, useSectionInView } from "./components/primitives.jsx";
import Nav from "./components/nav.jsx";
import Hero from "./components/hero.jsx";
import Book from "./components/book.jsx";
import Memorabilia from "./components/memorabilia.jsx";
import About from "./components/about.jsx";
import Apply from "./components/apply.jsx";
import MyTake from "./components/mytake.jsx";
import Footer from "./components/footer.jsx";
import CheckoutBanner from "./components/checkout-banner.jsx";
import Analytics from "./components/analytics.jsx";
import Privacy from "./components/privacy.jsx";
import Admin from "./components/admin.jsx";

// Tiny pathname-based router. The Worker serves index.html for any non-asset
// non-API request, so /privacy hits this app and we render the right page.
function usePathname() {
  const [path, setPath] = useState(typeof window !== "undefined" ? window.location.pathname : "/");
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

export default function App() {
  const path = usePathname();
  if (path.startsWith("/admin")) {
    return <Admin />;
  }
  if (path.startsWith("/privacy")) {
    return (
      <>
        <Analytics />
        <Privacy />
      </>
    );
  }
  return (
    <SiteContentProvider>
      <Home />
    </SiteContentProvider>
  );
}

function Home() {
  const content = useSiteContent();
  const ids = content.nav.items.map((n) => n.id);
  const active = useActiveSection(ids);
  useSectionInView();

  return (
    <>
      <Analytics />
      <ScrollProgress />
      <CheckoutBanner />
      <Nav active={active} />
      <a href="#main" className="skip-link">Skip to main content</a>
      <main id="main" className="grain">
        <Hero />
        <Book />
        <Memorabilia />
        <About show={["intro"]} />
        <About show={["speaking"]} />
        <Apply />
        <MyTake />
        <About show={["health"]} />
        <About show={["facebook"]} />
        <About show={["contact"]} />
      </main>
      <Footer />
    </>
  );
}

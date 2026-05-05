import React from "react";
import { NAV_ITEMS } from "./data.js";
import { ScrollProgress, useActiveSection, useSectionInView } from "./components/primitives.jsx";
import Nav from "./components/nav.jsx";
import Hero from "./components/hero.jsx";
import Book from "./components/book.jsx";
import Memorabilia from "./components/memorabilia.jsx";
import About from "./components/about.jsx";
import Apply from "./components/apply.jsx";
import MyTake from "./components/mytake.jsx";
import Podcast from "./components/podcast.jsx";
import Footer from "./components/footer.jsx";
import CheckoutBanner from "./components/checkout-banner.jsx";
import Analytics from "./components/analytics.jsx";

export default function App() {
  const ids = NAV_ITEMS.map((n) => n.id);
  const active = useActiveSection(ids);
  useSectionInView();

  return (
    <>
      <Analytics />
      <ScrollProgress />
      <CheckoutBanner />
      <Nav active={active} />
      <main className="grain">
        <Hero />
        <Book />
        <Memorabilia />
        <About show={["intro"]} />
        <About show={["speaking"]} />
        <Apply />
        <MyTake />
        <About show={["music"]} />
        <Podcast />
        <About show={["health"]} />
        <About show={["facebook"]} />
        <About show={["contact"]} />
      </main>
      <Footer />
    </>
  );
}

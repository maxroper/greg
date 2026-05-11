import React, { useEffect, useState } from "react";
import { useSiteContent } from "../content.js";

export default function Nav({ active }) {
  const content = useSiteContent();
  const navItems = content.nav.items;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">
        <a className="nav-brand" href="#hero" onClick={(e) => { e.preventDefault(); go("hero"); }}>
          <span className="nav-mark">GP</span>
          <span className="nav-name">{content.nav.brand}</span>
        </a>
        <ul className="nav-links">
          {navItems.slice(1).map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={active === it.id ? "is-active" : ""}
                onClick={(e) => { e.preventDefault(); go(it.id); }}
              >
                <span className="nav-link-num mono">{it.index}</span>
                <span>{it.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      {open && (
        <div className="nav-mobile">
          {navItems.map((it) => (
            <a key={it.id} href={`#${it.id}`} onClick={(e) => { e.preventDefault(); go(it.id); }}>
              <span className="mono">{it.index}</span> {it.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

const navStyles = document.createElement("style");
navStyles.textContent = `
.nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 80;
  padding: 18px 0;
  transition: padding 240ms, background 240ms, backdrop-filter 240ms;
}
.nav-scrolled {
  padding: 12px 0;
  background: rgba(5, 13, 26, 0.78);
  backdrop-filter: blur(14px) saturate(140%);
  border-bottom: 1px solid var(--rule);
}
.nav-inner {
  max-width: 1320px; margin: 0 auto; padding: 0 32px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 32px;
}
.nav-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--serif); font-weight: 600;
  font-size: 18px; letter-spacing: -0.01em;
  color: var(--bone);
}
.nav-mark {
  width: 32px; height: 32px;
  border: 1px solid var(--royal-blue-bright);
  background: var(--royal-blue);
  color: var(--bone);
  display: grid; place-items: center;
  font-family: var(--mono);
  font-size: 11px; font-weight: 600;
  letter-spacing: 0;
  border-radius: 50%;
}
.nav-num { color: var(--royal-blue-glow); font-size: 11px; opacity: 0.85; letter-spacing: 0.16em; white-space: nowrap; }
.nav-links {
  display: flex; align-items: center; gap: 2px;
  list-style: none; padding: 0; margin: 0;
}
.nav-links a {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 11px;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.005em;
  color: var(--bone-dim);
  border-radius: 999px;
  transition: color 200ms, background 200ms;
  position: relative;
  white-space: nowrap;
}
.nav-links a:hover { color: var(--bone); }
.nav-link-num { display: none; }
.nav-links a.is-active {
  color: var(--bone);
  background: rgba(0, 100, 194, 0.18);
  box-shadow: inset 0 0 0 1px rgba(43, 138, 255, 0.4);
}
.nav-links a.is-active .nav-link-num { opacity: 1; color: var(--royal-blue-glow); }
.nav-burger {
  display: none;
  width: 40px; height: 40px;
  background: transparent; border: 1px solid var(--rule); border-radius: 999px;
  flex-direction: column; gap: 4px; align-items: center; justify-content: center;
  cursor: pointer;
}
.nav-burger span { width: 14px; height: 1px; background: var(--bone); display: block; }
.nav-mobile {
  display: flex; flex-direction: column;
  margin-top: 12px; padding: 16px 32px;
  background: rgba(5, 13, 26, 0.95);
  border-top: 1px solid var(--rule);
}
.nav-mobile a { padding: 14px 0; color: var(--bone); border-bottom: 1px solid var(--rule); }
.nav-mobile a .mono { color: var(--gold); margin-right: 10px; font-size: 11px; }
@media (max-width: 1280px) {
  .nav-links { display: none; }
  .nav-burger { display: flex; }
}
`;
document.head.appendChild(navStyles);

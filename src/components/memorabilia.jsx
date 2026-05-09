import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Reveal, Eyebrow, Placeholder, Picture } from "./primitives.jsx";
import { MEMORABILIA } from "../data.js";

function MemImg({ src, alt, label, ratio }) {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return <Placeholder label={label} ratio={ratio || "auto"} style={{ width: "100%", height: "100%" }} />;
  return <Picture src={src} alt={alt} onError={() => setErrored(true)} />;
}

export default function Memorabilia() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Championship", "Signed", "Award", "Gear", "Memento"];

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") setActive(null); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  const items = useMemo(() => filter === "All" ? MEMORABILIA : MEMORABILIA.filter(m => m.category === filter), [filter]);

  return (
    <section id="memorabilia" data-screen-label="02 The Collection" className="section mem">
      <div className="section-inner">
        <div className="mem-head">
          <Reveal><Eyebrow index="02">The Collection</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 className="display h-xl mem-title">
              The <em>10 things</em><br/>I never threw out.
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <p className="lede" style={{maxWidth: "60ch"}}>
              Some of these I earned. Some I borrowed. One of them I'm pretty sure
              still belongs to Hal McRae. A small museum of a ten-year career.
            </p>
          </Reveal>
        </div>

        <Reveal delay={360}>
          <div className="mem-filters">
            {cats.map((c) => (
              <button key={c} className={`mem-filter ${filter === c ? "is-active" : ""}`} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
            <span className="mem-count mono">{items.length} ITEMS</span>
          </div>
        </Reveal>

        <div className="mem-grid">
          {items.map((it, i) => (
            <Reveal key={it.id} delay={Math.min(i*40, 600)} className={`mem-card mem-card-${it.size}`}>
              <button className="mem-card-btn" onClick={() => setActive(it)}>
                <div className="mem-card-img">
                  <MemImg src={it.img} alt={it.title} label={it.category} />
                  <div className="mem-card-year mono">{it.year}</div>
                </div>
                <div className="mem-card-body">
                  <div className="mem-card-cat mono">{it.category}</div>
                  <div className="mem-card-title">{it.title}</div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active && createPortal(
        <div className="mem-modal" onClick={() => setActive(null)}>
          <div className="mem-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="mem-modal-close" onClick={() => setActive(null)} aria-label="Close">×</button>
            <div className="mem-modal-img">
              <MemImg src={active.img} alt={active.title} label={active.category} ratio="4/3" />
            </div>
            <div className="mem-modal-body">
              <div className="mono mem-modal-eyebrow">
                {active.category} · {active.year}
              </div>
              <h3 className="display mem-modal-title">{active.title}</h3>
              <p className="mem-modal-desc">{active.desc}</p>
              <div className="mem-modal-meta mono">
                <span>ITEM № {String(active.id).padStart(3,"0")}</span>
                <span>FROM THE COLLECTION OF GREG PRYOR</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

const memStyles = document.createElement("style");
memStyles.textContent = `
.mem { background: linear-gradient(180deg, var(--navy-900) 0%, #061327 50%, var(--navy-900) 100%); }
.mem-head { margin-bottom: 48px; }
.mem-title { color: var(--bone); margin: 24px 0 32px; }
.mem-title em { color: var(--royal-blue-bright); font-style: italic; }

.mem-filters {
  display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--rule);
}
.mem-filter {
  background: transparent;
  border: 1px solid var(--rule);
  padding: 8px 16px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bone-dim);
  cursor: pointer;
  border-radius: 999px;
  transition: all 200ms;
}
.mem-filter:hover { color: var(--bone); border-color: var(--royal-blue-bright); }
.mem-filter.is-active { background: var(--royal-blue-bright); color: var(--bone); border-color: var(--royal-blue-bright); }
.mem-count { margin-left: auto; font-size: 10px; color: var(--gold); letter-spacing: 0.2em; }

.mem-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
  grid-auto-flow: dense;
  gap: 14px;
}
.mem-card { background: transparent; }
.mem-card-sm   { grid-column: span 1; grid-row: span 1; }
.mem-card-md   { grid-column: span 2; grid-row: span 1; }
.mem-card-lg   { grid-column: span 2; grid-row: span 2; }
.mem-card-tall { grid-column: span 1; grid-row: span 2; }
.mem-card-wide { grid-column: span 2; grid-row: span 1; }

@media (max-width: 1080px) {
  .mem-grid { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 200px; }
}
@media (max-width: 640px) {
  .mem-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; }
  .mem-card, .mem-card-sm, .mem-card-md, .mem-card-lg, .mem-card-tall, .mem-card-wide {
    grid-column: span 1; grid-row: span 1;
  }
}
@media (max-width: 460px) {
  .mem-grid { grid-template-columns: 1fr; grid-auto-rows: 200px; gap: 12px; }
}

.mem-card-btn {
  display: flex; flex-direction: column;
  width: 100%; height: 100%;
  background: linear-gradient(135deg, #0e1f37 0%, #1a3658 100%);
  border: 1px solid var(--rule);
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: var(--bone);
  transition: transform 300ms cubic-bezier(.2,.8,.2,1), border-color 300ms, box-shadow 300ms;
  overflow: hidden;
  font-family: inherit;
}
.mem-card-btn:hover {
  transform: translateY(-3px);
  border-color: var(--royal-blue-bright);
  box-shadow: 0 30px 60px -20px rgba(0, 70, 173, 0.5);
}
.mem-card-img { flex: 1; position: relative; min-height: 0; overflow: hidden; }
.mem-card-img img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 600ms cubic-bezier(.2,.8,.2,1);
  filter: saturate(0.85) contrast(1.05);
}
.mem-card-btn:hover .mem-card-img img { transform: scale(1.04); }
.mem-card-img::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(5,13,26,0) 50%, rgba(5,13,26,0.5) 100%);
  pointer-events: none;
}
.mem-card-img .ph { position: absolute; inset: 0; }
.mem-card-year {
  position: absolute; top: 12px; right: 12px;
  font-size: 10px; letter-spacing: 0.16em; color: var(--gold);
  background: rgba(5, 13, 26, 0.78); padding: 4px 8px;
  border: 1px solid var(--rule); z-index: 3;
}
.mem-card-body {
  padding: 14px 16px; border-top: 1px solid var(--rule);
  background: rgba(5, 13, 26, 0.6);
}
.mem-card-cat { font-size: 10px; color: var(--gold); letter-spacing: 0.18em; }
.mem-card-title {
  font-family: var(--serif); font-size: 16px; font-weight: 500;
  color: var(--bone); margin-top: 4px; line-height: 1.2;
}

.mem-modal {
  position: fixed; inset: 0;
  background: rgba(5, 13, 26, 0.88);
  backdrop-filter: blur(10px);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
  animation: memFadeIn 250ms;
}
@keyframes memFadeIn { from {opacity:0;} to {opacity:1;} }
.mem-modal-card {
  background: var(--navy-800);
  border: 1px solid var(--royal-blue-bright);
  max-width: 880px;
  width: 100%;
  max-height: min(86vh, 640px);
  display: grid;
  grid-template-columns: 5fr 6fr;
  position: relative;
  animation: memScaleIn 300ms cubic-bezier(.2,.8,.2,1);
  overflow: hidden;
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(0, 70, 173, 0.4);
}
@keyframes memScaleIn { from {opacity:0; transform: scale(.96);} to {opacity:1; transform: scale(1);} }
@media (max-width: 760px) {
  .mem-modal { padding: 16px; }
  .mem-modal-card { grid-template-columns: 1fr; grid-template-rows: 200px 1fr; max-height: 92vh; }
}
.mem-modal-close {
  position: absolute; top: 14px; right: 14px;
  width: 38px; height: 38px;
  background: rgba(5, 13, 26, 0.85);
  border: 1px solid var(--rule);
  color: var(--bone);
  font-size: 22px; line-height: 1;
  cursor: pointer; border-radius: 50%;
  z-index: 5;
  transition: all 200ms;
}
.mem-modal-close:hover { background: var(--royal-blue-bright); border-color: var(--royal-blue-bright); }
.mem-modal-img { background: var(--navy-700); position: relative; overflow: hidden; min-height: 0; }
.mem-modal-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mem-modal-img .ph { position: absolute; inset: 0; }
.mem-modal-body {
  padding: 36px 40px;
  display: flex; flex-direction: column;
  overflow-y: auto;
  min-height: 0;
}
.mem-modal-eyebrow { font-size: 11px; letter-spacing: 0.18em; color: var(--gold); margin-bottom: 12px; }
.mem-modal-title {
  font-family: var(--serif); font-weight: 500;
  font-size: clamp(22px, 2.2vw, 30px);
  line-height: 1.15;
  color: var(--bone);
  margin: 0 0 18px;
  letter-spacing: -0.01em;
}
.mem-modal-desc { font-size: 15px; line-height: 1.65; color: var(--bone-dim); margin: 0; flex: 1; }
.mem-modal-meta {
  margin-top: 28px; padding-top: 16px;
  font-size: 10px; letter-spacing: 0.16em; color: var(--gold);
  border-top: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 6px;
}
`;
document.head.appendChild(memStyles);

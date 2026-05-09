import React, { useEffect, useRef, useState } from "react";
import { Btn } from "./primitives.jsx";
import { ASSETS } from "../data.js";

export default function Hero() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const titleY = -progress * 80;
  const fourY = progress * 60;
  const fourScale = 1 - progress * 0.08;
  const subOpacity = 1 - progress * 1.4;

  return (
    <section id="hero" ref={sectionRef} data-screen-label="00 Home" className="section hero">
      <div className="hero-bg" aria-hidden>
        <div className="hero-photo" style={{
          backgroundImage: `image-set(url(${ASSETS.gregYankees.replace(/\.jpe?g$/i, ".webp")}) type("image/webp"), url(${ASSETS.gregYankees}) type("image/jpeg"))`,
        }} />
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-vignette" />
      </div>

      <div className="hero-four" aria-hidden style={{
        transform: `translate(-50%, calc(-50% + ${fourY}px)) scale(${fourScale})`,
        opacity: subOpacity * 0.9,
      }}>
        <span className="hero-four-num">4</span>
        <span className="hero-four-circle" />
      </div>

      <div className="hero-inner section-inner" style={{
        transform: `translate3d(0, ${titleY}px, 0)`,
      }}>
        <div className="hero-eyebrow-row" style={{ opacity: subOpacity }}>
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            <span className="mono">№ 4 · UTILITY INFIELDER · 1976–1986</span>
          </span>
        </div>

        <h1 className="display hero-title">
          <span className="hero-title-line">Greg</span>
          <span className="hero-title-line"><em>Pryor</em></span>
        </h1>

        <div className="hero-divider" />

        <div className="hero-meta" style={{ opacity: subOpacity }}>
          <p className="hero-lede">
            Former Major Leaguer. World Series Champion. Author. Speaker.
            Podcaster. I have stories. I'm finally telling them.
          </p>
          <p className="hero-lede hero-lede-sub">
            Forty years later, the dugout is quieter, but the memory is louder.
            Pull up a seat.
          </p>

          <div className="hero-cta-row">
            <Btn primary onClick={() => document.getElementById("book").scrollIntoView({behavior:"smooth"})}>
              Read the book
            </Btn>
            <Btn ghost onClick={() => document.getElementById("apply").scrollIntoView({behavior:"smooth"})}>
              Sit next to me
            </Btn>
          </div>
        </div>
      </div>

      <div className="hero-strip">
        <div className="hero-strip-inner">
          <div className="hero-stat">
            <span className="hero-stat-num">10</span>
            <span className="hero-stat-lbl">MLB SEASONS</span>
          </div>
          <div className="hero-strip-sep" />
          <div className="hero-stat">
            <span className="hero-stat-num">789</span>
            <span className="hero-stat-lbl">GAMES</span>
          </div>
          <div className="hero-strip-sep hero-strip-sep-minors" />
          <div className="hero-stat hero-stat-minors">
            <span className="hero-stat-num">6</span>
            <span className="hero-stat-lbl">YEARS IN THE MINORS</span>
          </div>
          <div className="hero-strip-sep" />
          <div className="hero-stat hero-stat-ring">
            <span className="hero-stat-num">1</span>
            <span className="hero-stat-lbl">WORLD SERIES RING</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const heroStyles = document.createElement("style");
heroStyles.textContent = `
.hero {
  min-height: 100vh;
  height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 120px 0 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  isolation: isolate;
}
.hero-bg {
  position: absolute; inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, #0a1426 0%, #0f1c30 55%, #15263d 100%);
}
.hero-photo {
  position: absolute;
  top: 0; bottom: 0;
  right: 0;
  width: 52%;
  background-size: cover;
  background-position: center 18%;
  opacity: 0.18;
  filter: grayscale(0.35) contrast(1.05);
  mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 30%, black 60%, black 100%),
              linear-gradient(180deg, transparent 0%, black 18%, black 78%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 30%, black 60%, black 100%),
                      linear-gradient(180deg, transparent 0%, black 18%, black 78%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
  mix-blend-mode: luminosity;
  pointer-events: none;
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(43, 138, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(43, 138, 255, 0.07) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: 50% 50%;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%);
  opacity: 0.7;
}
.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.hero-glow-1 {
  width: 720px; height: 720px;
  left: -180px; top: -120px;
  background: radial-gradient(circle, rgba(0, 100, 194, 0.45), transparent 65%);
}
.hero-glow-2 {
  width: 600px; height: 600px;
  right: -120px; bottom: -180px;
  background: radial-gradient(circle, rgba(43, 138, 255, 0.32), transparent 65%);
}
.hero-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(2, 6, 19, 0.7) 100%);
  pointer-events: none;
}
.hero-four {
  position: absolute;
  left: 50%; top: 50%;
  width: clamp(380px, 50vw, 720px);
  aspect-ratio: 1;
  z-index: 1;
  pointer-events: none;
  display: grid;
  place-items: center;
  will-change: transform, opacity;
}
.hero-four-num {
  font-family: var(--serif);
  font-size: clamp(380px, 50vw, 720px);
  font-weight: 400;
  font-style: italic;
  line-height: 1;
  background: linear-gradient(180deg,
    rgba(43, 138, 255, 0.18) 0%,
    rgba(43, 138, 255, 0.06) 60%,
    transparent 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 1px rgba(43, 138, 255, 0.32);
  letter-spacing: -0.05em;
  filter: drop-shadow(0 0 40px rgba(43, 138, 255, 0.15));
  position: relative;
  animation: heroFourBreathe 6s ease-in-out infinite;
}
.hero-four-num::before {
  content: "4";
  position: absolute;
  inset: 0;
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 1.5px rgba(43, 138, 255, 0.9);
  filter: blur(0.5px) drop-shadow(0 0 18px rgba(43, 138, 255, 0.55));
  background: linear-gradient(180deg,
    transparent 0%,
    transparent var(--sweep-start, 0%),
    rgba(43, 138, 255, 1) var(--sweep-mid, 50%),
    transparent var(--sweep-end, 100%),
    transparent 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  mask-image: linear-gradient(180deg,
    transparent 0%,
    transparent var(--sweep-start, 0%),
    black var(--sweep-mid, 50%),
    transparent var(--sweep-end, 100%),
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(180deg,
    transparent 0%,
    transparent var(--sweep-start, 0%),
    black var(--sweep-mid, 50%),
    transparent var(--sweep-end, 100%),
    transparent 100%
  );
  animation: heroFourSweep 5.5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes heroFourBreathe {
  0%, 100% { filter: drop-shadow(0 0 40px rgba(43, 138, 255, 0.12)); }
  50%      { filter: drop-shadow(0 0 60px rgba(43, 138, 255, 0.32)); }
}
@keyframes heroFourSweep {
  0%   { --sweep-start: -20%; --sweep-mid: 0%;   --sweep-end: 20%;  opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { --sweep-start: 80%;  --sweep-mid: 100%; --sweep-end: 120%; opacity: 0; }
}
@property --sweep-start { syntax: "<percentage>"; inherits: false; initial-value: -20%; }
@property --sweep-mid   { syntax: "<percentage>"; inherits: false; initial-value: 0%; }
@property --sweep-end   { syntax: "<percentage>"; inherits: false; initial-value: 20%; }
.hero-four-circle {
  position: absolute;
  width: 88%; height: 88%;
  border: 1px solid rgba(43, 138, 255, 0.18);
  border-radius: 50%;
  animation: heroSpin 60s linear infinite;
}
.hero-four-circle::before, .hero-four-circle::after {
  content: "";
  position: absolute;
  inset: -1px;
  border: 1px dashed rgba(43, 138, 255, 0.1);
  border-radius: 50%;
}
.hero-four-circle::after {
  inset: 24px;
  border-color: rgba(43, 138, 255, 0.08);
  border-style: solid;
}
@keyframes heroSpin { to { transform: rotate(360deg); } }

.hero-inner {
  position: relative;
  z-index: 5;
  width: 100%;
  will-change: transform;
}
.hero-eyebrow-row { margin-bottom: 28px; }
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 14px;
  border-radius: 999px;
  background: rgba(0, 100, 194, 0.15);
  border: 1px solid rgba(43, 138, 255, 0.35);
  backdrop-filter: blur(8px);
}
.hero-badge .mono {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--bone);
  white-space: nowrap;
}
.hero-badge-dot {
  width: 6px; height: 6px;
  background: var(--royal-blue-glow);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--royal-blue-glow);
  animation: heroPulse 2s ease-in-out infinite;
}
@keyframes heroPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.hero-title {
  font-size: clamp(72px, 13.5vw, 232px);
  line-height: 0.86;
  letter-spacing: -0.045em;
  color: var(--bone);
  margin: 0;
}
.hero-title-line { display: block; }
.hero-title em {
  font-style: italic;
  font-weight: 400;
  background: linear-gradient(135deg, var(--bone) 0%, var(--royal-blue-glow) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-divider {
  margin: 32px 0;
  width: 88px; height: 2px;
  background: var(--royal-blue-glow);
  box-shadow: 0 0 12px rgba(43, 138, 255, 0.5);
}

.hero-meta {
  max-width: 540px;
  display: flex; flex-direction: column; gap: 32px;
}
.hero-lede {
  font-family: var(--serif);
  font-size: clamp(17px, 1.4vw, 22px);
  line-height: 1.5;
  color: var(--bone-dim);
  margin: 0;
}
.hero-lede-sub {
  font-size: clamp(15px, 1.15vw, 18px);
  color: rgba(245, 244, 232, 0.55);
  font-style: italic;
  margin-top: -16px;
}
.hero-cta-row { display: flex; gap: 12px; flex-wrap: wrap; }

.hero-strip {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 5;
  background: linear-gradient(180deg, rgba(10, 20, 38, 0) 0%, rgba(10, 20, 38, 0.55) 40%, rgba(0, 70, 135, 0.35) 100%);
  border-top: 1px solid rgba(43, 138, 255, 0.2);
  backdrop-filter: blur(6px);
}
.hero-strip-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 18px 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-stat { display: flex; align-items: baseline; gap: 12px; }
.hero-stat-num {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 500;
  color: var(--bone);
  letter-spacing: -0.02em;
  line-height: 1;
}
.hero-stat-ring .hero-stat-num { color: var(--royal-blue-glow); }
.hero-stat-lbl {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--bone-dim);
  opacity: 0.85;
  text-transform: uppercase;
}
.hero-strip-sep { width: 1px; height: 22px; background: var(--rule); }

@media (max-width: 1080px) {
  .hero { padding: 110px 0 160px; height: 100vh; }
  .hero-strip-inner { padding: 16px 32px; }
  .hero-stat-num { font-size: 26px; }
}
@media (max-width: 768px) {
  /* Drop the "Years in the minors" stat on phones — three stats fit, four don't. */
  .hero-stat-minors, .hero-strip-sep-minors { display: none; }

  .hero {
    padding: 80px 0 0;
    height: 100vh;
    height: 100dvh;
    min-height: 600px;
    justify-content: flex-start;
  }
  .hero-photo {
    width: 100%;
    opacity: 0.1;
    background-position: center 12%;
    mask-image: linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%);
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 30%, black 70%, transparent 100%);
  }
  .hero-inner { padding-top: 12px; }
  .hero-title { font-size: clamp(60px, 16vw, 112px); padding-right: 0.06em; }
  .hero-divider { margin: 20px 0; width: 64px; }
  .hero-lede { font-size: 16px; }
  .hero-cta-row { gap: 10px; }
  .hero-four-num { font-size: clamp(280px, 75vw, 420px); }
  .hero-four { width: clamp(280px, 75vw, 420px); }
  .hero-strip { position: absolute; bottom: 0; left: 0; right: 0; }
  .hero-strip-inner { gap: 14px 24px; justify-content: center; padding: 12px 16px; flex-wrap: nowrap; }
  .hero-strip-sep { display: none; }
  .hero-stat { gap: 8px; flex: 0 0 auto; }
  .hero-stat-num { font-size: 20px; }
  .hero-stat-lbl { font-size: 9px; }
}
@media (max-width: 540px) {
  .hero { min-height: 640px; }
  .hero-inner { padding-top: 8px; }
  .hero-cta-row { gap: 10px; flex-wrap: wrap; }
  .hero-cta-row .btn { font-size: 13px; padding: 11px 16px; }
  .hero-badge { padding: 7px 12px; }
  .hero-badge .mono { font-size: 9px; letter-spacing: 0.14em; }
  .hero-title { font-size: clamp(56px, 17vw, 92px); }
  .hero-divider { margin: 16px 0; width: 56px; }
  .hero-lede { font-size: 15px; max-width: 100%; }
  .hero-lede-sub { font-size: 13.5px; margin-top: -12px; }
  .hero-strip-inner { padding: 10px 16px; gap: 10px 18px; }
  .hero-stat-num { font-size: 18px; }
  .hero-stat-lbl { font-size: 8.5px; letter-spacing: 0.12em; }
}
`;
document.head.appendChild(heroStyles);

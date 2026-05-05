import React from "react";
import { Reveal, Eyebrow } from "./primitives.jsx";

export default function Podcast() {
  return (
    <section id="podcast" data-screen-label="08 The Podcast" className="section pod">
      <div className="pod-bg" aria-hidden>
        <div className="pod-bg-grid" />
        <div className="pod-bg-glow" />
      </div>
      <div className="section-inner pod-inner">
        <div className="pod-head">
          <Reveal><Eyebrow index="08">The Podcast</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 className="display h-xl pod-title">
              Baseball<br/><em>Town</em>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <div className="pod-soon-tape mono">● BROADCASTING SOON</div>
          </Reveal>
          <Reveal delay={280}>
            <div className="pod-soon-title display">
              Episodes <em>dropping</em> late <span className="pod-soon-yr">'27</span>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <p className="lede pod-sub">
              Long stories, slow takes, and a couch worth of memorabilia.
              A weekly conversation with Greg Pryor about a game that's
              still recognizable to anyone who played it.
            </p>
          </Reveal>
        </div>

        <div className="pod-art">
          <Reveal delay={200}>
            <div className="pod-tile">
              <div className="pod-tile-meta mono">EP. 01 · COMING SOON</div>
              <div className="pod-tile-title display h-md">Baseball Town</div>
              <div className="pod-tile-host">with Greg Pryor</div>
              <div className="pod-tile-bars">
                {Array.from({length: 32}).map((_,i) => (
                  <span key={i} className="pod-bar" style={{ height: `${20 + Math.sin(i*0.7)*30 + Math.random()*30}%`, animationDelay: `${i*60}ms` }} />
                ))}
              </div>
              <div className="pod-tile-foot mono">
                <span>● REC</span>
                <span>00:42:18</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const podStyles = document.createElement("style");
podStyles.textContent = `
.pod { background: #050d1a; position: relative; overflow: hidden; }
.pod-bg { position: absolute; inset: 0; pointer-events: none; }
.pod-bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--rule) 1px, transparent 1px),
    linear-gradient(90deg, var(--rule) 1px, transparent 1px);
  background-size: 80px 80px;
  opacity: 0.5;
  mask-image: radial-gradient(ellipse at 70% 50%, black 0%, transparent 70%);
}
.pod-bg-glow {
  position: absolute; right: -20%; top: 20%;
  width: 800px; height: 800px;
  background: radial-gradient(circle, rgba(189,155,96,0.18) 0%, transparent 60%);
  filter: blur(40px);
}
.pod-inner {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  position: relative; z-index: 2;
  align-items: center;
}
@media (max-width: 980px) { .pod-inner { grid-template-columns: 1fr; gap: 56px; } }
.pod-title { color: var(--bone); margin-top: 24px; line-height: 0.9; }
.pod-title em { color: var(--royal-blue-glow); font-style: italic; }
.pod-sub { margin-top: 28px; }
.pod-soon-tape {
  margin-top: 28px;
  font-size: 11px; letter-spacing: 0.22em;
  color: #ff5a5a;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  border: 1px solid rgba(255,90,90,0.4);
  border-radius: 999px;
  background: rgba(255,90,90,0.08);
  width: fit-content;
}
.pod-soon-title {
  margin-top: 16px;
  font-size: clamp(28px, 3.5vw, 40px);
  line-height: 1.1;
  color: var(--bone);
  letter-spacing: -0.01em;
}
.pod-soon-title em { color: var(--royal-blue-glow); font-style: italic; }
.pod-soon-yr { color: var(--gold); font-style: italic; }
.pod-art { display: flex; justify-content: center; align-items: center; }
.pod-tile {
  width: 100%; max-width: 420px;
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--royal-blue) 0%, var(--navy-700) 100%);
  border: 1px solid var(--gold);
  border-radius: 4px;
  padding: 32px;
  display: flex; flex-direction: column;
  position: relative;
  box-shadow: 0 40px 80px -30px rgba(0, 70, 135, 0.4);
}
.pod-tile::before {
  content: "";
  position: absolute; inset: 8px;
  border: 1px solid rgba(189, 155, 96, 0.2);
  pointer-events: none;
}
.pod-tile-meta { font-size: 10px; letter-spacing: 0.2em; color: var(--gold); }
.pod-tile-title { color: var(--bone); margin-top: 12px; line-height: 0.95; }
.pod-tile-host {
  font-family: var(--serif); font-style: italic;
  font-size: 18px; color: var(--bone-dim);
  margin-top: 6px;
}
.pod-tile-bars {
  margin-top: auto;
  display: flex; align-items: flex-end; gap: 3px;
  height: 60px;
}
.pod-bar {
  flex: 1;
  background: var(--gold);
  opacity: 0.7;
  animation: barPulse 1.4s infinite ease-in-out;
}
@keyframes barPulse {
  0%, 100% { transform: scaleY(0.6); }
  50% { transform: scaleY(1); }
}
.pod-tile-foot {
  display: flex; justify-content: space-between;
  margin-top: 16px;
  font-size: 11px; color: var(--gold); letter-spacing: 0.16em;
}
`;
document.head.appendChild(podStyles);

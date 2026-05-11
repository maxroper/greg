import React, { useRef, useState } from "react";
import { Reveal, Eyebrow } from "./primitives.jsx";
import { useSiteContent } from "../content.js";

export default function MyTake() {
  const { mytake: copy } = useSiteContent();
  const [active, setActive] = useState(copy.takes[0].id);
  const current = copy.takes.find(t => t.id === active) || copy.takes[0];
  const detailRef = useRef(null);

  const onPick = (id) => {
    setActive(id);
    if (window.matchMedia("(max-width: 980px)").matches && detailRef.current) {
      requestAnimationFrame(() => {
        const el = detailRef.current;
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
      });
    }
  };

  return (
    <section id="mytake" data-screen-label="06 My Take" className="section take">
      <div className="section-inner">
        <div className="take-head">
          <Reveal><Eyebrow index="06">{copy.eyebrow}</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 className="display h-xl take-title">
              {copy.titleLine1} <em>{copy.titleEmphasis}</em><br/>{copy.titleLine2}
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <p className="lede" style={{maxWidth: "56ch"}}>
              {copy.lede}
            </p>
          </Reveal>
        </div>

        <div className="take-board">
          <div className="take-list">
            {copy.takes.map((t, i) => (
              <Reveal key={t.id} delay={i*80}>
                <button
                  className={`take-row ${active === t.id ? "is-active" : ""}`}
                  onClick={() => onPick(t.id)}>
                  <div className="take-row-num mono">№ {String(i+1).padStart(2,"0")}</div>
                  <div className="take-row-body">
                    <div className="take-row-topic">
                      {t.topic}
                      {t.hot && <span className="take-tag-hot">HOT</span>}
                    </div>
                    <div className="take-row-verdict">{t.verdict}</div>
                  </div>
                  <div className="take-row-arrow">→</div>
                </button>
              </Reveal>
            ))}
          </div>

          <div className="take-detail" ref={detailRef}>
            <div className="take-detail-card" key={current.id}>
              <div className="take-detail-tag mono">
                {current.hot ? "🔥 HOT TAKE" : "TAKE"} · No. {current.id}
              </div>
              <h3 className="display h-md take-detail-topic">{current.topic}</h3>
              <div className="take-detail-verdict">
                <span className="mono">VERDICT</span>
                <strong>{current.verdict}</strong>
              </div>
              <p className="take-detail-body">{current.body}</p>
              <div className="take-detail-meta">
                <span>👍 {current.reactions}</span>
                <span>💬 {current.comments} comments</span>
                <a href="#" onClick={(e) => e.preventDefault()}>Read full thread on Facebook →</a>
              </div>
            </div>
          </div>
        </div>

        <Reveal delay={400}>
          <div className="hot-take">
            <div className="hot-take-stripe" />
              <div className="hot-take-inner">
                <div className="hot-take-header">
                <span className="hot-take-tag mono">{copy.weeklyTag}</span>
                <span className="hot-take-date mono">{copy.weekly.date} · {copy.weekly.team} · {copy.weekly.record}</span>
              </div>
              <p className="hot-take-body">{copy.weekly.take}</p>
              <div className="hot-take-foot mono">{copy.weeklyFoot}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const takeStyles = document.createElement("style");
takeStyles.textContent = `
.take { background: var(--navy-900); }
.take-head { margin-bottom: 64px; }
.take-title { color: var(--bone); margin: 24px 0 32px; }
.take-title em { color: var(--gold); font-style: italic; }

.take-board { display: grid; grid-template-columns: 1fr 1.2fr; gap: 56px; align-items: start; }
@media (max-width: 980px) { .take-board { grid-template-columns: 1fr; gap: 32px; } }

.take-list { display: flex; flex-direction: column; }
.take-row {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 20px;
  align-items: center;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--rule);
  padding: 22px 4px;
  text-align: left;
  cursor: pointer;
  color: var(--bone);
  font-family: inherit;
  transition: padding 200ms;
}
.take-row:hover { padding-left: 12px; }
.take-row.is-active { padding-left: 16px; background: rgba(189, 155, 96, 0.04); }
.take-row.is-active .take-row-arrow { color: var(--gold); transform: translateX(4px); }
.take-row-num { font-size: 11px; color: var(--gold); letter-spacing: 0.18em; }
.take-row-topic { font-family: var(--serif); font-size: 22px; font-weight: 500; display: flex; align-items: center; gap: 12px; }
.take-tag-hot { font-family: var(--mono); font-size: 9px; background: var(--crimson); color: var(--bone); padding: 3px 6px; letter-spacing: 0.14em; }
.take-row-verdict { font-family: var(--mono); font-size: 11px; color: var(--gold); letter-spacing: 0.14em; margin-top: 6px; }
.take-row-arrow { color: var(--bone-dim); transition: all 200ms; font-size: 18px; }

.take-detail { position: sticky; top: 120px; }
.take-detail-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.04), transparent);
  border: 1px solid var(--rule);
  padding: 40px;
  animation: takeIn 400ms cubic-bezier(.2,.8,.2,1);
}
@keyframes takeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.take-detail-tag { font-size: 10px; color: var(--gold); letter-spacing: 0.22em; text-transform: uppercase; }
.take-detail-topic { color: var(--bone); margin: 16px 0 20px; }
.take-detail-verdict {
  display: inline-flex; align-items: center; gap: 12px;
  padding: 10px 18px;
  border: 1px solid var(--gold);
  background: rgba(189, 155, 96, 0.08);
  margin-bottom: 28px;
}
.take-detail-verdict .mono { font-size: 10px; color: var(--gold); letter-spacing: 0.18em; }
.take-detail-verdict strong { font-family: var(--serif); font-size: 18px; font-style: italic; color: var(--bone); }
.take-detail-body { font-family: var(--serif); font-size: 20px; line-height: 1.5; color: var(--bone); margin: 0 0 32px; }
.take-detail-meta {
  display: flex; gap: 20px; flex-wrap: wrap;
  padding-top: 20px; border-top: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: 11px; color: var(--bone-dim); letter-spacing: 0.1em;
}
.take-detail-meta a { color: var(--gold); }

.hot-take {
  margin-top: 72px;
  position: relative;
  background: linear-gradient(135deg, #2a0a0a 0%, #1a0606 100%);
  border: 1px solid var(--crimson);
  overflow: hidden;
}
.hot-take-stripe { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: var(--crimson); }
.hot-take-inner { padding: 32px 40px 32px 56px; }
.hot-take-header { display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.hot-take-tag { font-size: 11px; letter-spacing: 0.22em; color: var(--crimson); }
.hot-take-date { font-size: 10px; letter-spacing: 0.14em; color: var(--bone-dim); }
.hot-take-body { font-family: var(--serif); font-size: clamp(20px, 2vw, 26px); line-height: 1.4; color: var(--bone); margin: 0 0 16px; }
.hot-take-foot { font-size: 11px; color: var(--gold); letter-spacing: 0.14em; opacity: 0.8; }
`;
document.head.appendChild(takeStyles);

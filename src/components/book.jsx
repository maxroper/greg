import React, { useState } from "react";
import { Reveal, Eyebrow, Btn } from "./primitives.jsx";
import { useSiteContent } from "../content.js";
import Checkout from "./checkout.jsx";

export default function Book() {
  const { book: copy } = useSiteContent();
  const [tab, setTab] = useState("direct");
  const AMAZON_URL = "https://www.amazon.com/Day-Yankees-Made-Me-Shave-ebook/dp/B08FV8TLGW";
  const BOOK_COVER = "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1554949076i/45018799.jpg";
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  return (
    <>
    <section id="book" data-screen-label="01 The Book" className="section book">
      <div className="section-inner">
        <Reveal>
          <Eyebrow index="01">{copy.eyebrow}</Eyebrow>
        </Reveal>

        <div className="book-grid">
          <div className="book-cover-col">
            <Reveal delay={120}>
              <div className="book-cover">
                <div className="book-cover-spine" />
                <img
                  className="book-cover-img"
                  src={BOOK_COVER}
                  alt="The Day The Yankees Made Me Shave — book cover"
                  loading="lazy"
                />
              </div>
              <div className="book-cover-shadow" />
            </Reveal>
            <Reveal delay={400}>
              <div className="book-stats">
                <div><span className="mono">312</span> Pages</div>
                <div><span className="mono">14</span> Chapters</div>
                <div><span className="mono">★ 4.7</span> · 184 Reviews</div>
              </div>
            </Reveal>
          </div>

          <div className="book-text-col">
            <Reveal delay={200}>
              <h2 className="display h-lg book-title">
                {copy.titleBefore} <em>{copy.titleEmphasis}</em>.
              </h2>
            </Reveal>
            <Reveal delay={300}>
              <p className="lede" style={{ marginTop: 24 }}>
                {copy.lede}
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="book-pull">
                <div className="book-pull-mark">"</div>
                <p>
                  {copy.pullQuote}
                </p>
                <span className="book-pull-attr mono">- {copy.pullAttribution}</span>
              </div>
            </Reveal>

            <Reveal delay={500}>
              <div className="book-tabs">
                {[
                  { k: "direct",  l: copy.directTabLabel, sub: copy.directTabSub },
                  { k: "amazon", l: copy.amazonTabLabel, sub: copy.amazonTabSub },
                ].map((t) => (
                  <button key={t.k} className={`book-tab ${tab === t.k ? "is-active" : ""}`} onClick={() => setTab(t.k)}>
                    <span className="book-tab-l">{t.l}</span>
                    <span className="book-tab-sub mono">{t.sub}</span>
                  </button>
                ))}
              </div>
              <div className="book-cta">
                {tab === "direct" && (
                  <Btn primary href="#" onClick={(e) => { e.preventDefault(); setCheckoutOpen(true); }}>
                    {copy.directCta}
                  </Btn>
                )}
                {tab === "amazon" && (
                  <Btn primary href={AMAZON_URL} target="_blank" rel="noopener">
                    {copy.amazonCta}
                  </Btn>
                )}
              </div>
            </Reveal>

            <Reveal delay={650}>
              <div className="book-quotes">
                {copy.quotes.slice(2, 4).map((q, i) => (
                  <div className="book-quote" key={i}>
                    <p className="book-quote-text">"{q.text}"</p>
                    <div className="book-quote-attr">
                      <span className="book-quote-who">{q.who}</span>
                      <span className="book-quote-role mono">{q.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={800}>
              <div className="book-teaser">
                <div className="book-teaser-bar">
                  <span className="mono">{copy.teaserTag}</span>
                  <span className="book-teaser-dot" />
                  <span className="mono">{copy.teaserDate}</span>
                </div>
                <p>
                  {copy.teaserText}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
    <Checkout
      open={checkoutOpen}
      initialEdition={tab === "amazon" ? "standard" : "signed"}
      onClose={() => setCheckoutOpen(false)}
    />
    </>
  );
}

const bookStyles = document.createElement("style");
bookStyles.textContent = `
.book { background: var(--navy-900); }
.book-grid {
  display: grid;
  grid-template-columns: minmax(300px, 440px) 1fr;
  gap: 80px;
  margin-top: 56px;
  align-items: start;
}
@media (max-width: 980px) { .book-grid { grid-template-columns: 1fr; gap: 56px; } }

.book-cover-col { position: relative; position: sticky; top: 120px; }
@media (max-width: 980px) {
  .book-cover-col { position: static; max-width: 280px; margin: 0 auto; width: 100%; }
  .book-cover { transform: none; }
}
.book-cover {
  position: relative;
  aspect-ratio: 2/3;
  background: #1a0606;
  border: 1px solid rgba(189, 155, 96, 0.3);
  box-shadow:
    0 60px 80px -30px rgba(0, 0, 0, 0.7),
    0 30px 40px -20px rgba(0, 0, 0, 0.5);
  transform: perspective(1500px) rotateY(-8deg) rotateX(2deg);
  transition: transform 600ms cubic-bezier(.2,.8,.2,1);
  overflow: hidden;
}
.book-cover-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.book-cover:hover { transform: perspective(1500px) rotateY(-3deg) rotateX(0deg) translateY(-6px); }
.book-cover-spine {
  position: absolute; left: -1px; top: 0; bottom: 0; width: 8px;
  background: linear-gradient(90deg, #1a0606, #2d0e0e);
  border-right: 1px solid rgba(189, 155, 96, 0.3);
}

.book-stats { display: flex; gap: 24px; margin-top: 32px; font-family: var(--sans); font-size: 12px; color: var(--bone-dim); flex-wrap: wrap; }
@media (max-width: 540px) {
  .book-stats { gap: 14px; flex-wrap: nowrap; align-items: center; }
  .book-stats > div { font-size: 12px; white-space: nowrap; }
  .book-stats .mono { font-size: 13px; }
}
.book-stats .mono { color: var(--gold); font-size: 14px; font-weight: 600; }

.book-title { color: var(--bone); }
.book-title em { font-style: italic; color: var(--royal-blue-glow); font-variation-settings: "opsz" 144; }

.book-pull {
  margin-top: 40px;
  padding: 28px 32px;
  border-left: 2px solid var(--royal-blue-glow);
  background: rgba(0, 100, 194, 0.06);
  position: relative;
}
.book-pull-mark { position: absolute; top: -16px; left: 16px; font-family: var(--serif); font-size: 80px; color: var(--gold); line-height: 1; }
.book-pull p { font-family: var(--serif); font-size: clamp(20px, 2vw, 26px); font-style: italic; color: var(--bone); margin: 0 0 16px 0; line-height: 1.3; }
.book-pull-attr { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); }

.book-tabs { display: grid; grid-template-columns: 1fr 1fr; margin-top: 48px; border-top: 1px solid var(--rule); }
.book-tab {
  background: transparent; border: none;
  border-bottom: 1px solid var(--rule);
  padding: 18px 16px; text-align: left;
  cursor: pointer;
  display: flex; flex-direction: column; gap: 4px;
  position: relative;
  color: var(--bone-dim);
  transition: color 200ms;
}
.book-tab:hover { color: var(--bone); }
.book-tab.is-active { color: var(--royal-blue-glow); }
.book-tab.is-active::after { content: ""; position: absolute; left: 0; bottom: -1px; right: 0; height: 1px; background: var(--royal-blue-glow); }
.book-tab-l { font-size: 14px; font-weight: 500; }
.book-tab-sub { font-size: 11px; opacity: 0.7; white-space: nowrap; }

.book-cta { display: flex; gap: 14px; margin-top: 24px; flex-wrap: wrap; }

.book-quotes { margin-top: 56px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
@media (max-width: 768px) { .book-quotes { grid-template-columns: 1fr; } }
.book-quote { padding: 24px; border: 1px solid var(--rule); background: rgba(189, 155, 96, 0.02); }
.book-quote-text { font-family: var(--serif); font-style: italic; font-size: 16px; line-height: 1.4; color: var(--bone); margin: 0 0 16px 0; }
.book-quote-attr { display: flex; flex-direction: column; gap: 2px; }
.book-quote-who { font-weight: 600; font-size: 13px; color: var(--bone); }
.book-quote-role { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gold); opacity: 0.8; }

.book-teaser {
  margin-top: 56px;
  padding: 28px 32px;
  border: 1px dashed var(--royal-blue-bright);
  background: linear-gradient(135deg, rgba(0, 100, 194, 0.1), rgba(0, 70, 135, 0.04));
}
.book-teaser-bar { display: flex; align-items: center; gap: 14px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--royal-blue-glow); margin-bottom: 12px; }
.book-teaser-dot { width: 4px; height: 4px; background: var(--royal-blue-glow); border-radius: 50%; }
.book-teaser p { margin: 0; font-family: var(--serif); font-size: 18px; color: var(--bone); }
`;
document.head.appendChild(bookStyles);

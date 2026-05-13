import React, { useMemo, useState } from "react";
import Analytics from "./analytics.jsx";
import Footer from "./footer.jsx";
import { BONUS_STORIES, BONUS_STORY_SOURCES } from "../bonusStories.js";

export default function BonusStoriesPage() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const chapter = BONUS_STORIES[chapterIndex];
  const progress = useMemo(() => `${chapterIndex + 1} / ${BONUS_STORIES.length}`, [chapterIndex]);

  const chooseChapter = (index) => {
    setChapterIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Analytics />
      <main className="bonus-page grain">
        <header className="bonus-nav">
          <a href="/" className="bonus-brand">
            <span className="bonus-brand-mark">GP</span>
            <span>Greg Pryor</span>
          </a>
          <a className="bonus-home-link mono" href="/#book">Back to the book</a>
        </header>

        <section className="bonus-hero">
          <div className="bonus-hero-inner">
            <div>
              <div className="bonus-kicker mono">Bonus Reader</div>
              <h1 className="display bonus-title">27 more days in the baseball life.</h1>
            </div>
            <p className="bonus-lede">
              New imagined chapters built as a companion to <em>The Day The Yankees Made Me Shave</em>.
            </p>
          </div>
        </section>

        <section className="bonus-reader">
          <aside className="bonus-toc" aria-label="Table of contents">
            <div className="bonus-toc-head">
              <span className="mono">Table of Contents</span>
              <span className="mono">{progress}</span>
            </div>
            <div className="bonus-toc-list">
              {BONUS_STORIES.map((story, index) => (
                <button
                  key={story.slug}
                  className={`bonus-toc-item ${index === chapterIndex ? "is-active" : ""}`}
                  onClick={() => chooseChapter(index)}
                >
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <span>{story.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <article className="bonus-chapter">
            <div className="bonus-chapter-top">
              <span className="mono">Chapter {String(chapterIndex + 1).padStart(2, "0")}</span>
              <span className="mono">{chapter.year}</span>
            </div>
            <h2 className="display bonus-chapter-title">{chapter.title}</h2>
            <div className="bonus-fact">
              <span className="mono">Real Baseball Thread</span>
              <p>{chapter.fact}</p>
            </div>
            <div className="bonus-prose">
              {chapter.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="bonus-pager">
              <button
                className="bonus-pager-btn"
                disabled={chapterIndex === 0}
                onClick={() => chooseChapter(Math.max(0, chapterIndex - 1))}
              >
                <span className="mono">Previous</span>
                <strong>{chapterIndex > 0 ? BONUS_STORIES[chapterIndex - 1].title : "Start"}</strong>
              </button>
              <button
                className="bonus-pager-btn"
                disabled={chapterIndex === BONUS_STORIES.length - 1}
                onClick={() => chooseChapter(Math.min(BONUS_STORIES.length - 1, chapterIndex + 1))}
              >
                <span className="mono">Next</span>
                <strong>{chapterIndex < BONUS_STORIES.length - 1 ? BONUS_STORIES[chapterIndex + 1].title : "End"}</strong>
              </button>
            </div>
          </article>
        </section>

        <section className="bonus-sources">
          <div className="bonus-sources-inner">
            <div>
              <div className="bonus-kicker mono">Fact Sources</div>
              <h2 className="display bonus-sources-title">The real scaffolding.</h2>
            </div>
            <div className="bonus-source-list">
              {BONUS_STORY_SOURCES.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const bonusStyles = document.createElement("style");
bonusStyles.textContent = `
.bonus-page {
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(0, 70, 135, 0.24), rgba(5, 13, 26, 0) 520px),
    var(--navy-900);
  color: var(--bone);
}
.bonus-nav {
  position: sticky;
  top: 0;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 32px;
  background: rgba(5, 13, 26, 0.82);
  border-bottom: 1px solid var(--rule);
  backdrop-filter: blur(14px) saturate(140%);
}
.bonus-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 600;
}
.bonus-brand-mark {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid var(--royal-blue-bright);
  border-radius: 50%;
  background: var(--royal-blue);
  font-family: var(--mono);
  font-size: 11px;
}
.bonus-home-link {
  color: var(--gold);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.bonus-hero {
  padding: 96px 0 72px;
}
.bonus-hero-inner,
.bonus-reader,
.bonus-sources-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 56px;
}
.bonus-hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 64px;
  align-items: end;
}
.bonus-kicker {
  color: var(--gold);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 18px;
}
.bonus-title {
  max-width: 9ch;
  font-size: clamp(60px, 10vw, 146px);
  color: var(--bone);
}
.bonus-lede {
  margin: 0;
  max-width: 48ch;
  color: var(--bone-dim);
  font-family: var(--serif);
  font-size: clamp(19px, 1.7vw, 25px);
  line-height: 1.48;
}
.bonus-lede em { color: var(--gold-bright); }
.bonus-reader {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 56px;
  align-items: start;
  padding-bottom: 96px;
}
.bonus-toc {
  position: sticky;
  top: 92px;
  max-height: calc(100vh - 116px);
  overflow: auto;
  border: 1px solid var(--rule);
  background: rgba(3, 8, 16, 0.58);
}
.bonus-toc-head {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 16px;
  background: rgba(3, 8, 16, 0.96);
  color: var(--gold);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--rule);
}
.bonus-toc-list {
  display: grid;
}
.bonus-toc-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-bottom: 1px solid rgba(189, 155, 96, 0.12);
  background: transparent;
  color: var(--bone-dim);
  text-align: left;
  cursor: pointer;
  line-height: 1.25;
}
.bonus-toc-item:hover,
.bonus-toc-item.is-active {
  color: var(--bone);
  background: rgba(0, 100, 194, 0.16);
}
.bonus-toc-item .mono {
  color: var(--gold);
  font-size: 11px;
}
.bonus-chapter {
  min-height: 720px;
  padding: clamp(32px, 5vw, 72px);
  border: 1px solid var(--rule);
  background:
    linear-gradient(180deg, rgba(244, 241, 234, 0.98), rgba(232, 227, 214, 0.96)),
    var(--bone);
  color: var(--ink);
  box-shadow: 0 44px 90px -54px rgba(0, 0, 0, 0.9);
}
.bonus-chapter-top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  color: #5c4930;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.bonus-chapter-title {
  max-width: 12ch;
  font-size: clamp(38px, 5.2vw, 84px);
  line-height: 0.98;
  color: #07101d;
}
.bonus-fact {
  margin: 32px 0;
  padding: 18px 22px;
  border-left: 3px solid var(--royal-blue);
  background: rgba(0, 70, 135, 0.08);
}
.bonus-fact .mono {
  display: block;
  margin-bottom: 8px;
  color: var(--royal-blue);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.bonus-fact p {
  margin: 0;
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.45;
}
.bonus-prose {
  max-width: 72ch;
}
.bonus-prose p {
  margin: 0 0 22px;
  font-family: var(--serif);
  font-size: clamp(18px, 1.5vw, 22px);
  line-height: 1.64;
}
.bonus-pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 48px;
}
.bonus-pager-btn {
  min-height: 88px;
  padding: 16px;
  border: 1px solid rgba(10, 10, 10, 0.2);
  background: rgba(255, 255, 255, 0.34);
  color: #07101d;
  text-align: left;
  cursor: pointer;
}
.bonus-pager-btn:hover:not(:disabled) {
  border-color: var(--royal-blue);
  background: rgba(0, 70, 135, 0.08);
}
.bonus-pager-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.bonus-pager-btn .mono {
  display: block;
  margin-bottom: 8px;
  color: var(--royal-blue);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.bonus-pager-btn strong {
  display: block;
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.2;
}
.bonus-sources {
  padding: 72px 0;
  border-top: 1px solid var(--rule);
  background: rgba(3, 8, 16, 0.6);
}
.bonus-sources-inner {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) 1.2fr;
  gap: 48px;
}
.bonus-sources-title {
  font-size: clamp(32px, 4vw, 58px);
}
.bonus-source-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.bonus-source-list a {
  padding: 16px;
  border: 1px solid var(--rule);
  color: var(--bone-dim);
  background: rgba(189, 155, 96, 0.03);
}
.bonus-source-list a:hover {
  color: var(--gold);
  border-color: var(--gold);
}
@media (max-width: 980px) {
  .bonus-hero-inner,
  .bonus-reader,
  .bonus-sources-inner {
    grid-template-columns: 1fr;
  }
  .bonus-toc {
    position: static;
    max-height: 360px;
  }
}
@media (max-width: 640px) {
  .bonus-nav {
    padding: 14px 20px;
  }
  .bonus-hero-inner,
  .bonus-reader,
  .bonus-sources-inner {
    padding-left: 22px;
    padding-right: 22px;
  }
  .bonus-hero {
    padding: 70px 0 48px;
  }
  .bonus-pager,
  .bonus-source-list {
    grid-template-columns: 1fr;
  }
  .bonus-chapter {
    padding: 28px 22px;
  }
}
`;
document.head.appendChild(bonusStyles);

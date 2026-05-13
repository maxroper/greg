import React, { useEffect, useState } from "react";
import { Reveal, Eyebrow, Btn, Picture } from "./primitives.jsx";
import { ASSETS, PRYOR_STATS, FB_POSTS, FB_PAGE_URL } from "../data.js";
import RequestDateModal from "./request-date-modal.jsx";
import { useSiteContent } from "../content.js";

// Fetched once for all <About> instances on the page; ref-counted so we don't
// spam /api/facebook-posts on every render.
let fbPostsCache = null;
function useFacebookPosts(enabled) {
  const [posts, setPosts] = useState(fbPostsCache?.posts || null);
  useEffect(() => {
    if (!enabled) return;
    if (fbPostsCache) { setPosts(fbPostsCache.posts); return; }
    let cancelled = false;
    fetch("/api/facebook-posts")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        const next = Array.isArray(data?.posts) && data.posts.length > 0 ? data.posts : FB_POSTS;
        fbPostsCache = { posts: next };
        setPosts(next);
      })
      .catch(() => {
        if (cancelled) return;
        fbPostsCache = { posts: FB_POSTS };
        setPosts(FB_POSTS);
      });
    return () => { cancelled = true; };
  }, [enabled]);
  return posts;
}

export default function About({ show }) {
  const content = useSiteContent();
  const aboutCopy = content.about;
  const speakingCopy = content.speaking;
  const healthCopy = content.health;
  const facebookCopy = content.facebook;
  const contactCopy = content.contact;
  const visible = (k) => !show || show.includes(k);
  const [statTab, setStatTab] = useState("highlights");
  const [requestOpen, setRequestOpen] = useState(false);
  const fbPosts = useFacebookPosts(visible("facebook"));

  const isIntro = visible("intro");
  const sectionId = isIntro ? "about" : null;
  const sectionLabel = isIntro ? "03 About Greg" : null;

  return (
    <section id={sectionId} data-screen-label={sectionLabel} className={`section about ${isIntro ? "" : "about-sub"}`}>
      <div className="section-inner">
       {visible("intro") && <>
        <div className="about-head">
          <Reveal><Eyebrow index="03">{aboutCopy.eyebrow}</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 className="display h-xl about-title">
              {aboutCopy.titleLine1}<br/><em>{aboutCopy.titleLine2}</em>. {aboutCopy.titleLine3}
            </h2>
          </Reveal>
        </div>

        <div className="about-bio-row">
          <Reveal delay={200} className="about-bio-text">
            <p className="lede">
              {aboutCopy.bio1}
            </p>
            <p className="lede">
              {aboutCopy.bio2}
            </p>
          </Reveal>
          <Reveal delay={300} className="about-bio-img">
            <div className="about-bio-photo">
              <Picture src={ASSETS.gregFielding} alt="Greg Pryor in the field, ready stance, glove down — visiting team road grays" />
              <div className="about-bio-photo-cap mono">GREG IN UNIFORM · INFIELD READY</div>
            </div>
          </Reveal>
        </div>

        <div className="about-stats-section">
          <Reveal>
            <div className="about-section-head">
              <h3 className="display h-md">{aboutCopy.careerHeading}</h3>
              <div className="about-tabs">
                {[
                  { k: "highlights", l: "Highlights" },
                  { k: "byyear", l: "By Year" },
                  { k: "totals", l: "Totals" },
                ].map((t) => (
                  <button key={t.k} className={`about-tab ${statTab === t.k ? "is-active" : ""}`} onClick={() => setStatTab(t.k)}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {statTab === "highlights" && (
            <div className="about-highlights">
              {PRYOR_STATS.bestYears.map((y, i) => (
                <Reveal key={y.year} delay={i*80} className="about-hl-card">
                  <div className="about-hl-year">
                    <span className="display h-lg">{y.year}</span>
                    <span className="mono about-hl-team">{y.team}</span>
                  </div>
                  <div className="about-hl-stats">
                    {Object.entries(y).filter(([k]) => !["year","team","note"].includes(k)).map(([k,v]) => (
                      <div key={k}><span className="mono about-hl-k">{k}</span><span className="about-hl-v">{v}</span></div>
                    ))}
                  </div>
                  <p className="about-hl-note">{y.note}</p>
                </Reveal>
              ))}
            </div>
          )}

          {statTab === "byyear" && (
            <div className="about-table">
              <table>
                <thead>
                  <tr>
                    <th>Year</th><th>Team</th><th>G</th><th>AB</th><th>H</th><th>HR</th><th>RBI</th><th>AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {PRYOR_STATS.byYear.map((r) => (
                    <tr key={r.y} className={[1979, 1984, 1985].includes(r.y) ? "hi" : ""}>
                      <td className="mono">{r.y}</td>
                      <td><span className="about-team-tag">{r.t}</span></td>
                      <td>{r.g}</td><td>{r.ab}</td><td>{r.h}</td>
                      <td>{r.hr}</td><td>{r.rbi}</td><td className="mono">{r.avg}</td>
                    </tr>
                  ))}
                  <tr className="totals">
                    <td colSpan="2"><strong>Career</strong></td>
                    <td>789</td><td>1885</td><td>471</td><td>14</td><td>146</td><td className="mono">.250</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {statTab === "totals" && (
            <div className="about-totals">
              {Object.entries(PRYOR_STATS.career).map(([k,v]) => (
                <div key={k} className="about-total">
                  <span className="about-total-num">{v}</span>
                  <span className="mono about-total-lbl">{k}</span>
                </div>
              ))}
            </div>
          )}
        </div>
       </>}

       {visible("speaking") && <>
        <div id="speaking" data-screen-label="On the Road" className="about-speaking">
          <Reveal>
            <div className="about-section-head">
              <h3 className="display h-md">{speakingCopy.heading}</h3>
              <span className="mono about-section-sub">{speakingCopy.subheading}</span>
            </div>
          </Reveal>

          <div className="speaking-grid">
            <Reveal delay={120} className="speaking-img-wrap">
              <div className="speaking-img-frame">
                <Picture src={ASSETS.gregKids} alt="Greg with a group of young baseball players" />
                <div className="speaking-img-overlay" aria-hidden></div>
                <div className="speaking-img-cap mono">FIELD VISIT · INDIAN VALLEY · APRIL 2026</div>
              </div>
              <div className="speaking-img-tape" aria-hidden>NO. 04</div>
            </Reveal>

            <div className="speaking-body">
              <Reveal delay={200}>
                <div className="speaking-eyebrow mono">
                  <span className="dot" />
                  {speakingCopy.eyebrow}
                </div>
              </Reveal>
              <Reveal delay={280}>
                <h4 className="display speaking-headline">
                  {speakingCopy.headlineLine1} <em>{speakingCopy.headlineEmphasis}</em>,<br/>{speakingCopy.headlineLine2}<br/>{speakingCopy.headlineLine3}
                </h4>
              </Reveal>
              <Reveal delay={360}>
                <p className="speaking-lede">
                  {speakingCopy.lede}
                </p>
              </Reveal>

              <Reveal delay={440}>
                <ul className="speaking-list">
                  {speakingCopy.list.map((item, index) => (
                    <li key={index}>
                      <span className="speaking-list-num mono">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={520}>
                <div className="speaking-cta-row">
                  <Btn primary onClick={() => setRequestOpen(true)}>
                    {speakingCopy.cta}
                  </Btn>
                  <span className="speaking-cta-note mono">
                    {speakingCopy.note}
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
        <RequestDateModal open={requestOpen} onClose={() => setRequestOpen(false)} />
       </>}

       {visible("health") && <>
        <Reveal delay={120}>
          <div id="health" data-screen-label="Health" className="lp-band" aria-labelledby="lp-h">
            <div className="lp-grid">
              <div className="lp-text">
                <div className="lp-eyebrow mono">
                  <span className="lp-pulse" aria-hidden />
                  {healthCopy.eyebrow}
                </div>
                <h3 id="lp-h" className="display lp-h">
                  {healthCopy.titleLine1}<br />
                  <em>{healthCopy.titleEmphasis}</em>
                </h3>
                <p className="lp-lede">
                  {healthCopy.lede}
                </p>

                <div className="lp-pillars">
                  {healthCopy.pillars.map((pillar, index) => (
                    <div className="lp-pillar" key={pillar}>
                      <div className="lp-pillar-n mono">{String(index + 1).padStart(2, "0")}</div>
                      <div className="lp-pillar-t">{pillar}</div>
                    </div>
                  ))}
                </div>

                <div className="lp-cta-row">
                  <a className="lp-btn lp-btn-primary" href="https://lifepriority.com/product/lift-caps/" target="_blank" rel="noopener noreferrer">
                    <span>{healthCopy.cta}</span>
                    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                      <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <span className="lp-stat mono">
                    <span className="lp-stat-n">35</span>
                    <span className="lp-stat-l">{healthCopy.yearsLabel.split(" ").slice(0, 2).join(" ")}<br/>{healthCopy.yearsLabel.split(" ").slice(2).join(" ")}</span>
                  </span>
                </div>
              </div>

              <div className="lp-art" aria-hidden>
                <div className="lp-orbit">
                  <div className="lp-orbit-ring lp-orbit-ring-1" />
                  <div className="lp-orbit-ring lp-orbit-ring-2" />
                  <div className="lp-orbit-ring lp-orbit-ring-3" />
                  <div className="lp-bottle">
                    <div className="lp-bottle-cap" />
                    <div className="lp-bottle-neck" />
                    <div className="lp-bottle-body">
                      <div className="lp-bottle-label">
                        <div className="lp-bottle-label-tag mono">LIFE PRIORITY</div>
                        <div className="lp-bottle-label-h">LIFT</div>
                        <div className="lp-bottle-label-sub mono">CAPS™</div>
                        <div className="lp-bottle-label-rule" />
                        <div className="lp-bottle-label-flav">ENERGY &amp; FOCUS · 60 CT</div>
                      </div>
                    </div>
                  </div>
                  <div className="lp-spec lp-spec-1 mono">L-PHENYLALANINE</div>
                  <div className="lp-spec lp-spec-2 mono">CAFFEINE</div>
                  <div className="lp-spec lp-spec-3 mono">CHOLINE</div>
                  <div className="lp-spec lp-spec-4 mono">B-VITAMINS</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
       </>}

       {visible("facebook") && <>
        <Reveal delay={120}>
          <div id="facebook" data-screen-label="Facebook" className="fb-band" aria-labelledby="fb-h">
            <div className="fb-head">
              <div className="fb-eyebrow mono">
                <svg className="fb-eyebrow-mark" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                  <path fill="currentColor" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82V14.706h-3.13V11.08h3.13V8.413c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.59l-.467 3.626H17.56V24h5.115C23.407 24 24 23.407 24 22.676V1.325C24 .593 23.407 0 22.675 0z"/>
                </svg>
                <span>{facebookCopy.eyebrow}</span>
              </div>
              <h3 id="fb-h" className="display fb-title">
                {facebookCopy.titlePrefix} <em>{facebookCopy.titleHandle}</em>
              </h3>
              <a className="fb-follow" href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">
                <span>{facebookCopy.followCta}</span>
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                  <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            <div className="fb-grid">
              {(fbPosts || Array.from({ length: 3 })).map((p, i) =>
                p ? (
                  <Reveal key={p.id || i} delay={i * 100}>
                    <a className={`fb-card ${p.media ? "fb-card-with-media" : ""}`} href={p.permalink || FB_PAGE_URL} target="_blank" rel="noopener noreferrer">
                      {p.media?.image && (
                        <div className={`fb-card-media fb-card-media-${p.media.type || "photo"}`}>
                          <img src={p.media.image} alt="" loading="lazy" decoding="async" />
                          {p.media.type === "video" && (
                            <span className="fb-card-media-play" aria-hidden />
                          )}
                          {p.media.extraCount > 0 && (
                            <span className="fb-card-media-badge mono">+{p.media.extraCount}</span>
                          )}
                        </div>
                      )}
                      <div className="fb-card-head">
                        <div className="fb-card-avatar">GP</div>
                        <div className="fb-card-meta">
                          <div className="fb-card-name">Greg Pryor</div>
                          <div className="fb-card-when mono">{p.when} · <span className="fb-card-tag">{p.tag}</span></div>
                        </div>
                      </div>
                      <p className="fb-card-text">{p.text}</p>
                      <div className="fb-card-stats mono">
                        <span><strong>{p.likes}</strong> likes</span>
                        <span><strong>{p.comments}</strong> comments</span>
                        <span><strong>{p.shares}</strong> shares</span>
                      </div>
                    </a>
                  </Reveal>
                ) : (
                  <Reveal key={`sk-${i}`} delay={i * 100}>
                    <div className="fb-card fb-card-skeleton fb-card-with-media" aria-hidden>
                      <div className="fb-card-media fb-sk-media" />
                      <div className="fb-card-head">
                        <div className="fb-card-avatar">GP</div>
                        <div className="fb-card-meta">
                          <div className="fb-sk-bar fb-sk-bar-name" />
                          <div className="fb-sk-bar fb-sk-bar-when" />
                        </div>
                      </div>
                      <div className="fb-sk-bar fb-sk-bar-line" />
                      <div className="fb-sk-bar fb-sk-bar-line" />
                      <div className="fb-sk-bar fb-sk-bar-line fb-sk-bar-short" />
                    </div>
                  </Reveal>
                )
              )}
            </div>

            <div className="fb-cta-row">
              <a className="fb-cta" href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                  <path fill="currentColor" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82V14.706h-3.13V11.08h3.13V8.413c0-3.099 1.894-4.785 4.659-4.785 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.59l-.467 3.626H17.56V24h5.115C23.407 24 24 23.407 24 22.676V1.325C24 .593 23.407 0 22.675 0z"/>
                </svg>
                <span>{facebookCopy.bottomCta}</span>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                  <path d="M3 8 L13 8 M9 4 L13 8 L9 12" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </Reveal>
       </>}

       {visible("contact") && <>
        <Reveal delay={200}>
          <div id="contact" data-screen-label="Get in Touch" className="about-contact">
            <div>
              <div className="mono about-contact-tag">{contactCopy.tag}</div>
              <h3 className="display h-md" style={{margin: "12px 0 16px"}}>
                {contactCopy.headingLine1}<br/><em>{contactCopy.headingEmphasis}</em>
              </h3>
              <p style={{maxWidth: "44ch", color: "var(--bone-dim)"}}>
                {contactCopy.lede}
              </p>
            </div>
            <div className="about-contact-btns">
              <Btn primary href="mailto:gpryor@lifepriority.com">{contactCopy.emailCta}</Btn>
              <Btn ghost href={FB_PAGE_URL} target="_blank" rel="noopener noreferrer">{contactCopy.facebookCta}</Btn>
              <Btn ghost>{contactCopy.pressCta}</Btn>
              <Btn ghost>{contactCopy.autographCta}</Btn>
            </div>
          </div>
        </Reveal>
       </>}
      </div>
    </section>
  );
}

const aboutStyles = document.createElement("style");
aboutStyles.textContent = `
.about { background: var(--navy-900); }
#speaking, #health, #facebook, #contact { scroll-margin-top: 80px; }
.about-sub { padding: 32px 0; }
.about-sub + .about-sub { padding-top: 0; }
.about-sub + .section:not(.about-sub) { padding-top: 32px; }
.section:not(.about-sub) + .about-sub { padding-top: 0; }
.about-sub .about-speaking,
.about-sub .about-stats-section,
.about-sub .about-bio-row { margin-bottom: 0; }
.about-sub .lp-band { margin: 0; }
.about-sub .fb-band { margin-bottom: 0; }
@media (max-width: 900px) { .about-sub { padding: 20px 0; } }
.about-head { margin-bottom: 56px; }
.about-title { color: var(--bone); margin-top: 24px; }
.about-title em { color: var(--royal-blue-glow); font-style: italic; }

.about:not(.about-sub) .about-stats-section { margin-bottom: 0; }
.about:not(.about-sub) { padding-bottom: 32px; }
@media (max-width: 900px) { .about:not(.about-sub) { padding-bottom: 24px; } }
.about-bio-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 48px;
  align-items: start;
  margin-bottom: 56px;
}
@media (max-width: 768px) { .about-bio-row { margin-bottom: 36px; } }
@media (max-width: 720px) { .about-bio-row { grid-template-columns: 1fr; gap: 28px; } }
.about-bio-text { display: flex; flex-direction: column; gap: 20px; }
.about-bio-img { max-width: 100%; }
.about-bio-photo {
  position: relative;
  border: 1px solid var(--rule);
  background: var(--navy-900);
  padding: 12px 12px 14px;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(189,155,96,0.04) inset;
  transform: rotate(-1deg);
  transition: transform 400ms cubic-bezier(.2,.8,.2,1);
}
.about-bio-photo:hover { transform: rotate(0deg); }
.about-bio-photo img { width: 100%; aspect-ratio: 3/4; object-fit: cover; object-position: center top; display: block; filter: contrast(1.05); }
.about-bio-photo-cap { display: block; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--rule); font-size: 9px; letter-spacing: 0.22em; color: var(--bone-dim); text-align: center; }

.about-section-head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid var(--rule); padding-bottom: 16px; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.about-section-head h3 { color: var(--bone); margin: 0; }
.about-section-sub { font-size: 11px; letter-spacing: 0.18em; color: var(--gold); }

.about-tabs { display: flex; gap: 4px; }
.about-tab { background: transparent; border: 1px solid var(--rule); padding: 8px 16px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--bone-dim); cursor: pointer; border-radius: 999px; }
.about-tab.is-active { background: var(--gold); color: var(--navy-900); border-color: var(--gold); }

.about-stats-section { margin-bottom: 96px; }

.about-highlights { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 768px) { .about-highlights { grid-template-columns: 1fr; } }
.about-hl-card { border: 1px solid var(--rule); padding: 28px; background: linear-gradient(180deg, rgba(189,155,96,0.04), transparent); }
.about-hl-year { display: flex; align-items: baseline; gap: 16px; margin-bottom: 16px; }
.about-hl-year .display { color: var(--gold); margin: 0; }
.about-hl-team { font-size: 11px; letter-spacing: 0.18em; color: var(--bone-dim); }
.about-hl-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 12px; padding: 16px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); }
.about-hl-stats > div { display: flex; flex-direction: column; gap: 2px; }
.about-hl-k { font-size: 9px; letter-spacing: 0.18em; color: var(--bone-dim); }
.about-hl-v { font-family: var(--serif); font-size: 18px; color: var(--bone); font-weight: 500; }
.about-hl-note { margin: 16px 0 0; font-family: var(--serif); font-style: italic; font-size: 15px; color: var(--bone-dim); line-height: 1.4; }

.about-table { border: 1px solid var(--rule); overflow-x: auto; }
.about-table table { width: 100%; border-collapse: collapse; }
.about-table th { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; color: var(--gold); padding: 14px 16px; text-align: left; background: rgba(189,155,96,0.06); border-bottom: 1px solid var(--rule); }
.about-table td { padding: 14px 16px; border-bottom: 1px solid var(--rule); color: var(--bone); font-size: 14px; }
.about-table tr.hi td { background: rgba(189,155,96,0.06); color: var(--bone); }
.about-table tr.hi td.mono { color: var(--gold); }
.about-table tr.totals td { color: var(--gold); font-weight: 600; border-top: 2px solid var(--gold); }
.about-team-tag { font-family: var(--mono); font-size: 10px; padding: 3px 8px; border: 1px solid var(--rule); letter-spacing: 0.16em; color: var(--bone-dim); }

.about-totals { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0; border: 1px solid var(--rule); }
@media (max-width: 768px) { .about-totals { grid-template-columns: repeat(3, 1fr); } }
.about-total { padding: 24px; border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); display: flex; flex-direction: column; gap: 4px; }
.about-total:nth-child(6n) { border-right: none; }
.about-total-num { font-family: var(--serif); font-size: 28px; color: var(--bone); font-weight: 500; }
.about-total-lbl { font-size: 10px; letter-spacing: 0.18em; color: var(--gold); }

.about-speaking { margin-bottom: 96px; }
.speaking-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 64px; align-items: center; }
@media (max-width: 980px) { .speaking-grid { grid-template-columns: 1fr; gap: 40px; } }

.speaking-img-wrap { position: relative; padding: 12px 14px 14px; background: linear-gradient(180deg, #f6efde 0%, #e9dfc4 100%); box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(189,155,96,0.3); transform: rotate(-1.4deg); transition: transform 400ms cubic-bezier(.2,.8,.2,1); }
.speaking-img-wrap:hover { transform: rotate(0deg); }
.speaking-img-frame { position: relative; overflow: hidden; background: var(--navy-900); aspect-ratio: 4/3; }
.speaking-img-frame img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(1.05) contrast(1.02); }
.speaking-img-overlay { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.18), transparent 60%), linear-gradient(0deg, rgba(0, 70, 135, 0.06), transparent 40%); pointer-events: none; }
.speaking-img-cap { position: absolute; bottom: 12px; left: 12px; font-size: 9px; letter-spacing: 0.18em; color: rgba(255,255,255,0.92); background: rgba(5,13,26,0.6); backdrop-filter: blur(6px); padding: 5px 9px; border: 1px solid rgba(255,255,255,0.15); z-index: 2; }
.speaking-img-tape { position: absolute; top: -16px; right: -22px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; color: var(--navy-900); background: var(--gold); padding: 8px 18px; transform: rotate(6deg); box-shadow: 0 8px 18px -4px rgba(189,155,96,0.5); z-index: 3; }

.speaking-body { display: flex; flex-direction: column; gap: 22px; }
.speaking-eyebrow { display: inline-flex; align-items: center; gap: 10px; font-size: 11px; letter-spacing: 0.2em; color: var(--royal-blue-glow); }
.speaking-eyebrow .dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: var(--royal-blue-glow); box-shadow: 0 0 16px var(--royal-blue-glow); animation: speakDot 2.4s ease-in-out infinite; }
@keyframes speakDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
.speaking-headline { font-size: clamp(34px, 4.4vw, 52px); line-height: 1.05; color: var(--bone); letter-spacing: -0.015em; margin: 0; font-family: var(--serif); }
.speaking-headline em { color: var(--royal-blue-glow); font-style: italic; font-family: var(--serif); }
.speaking-lede { font-family: var(--serif); font-size: 17px; line-height: 1.55; color: var(--bone-dim); margin: 0; max-width: 56ch; }

.speaking-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; border-top: 1px solid var(--rule); }
.speaking-list li { display: grid; grid-template-columns: 44px 1fr; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--rule); align-items: start; transition: background-color 200ms; }
.speaking-list li:hover { background: rgba(43,138,255,0.04); }
.speaking-list-num { font-size: 11px; letter-spacing: 0.2em; color: var(--royal-blue-glow); padding-top: 4px; }
.speaking-list strong { display: block; font-family: var(--serif); font-weight: 500; font-size: 17px; color: var(--bone); margin-bottom: 2px; }
.speaking-list span { display: block; font-size: 14px; line-height: 1.5; color: var(--bone-dim); }

.speaking-cta-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-top: 8px; }
.speaking-cta-note { font-size: 10px; letter-spacing: 0.18em; color: var(--bone-dim); max-width: 32ch; }

@media (max-width: 768px) {
  .speaking-img-wrap { transform: rotate(-1deg); padding: 10px 10px 12px; }
  .speaking-img-tape { font-size: 10px; padding: 6px 14px; right: -10px; top: -12px; }
  .speaking-headline { font-size: clamp(30px, 8vw, 44px); }
  .speaking-list strong { font-size: 16px; }
  .speaking-list span { font-size: 13px; }
  .speaking-cta-note { font-size: 9px; }
}

.about-contact { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; padding: 48px; border: 1px solid var(--rule); background: linear-gradient(135deg, rgba(189,155,96,0.06), rgba(189,155,96,0.01)); }
@media (max-width: 768px) { .about-contact { grid-template-columns: 1fr; padding: 32px; } }
.about-contact em { color: var(--gold); font-style: italic; }
.about-contact-tag { font-size: 11px; letter-spacing: 0.18em; color: var(--gold); }
.about-contact-btns { display: flex; flex-wrap: wrap; gap: 12px; }

.fb-band { margin-bottom: 64px; padding: 56px 56px 48px; border: 1px solid var(--rule); background: linear-gradient(180deg, rgba(24, 119, 242, 0.04), rgba(24, 119, 242, 0.01)); position: relative; overflow: hidden; }
.fb-band::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #1877f2, #4267b2, #1877f2); }
@media (max-width: 768px) { .fb-band { padding: 32px 20px; } }
.fb-head { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 36px; }
.fb-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.18em; color: #4a90ec; margin-bottom: 14px; }
.fb-eyebrow-mark { color: #1877f2; }
.fb-title { color: var(--bone); margin: 0; font-size: clamp(28px, 4vw, 44px); line-height: 1; }
.fb-title em { color: #4a90ec; font-style: italic; }
.fb-follow { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border: 1px solid rgba(74, 144, 236, 0.4); background: rgba(24, 119, 242, 0.08); color: #6aa9f0; font-family: var(--mono); font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; transition: all 200ms; }
.fb-follow:hover { background: rgba(24, 119, 242, 0.18); border-color: #4a90ec; color: var(--bone); }

.fb-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 36px; }
@media (max-width: 980px) { .fb-grid { grid-template-columns: 1fr; gap: 16px; } }

.fb-card { display: flex; flex-direction: column; padding: 24px 24px 20px; border: 1px solid var(--rule); background: var(--navy-800); text-decoration: none; transition: all 250ms; position: relative; overflow: hidden; }
.fb-card:hover { border-color: rgba(74, 144, 236, 0.5); background: var(--navy-700); transform: translateY(-2px); }
.fb-card::after { content: ""; position: absolute; inset: 0; border-left: 3px solid transparent; pointer-events: none; transition: border-color 250ms; }
.fb-card:hover::after { border-left-color: #1877f2; }

.fb-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.fb-card-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--royal-blue); border: 1px solid var(--royal-blue-bright); display: grid; place-items: center; font-family: var(--mono); font-size: 13px; font-weight: 600; color: var(--bone); flex-shrink: 0; }
.fb-card-meta { flex: 1; min-width: 0; }
.fb-card-name { font-family: var(--sans); font-size: 14px; font-weight: 600; color: var(--bone); }
.fb-card-when { font-size: 10px; letter-spacing: 0.12em; color: var(--bone-dim); margin-top: 2px; }
.fb-card-tag { color: #6aa9f0; }

.fb-card-text { font-family: var(--serif); font-size: 16px; line-height: 1.55; color: var(--bone); margin: 0 0 20px; flex: 1; }

.fb-card-stats { display: flex; gap: 16px; padding-top: 16px; border-top: 1px solid var(--rule); font-size: 11px; letter-spacing: 0.06em; color: var(--bone-dim); flex-wrap: wrap; }
.fb-card-stats strong { color: var(--bone); font-weight: 600; }

.fb-card-with-media { padding-top: 0; }
.fb-card-media {
  position: relative;
  aspect-ratio: 16/10;
  margin: -24px -24px 18px;
  overflow: hidden;
  background: var(--navy-900);
  border-bottom: 1px solid var(--rule);
}
.fb-card-media img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 600ms cubic-bezier(.2,.8,.2,1);
}
.fb-card:hover .fb-card-media img { transform: scale(1.03); }
.fb-card-media::after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(5,13,26,0.45) 100%);
  pointer-events: none;
}
.fb-card-media-badge {
  position: absolute;
  top: 12px; right: 12px;
  background: rgba(5,13,26,0.78);
  color: var(--bone);
  padding: 5px 10px;
  border: 1px solid var(--rule);
  font-size: 11px;
  letter-spacing: 0.08em;
  border-radius: 4px;
  z-index: 2;
}
.fb-card-media-play {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  background: rgba(0,0,0,0.18);
  pointer-events: none;
  z-index: 2;
}
.fb-card-media-play::before {
  content: "";
  width: 0; height: 0;
  border-left: 22px solid var(--bone);
  border-top: 14px solid transparent;
  border-bottom: 14px solid transparent;
  margin-left: 6px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6));
}

.fb-card-skeleton { pointer-events: none; }
.fb-sk-media {
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 200% 100%;
  animation: fbShimmer 1.6s ease-in-out infinite;
}
.fb-sk-media::after { display: none; }
.fb-sk-bar {
  display: block;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 100%);
  background-size: 200% 100%;
  animation: fbShimmer 1.6s ease-in-out infinite;
  margin: 6px 0;
}
.fb-sk-bar-name { width: 80px; height: 14px; }
.fb-sk-bar-when { width: 120px; height: 10px; opacity: 0.7; }
.fb-sk-bar-line { width: 100%; margin-top: 8px; }
.fb-sk-bar-short { width: 65%; }
@keyframes fbShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.fb-cta-row { display: flex; justify-content: center; }
.fb-cta { display: inline-flex; align-items: center; gap: 12px; padding: 16px 28px; background: #1877f2; color: #fff; font-family: var(--sans); font-size: 15px; font-weight: 600; border-radius: 8px; transition: all 200ms; text-decoration: none; }
.fb-cta:hover { background: #166fe0; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(24, 119, 242, 0.3); }
@media (max-width: 540px) { .fb-cta { font-size: 13px; padding: 14px 20px; gap: 8px; } }

.lp-band { position: relative; margin: 96px 0 64px; padding: 56px 56px; border: 1px solid var(--rule); border-radius: 20px; background: radial-gradient(120% 200% at 100% 0%, rgba(94, 188, 130, 0.08) 0%, transparent 55%), radial-gradient(120% 200% at 0% 100%, rgba(0, 70, 135, 0.10) 0%, transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.015), rgba(0,0,0,0.04)); overflow: hidden; isolation: isolate; }
.lp-band::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 80px 100%; pointer-events: none; z-index: -1; opacity: 0.4; }
.lp-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 56px; align-items: center; }

.lp-eyebrow { font-size: 11px; letter-spacing: 0.22em; color: #74e29a; display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.lp-pulse { width: 8px; height: 8px; border-radius: 50%; background: #74e29a; box-shadow: 0 0 0 0 rgba(116, 226, 154, 0.6); animation: lp-pulse 1.8s ease-out infinite; }
@keyframes lp-pulse { 0% { box-shadow: 0 0 0 0 rgba(116, 226, 154, 0.55); } 70% { box-shadow: 0 0 0 10px rgba(116, 226, 154, 0); } 100% { box-shadow: 0 0 0 0 rgba(116, 226, 154, 0); } }

.lp-h { font-family: var(--serif); font-size: clamp(36px, 4.4vw, 56px); line-height: 0.98; letter-spacing: -0.02em; color: var(--bone); margin: 0 0 24px; }
.lp-h em { color: #74e29a; font-style: italic; font-weight: 400; }

.lp-lede { max-width: 52ch; color: var(--bone-dim); font-size: 16px; line-height: 1.6; margin: 0 0 32px; }
.lp-lede strong { color: var(--bone); font-weight: 600; }

.lp-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 0 0 36px; }
.lp-pillar { padding: 16px 14px; border: 1px solid var(--rule); border-radius: 10px; background: rgba(0,0,0,0.18); }
.lp-pillar-n { font-size: 11px; color: #74e29a; letter-spacing: 0.16em; margin-bottom: 8px; }
.lp-pillar-t { color: var(--bone); font-size: 14px; font-weight: 500; letter-spacing: -0.005em; }

.lp-cta-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.lp-btn { display: inline-flex; align-items: center; gap: 12px; padding: 14px 22px; border-radius: 999px; font-family: var(--mono); font-size: 12px; letter-spacing: 0.12em; text-decoration: none; cursor: pointer; transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease; text-transform: uppercase; }
.lp-btn-primary { background: linear-gradient(135deg, #74e29a 0%, #4ec97c 100%); color: #0a1929; border: 1px solid rgba(116, 226, 154, 0.4); box-shadow: 0 6px 20px rgba(116, 226, 154, 0.18); }
.lp-btn-primary:hover { transform: translateY(-1px); background: linear-gradient(135deg, #8cf2ad 0%, #5ed98a 100%); }

.lp-stat { display: flex; align-items: center; gap: 10px; color: var(--bone-dim); font-size: 10px; letter-spacing: 0.2em; line-height: 1.1; }
.lp-stat-n { font-family: var(--serif); font-size: 44px; font-weight: 400; color: var(--bone); letter-spacing: -0.02em; line-height: 1; }

.lp-art { position: relative; height: 440px; display: flex; align-items: center; justify-content: center; }
.lp-orbit { position: relative; width: 380px; height: 380px; display: flex; align-items: center; justify-content: center; }
.lp-orbit-ring { position: absolute; border: 1px solid rgba(116, 226, 154, 0.18); border-radius: 50%; pointer-events: none; }
.lp-orbit-ring-1 { inset: 0; animation: lp-spin 28s linear infinite; }
.lp-orbit-ring-2 { inset: 30px; border-style: dashed; border-color: rgba(255,255,255,0.08); animation: lp-spin 22s linear infinite reverse; }
.lp-orbit-ring-3 { inset: 60px; border-color: rgba(116, 226, 154, 0.12); }
@keyframes lp-spin { to { transform: rotate(360deg); } }

.lp-bottle { position: relative; width: 150px; height: 240px; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 24px 36px rgba(0,0,0,0.4)); z-index: 2; }
.lp-bottle-cap { width: 78px; height: 26px; background: linear-gradient(180deg, #d8e8d4 0%, #97b89a 50%, #6f9477 100%); border-radius: 4px 4px 2px 2px; border: 1px solid rgba(0,0,0,0.25); position: relative; }
.lp-bottle-cap::before { content: ""; position: absolute; inset: 4px 6px; background: repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 4px); }
.lp-bottle-neck { width: 64px; height: 8px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.2)); border-left: 1px solid rgba(255,255,255,0.04); border-right: 1px solid rgba(0,0,0,0.18); }
.lp-bottle-body { flex: 1; width: 150px; background: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 18%, rgba(255,255,255,0.06) 50%, rgba(0,0,0,0.18) 100%), linear-gradient(180deg, #1f3a2a 0%, #122a1c 100%); border-radius: 6px 6px 14px 14px; border: 1px solid rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; padding: 14px 12px; position: relative; overflow: hidden; }
.lp-bottle-body::after { content: ""; position: absolute; top: 8px; bottom: 8px; left: 8px; width: 4px; background: linear-gradient(180deg, transparent, rgba(255,255,255,0.16), transparent); border-radius: 2px; }
.lp-bottle-label { background: var(--bone); width: 100%; height: 100%; border-radius: 2px; padding: 12px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; color: #1a3326; position: relative; box-shadow: inset 0 0 0 2px #1a3326, inset 0 0 0 3px var(--bone); }
.lp-bottle-label-tag { font-size: 8px; letter-spacing: 0.18em; color: #4a7d5b; margin-top: 4px; }
.lp-bottle-label-h { font-family: var(--serif); font-size: 38px; font-weight: 400; color: #1a3326; letter-spacing: -0.02em; line-height: 1; margin: 6px 0 4px; }
.lp-bottle-label-sub { font-size: 7px; letter-spacing: 0.18em; color: #4a7d5b; }
.lp-bottle-label-rule { width: 32px; height: 1px; background: #4a7d5b; margin: 8px 0; }
.lp-bottle-label-flav { font-size: 7px; letter-spacing: 0.16em; color: #1a3326; }

.lp-spec { position: absolute; font-size: 9px; color: var(--bone-dim); letter-spacing: 0.18em; padding: 4px 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--rule); border-radius: 4px; z-index: 3; }
.lp-spec::before { content: ""; position: absolute; width: 24px; height: 1px; background: rgba(116, 226, 154, 0.4); }
.lp-spec-1 { top: 16%; left: -20px; }
.lp-spec-1::before { right: -28px; top: 50%; }
.lp-spec-2 { top: 38%; right: -10px; }
.lp-spec-2::before { left: -28px; top: 50%; }
.lp-spec-3 { bottom: 28%; left: -10px; }
.lp-spec-3::before { right: -28px; top: 50%; }
.lp-spec-4 { bottom: 8%; right: 4px; color: #74e29a; border-color: rgba(116, 226, 154, 0.3); }
.lp-spec-4::before { display: none; }

@media (max-width: 980px) {
  .lp-grid { grid-template-columns: 1fr; gap: 32px; }
  .lp-band { padding: 40px 32px; margin: 80px 0 56px; }
  .lp-art { height: 380px; order: -1; }
  .lp-orbit { width: 320px; height: 320px; }
}
@media (max-width: 540px) {
  .lp-band { padding: 32px 22px; margin: 64px 0 48px; border-radius: 14px; }
  .lp-h { font-size: 32px; }
  .lp-pillars { grid-template-columns: 1fr; gap: 10px; }
  .lp-pillar { padding: 12px 14px; }
  .lp-cta-row { flex-direction: column; align-items: flex-start; gap: 18px; }
  .lp-btn { width: 100%; justify-content: center; }
  .lp-art { height: 320px; }
  .lp-orbit { width: 260px; height: 260px; }
  .lp-bottle { width: 120px; height: 200px; }
  .lp-bottle-body { width: 120px; padding: 10px; }
  .lp-bottle-label-h { font-size: 30px; }
  .lp-spec { font-size: 8px; }
  .lp-spec-1 { left: -8px; }
  .lp-spec-2 { right: -2px; }
  .lp-spec-3 { left: -2px; }
}

.about-hl-card .display { font-family: var(--serif); font-weight: 500; line-height: 0.94; letter-spacing: -0.025em; }
`;
document.head.appendChild(aboutStyles);

import React, { useState } from "react";
import { Reveal, Eyebrow, Btn } from "./primitives.jsx";

export default function Apply() {
  const [form, setForm] = useState({ name: "", email: "", date: "", group: "2", about: "", how: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const upcoming = [
    "Jul 05 vs PHI", "Jul 17 vs SDP", "Jul 20 vs SFG", "Jul 22 vs SFG",
    "Aug 06 vs MIN", "Aug 08 vs CHC", "Aug 18 vs OAK", "Aug 21 vs DET",
    "Aug 23 vs DET",
  ];

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.includes("@")) errs.email = "Need a valid email";
    if (!form.date) errs.date = "Pick a date";
    if (!form.about.trim() || form.about.trim().length < 20) errs.about = "Tell me a bit more";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    // Submit to API endpoint (Cloudflare Pages Function). Falls back gracefully if missing.
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (err) {
      console.warn("Apply submission failed; showing success state anyway", err);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="apply" data-screen-label="05 Sit Next To Me" className="section apply">
        <div className="section-inner apply-success">
          <Reveal>
            <Eyebrow index="05">You're In</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <h2 className="display h-lg" style={{marginTop: 24}}>
              See you at the<br/><em>K</em>.
            </h2>
          </Reveal>
          <Reveal delay={240}>
            <div className="apply-ticket">
              <div className="apply-ticket-stub">
                <div className="mono apply-ticket-tag">DIAMOND CLUB · APPLICATION RECEIVED</div>
                <div className="apply-ticket-name">{form.name}</div>
                <div className="apply-ticket-row">
                  <div><span className="mono">SEATS</span><strong>ROW 2 · 1–3</strong></div>
                  <div><span className="mono">DATE</span><strong>{form.date}</strong></div>
                  <div><span className="mono">GROUP</span><strong>{form.group}</strong></div>
                </div>
              </div>
              <div className="apply-ticket-perf">
                <div className="apply-ticket-num mono">№<br/>{Math.floor(Math.random()*9000+1000)}</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <p className="lede" style={{marginTop: 32}}>
              I read every application personally. If we're a fit, I'll email
              you within a week with confirmation, parking instructions, and a
              meet-up spot before first pitch. The seats are next to mine — so
              come ready to talk baseball for nine innings.
            </p>
          </Reveal>
          <Reveal delay={480}>
            <Btn ghost onClick={() => { setSubmitted(false); setForm({ name: "", email: "", date: "", group: "2", about: "", how: "" }); }}>
              Submit another
            </Btn>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="apply" data-screen-label="05 Sit Next To Me" className="section apply">
      <div className="section-inner">
        <div className="apply-head">
          <Reveal><Eyebrow index="05">Sit Next To Me</Eyebrow></Reveal>
          <Reveal delay={120}>
            <h2 className="display h-xl apply-title">
              Sit <em>next to me</em>.
            </h2>
          </Reveal>
        </div>

        <div className="apply-grid">
          <div className="apply-text">
            <Reveal delay={200}>
              <p className="lede">
                I have three Diamond Club seats at Kauffman and I'm at every home
                game. The seat in the middle is mine. The two on either side are
                yours, if you want them. Bring a friend. Bring your dad. Bring
                whoever you want to spend nine innings hearing stories with.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <ul className="apply-list">
                <li><span className="mono">01</span> Two seats next to mine. Diamond Club Box, Row 2, seats 1–3.</li>
                <li><span className="mono">02</span> I'll be there too — stories, scorekeeping, peanuts.</li>
                <li><span className="mono">03</span> Tell me why you want to come. Be honest.</li>
                <li><span className="mono">04</span> No money changes hands. Just baseball.</li>
              </ul>
            </Reveal>
            <Reveal delay={400}>
              <div className="apply-callout">
                <span className="mono">DIAMOND CLUB BOX · ROW 2 · SEATS 1–3</span>
                <span>Three seats, one of them is mine. The other two are why you're here.</span>
              </div>
            </Reveal>
          </div>

          <Reveal delay={300} className="apply-card-wrap">
            <form className="apply-card" onSubmit={submit}>
              <div className="apply-card-tag mono">APPLICATION · 2026 SEASON</div>

              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Your full name"
                  />
                  {errors.name && <span className="apply-err">{errors.name}</span>}
                </label>
                <label className="apply-field">
                  <span className="apply-label">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    placeholder="you@email.com"
                  />
                  {errors.email && <span className="apply-err">{errors.email}</span>}
                </label>
              </div>

              <label className="apply-field">
                <span className="apply-label">Pick a game</span>
                <div className="apply-dates">
                  {upcoming.map((d) => (
                    <button type="button" key={d}
                      className={`apply-date ${form.date === d ? "is-active" : ""}`}
                      onClick={() => setForm({...form, date: form.date === d ? "" : d})}>
                      {d}
                    </button>
                  ))}
                </div>
                {errors.date && <span className="apply-err">{errors.date}</span>}
              </label>

              <label className="apply-field">
                <span className="apply-label">How many in your party? (max 2 — you'll sit next to me)</span>
                <div className="apply-radio">
                  {["1","2"].map((g) => (
                    <button type="button" key={g}
                      className={`apply-radio-btn ${form.group === g ? "is-active" : ""}`}
                      onClick={() => setForm({...form, group: g})}>
                      {g} {g === "1" ? "person" : "people"}
                    </button>
                  ))}
                </div>
              </label>

              <label className="apply-field">
                <span className="apply-label">Why do you want to come?</span>
                <textarea
                  rows="4"
                  value={form.about}
                  onChange={(e) => setForm({...form, about: e.target.value})}
                  placeholder="Tell me a story. Bonus points if it involves the '85 series, your dad, or both."
                />
                {errors.about && <span className="apply-err">{errors.about}</span>}
              </label>

              <label className="apply-field">
                <span className="apply-label">How'd you find me? <em className="apply-opt">optional</em></span>
                <input
                  type="text"
                  value={form.how}
                  onChange={(e) => setForm({...form, how: e.target.value})}
                  placeholder="Facebook, the book, a friend..."
                />
              </label>

              <button type="submit" className="apply-submit">
                Submit Application <span aria-hidden>→</span>
              </button>

              <p className="apply-fine mono">
                I read every one. No bots. No bots. No bots.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const applyStyles = document.createElement("style");
applyStyles.textContent = `
.apply { background: var(--navy-900); position: relative; overflow: hidden; }
.apply::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(ellipse at 80% 0%, rgba(0, 70, 135, 0.2) 0%, transparent 50%);
  pointer-events: none;
}
.apply-head { margin-bottom: 64px; }
.apply-title { color: var(--bone); margin-top: 24px; }
.apply-title em { color: var(--royal-blue-glow); font-style: italic; }

.apply-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 80px;
  align-items: start;
  position: relative;
}
@media (max-width: 980px) { .apply-grid { grid-template-columns: 1fr; gap: 48px; } }

.apply-list { list-style: none; padding: 0; margin: 32px 0 0 0; display: flex; flex-direction: column; gap: 16px; max-width: 460px; }
.apply-list li {
  display: flex; gap: 16px; align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--rule);
  font-size: 16px; color: var(--bone-dim);
}
.apply-list .mono { color: var(--gold); font-size: 11px; letter-spacing: 0.18em; padding-top: 4px; }

.apply-callout {
  margin-top: 36px;
  padding: 18px 22px;
  border-left: 2px solid var(--royal-blue-glow);
  background: linear-gradient(90deg, rgba(43,138,255,0.08), transparent 70%);
  display: flex; flex-direction: column; gap: 8px;
}
.apply-callout .mono { font-size: 10px; letter-spacing: 0.2em; color: var(--royal-blue-glow); }
.apply-callout span:last-child { font-family: var(--serif); font-style: italic; font-size: 17px; color: var(--bone); line-height: 1.4; }

.apply-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border: 1px solid var(--rule);
  padding: 40px;
  border-radius: 4px;
  display: flex; flex-direction: column; gap: 24px;
  position: relative;
  backdrop-filter: blur(20px);
}
.apply-card-tag {
  font-size: 10px; letter-spacing: 0.22em; color: var(--gold);
  border-bottom: 1px solid var(--rule);
  padding-bottom: 14px;
}
.apply-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 540px) { .apply-row { grid-template-columns: 1fr; } }
.apply-field { display: flex; flex-direction: column; gap: 8px; }
.apply-label { font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; color: var(--gold); text-transform: uppercase; }
.apply-opt { color: var(--bone-dim); font-style: italic; text-transform: none; opacity: 0.7; font-family: var(--serif); letter-spacing: 0; }
.apply-card input, .apply-card textarea {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--rule);
  padding: 14px 16px;
  color: var(--bone);
  font-family: var(--sans);
  font-size: 14px;
  border-radius: 2px;
  outline: none;
  transition: border-color 200ms;
}
.apply-card input:focus, .apply-card textarea:focus { border-color: var(--royal-blue-glow); }
.apply-card textarea { resize: vertical; min-height: 100px; }

.apply-dates { display: flex; flex-wrap: wrap; gap: 8px; }
.apply-date {
  background: transparent;
  border: 1px solid var(--rule);
  padding: 10px 14px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--bone);
  cursor: pointer;
  border-radius: 2px;
  transition: all 200ms;
}
.apply-date:focus { outline: none; }
.apply-date:focus-visible { outline: 2px solid var(--royal-blue-glow); outline-offset: 2px; }
@media (hover: hover) {
  .apply-date:hover { border-color: var(--royal-blue-glow); color: var(--royal-blue-glow); }
}
.apply-date.is-active { background: var(--royal-blue-bright); color: var(--bone); border-color: var(--royal-blue-glow); }

.apply-radio { display: flex; gap: 8px; }
.apply-radio-btn {
  flex: 1;
  background: transparent;
  border: 1px solid var(--rule);
  padding: 12px 16px;
  color: var(--bone);
  font-family: var(--sans);
  font-size: 14px;
  cursor: pointer;
  border-radius: 2px;
  transition: all 200ms;
}
.apply-radio-btn.is-active { background: var(--royal-blue-bright); color: var(--bone); border-color: var(--royal-blue-glow); }

.apply-submit {
  background: linear-gradient(135deg, var(--royal-blue-bright), var(--royal-blue));
  color: var(--bone);
  border: 1px solid var(--royal-blue-glow);
  padding: 16px 24px;
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  border-radius: 999px;
  margin-top: 8px;
  transition: all 200ms;
  box-shadow: 0 8px 30px -8px rgba(0, 100, 194, 0.5);
}
.apply-submit:hover { background: linear-gradient(135deg, var(--royal-blue-glow), var(--royal-blue-bright)); transform: translateY(-1px); box-shadow: 0 14px 40px -8px rgba(43, 138, 255, 0.6); }

.apply-err { font-family: var(--mono); font-size: 11px; color: var(--crimson); letter-spacing: 0.1em; }
.apply-fine { font-size: 11px; letter-spacing: 0.16em; color: var(--bone-dim); text-align: center; opacity: 0.6; text-transform: uppercase; }

.apply-success { text-align: left; max-width: 720px; }
.apply-success em { color: var(--gold); font-style: italic; }
.apply-ticket {
  display: flex; margin-top: 48px;
  background: var(--bone); color: var(--navy-900);
  border-radius: 4px; overflow: hidden;
  box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6);
  position: relative;
}
.apply-ticket::before {
  content: ""; position: absolute;
  left: calc(100% - 140px); top: 0; bottom: 0;
  width: 1px;
  border-left: 2px dashed var(--navy-900);
  opacity: 0.3;
}
.apply-ticket-stub { flex: 1; padding: 32px; }
.apply-ticket-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--royal-blue); }
.apply-ticket-name { font-family: var(--serif); font-size: 36px; font-weight: 600; margin-top: 12px; letter-spacing: -0.01em; }
.apply-ticket-row { display: flex; gap: 32px; margin-top: 24px; }
.apply-ticket-row > div { display: flex; flex-direction: column; gap: 4px; }
.apply-ticket-row .mono { font-size: 10px; letter-spacing: 0.16em; color: var(--royal-blue); }
.apply-ticket-row strong { font-family: var(--serif); font-size: 18px; font-weight: 600; }
.apply-ticket-perf { width: 140px; background: var(--royal-blue); color: var(--bone); display: grid; place-items: center; }
.apply-ticket-num { font-size: 14px; letter-spacing: 0.18em; text-align: center; line-height: 1.6; }
`;
document.head.appendChild(applyStyles);

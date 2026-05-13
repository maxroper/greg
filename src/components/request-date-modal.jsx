import React, { useEffect, useRef, useState } from "react";

const EVENT_TYPES = [
  { id: "corporate", label: "Corporate / keynote" },
  { id: "fundraiser", label: "Fundraiser / charity" },
  { id: "private",    label: "Private dinner / Q&A" },
  { id: "media",      label: "Media / interview" },
  { id: "school",     label: "School / clinic" },
  { id: "other",      label: "Something else" },
];

const TIMELINES = [
  { id: "asap",     label: "Within 30 days" },
  { id: "60-90",    label: "60–90 days out" },
  { id: "quarter",  label: "This quarter" },
  { id: "flexible", label: "Flexible / not yet booked" },
];

async function submitRequest(payload) {
  const res = await fetch("/api/speaking-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error || `HTTP ${res.status}` };
  }
  return res.json();
}

export default function RequestDateModal({ open, onClose }) {
  const [step, setStep] = useState("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", organization: "",
    eventType: "corporate", timeline: "60-90",
    eventDate: "", city: "", audienceSize: "",
    budget: "", details: "",
  });

  const dialogRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setErrorMsg("");
      setReferenceId("");
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const setField = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.details.trim()) {
      setErrorMsg("Name, email, and event details are required.");
      return;
    }
    setStep("sending");
    setErrorMsg("");
    try {
      const payload = {
        ...form,
        audienceSize: form.audienceSize ? Number(form.audienceSize) : null,
        submittedAt: new Date().toISOString(),
      };
      const res = await submitRequest(payload);
      if (res.ok) {
        setReferenceId(res.id || "");
        setStep("success");
      } else {
        setErrorMsg(res.error || "Something went wrong. Please try again.");
        setStep("error");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Network error. Please try again.");
      setStep("error");
    }
  };

  return (
    <div className="rdm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-labelledby="rdm-title">
      <div className="rdm-dialog" ref={dialogRef}>
        <button className="rdm-close" onClick={onClose} aria-label="Close">×</button>

        {step === "success" ? (
          <div className="rdm-success">
            <div className="rdm-success-icon">✓</div>
            <h3 className="rdm-success-h">Request received.</h3>
            <p className="rdm-success-p">
              Thanks, {form.name.split(" ")[0] || "friend"}. Greg or someone from his team
              will reach out within a couple of business days.
            </p>
            {referenceId && (
              <div className="rdm-ref mono">REFERENCE · {referenceId.toUpperCase()}</div>
            )}
            <button className="rdm-submit" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rdm-form">
            <header className="rdm-head">
              <span className="mono rdm-eyebrow">SPEAKING · BOOK A DATE</span>
              <h3 id="rdm-title" className="rdm-title">
                Tell us about <em>your event.</em>
              </h3>
              <p className="rdm-sub">
                The more you can share, the faster we can get back to you with availability and pricing.
                Required fields marked <span className="rdm-req">*</span>.
              </p>
            </header>

            <div className="rdm-grid">
              <label className="rdm-field">
                <span className="rdm-label">Your name <span className="rdm-req">*</span></span>
                <input ref={firstInputRef} type="text" value={form.name} onChange={setField("name")} required autoComplete="name" />
              </label>

              <label className="rdm-field">
                <span className="rdm-label">Email <span className="rdm-req">*</span></span>
                <input type="email" value={form.email} onChange={setField("email")} required autoComplete="email" />
              </label>

              <label className="rdm-field rdm-field-wide">
                <span className="rdm-label">Organization / company</span>
                <input type="text" value={form.organization} onChange={setField("organization")} autoComplete="organization" />
              </label>

              <div className="rdm-field rdm-field-wide">
                <span className="rdm-label">Event type</span>
                <div className="rdm-pillrow">
                  {EVENT_TYPES.map(t => (
                    <button type="button" key={t.id} className={`rdm-pill ${form.eventType === t.id ? "is-active" : ""}`} onClick={() => setForm(f => ({ ...f, eventType: t.id }))}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="rdm-field">
                <span className="rdm-label">Preferred date</span>
                <input type="date" value={form.eventDate} onChange={setField("eventDate")} />
              </label>

              <div className="rdm-field">
                <span className="rdm-label">Timeline</span>
                <div className="rdm-pillrow rdm-pillrow-tight">
                  {TIMELINES.map(t => (
                    <button type="button" key={t.id} className={`rdm-pill ${form.timeline === t.id ? "is-active" : ""}`} onClick={() => setForm(f => ({ ...f, timeline: t.id }))}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="rdm-field">
                <span className="rdm-label">City, State</span>
                <input type="text" value={form.city} onChange={setField("city")} placeholder="Kansas City, MO" />
              </label>

              <label className="rdm-field">
                <span className="rdm-label">Audience size</span>
                <input type="number" min="1" step="1" value={form.audienceSize} onChange={setField("audienceSize")} placeholder="200" />
              </label>

              <label className="rdm-field rdm-field-wide">
                <span className="rdm-label">Budget range</span>
                <input type="text" value={form.budget} onChange={setField("budget")} placeholder="e.g. $5–10k, plus travel" />
              </label>

              <label className="rdm-field rdm-field-wide">
                <span className="rdm-label">Event details <span className="rdm-req">*</span></span>
                <textarea rows={4} value={form.details} onChange={setField("details")} required placeholder="Theme, format, what you're hoping Greg will share, special asks (signing, Q&A, etc)…" />
              </label>
            </div>

            {errorMsg && <div className="rdm-error">{errorMsg}</div>}

            <footer className="rdm-foot">
              <span className="rdm-foot-note mono">
                We typically respond within 2 business days.
              </span>
              <div className="rdm-foot-actions">
                <button type="button" className="rdm-cancel" onClick={onClose}>Cancel</button>
                <button type="submit" className="rdm-submit" disabled={step === "sending"}>
                  {step === "sending" ? "Sending…" : "Send request →"}
                </button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

const rdmStyle = document.createElement("style");
rdmStyle.textContent = `
.rdm-overlay { position: fixed; inset: 0; background: rgba(5, 9, 18, 0.78); backdrop-filter: blur(8px); z-index: 1000; display: grid; place-items: center; padding: 24px; animation: rdm-fade-in 220ms ease-out; overflow-y: auto; }
@keyframes rdm-fade-in { from { opacity: 0; } to { opacity: 1; } }
.rdm-dialog {
  position: relative;
  width: min(680px, 100%);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background: linear-gradient(180deg, var(--navy-800) 0%, var(--navy-900) 100%);
  border: 1px solid var(--rule);
  border-radius: 6px;
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(43,138,255,0.06);
  animation: rdm-rise 320ms cubic-bezier(.2,.8,.2,1);
}
@keyframes rdm-rise { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.rdm-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; display: grid; place-items: center; background: transparent; border: 1px solid var(--rule); color: var(--bone-dim); font-size: 22px; line-height: 1; cursor: pointer; border-radius: 50%; transition: background 180ms, color 180ms, border-color 180ms; z-index: 2; }
.rdm-close:hover { background: var(--navy-700); color: var(--bone); border-color: var(--gold); }

.rdm-form { padding: 44px 44px 32px; }
.rdm-head { margin-bottom: 28px; padding-right: 32px; }
.rdm-eyebrow { color: var(--royal-blue-glow); font-size: 11px; letter-spacing: 0.22em; }
.rdm-title { font-family: var(--serif); font-size: clamp(28px, 4.2vw, 40px); font-weight: 500; letter-spacing: -0.015em; color: var(--bone); margin: 10px 0 12px; line-height: 1.05; }
.rdm-title em { color: var(--royal-blue-glow); font-style: italic; }
.rdm-sub { font-size: 14px; line-height: 1.5; color: var(--bone-dim); margin: 0; }
.rdm-req { color: var(--gold); }

.rdm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 16px; }
.rdm-field { display: flex; flex-direction: column; gap: 8px; }
.rdm-field-wide { grid-column: 1 / -1; }
.rdm-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; color: var(--bone-dim); text-transform: uppercase; }
.rdm-field input, .rdm-field textarea { font-family: inherit; font-size: 14px; background: rgba(0,0,0,0.25); color: var(--bone); border: 1px solid var(--rule); border-radius: 4px; padding: 12px 14px; outline: none; transition: border-color 180ms, background 180ms; }
.rdm-field input:focus, .rdm-field textarea:focus { border-color: var(--royal-blue-glow); background: rgba(43,138,255,0.04); }
.rdm-field textarea { resize: vertical; min-height: 96px; line-height: 1.5; }

.rdm-pillrow { display: flex; flex-wrap: wrap; gap: 8px; }
.rdm-pillrow-tight { gap: 6px; }
.rdm-pill { font-family: inherit; font-size: 12px; background: rgba(0,0,0,0.25); color: var(--bone-dim); border: 1px solid var(--rule); border-radius: 999px; padding: 8px 14px; cursor: pointer; transition: all 160ms; }
.rdm-pill:hover { border-color: var(--bone-dim); color: var(--bone); }
.rdm-pill.is-active { background: rgba(43,138,255,0.12); color: var(--bone); border-color: var(--royal-blue-glow); box-shadow: 0 0 0 1px var(--royal-blue-glow), 0 0 20px -8px var(--royal-blue-glow); }

.rdm-error { margin-top: 18px; padding: 12px 14px; border: 1px solid rgba(220, 80, 80, 0.4); background: rgba(220, 80, 80, 0.08); color: #ffb8b8; font-size: 13px; border-radius: 4px; }

.rdm-foot { margin-top: 28px; padding-top: 22px; border-top: 1px solid var(--rule); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.rdm-foot-note { font-size: 10px; letter-spacing: 0.18em; color: var(--bone-dim); }
.rdm-foot-actions { display: flex; gap: 10px; }
.rdm-cancel { font-family: inherit; font-size: 13px; background: transparent; color: var(--bone-dim); border: 1px solid var(--rule); padding: 12px 22px; border-radius: 4px; cursor: pointer; transition: all 180ms; }
.rdm-cancel:hover { color: var(--bone); border-color: var(--bone-dim); }
.rdm-submit { font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; background: var(--royal-blue-glow); color: var(--navy-900); border: 1px solid var(--royal-blue-glow); padding: 12px 24px; border-radius: 4px; cursor: pointer; transition: all 180ms; box-shadow: 0 4px 18px -4px var(--royal-blue-glow); }
.rdm-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 26px -4px var(--royal-blue-glow); }
.rdm-submit:disabled { opacity: 0.6; cursor: progress; }

.rdm-success { padding: 56px 44px 44px; text-align: center; }
.rdm-success-icon { width: 64px; height: 64px; margin: 0 auto 24px; border-radius: 50%; background: rgba(43,138,255,0.12); border: 1px solid var(--royal-blue-glow); color: var(--royal-blue-glow); font-size: 32px; display: grid; place-items: center; box-shadow: 0 0 30px -4px var(--royal-blue-glow); }
.rdm-success-h { font-family: var(--serif); font-size: 32px; color: var(--bone); margin: 0 0 12px; font-weight: 500; letter-spacing: -0.015em; }
.rdm-success-p { color: var(--bone-dim); font-size: 15px; line-height: 1.55; max-width: 42ch; margin: 0 auto 24px; }
.rdm-ref { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); margin-bottom: 28px; }

@media (max-width: 640px) {
  .rdm-overlay { padding: 12px; align-items: flex-start; }
  .rdm-dialog { max-height: calc(100vh - 24px); }
  .rdm-form { padding: 32px 22px 24px; }
  .rdm-success { padding: 44px 22px 32px; }
  .rdm-grid { grid-template-columns: 1fr; gap: 14px; }
  .rdm-title { font-size: 26px; }
  .rdm-foot { justify-content: flex-end; }
  .rdm-foot-note { width: 100%; }
}
`;
document.head.appendChild(rdmStyle);

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";

// Checkout — multi-step purchase flow.
// Steps 1–3: edition / personalize / shipping (collected client-side).
// Step 4: Stripe Embedded Checkout iframe (PCI-compliant; card data goes
//   directly to Stripe but never leaves the page UI). On success, Stripe
//   redirects the parent page to /?checkout=success.

// Lazy-load Stripe.js once for the whole app (this returns a Promise; the
// EmbeddedCheckoutProvider awaits it). Safe to call before VITE_STRIPE_PUBLISHABLE_KEY
// is set — loadStripe(undefined) returns a no-op promise that the provider handles.
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;
export default function Checkout({ open, initialEdition, onClose }) {
  const [step, setStep] = useState(1);
  const [edition, setEdition] = useState(initialEdition || "signed");
  const [quantity, setQuantity] = useState(1);
  const [personalize, setPersonalize] = useState(true);
  const [recipient, setRecipient] = useState("");
  const [inscription, setInscription] = useState("");
  const [addBall, setAddBall] = useState(false);
  const [ballInscription, setBallInscription] = useState("");
  const [shipMethod, setShipMethod] = useState("standard");
  const [contact, setContact] = useState({ email: "", name: "", address1: "", city: "", state: "", zip: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setEdition(initialEdition || "signed");
      setQuantity(1);
      setProcessing(false);
      setError("");
      setClientSecret(null);
    }
  }, [open, initialEdition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !processing) onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, processing]);

  if (!open) return null;

  const editions = {
    standard: { name: "Hardcover, unsigned", price: 24.95, sub: "Direct from Greg's garage. Ships in 2 days." },
    signed: { name: "Hardcover, signed by Greg", price: 32.00, sub: "Personalized inscription available. Ships in a week." },
  };

  const editionPrice = editions[edition].price;
  const editionLineTotal = +(editionPrice * quantity).toFixed(2);
  const ballPrice = addBall ? 89.00 : 0;
  const subtotal = +(editionLineTotal + ballPrice).toFixed(2);
  const ship = shipMethod === "express" ? 14.95 : (subtotal > 50 ? 0 : 5.95);
  const tax = +(subtotal * 0.082).toFixed(2);
  const total = +(subtotal + ship + tax).toFixed(2);

  const goBack = () => {
    setError("");
    if (step === 4) setClientSecret(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const goNext = async () => {
    setError("");
    // Steps 1, 2 advance straight to the next page.
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    // Step 3 -> 4 also creates the Stripe session and prepares the embedded
    // checkout iframe with the resulting client_secret.
    setProcessing(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          edition, quantity, personalize, recipient, inscription,
          addBall, ballInscription, shipMethod, contact,
          displayTotal: total,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Checkout failed (${res.status})`);
      }
      const data = await res.json();
      if (!data.client_secret) throw new Error("No client_secret returned.");
      setClientSecret(data.client_secret);
      setStep(4);
    } catch (err) {
      console.error("Checkout error", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const step1Valid = !!edition;
  const step2Valid = edition === "standard" || !personalize || (recipient.length >= 1 && inscription.length >= 1) || !inscription;
  const step3Valid = contact.email && contact.name && contact.address1 && contact.city && contact.state && contact.zip;

  const STEPS = [
    { n: 1, label: "Edition" },
    { n: 2, label: "Personalize" },
    { n: 3, label: "Shipping" },
    { n: 4, label: "Payment" },
  ];

  return createPortal(
    <div className="ck-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !processing) onClose(); }}>
      <div className="ck-modal" role="dialog" aria-modal="true">
        <div className="ck-head">
          <div className="ck-head-l">
            <span className="mono ck-head-tag">DIRECT FROM GREG · NO. 04</span>
            <div className="ck-head-title">Order signed copy</div>
          </div>
          <button className="ck-close" onClick={onClose} aria-label="Close" disabled={processing}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
          </button>
        </div>

        <div className="ck-stepper">
          {STEPS.map((s, i) => (
            <div key={s.n} className={`ck-step ${step === s.n ? "is-current" : ""} ${step > s.n ? "is-done" : ""}`}>
              <div className="ck-step-dot">
                {step > s.n ? (
                  <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 5.5L4 8.5 10 2" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
                ) : <span className="mono">{s.n}</span>}
              </div>
              <span className="ck-step-l mono">{s.label}</span>
              {i < STEPS.length - 1 && <div className="ck-step-rail" />}
            </div>
          ))}
        </div>

        <div className="ck-body">
          <div className="ck-main">
            {step === 1 && (
              <div className="ck-pane">
                <h3 className="ck-h">Pick your edition.</h3>
                <p className="ck-lede">Two ways to take a book home from the dugout. Signed by me, personalized however you want.</p>

                <div className="ck-edits">
                  {Object.entries(editions).map(([key, e]) => (
                    <label key={key} className={`ck-edit ${edition === key ? "is-on" : ""}`}>
                      <input type="radio" name="ed" checked={edition === key} onChange={() => setEdition(key)} />
                      <div className="ck-edit-art" data-kind={key} aria-hidden>
                        <div className="ck-edit-spine" />
                        <div className="ck-edit-cover">
                          <div className="ck-edit-mini-h">No. 04</div>
                          <div className="ck-edit-mini-t">The Day The Yankees Made Me Shave</div>
                          {key === "signed" && <div className="ck-edit-sig">Greg Pryor</div>}
                        </div>
                      </div>
                      <div className="ck-edit-meta">
                        <div className="ck-edit-name">{e.name}</div>
                        <div className="ck-edit-sub">{e.sub}</div>
                      </div>
                      <div className="ck-edit-price mono">${e.price.toFixed(2)}</div>
                    </label>
                  ))}
                </div>

                <div className="ck-qty-row">
                  <div className="ck-qty-l">
                    <div className="ck-qty-name">How many copies?</div>
                    <div className="ck-qty-sub">Buying for the whole team? Greg ships up to 25 in one box.</div>
                  </div>
                  <div className="ck-qty-stepper" role="group" aria-label="Quantity">
                    <button type="button" className="ck-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">−</button>
                    <input
                      type="number" className="ck-qty-input mono"
                      min="1" max="25" value={quantity}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (Number.isNaN(v)) { setQuantity(1); return; }
                        setQuantity(Math.max(1, Math.min(25, v)));
                      }}
                      aria-label="Quantity"
                    />
                    <button type="button" className="ck-qty-btn" onClick={() => setQuantity(q => Math.min(25, q + 1))} disabled={quantity >= 25} aria-label="Increase quantity">+</button>
                  </div>
                </div>

                <div className={`ck-addon ${addBall ? "is-on" : ""}`}>
                  <div className="ck-addon-l">
                    <div className="ck-ball-art" aria-hidden>
                      <svg viewBox="0 0 80 80" width="64" height="64">
                        <defs>
                          <radialGradient id="bg" cx="40%" cy="35%">
                            <stop offset="0%" stopColor="#fff8eb"/>
                            <stop offset="80%" stopColor="#ece1c8"/>
                            <stop offset="100%" stopColor="#c5b894"/>
                          </radialGradient>
                        </defs>
                        <circle cx="40" cy="40" r="32" fill="url(#bg)" stroke="rgba(0,0,0,0.1)"/>
                        <path d="M18 28 Q40 38, 62 28" stroke="#a32a2a" strokeWidth="1.2" fill="none" strokeDasharray="2 3"/>
                        <path d="M18 52 Q40 42, 62 52" stroke="#a32a2a" strokeWidth="1.2" fill="none" strokeDasharray="2 3"/>
                        <text x="40" y="44" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="9" fill="#1e2942">G. Pryor</text>
                      </svg>
                    </div>
                    <div>
                      <div className="ck-addon-tag mono">ADD A SIGNED BALL · +$89</div>
                      <div className="ck-addon-name">Official MLB ball, signed by Greg</div>
                      <div className="ck-addon-sub">Personalize it too. Ships protected in a UV display case.</div>
                    </div>
                  </div>
                  <button className={`ck-addon-btn ${addBall ? "is-on" : ""}`} onClick={() => setAddBall(v => !v)}>
                    {addBall ? "Added" : "Add"}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="ck-pane">
                <h3 className="ck-h">Make it yours.</h3>
                <p className="ck-lede">
                  {edition !== "standard" && quantity > 1
                    ? <>Tell me who I'm writing this for. All <strong>{quantity}</strong> copies get the same inscription — message me after if you need different ones per copy.</>
                    : "Tell me who I'm writing this for. I'll handle the rest with a real pen."
                  }
                </p>

                {edition === "standard" ? (
                  <div className="ck-info">
                    <div className="mono ck-info-tag">UNSIGNED EDITION</div>
                    <p>You picked the unsigned hardcover, so there's nothing to personalize on the book itself.{addBall ? " You can still inscribe the baseball below." : ""}</p>
                    <button className="ck-link" onClick={() => setStep(1)}>Want it signed instead? →</button>
                  </div>
                ) : (
                  <>
                    <div className="ck-toggle-row">
                      <span>Add a personal inscription</span>
                      <button role="switch" aria-checked={personalize} onClick={() => setPersonalize(v => !v)} className={`ck-switch ${personalize ? "is-on" : ""}`}>
                        <span className="ck-switch-knob" />
                      </button>
                    </div>

                    {personalize && (
                      <div className="ck-pers">
                        <label className="ck-field">
                          <span className="ck-label mono">TO</span>
                          <input type="text" placeholder="Recipient's name (e.g. Mike)" value={recipient} onChange={(e) => setRecipient(e.target.value.slice(0, 30))} maxLength={30} />
                        </label>
                        <label className="ck-field">
                          <span className="ck-label mono">MESSAGE <span className="ck-label-opt">(optional)</span></span>
                          <textarea placeholder='e.g. "Happy 50th. Keep watching baseball." Or leave blank — I always sign with something.' value={inscription} onChange={(e) => setInscription(e.target.value.slice(0, 140))} maxLength={140} />
                          <span className="ck-counter mono">{inscription.length}/140</span>
                        </label>

                        <div className="ck-preview">
                          <div className="ck-preview-tag mono">PREVIEW</div>
                          <div className="ck-preview-card">
                            <div className="ck-preview-page">
                              {recipient && <p className="ck-prev-line">To {recipient},</p>}
                              {inscription && <p className="ck-prev-msg">{inscription}</p>}
                              {!recipient && !inscription && (
                                <p className="ck-prev-empty">Your message appears here.</p>
                              )}
                              <p className="ck-prev-sig">G. Pryor</p>
                              <p className="ck-prev-num mono">№ 04</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {addBall && (
                  <div className="ck-pers ck-ball-pers">
                    <div className="ck-pers-divider">
                      <span className="mono">SIGNED BALL · OPTIONAL INSCRIPTION</span>
                    </div>
                    <label className="ck-field">
                      <span className="ck-label mono">BALL INSCRIPTION <span className="ck-label-opt">(optional)</span></span>
                      <input type="text" placeholder='e.g. "To Sam — keep swinging."' value={ballInscription} onChange={(e) => setBallInscription(e.target.value.slice(0, 40))} maxLength={40} />
                      <span className="ck-counter mono">{ballInscription.length}/40</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="ck-pane">
                <h3 className="ck-h">Where am I sending it?</h3>
                <p className="ck-lede">Drops in the mail from Olathe, Kansas. I write the address by hand.</p>

                <div className="ck-grid-2">
                  <label className="ck-field ck-field-full">
                    <span className="ck-label mono">EMAIL</span>
                    <input type="email" placeholder="you@example.com" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} />
                  </label>
                  <label className="ck-field ck-field-full">
                    <span className="ck-label mono">FULL NAME</span>
                    <input type="text" placeholder="Your name" value={contact.name} onChange={(e) => setContact({...contact, name: e.target.value})} />
                  </label>
                  <label className="ck-field ck-field-full">
                    <span className="ck-label mono">ADDRESS</span>
                    <input type="text" placeholder="Street address" value={contact.address1} onChange={(e) => setContact({...contact, address1: e.target.value})} />
                  </label>
                  <label className="ck-field">
                    <span className="ck-label mono">CITY</span>
                    <input type="text" placeholder="City" value={contact.city} onChange={(e) => setContact({...contact, city: e.target.value})} />
                  </label>
                  <label className="ck-field ck-field-half-2">
                    <span className="ck-label mono">STATE</span>
                    <input type="text" placeholder="MO" value={contact.state} maxLength={2} onChange={(e) => setContact({...contact, state: e.target.value.toUpperCase()})} />
                  </label>
                  <label className="ck-field ck-field-half-2">
                    <span className="ck-label mono">ZIP</span>
                    <input type="text" placeholder="64111" value={contact.zip} maxLength={10} onChange={(e) => setContact({...contact, zip: e.target.value})} />
                  </label>
                </div>

                <div className="ck-ship-options">
                  <label className={`ck-ship ${shipMethod === "standard" ? "is-on" : ""}`}>
                    <input type="radio" name="ship" checked={shipMethod === "standard"} onChange={() => setShipMethod("standard")} />
                    <div>
                      <div className="ck-ship-name">Standard · USPS Priority</div>
                      <div className="ck-ship-sub">3–5 business days · {subtotal > 50 ? "Free" : "$5.95"}</div>
                    </div>
                  </label>
                  <label className={`ck-ship ${shipMethod === "express" ? "is-on" : ""}`}>
                    <input type="radio" name="ship" checked={shipMethod === "express"} onChange={() => setShipMethod("express")} />
                    <div>
                      <div className="ck-ship-name">Express · UPS 2-day</div>
                      <div className="ck-ship-sub">2 business days · $14.95</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="ck-pane">
                {!stripePromise ? (
                  <div className="ck-error">
                    Stripe isn't configured yet. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in
                    Cloudflare and redeploy.
                  </div>
                ) : clientSecret ? (
                  <div className="ck-embedded">
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </div>
                ) : (
                  <div className="ck-stripe-loading">
                    <span className="ck-spinner" aria-hidden /> Preparing payment…
                  </div>
                )}
                {error && <div className="ck-error" style={{ marginTop: 16 }}>{error}</div>}
              </div>
            )}
          </div>

          <>
            <button
              type="button"
              className={"ck-side-toggle" + (summaryOpen ? " is-open" : "")}
              onClick={() => setSummaryOpen(o => !o)}
              aria-expanded={summaryOpen}
              aria-controls="ck-side-panel"
            >
              <span className="ck-side-toggle-l">
                <span className="mono ck-side-toggle-tag">ORDER SUMMARY</span>
                <span className="ck-side-toggle-sub mono">{summaryOpen ? "Hide" : "Show details"}</span>
              </span>
              <span className="ck-side-toggle-r">
                <span className="mono ck-side-toggle-total">${total.toFixed(2)}</span>
                <svg className="ck-side-toggle-chev" viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                  <path d="M3 6 L8 11 L13 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>

            <aside id="ck-side-panel" className={"ck-side" + (summaryOpen ? " is-open" : "")}>
              <div className="ck-side-tag mono">ORDER SUMMARY</div>

              <div className="ck-side-item">
                <div className="ck-side-item-art" data-kind={edition} aria-hidden>
                  <div className="ck-side-spine" />
                  <div className="ck-side-cover">
                    <div className="ck-side-cover-h">No. 04</div>
                    <div className="ck-side-cover-t">The Day<br/>The Yankees<br/>Made Me Shave</div>
                  </div>
                  {quantity > 1 && <div className="ck-side-qty-badge mono">×{quantity}</div>}
                </div>
                <div className="ck-side-item-meta">
                  <div className="ck-side-item-name">{editions[edition].name}</div>
                  <div className="ck-side-item-sub mono">
                    {quantity > 1 ? `${quantity} × $${editionPrice.toFixed(2)}` : "№ 04 · GREG PRYOR"}
                  </div>
                  {edition !== "standard" && personalize && recipient && (
                    <div className="ck-side-item-pers">To {recipient}{inscription && ` — "${inscription.slice(0, 32)}${inscription.length > 32 ? "…" : ""}"`}</div>
                  )}
                </div>
                <div className="ck-side-item-price mono">${editionLineTotal.toFixed(2)}</div>
              </div>

              {addBall && (
                <div className="ck-side-item">
                  <div className="ck-side-item-art ck-side-item-ball" aria-hidden>
                    <svg viewBox="0 0 80 80" width="56" height="56">
                      <circle cx="40" cy="40" r="32" fill="#f4ecd6" stroke="rgba(0,0,0,0.1)"/>
                      <path d="M18 28 Q40 38, 62 28" stroke="#a32a2a" strokeWidth="1.2" fill="none" strokeDasharray="2 3"/>
                      <path d="M18 52 Q40 42, 62 52" stroke="#a32a2a" strokeWidth="1.2" fill="none" strokeDasharray="2 3"/>
                    </svg>
                  </div>
                  <div className="ck-side-item-meta">
                    <div className="ck-side-item-name">Signed MLB ball</div>
                    <div className="ck-side-item-sub mono">DISPLAY CASE INCL.</div>
                    {ballInscription && (
                      <div className="ck-side-item-pers">"{ballInscription.slice(0, 32)}{ballInscription.length > 32 ? "…" : ""}"</div>
                    )}
                  </div>
                  <div className="ck-side-item-price mono">$89.00</div>
                </div>
              )}

              <div className="ck-side-totals">
                <div className="ck-side-row"><span>Subtotal</span><span className="mono">${subtotal.toFixed(2)}</span></div>
                <div className="ck-side-row"><span>Shipping</span><span className="mono">{ship === 0 ? "FREE" : `$${ship.toFixed(2)}`}</span></div>
                <div className="ck-side-row"><span>Tax</span><span className="mono">${tax.toFixed(2)}</span></div>
                <div className="ck-side-row ck-side-total">
                  <span>Total</span>
                  <span className="mono">${total.toFixed(2)} <span className="ck-side-cur">USD</span></span>
                </div>
              </div>

              <div className="ck-side-note mono">
                ✓ HAND-SIGNED ·  ✓ FREE TRACKING ·  ✓ 30-DAY RETURNS
              </div>
            </aside>
          </>
        </div>

        <div className="ck-foot">
          {step > 1 ? (
            <button className="ck-btn-back" onClick={goBack} disabled={processing}>
              <span aria-hidden>←</span> Back
            </button>
          ) : <span/>}

          <div className="ck-foot-r">
            <div className="ck-foot-total mono">
              Total <span className="ck-foot-amt">${total.toFixed(2)}</span>
            </div>
            {step < 4 && (
              <button
                className="ck-btn-next"
                onClick={goNext}
                disabled={
                  processing ||
                  (step === 1 && !step1Valid) ||
                  (step === 2 && !step2Valid) ||
                  (step === 3 && !step3Valid)
                }
              >
                {processing && step === 3 ? (
                  <><span className="ck-spinner" aria-hidden /> Loading…</>
                ) : (
                  <>{step === 1 ? "Personalize" : step === 2 ? "Shipping" : "Payment"} <span aria-hidden>→</span></>
                )}
              </button>
            )}
            {step === 4 && (
              <span className="ck-foot-note mono">Card entry below ↓</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const ckStyles = document.createElement("style");
ckStyles.textContent = `
.ck-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(5, 13, 26, 0.78);
  backdrop-filter: blur(8px);
  display: grid; place-items: center;
  padding: 24px;
  animation: ckFade 280ms ease-out;
}
@keyframes ckFade { from { opacity: 0; } to { opacity: 1; } }

.ck-modal {
  width: 100%; max-width: 1080px;
  max-height: calc(100dvh - 48px);
  background: #0d1a2e;
  border: 1px solid rgba(189, 155, 96, 0.25);
  box-shadow: 0 60px 120px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset;
  display: grid; grid-template-rows: auto auto 1fr auto;
  overflow: hidden;
  position: relative;
  animation: ckRise 380ms cubic-bezier(.2,.8,.2,1);
}
@keyframes ckRise { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.ck-modal::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--royal-blue) 0%, var(--royal-blue-bright) 50%, var(--gold) 100%);
}

.ck-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 24px 32px 16px;
  border-bottom: 1px solid var(--rule);
}
.ck-head-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); }
.ck-head-title {
  font-family: var(--serif); font-size: 26px; font-weight: 500; color: var(--bone);
  margin-top: 6px; line-height: 1.1; letter-spacing: -0.01em;
}
.ck-close {
  background: transparent; border: 1px solid var(--rule); color: var(--bone-dim);
  width: 32px; height: 32px; cursor: pointer;
  display: grid; place-items: center;
  transition: all 200ms;
}
.ck-close:hover { color: var(--bone); border-color: var(--gold); }

.ck-stepper {
  display: flex; align-items: center; gap: 0;
  padding: 16px 32px;
  border-bottom: 1px solid var(--rule);
  background: rgba(0,0,0,0.15);
  overflow-x: auto;
}
.ck-step {
  display: flex; align-items: center; gap: 10px;
  flex: 1; min-width: 0;
  color: var(--bone-dim);
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  white-space: nowrap;
}
.ck-step.is-current { color: var(--bone); }
.ck-step.is-done { color: var(--royal-blue-glow); }
.ck-step-dot {
  width: 26px; height: 26px;
  border: 1px solid currentColor;
  border-radius: 50%;
  display: grid; place-items: center;
  font-size: 11px;
  flex-shrink: 0;
}
.ck-step.is-current .ck-step-dot { background: var(--royal-blue); border-color: var(--royal-blue-glow); color: var(--bone); }
.ck-step.is-done .ck-step-dot { background: var(--royal-blue-glow); border-color: var(--royal-blue-glow); color: var(--navy-900); }
.ck-step-l { font-size: 11px; }
.ck-step-rail { flex: 1; height: 1px; background: var(--rule); margin: 0 12px; }
.ck-step.is-done + .ck-step .ck-step-rail,
.ck-step.is-done .ck-step-rail { background: var(--royal-blue-glow); }

.ck-body { display: grid; grid-template-columns: 1.4fr 1fr; overflow: hidden; min-height: 0; }
.ck-main { padding: 32px; overflow-y: auto; border-right: 1px solid var(--rule); }
.ck-side { padding: 32px 28px; background: rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 0; overflow-y: auto; }

.ck-pane { display: flex; flex-direction: column; gap: 8px; }
.ck-h { font-family: var(--serif); font-size: 28px; font-weight: 500; color: var(--bone); margin: 0; line-height: 1.1; letter-spacing: -0.01em; }
.ck-lede { font-family: var(--serif); font-size: 16px; color: var(--bone-dim); margin: 0 0 20px; line-height: 1.5; }

.ck-edits { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.ck-edit {
  display: grid; grid-template-columns: auto 80px 1fr auto;
  gap: 18px; align-items: center;
  padding: 16px;
  border: 1px solid var(--rule);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: all 200ms;
  position: relative;
}
.ck-edit:hover { border-color: var(--bone-dim); background: rgba(255,255,255,0.04); }
.ck-edit.is-on { border-color: var(--royal-blue-glow); background: rgba(0,100,194,0.08); box-shadow: 0 0 0 1px var(--royal-blue-glow) inset; }
.ck-edit input { width: 16px; height: 16px; accent-color: var(--royal-blue-glow); margin: 0; }
.ck-edit-art {
  width: 64px; height: 88px;
  background: #1a0606;
  border: 1px solid rgba(189, 155, 96, 0.3);
  position: relative;
  flex-shrink: 0;
  box-shadow: 4px 6px 0 rgba(0,0,0,0.3);
  overflow: hidden;
}
.ck-edit-spine { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(90deg, #1a0606, #2d0e0e); }
.ck-edit-cover { padding: 6px 6px 6px 8px; height: 100%; display: flex; flex-direction: column; color: #e8c98a; }
.ck-edit-mini-h { font-family: var(--mono); font-size: 6px; letter-spacing: 0.16em; opacity: 0.7; }
.ck-edit-mini-t { font-family: var(--serif); font-size: 8px; line-height: 1; margin-top: 4px; font-style: italic; }
.ck-edit-sig {
  position: absolute; left: 0; right: 0; top: 50%;
  font-family: var(--serif); font-style: italic; font-weight: 600;
  font-size: 10px; line-height: 1;
  color: #2b8aff;
  transform: translateY(-50%) rotate(-12deg);
  text-shadow: 0 0 5px rgba(43, 138, 255, 0.5), 0 0 2px rgba(43, 138, 255, 0.8);
  white-space: nowrap; pointer-events: none; letter-spacing: -0.01em; text-align: center;
}
.ck-edit-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ck-edit-name { font-family: var(--sans); font-size: 15px; font-weight: 500; color: var(--bone); }
.ck-edit-sub { font-family: var(--serif); font-size: 13px; color: var(--bone-dim); font-style: italic; }
.ck-edit-price { font-size: 18px; color: var(--bone); font-weight: 600; }

.ck-qty-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  border: 1px solid var(--rule);
  background: rgba(0,0,0,0.18);
  margin-bottom: 24px;
}
.ck-qty-l { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ck-qty-name { font-family: var(--sans); font-size: 14px; font-weight: 500; color: var(--bone); }
.ck-qty-sub { font-family: var(--serif); font-size: 12px; color: var(--bone-dim); font-style: italic; }
.ck-qty-stepper {
  display: flex; align-items: stretch;
  border: 1px solid var(--rule);
  background: rgba(255,255,255,0.02);
  overflow: hidden; flex-shrink: 0;
}
.ck-qty-btn { width: 38px; height: 38px; background: transparent; border: none; color: var(--bone); font-size: 18px; line-height: 1; cursor: pointer; display: grid; place-items: center; transition: background 160ms, color 160ms; }
.ck-qty-btn:hover:not(:disabled) { background: var(--royal-blue); color: var(--bone); }
.ck-qty-btn:disabled { color: rgba(245,244,232,0.25); cursor: not-allowed; }
.ck-qty-input { width: 48px; height: 38px; background: transparent; border: none; border-left: 1px solid var(--rule); border-right: 1px solid var(--rule); color: var(--bone); font-size: 15px; font-weight: 600; text-align: center; -moz-appearance: textfield; outline: none; }
.ck-qty-input::-webkit-outer-spin-button, .ck-qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ck-qty-input:focus { background: rgba(43, 138, 255, 0.08); box-shadow: inset 0 0 0 1px var(--royal-blue-glow); }

.ck-side-qty-badge { position: absolute; top: -6px; right: -8px; background: var(--royal-blue-glow); color: var(--navy-900); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; padding: 3px 7px; border-radius: 999px; box-shadow: 0 2px 8px rgba(43,138,255,0.4); }

.ck-addon { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 18px 20px; border: 1px dashed var(--gold); background: rgba(189, 155, 96, 0.05); position: relative; }
.ck-addon.is-on { border-style: solid; background: rgba(189, 155, 96, 0.12); }
.ck-addon-l { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
.ck-addon-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); }
.ck-addon-name { font-family: var(--sans); font-size: 15px; font-weight: 500; color: var(--bone); margin-top: 4px; }
.ck-addon-sub { font-family: var(--serif); font-size: 13px; color: var(--bone-dim); font-style: italic; margin-top: 2px; }
.ck-addon-btn { background: transparent; color: var(--gold); border: 1px solid var(--gold); padding: 10px 20px; font-family: var(--mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: all 200ms; flex-shrink: 0; }
.ck-addon-btn:hover { background: var(--gold); color: var(--navy-900); }
.ck-addon-btn.is-on { background: var(--gold); color: var(--navy-900); }

.ck-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; margin-bottom: 8px; font-family: var(--serif); font-size: 16px; color: var(--bone); border-bottom: 1px solid var(--rule); }
.ck-switch { width: 44px; height: 24px; border-radius: 12px; background: var(--rule); border: none; cursor: pointer; position: relative; transition: background 200ms; }
.ck-switch.is-on { background: var(--royal-blue-glow); }
.ck-switch-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--bone); transition: transform 200ms; }
.ck-switch.is-on .ck-switch-knob { transform: translateX(20px); }

.ck-pers { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
.ck-pers-divider { border-top: 1px dashed var(--rule); padding-top: 14px; margin-top: 8px; }
.ck-pers-divider span { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); }

.ck-preview { margin-top: 8px; }
.ck-preview-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--bone-dim); margin-bottom: 8px; display: block; }
.ck-preview-card {
  background: linear-gradient(135deg, #f4ecd6 0%, #e8dcb6 100%);
  padding: 28px 26px;
  position: relative;
  box-shadow: inset 0 0 60px rgba(120, 80, 30, 0.15), 0 8px 16px rgba(0,0,0,0.3);
  border: 1px solid rgba(0,0,0,0.1);
  min-height: 140px;
}
.ck-preview-card::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(90deg, rgba(0,0,0,0.18), transparent); }
.ck-preview-page { font-family: var(--serif); color: #2b1f0a; line-height: 1.5; }
.ck-prev-line { margin: 0 0 8px; font-size: 17px; }
.ck-prev-msg { margin: 0 0 14px; font-size: 16px; font-style: italic; }
.ck-prev-empty { margin: 0; font-size: 15px; opacity: 0.4; font-style: italic; }
.ck-prev-sig { font-family: 'Brush Script MT', 'Lucida Handwriting', cursive; font-size: 28px; color: #1d3a72; margin: 16px 0 0; transform: rotate(-3deg); line-height: 1; }
.ck-prev-num { font-size: 10px; letter-spacing: 0.22em; color: #6b4f24; margin: 6px 0 0; }

.ck-field { display: flex; flex-direction: column; gap: 6px; position: relative; }
.ck-field-full { grid-column: 1 / -1; }
.ck-label { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); }
.ck-label-opt { color: var(--bone-dim); font-style: italic; text-transform: none; opacity: 0.7; font-family: var(--serif); letter-spacing: 0; }
.ck-field input, .ck-field textarea { background: rgba(0, 0, 0, 0.3); border: 1px solid var(--rule); color: var(--bone); font-family: var(--sans); font-size: 15px; padding: 12px 14px; outline: none; transition: border-color 200ms; width: 100%; }
.ck-field input:focus, .ck-field textarea:focus { border-color: var(--royal-blue-glow); }
.ck-field textarea { resize: vertical; min-height: 80px; font-family: var(--serif); font-style: italic; font-size: 16px; }
.ck-counter { position: absolute; right: 8px; bottom: 8px; font-size: 10px; color: var(--bone-dim); pointer-events: none; }

.ck-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.ck-ship-options { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.ck-ship { display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer; border: 1px solid var(--rule); background: rgba(255,255,255,0.02); transition: all 200ms; }
.ck-ship.is-on { border-color: var(--royal-blue-glow); background: rgba(0,100,194,0.08); }
.ck-ship input { accent-color: var(--royal-blue-glow); margin: 0; }
.ck-ship-name { font-family: var(--sans); font-size: 14px; color: var(--bone); font-weight: 500; }
.ck-ship-sub { font-family: var(--serif); font-size: 13px; color: var(--bone-dim); font-style: italic; margin-top: 2px; }

.ck-embedded {
  background: var(--bone);
  border: 1px solid var(--rule);
  padding: 14px;
  min-height: 480px;
  border-radius: 4px;
}
.ck-embedded > * { width: 100%; }
.ck-stripe-loading {
  display: flex; align-items: center; gap: 12px;
  padding: 32px;
  border: 1px solid var(--rule);
  background: rgba(0,0,0,0.2);
  color: var(--bone-dim);
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.ck-stripe-loading .ck-spinner { border-color: rgba(245,244,232,0.3); border-top-color: var(--bone); }

.ck-stripe-card { border: 1px solid var(--rule); background: rgba(0,0,0,0.2); padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.ck-stripe-badge { display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid var(--rule); }
.ck-stripe-badge .mono { font-size: 10px; letter-spacing: 0.22em; color: var(--bone-dim); }
.ck-stripe-summary { display: flex; flex-direction: column; gap: 10px; }
.ck-stripe-summary-row { display: flex; justify-content: space-between; align-items: baseline; font-family: var(--sans); color: var(--bone-dim); font-size: 14px; }
.ck-stripe-summary-row.ck-stripe-summary-total { padding-top: 12px; margin-top: 4px; border-top: 1px solid var(--rule); font-size: 17px; color: var(--bone); font-weight: 600; }

.ck-error { padding: 12px 14px; border: 1px solid rgba(220, 80, 80, 0.4); background: rgba(220, 80, 80, 0.08); color: #ffb8b8; font-size: 13px; }

.ck-trust { display: flex; gap: 12px; align-items: flex-start; margin-top: 16px; font-size: 12px; color: var(--bone-dim); font-family: var(--serif); font-style: italic; line-height: 1.5; }
.ck-trust-i { font-size: 14px; }

.ck-info { padding: 24px; border: 1px dashed var(--rule); background: rgba(255,255,255,0.02); margin-bottom: 16px; }
.ck-info-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); display: block; margin-bottom: 10px; }
.ck-info p { margin: 0; font-family: var(--serif); color: var(--bone-dim); line-height: 1.5; font-size: 15px; }
.ck-link { background: transparent; border: none; padding: 0; margin-top: 14px; color: var(--royal-blue-glow); font-family: var(--mono); font-size: 12px; letter-spacing: 0.16em; cursor: pointer; text-transform: uppercase; }

.ck-side-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); margin-bottom: 16px; }
.ck-side-item { display: grid; grid-template-columns: 56px 1fr auto; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid var(--rule); }
.ck-side-item-art { width: 48px; height: 64px; background: #1a0606; border: 1px solid rgba(189, 155, 96, 0.3); position: relative; box-shadow: 3px 4px 0 rgba(0,0,0,0.3); }
.ck-side-spine { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(90deg, #1a0606, #2d0e0e); }
.ck-side-cover { padding: 5px 5px 5px 7px; height: 100%; display: flex; flex-direction: column; color: #e8c98a; }
.ck-side-cover-h { font-family: var(--mono); font-size: 5px; letter-spacing: 0.16em; opacity: 0.7; }
.ck-side-cover-t { font-family: var(--serif); font-size: 6px; line-height: 1; margin-top: 4px; font-style: italic; }
.ck-side-item-ball { background: transparent; border: none; box-shadow: none; padding-top: 4px; }
.ck-side-item-name { font-family: var(--sans); font-size: 13px; color: var(--bone); font-weight: 500; line-height: 1.3; }
.ck-side-item-sub { font-size: 9px; letter-spacing: 0.18em; color: var(--bone-dim); margin-top: 2px; }
.ck-side-item-pers { font-family: var(--serif); font-style: italic; font-size: 12px; color: var(--royal-blue-glow); margin-top: 4px; line-height: 1.4; }
.ck-side-item-price { color: var(--bone); font-size: 14px; font-weight: 600; }

.ck-side-totals { padding: 16px 0; display: flex; flex-direction: column; gap: 8px; }
.ck-side-row { display: flex; justify-content: space-between; font-family: var(--sans); font-size: 13px; color: var(--bone-dim); }
.ck-side-row.ck-side-total { padding-top: 12px; margin-top: 4px; border-top: 1px solid var(--rule); font-size: 16px; color: var(--bone); font-weight: 600; }
.ck-side-cur { font-size: 11px; color: var(--bone-dim); margin-left: 4px; }
.ck-side-note { font-size: 9px; letter-spacing: 0.16em; color: var(--bone-dim); padding: 14px 0 0; border-top: 1px solid var(--rule); margin-top: 8px; }

.ck-foot { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 32px; border-top: 1px solid var(--rule); background: rgba(0,0,0,0.2); }
.ck-btn-back { background: transparent; border: none; color: var(--bone-dim); font-family: var(--mono); font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; padding: 12px 0; transition: color 200ms; }
.ck-btn-back:hover { color: var(--bone); }
.ck-btn-back:disabled { opacity: 0.3; cursor: not-allowed; }

.ck-foot-r { display: flex; align-items: center; gap: 18px; }
.ck-foot-total { font-size: 11px; letter-spacing: 0.18em; color: var(--bone-dim); text-transform: uppercase; }
.ck-foot-amt { color: var(--bone); font-size: 16px; font-weight: 600; margin-left: 4px; }
.ck-btn-next, .ck-btn-pay {
  background: var(--royal-blue-glow); color: var(--navy-900);
  border: none; padding: 14px 28px;
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.18em;
  text-transform: uppercase; cursor: pointer;
  transition: all 200ms;
  display: flex; align-items: center; gap: 10px;
  font-weight: 600;
}
.ck-btn-next:hover, .ck-btn-pay:hover { background: var(--bone); }
.ck-btn-next:disabled, .ck-btn-pay:disabled { opacity: 0.4; cursor: not-allowed; }
.ck-btn-pay { background: var(--gold); }
.ck-btn-pay:hover { background: #d4b56e; }

.ck-spinner { width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: var(--navy-900); border-radius: 50%; animation: ckSpin 600ms linear infinite; }
@keyframes ckSpin { to { transform: rotate(360deg); } }

.ck-side-toggle {
  display: none;
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: none;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  padding: 14px 22px;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: var(--bone);
  font-family: var(--sans);
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.ck-side-toggle:hover { background: rgba(0,0,0,0.4); }
.ck-side-toggle-l { display: flex; flex-direction: column; gap: 4px; }
.ck-side-toggle-tag { font-size: 10px; letter-spacing: 0.22em; color: var(--gold); }
.ck-side-toggle-sub { font-size: 11px; color: var(--bone-dim); letter-spacing: 0.04em; text-transform: none; }
.ck-side-toggle-r { display: flex; align-items: center; gap: 12px; }
.ck-side-toggle-total { font-size: 16px; font-weight: 600; color: var(--bone); }
.ck-side-toggle-chev { color: var(--bone-dim); transition: transform 0.25s ease; }
.ck-side-toggle.is-open .ck-side-toggle-chev { transform: rotate(180deg); }

@media (max-width: 900px) {
  .ck-modal { max-height: calc(100dvh - 24px); }
  .ck-body { grid-template-columns: 1fr; }
  .ck-main { border-right: none; padding: 24px; }
  .ck-side-toggle { display: flex; }
  .ck-side {
    padding: 0 24px;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.32s ease, padding 0.32s ease;
    border-bottom: 1px solid var(--rule);
  }
  .ck-side.is-open { padding: 20px 24px 24px; max-height: 1200px; }
  .ck-head { padding: 18px 22px 14px; }
  .ck-head-title { font-size: 22px; }
  .ck-stepper { padding: 12px 22px; gap: 4px; }
  .ck-step-l { display: none; }
  .ck-step-rail { margin: 0 6px; }
  .ck-edit { grid-template-columns: auto 60px 1fr auto; gap: 12px; padding: 12px; }
  .ck-edit-art { width: 50px; height: 70px; }
  .ck-edit-name { font-size: 14px; }
  .ck-edit-sub { font-size: 12px; }
  .ck-edit-price { font-size: 16px; }
  .ck-addon { flex-direction: column; align-items: flex-start; gap: 14px; }
  .ck-addon-btn { width: 100%; }
  .ck-qty-row { flex-direction: column; align-items: stretch; gap: 14px; padding: 14px; }
  .ck-qty-stepper { align-self: flex-start; }
  .ck-foot { padding: 14px 22px; }
  .ck-btn-next, .ck-btn-pay { padding: 12px 18px; font-size: 11px; }
  .ck-foot-total { font-size: 10px; }
  .ck-foot-amt { font-size: 14px; }
  .ck-h { font-size: 22px; }
  .ck-lede { font-size: 15px; }
}
@media (max-width: 540px) {
  .ck-backdrop { padding: 0; }
  .ck-modal { max-height: 100dvh; height: 100dvh; max-width: none; }
  .ck-grid-2 { grid-template-columns: 1fr; }
  .ck-main { padding: 20px; }
  .ck-stripe-card { padding: 16px; }
}
`;
document.head.appendChild(ckStyles);

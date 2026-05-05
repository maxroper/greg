import React, { useEffect, useState } from "react";

// Reads ?checkout=success|cancel from the URL on first paint and shows a
// dismissable confirmation banner. Strips the query string so a refresh
// doesn't re-show it.
export default function CheckoutBanner() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("checkout");
    if (status === "success" || status === "cancel") {
      setState(status);
      params.delete("checkout");
      params.delete("session_id");
      const qs = params.toString();
      const next = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
      window.history.replaceState({}, "", next);
    }
  }, []);

  if (!state) return null;

  return (
    <div className={`ck-banner ck-banner-${state}`} role="status">
      <div className="ck-banner-inner">
        {state === "success" ? (
          <>
            <span className="ck-banner-stamp">✓</span>
            <div>
              <div className="ck-banner-title">Order received. Greg's on it.</div>
              <div className="ck-banner-sub">A receipt is in your inbox. Tracking follows when it ships.</div>
            </div>
          </>
        ) : (
          <>
            <span className="ck-banner-stamp ck-banner-stamp-cancel">×</span>
            <div>
              <div className="ck-banner-title">Checkout cancelled.</div>
              <div className="ck-banner-sub">No card was charged. Pop the order open again any time.</div>
            </div>
          </>
        )}
        <button className="ck-banner-close" onClick={() => setState(null)} aria-label="Dismiss">×</button>
      </div>
    </div>
  );
}

const bannerStyles = document.createElement("style");
bannerStyles.textContent = `
.ck-banner {
  position: fixed; top: 80px; left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  width: min(560px, calc(100% - 32px));
  background: var(--navy-800);
  border: 1px solid var(--royal-blue-glow);
  box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6);
  border-radius: 6px;
  animation: ck-banner-in 360ms cubic-bezier(.2,.8,.2,1);
}
.ck-banner-cancel { border-color: var(--gold); }
@keyframes ck-banner-in { from { opacity: 0; transform: translate(-50%, -16px); } to { opacity: 1; transform: translate(-50%, 0); } }
.ck-banner-inner { display: flex; align-items: center; gap: 16px; padding: 18px 22px; }
.ck-banner-stamp {
  width: 36px; height: 36px;
  border: 2px solid var(--royal-blue-glow);
  border-radius: 50%;
  display: grid; place-items: center;
  color: var(--royal-blue-glow);
  font-size: 18px; font-weight: 700;
  flex-shrink: 0;
}
.ck-banner-stamp-cancel { border-color: var(--gold); color: var(--gold); }
.ck-banner-title { font-family: var(--serif); font-size: 18px; color: var(--bone); font-weight: 500; }
.ck-banner-sub { font-size: 13px; color: var(--bone-dim); margin-top: 2px; }
.ck-banner-close {
  margin-left: auto;
  background: transparent; border: 1px solid var(--rule);
  color: var(--bone-dim);
  width: 28px; height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px; line-height: 1;
}
.ck-banner-close:hover { color: var(--bone); border-color: var(--bone-dim); }
`;
document.head.appendChild(bannerStyles);

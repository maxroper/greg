import React from "react";
import { useSiteContent } from "../content.js";

export default function Footer() {
  const { footer: copy } = useSiteContent();
  return (
    <footer className="footer">
      <div className="section-inner footer-inner">
        <div className="footer-row">
          <div>
            <div className="footer-brand">
              <span className="footer-mark">GP</span>
              <div>
                <div className="display h-sm" style={{margin: 0}}>{copy.brand}</div>
                <div className="mono" style={{fontSize: 11, color: "var(--royal-blue-glow)", letterSpacing: "0.16em", marginTop: 4}}>{copy.subbrand}</div>
              </div>
            </div>
            <p className="footer-copy">
              {copy.quote}
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <div className="mono footer-h">SITE</div>
              <a href="#hero" onClick={(e) => { e.preventDefault(); document.getElementById("hero")?.scrollIntoView({behavior:"smooth"}); }}>Home</a>
              <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({behavior:"smooth"}); }}>The Book</a>
              <a href="#memorabilia" onClick={(e) => { e.preventDefault(); document.getElementById("memorabilia")?.scrollIntoView({behavior:"smooth"}); }}>The Collection</a>
              <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({behavior:"smooth"}); }}>About Greg</a>
              <a href="#speaking" onClick={(e) => { e.preventDefault(); document.getElementById("speaking")?.scrollIntoView({behavior:"smooth"}); }}>On the Road</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({behavior:"smooth"}); }}>Get in Touch</a>
            </div>
            <div>
              <div className="mono footer-h">ELSEWHERE</div>
              <a href="mailto:gpryor@lifepriority.com">Email Greg</a>
              <a href="https://www.facebook.com/GregPryor85/" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.amazon.com/Day-Yankees-Made-Me-Shave-ebook/dp/B08FV8TLGW" target="_blank" rel="noopener noreferrer">Amazon</a>
              <a href="https://lifepriority.com/product/lift-caps/" target="_blank" rel="noopener noreferrer">Life Priority</a>
            </div>
            <div>
              <div className="mono footer-h">LEGAL</div>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="mono">{copy.copyright}</span>
          <span className="mono">{copy.credit}</span>
        </div>
      </div>
    </footer>
  );
}

const footerStyles = document.createElement("style");
footerStyles.textContent = `
.footer {
  background: #030810;
  border-top: 1px solid var(--rule);
  padding: 80px 0 40px;
}
.footer-row {
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 56px;
  padding-bottom: 56px;
  border-bottom: 1px solid var(--rule);
}
@media (max-width: 768px) { .footer-row { grid-template-columns: 1fr; gap: 32px; } }
.footer-brand { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.footer-mark {
  width: 48px; height: 48px;
  border: 1px solid var(--royal-blue-bright);
  background: var(--royal-blue);
  color: var(--bone);
  display: grid; place-items: center;
  font-family: var(--mono);
  font-size: 14px; font-weight: 600;
  border-radius: 50%;
}
.footer-copy {
  font-family: var(--serif);
  font-style: italic;
  font-size: 16px;
  color: var(--bone-dim);
  max-width: 44ch;
  margin: 0;
  line-height: 1.5;
}
.footer-cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
@media (max-width: 540px) { .footer-cols { grid-template-columns: 1fr 1fr; } }
.footer-cols a {
  display: block;
  padding: 6px 0;
  color: var(--bone-dim);
  font-size: 14px;
  transition: color 200ms;
}
.footer-cols a:hover { color: var(--gold); }
.footer-h { font-size: 10px; color: var(--gold); letter-spacing: 0.18em; margin-bottom: 12px; }
.footer-bottom {
  margin-top: 32px;
  display: flex; justify-content: space-between;
  font-size: 10px; letter-spacing: 0.16em; color: var(--bone-dim);
  flex-wrap: wrap; gap: 12px;
}
`;
document.head.appendChild(footerStyles);

import React, { useEffect, useRef, useState } from "react";

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 8% 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function Reveal({ children, delay = 0, as: Tag = "div", className = "", style }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ ...style, "--reveal-delay": `${delay}ms` }}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ index, children }) {
  return (
    <span className="eyebrow">
      {index ? <span className="mono" style={{ color: "var(--gold)", opacity: 0.7 }}>{index}</span> : null}
      {children}
    </span>
  );
}

export function Stitch({ style }) {
  return <div className="stitch" style={style} />;
}

export function Placeholder({ label, ratio = "16/9", style, className = "" }) {
  return (
    <div className={`ph ${className}`} style={{ aspectRatio: ratio, ...style }}>
      <div className="ph-label">{label || "Photo"}</div>
    </div>
  );
}

export function ImgPlate({ src, alt, caption, ratio = "16/9", style, className = "" }) {
  return (
    <div className={`imgwrap ${className}`} style={{ aspectRatio: ratio, ...style }}>
      <img src={src} alt={alt || ""} loading="lazy" />
      {caption ? <div className="caption">{caption}</div> : null}
    </div>
  );
}

export function Btn({ children, primary, ghost, href, onClick, type, target, rel }) {
  const cls = `btn ${primary ? "btn-primary" : ghost ? "btn-ghost" : ""}`;
  const arrow = <span className="btn-arrow" aria-hidden>→</span>;
  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick} target={target} rel={rel || (target === "_blank" ? "noopener" : undefined)}>
        {children} {arrow}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick} type={type || "button"}>
      {children} {arrow}
    </button>
  );
}

export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" ref={ref} />;
}

export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      const triggerY = window.innerHeight * 0.30;
      let bestId = ids[0];
      let bestTop = -Infinity;
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerY && rect.top > bestTop) {
          bestTop = rect.top;
          bestId = id;
        }
      });
      setActive((prev) => (prev === bestId ? prev : bestId));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids.join(",")]);
  return active;
}

export function useSectionInView() {
  useEffect(() => {
    const supportsTimeline = typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline: view()");
    if (supportsTimeline) return;
    const sections = document.querySelectorAll("section.section:not(.hero)");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("in-view");
      });
    }, { threshold: 0.04, rootMargin: "0px 0px 12% 0px" });
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);
}

export function useParallax(speed = 0.18) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${center * -speed}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return ref;
}

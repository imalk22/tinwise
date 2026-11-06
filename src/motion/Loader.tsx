import { useEffect, useRef, useState } from "react";
import { LogoGlyph } from "../components/Logo";
import { prefersReducedMotion, useReady } from "./core";

const SEEN_KEY = "tinlanka.intro";
const ARC = 2 * Math.PI * 94;

/**
 * Brand intro: a ring fills while fonts load, then a gradient curtain wipes it away.
 * Shown once per browser session, never for reduced motion, and never longer than ~3s.
 */
export function Loader({ tagline }: { tagline: string }) {
  const { setReady } = useReady();
  const [skip] = useState(() => {
    try {
      return prefersReducedMotion() || sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      return prefersReducedMotion();
    }
  });
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(skip);
  const finished = useRef(false);

  useEffect(() => {
    if (skip) {
      setReady();
      return;
    }
    let fontsLoaded = false;
    document.fonts?.ready.then(() => (fontsLoaded = true));
    const t0 = performance.now();
    const minTime = 1400;
    let shown = 0;
    let raf = 0;

    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      setDone(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* storage blocked */
      }
      setTimeout(setReady, 550);
      setTimeout(() => setGone(true), 1200);
    };

    const tick = (now: number) => {
      const timeShare = Math.min((now - t0) / minTime, 1);
      const target = (fontsLoaded ? timeShare : Math.min(timeShare, 0.85)) * 100;
      shown += (target - shown) * 0.12;
      if (target >= 100 && shown > 99.4) shown = 100;
      setProgress(shown);
      if (shown < 100) raf = requestAnimationFrame(tick);
      else setTimeout(finish, 200);
    };
    raf = requestAnimationFrame(tick);
    // Never hang on a slow network or a throttled background tab.
    const bail = setTimeout(finish, 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bail);
    };
  }, [skip, setReady]);

  if (gone) return null;

  return (
    <div className={`loader ${done ? "done" : ""}`} aria-hidden="true">
      <div className="loader__aurora">
        <i />
        <i />
        <i />
      </div>
      <div className="loader__inner">
        <div className="loader__emblem">
          <div className="loader__halo" />
          <svg className="loader__ring" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="loaderGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#25aee3" />
                <stop offset=".5" stopColor="#0071e3" />
                <stop offset="1" stopColor="#7d4cdb" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="94" className="loader__track" />
            <circle
              cx="100"
              cy="100"
              r="94"
              className="loader__arc"
              style={{ strokeDasharray: ARC, strokeDashoffset: ARC * (1 - progress / 100) }}
            />
          </svg>
          <div className="loader__mark">
            <LogoGlyph size={64} />
            <span className="loader__shine" />
          </div>
        </div>
        <p className="loader__name">
          <span>TINwise</span>
          <span>{tagline}</span>
        </p>
        <div className="loader__count">{Math.round(progress)}%</div>
      </div>
      <div className="loader__curtain" />
    </div>
  );
}

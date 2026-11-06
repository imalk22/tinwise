import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export const prefersReducedMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () =>
  typeof matchMedia !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- "Ready": flips once the intro loader has cleared ---------- */

const ReadyContext = createContext<{ ready: boolean; setReady: () => void }>({ ready: true, setReady: () => {} });

export function ReadyProvider({ children }: { children: ReactNode }) {
  const [ready, set] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("is-ready", ready);
  }, [ready]);
  return <ReadyContext.Provider value={{ ready, setReady: () => set(true) }}>{children}</ReadyContext.Provider>;
}

export const useReady = () => useContext(ReadyContext);

/* ---------- Adds `.shown` the first time an element scrolls into view ---------- */

export function useShown<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}

/* ---------- Count up to a number when shown ---------- */

export function useCountUp(end: number, run: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      setValue(end);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(end * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, run, duration]);
  return value;
}

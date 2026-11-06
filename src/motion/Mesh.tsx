import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "./core";

/**
 * Drifting network of points with flowing wave lines; points shy away from the pointer.
 * Pauses when off screen or in a background tab, and is skipped for reduced motion.
 */
export function Mesh({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const color = () => (document.documentElement.classList.contains("dark") ? "100,170,255" : "0,113,227");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const density = innerWidth < 720 ? 25000 : 14000;
    const link = 130;
    let w = 0;
    let h = 0;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const mouse = { x: -999, y: -999 };
    let visible = true;
    let raf = 0;
    let t = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.round((w * h) / density));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };
    resize();

    const host = canvas.parentElement!;
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
    };
    const onLeave = () => (mouse.x = mouse.y = -999);
    addEventListener("resize", resize);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      t += 0.004;
      const c = color();
      ctx.clearRect(0, 0, w, h);

      // Flowing wave lines near the bottom.
      for (let k = 0; k < 14; k++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const y = h * 0.8 + Math.sin(x * 0.004 + t * 2 + k * 0.35) * (40 + k * 5) + Math.cos(x * 0.0017 - t + k) * 30 - k * 6;
          if (x) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.strokeStyle = `rgba(${c},${0.04 + k * 0.01})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 120) {
          p.x += (dx / d) * 0.8;
          p.y += (dy / d) * 0.8;
        }
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(${c},${(1 - d / link) * 0.3})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${c},.55)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("resize", resize);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

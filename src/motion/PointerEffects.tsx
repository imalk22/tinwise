import { useEffect } from "react";
import { finePointer, prefersReducedMotion } from "./core";

/**
 * Desktop-only pointer effects, wired once with event delegation:
 * - a soft glow that trails the cursor
 * - a spotlight on any `.card` under the pointer (sets --mx / --my)
 * - a gentle 3D tilt on `.tilt` elements
 * - a magnetic pull on `.magnetic` buttons
 */
export function PointerEffects() {
  useEffect(() => {
    if (prefersReducedMotion() || !finePointer()) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    let gx = innerWidth / 2;
    let gy = innerHeight / 2;
    let cx = gx;
    let cy = gy;
    let raf = 0;
    let tilted: HTMLElement | null = null;
    let pulled: HTMLElement | null = null;

    const follow = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(follow);
    };
    raf = requestAnimationFrame(follow);

    const release = (el: HTMLElement | null, prop: "transform" | "translate") => {
      if (el) el.style[prop] = "";
    };

    const onMove = (e: PointerEvent) => {
      gx = e.clientX;
      gy = e.clientY;
      glow.classList.add("on");
      const target = e.target as Element | null;

      const card = target?.closest<HTMLElement>(".card");
      if (card) {
        const b = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - b.left}px`);
        card.style.setProperty("--my", `${e.clientY - b.top}px`);
      }

      const tilt = target?.closest<HTMLElement>(".tilt") ?? null;
      if (tilt !== tilted) release(tilted, "transform");
      tilted = tilt;
      if (tilt) {
        const b = tilt.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width;
        const y = (e.clientY - b.top) / b.height;
        tilt.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 5}deg)`;
      }

      const mag = target?.closest<HTMLElement>(".magnetic") ?? null;
      if (mag !== pulled) release(pulled, "translate");
      pulled = mag;
      if (mag) {
        const b = mag.getBoundingClientRect();
        mag.style.translate = `${(e.clientX - b.left - b.width / 2) * 0.18}px ${(e.clientY - b.top - b.height / 2) * 0.25}px`;
      }
    };
    const onLeave = () => {
      glow.classList.remove("on");
      release(tilted, "transform");
      release(pulled, "translate");
      tilted = pulled = null;
    };

    addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      glow.remove();
    };
  }, []);

  return null;
}

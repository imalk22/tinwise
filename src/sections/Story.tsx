import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "../components/ui";
import { useT } from "../i18n";
import { prefersReducedMotion, useCountUp, useShown } from "../motion/core";
import { Kicker } from "../motion/Text";

/* ---------- Stats band: count-up numbers ---------- */

const STATS = [
  { end: 8, decimals: 0, prefix: "", suffix: "" },
  { end: 1.8, decimals: 1, prefix: "currency", suffix: "M" },
  { end: 18, decimals: 0, prefix: "", suffix: "+" },
  { end: 3, decimals: 0, prefix: "", suffix: "" },
];

function Stat({ i, label }: { i: number; label: string }) {
  const { t } = useT();
  const s = STATS[i];
  const [ref, shown] = useShown<HTMLDivElement>(0.5);
  const value = useCountUp(s.end, shown);
  return (
    <div ref={ref} className="stat card p-7">
      <div className="stat__num relative text-5xl font-extrabold tracking-[-0.04em] tabular-nums md:text-6xl">
        {s.prefix === "currency" && <span className="text-3xl md:text-4xl">{t.common.currency} </span>}
        {value.toFixed(s.decimals)}
        {s.suffix}
      </div>
      <p className="relative mt-3 max-w-[22ch] text-[15px] text-mute">{label}</p>
    </div>
  );
}

export function StatsBand() {
  const { t } = useT();
  return (
    <section id="stats" className="px-5 pb-8">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {t.stats.map((label, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Stat i={i} label={label} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- Marquee ---------- */

const WORDS = ["TIN", "බදු", "வரி", "Free", "නොමිලේ", "இலவசம்", "Private", "APIT", "VAT", "SSCL"];

export function Marquee() {
  const row = (
    <>
      {WORDS.map((w, i) => (
        <span key={i} className="contents">
          <span>{w}</span>
          <i>✦</i>
        </span>
      ))}
    </>
  );
  return (
    <div className="marquee py-10 text-ink/85 dark:text-white/85" aria-hidden="true">
      <div className="marquee__track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ---------- Scroll-scrub statement: words light up as you scroll ---------- */

export function Scrub() {
  const { t } = useT();
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(
    () =>
      t.scrub.text
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => ({ text: w.replace(/\*/g, ""), hl: w.includes("*") })),
    [t.scrub.text],
  );
  const [lit, setLit] = useState(prefersReducedMotion() ? words.length : 0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setLit(words.length);
      return;
    }
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(Math.max((innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.4), 0), 1);
      setLit(Math.floor(p * words.length));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
    };
  }, [words.length]);

  return (
    <section className="px-5 py-24 md:py-36">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Kicker>{t.scrub.kicker}</Kicker>
        </Reveal>
        <p
          ref={ref}
          aria-label={t.scrub.text.replace(/\*/g, "")}
          className="scrub mt-8 text-[1.7rem] font-semibold leading-[1.25] tracking-[-0.03em] sm:text-4xl md:text-5xl"
        >
          {words.map((w, i) => (
            <span key={i} aria-hidden="true">
              <span className={`w ${i < lit ? "on" : ""} ${w.hl ? "hl" : ""}`}>{w.text}</span>{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ---------- Call-to-action band with a light beam ---------- */

export function CtaBand() {
  const { t } = useT();
  return (
    <section className="px-5 pb-24">
      <Reveal>
        <div className="beam mx-auto max-w-6xl rounded-[32px] bg-[linear-gradient(120deg,#0b1d55,#0071e3_55%,#7d4cdb)] px-8 py-14 text-white sm:px-14 sm:py-20">
          <div className="relative grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="headline text-white">{t.cta.title}</h2>
              <p className="mt-4 max-w-xl text-lg text-white/75">{t.cta.sub}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href="https://www.ird.gov.lk"
                target="_blank"
                rel="noreferrer"
                className="magnetic inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-[16px] font-semibold text-[#0b1d55] transition-colors hover:bg-white/90"
              >
                {t.cta.button} <ArrowUpRight size={17} strokeWidth={2} />
              </a>
              <a href="#check" className="magnetic inline-flex items-center gap-1.5 rounded-full px-5 py-3.5 text-[16px] font-medium text-white/90 hover:bg-white/10">
                {t.cta.secondary} <ArrowRight size={16} strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useT } from "../i18n";
import { Kicker, RiseTitle } from "../motion/Text";

export const spring = { type: "spring", stiffness: 380, damping: 32, mass: 0.8 } as const;
export const softSpring = { type: "spring", stiffness: 120, damping: 20 } as const;

/** Fades and lifts children into view once, as the user scrolls. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A number that glides to its new value. */
export function AnimatedNumber({ value, format, className }: { value: number; format: (n: number) => string; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(mv, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, inView, reduce, mv]);

  return <motion.span ref={ref} className={`tabular-nums whitespace-nowrap ${className ?? ""}`}>{text}</motion.span>;
}

export function SectionHeader({
  n,
  eyebrow,
  a,
  b,
  accent = "gradient",
  breakLine = false,
  sub,
}: {
  n?: number;
  eyebrow: string;
  a: string;
  b?: string;
  accent?: "gradient" | "mute";
  breakLine?: boolean;
  sub?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
      <Reveal>
        <Kicker n={n}>{eyebrow}</Kicker>
      </Reveal>
      <div className="mt-5">
        <RiseTitle a={a} b={b} accent={accent} breakLine={breakLine} />
      </div>
      {sub && (
        <Reveal delay={0.15}>
          <p className="subhead mt-5">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/** Page section with optional drifting colour washes behind it (variant 0–2). */
export function Section({ id, children, className = "", ambient }: { id: string; children: ReactNode; className?: string; ambient?: 0 | 1 | 2 }) {
  return (
    <section id={id} className={`relative isolate px-5 py-24 md:py-32 ${className}`}>
      {ambient !== undefined && (
        <div className={`ambient a${ambient}`} aria-hidden="true">
          <i />
          <i />
        </div>
      )}
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** iOS-style segmented control with a sliding thumb. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex shrink-0 rounded-full bg-black/[0.05] dark:bg-white/[0.08] ${size === "sm" ? "p-0.5" : "p-1"}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full font-medium transition-colors ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-4 py-1.5 text-sm"} ${active ? "text-ink dark:text-white" : "text-mute"}`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={spring}
                className="absolute inset-0 rounded-full bg-white dark:bg-[#3a3a3c] shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

const grouping = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });

/** Rupee input that keeps thousands separators while you type. */
export function MoneyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  const id = useId();
  const { t } = useT();
  const [text, setText] = useState(value ? grouping.format(value) : "");

  useEffect(() => {
    const parsed = Number(text.replace(/[^\d]/g, "")) || 0;
    // Sync only when the value changes from outside (e.g. a preset tap).
    if (parsed !== value) setText(value ? grouping.format(value) : "");
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-mute dark:text-[#a1a1a6]">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-mute">{t.common.currency}</span>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          className="field pl-12"
          placeholder="0"
          value={text}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 12);
            const n = Number(digits) || 0;
            setText(digits ? grouping.format(n) : "");
            onChange(n);
          }}
        />
      </div>
      {hint && <span className="mt-1.5 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

/** Pressable card with a subtle spring on tap. */
export function Pressable({ children, className = "", onClick, selected }: { children: ReactNode; className?: string; onClick?: () => void; selected?: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      aria-pressed={selected}
      className={`text-left ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-xs leading-relaxed text-mute">{children}</p>;
}

/** Decimal-friendly number input with optional prefix/suffix (rates, percentages). */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  decimals = 2,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  decimals?: number;
}) {
  const id = useId();
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if ((Number(text) || 0) !== value) setText(String(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-sm font-medium text-mute dark:text-[#a1a1a6]">{label}</span>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-mute">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          className={`field ${prefix ? "pl-14" : ""} ${suffix ? "pr-12" : ""}`}
          value={text}
          onChange={(e) => {
            let v = e.target.value.replace(/[^\d.]/g, "");
            const [whole, ...rest] = v.split(".");
            v = rest.length ? `${whole}.${rest.join("").slice(0, decimals)}` : whole;
            setText(v);
            onChange(Number(v) || 0);
          }}
        />
        {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-mute">{suffix}</span>}
      </div>
      {hint && <span className="mt-1.5 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

/** iOS-style switch. */
export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.07] px-4 py-3.5 text-left"
    >
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-mute">{hint}</span>}
      </span>
      <span className={`flex h-[31px] w-[51px] shrink-0 rounded-full p-[2px] transition-colors duration-200 ${checked ? "justify-end bg-[#30d158]" : "justify-start bg-black/15 dark:bg-white/20"}`}>
        <motion.span layout transition={spring} className="h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)]" />
      </span>
    </button>
  );
}

/** Range slider with a live value label. */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  display,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  display: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label htmlFor={id} className="block">
      <span className="mb-3 flex items-baseline justify-between text-sm font-medium text-mute dark:text-[#a1a1a6]">
        {label}
        <span className="text-base font-semibold tabular-nums text-ink dark:text-white">{display}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider w-full"
        style={{ background: `linear-gradient(to right, var(--color-accent) ${pct}%, color-mix(in srgb, currentColor 12%, transparent) ${pct}%)` }}
      />
    </label>
  );
}

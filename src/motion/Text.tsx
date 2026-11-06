import type { ReactNode } from "react";
import { useT } from "../i18n";
import { useShown } from "./core";

/**
 * Hero line that assembles piece by piece.
 * English splits into letters. Sinhala and Tamil split into words, because breaking
 * their conjunct letters apart into separate boxes would corrupt the shaping.
 */
export function AssembleText({ text, grad = false, offset = 0 }: { text: string; grad?: boolean; offset?: number }) {
  const { lang } = useT();
  const pieces = lang === "en" ? [...text] : text.split(/(\s+)/);
  let i = offset;
  return (
    <span aria-label={text} role="text">
      {pieces.map((p, k) =>
        /^\s+$/.test(p) ? (
          <span key={k}> </span>
        ) : (
          <span key={k} aria-hidden="true" className={`ch ${grad ? "grad" : ""}`} style={{ ["--i" as string]: i++ }}>
            {p}
          </span>
        ),
      )}
    </span>
  );
}

/** Number of animated pieces in a line, so the next line can continue the stagger. */
export const pieceCount = (text: string, lang: string) =>
  lang === "en" ? [...text].filter((c) => c !== " ").length : text.split(/\s+/).filter(Boolean).length;

/** Section title whose words rise out of a mask when it scrolls into view. */
export function RiseTitle({
  a,
  b,
  accent = "gradient",
  breakLine = false,
  className = "headline",
}: {
  a: string;
  b?: string;
  accent?: "gradient" | "mute";
  breakLine?: boolean;
  className?: string;
}) {
  const [ref, shown] = useShown<HTMLHeadingElement>(0.3);
  let w = 0;
  const words = (text: string, cls = "") =>
    text
      .split(/\s+/)
      .filter(Boolean)
      .map((word, k) => (
        <span key={`${cls}${k}`}>
          <span className="tw">
            <span className={`tw__in ${cls}`} style={{ ["--w" as string]: w++ }}>
              {word}
            </span>
          </span>{" "}
        </span>
      ));
  const accentCls = accent === "gradient" ? "text-gradient" : "text-mute";
  return (
    <h2 ref={ref} className={`${className} ${shown ? "shown" : ""}`} aria-label={[a, b].filter(Boolean).join(" ")}>
      <span aria-hidden="true">
        {words(a)}
        {b && breakLine && <br />}
        {b && words(b, accentCls)}
      </span>
    </h2>
  );
}

/** Numbered pill label with a pulsing dot. */
export function Kicker({ n, children }: { n?: number; children: ReactNode }) {
  return (
    <span className="kicker">
      {n !== undefined && <b>{String(n).padStart(2, "0")}</b>}
      {children}
    </span>
  );
}

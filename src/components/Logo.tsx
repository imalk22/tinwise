import { useId } from "react";

/**
 * TINwise mark: a "T" whose partner stroke is a verification tick — "your TIN, checked".
 * Deep navy-to-blue tile, white T, sky-blue tick. Drawn on a 64-unit grid.
 */
export const T_BAR = "M15 21H35";
export const T_STEM = "M25 21V45";
export const TICK = "M33 37l6 6 11-16";

function Strokes({ tick = "#5ac8fa" }: { tick?: string }) {
  return (
    <g fill="none" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={T_BAR} stroke="#fff" />
      <path d={T_STEM} stroke="#fff" />
      <path d={TICK} stroke={tick} />
    </g>
  );
}

export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a2a6b" />
          <stop offset="1" stopColor="#0071e3" />
        </linearGradient>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#g${id})`} />
      <rect width="64" height="64" rx="15" fill={`url(#h${id})`} />
      <rect x="0.5" y="0.5" width="63" height="63" rx="14.5" fill="none" stroke="#fff" strokeOpacity="0.12" />
      <Strokes />
    </svg>
  );
}

/** Just the strokes, for placing on an existing coloured surface. */
export function LogoGlyph({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="10 14 44 36" aria-hidden="true">
      <Strokes />
    </svg>
  );
}

/** Two-weight wordmark: bold "TIN", lighter "wise". */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`tracking-[-0.02em] ${className}`}>
      <span className="font-extrabold">TIN</span>
      <span className="font-medium text-accent dark:text-[#5ac8fa]">wise</span>
    </span>
  );
}

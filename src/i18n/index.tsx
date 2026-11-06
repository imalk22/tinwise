import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dict } from "./en";
import { si } from "./si";
import { ta } from "./ta";

export type Lang = "en" | "si" | "ta";
export const DICTS: Record<Lang, Dict> = { en, si, ta };
export const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "si", label: "සිං" },
  { value: "ta", label: "தமிழ்" },
];

const STORAGE_KEY = "tinlanka.lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "si" || saved === "ta") return saved;
  } catch {
    /* storage blocked */
  }
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("si")) return "si";
  if (nav.startsWith("ta")) return "ta";
  return "en";
}

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  /** Locale-aware rupee formatting. */
  money: (n: number) => string;
  pct: (n: number, digits?: number) => string;
  locale: string;
}

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = DICTS[lang].meta.title;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage blocked */
    }
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const t = DICTS[lang];
    const locale = lang === "en" ? "en-LK" : `${lang}-LK`;
    const nf = new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 });
    return {
      lang,
      setLang,
      t,
      locale,
      money: (n) => `${t.common.currency}\u00a0${nf.format(Math.round(n))}`,
      pct: (n, digits = 1) => `${(n * 100).toFixed(digits)}%`,
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LangProvider");
  return ctx;
}

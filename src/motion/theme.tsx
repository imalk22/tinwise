import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "../i18n";

const KEY = "sarala.theme";
type Theme = "light" | "dark";

const systemTheme = (): Theme => (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

function savedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export const isDark = () => document.documentElement.classList.contains("dark");

/**
 * Light/dark switch. Until someone taps it, the site follows the device setting live;
 * after that their choice is remembered.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? systemTheme());

  useEffect(() => {
    const root = document.documentElement;
    // Smooth cross-fade between themes, without animating the first paint.
    root.classList.add("theme-anim");
    root.classList.toggle("dark", theme === "dark");
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (meta) meta.content = theme === "dark" ? "#000000" : "#f5f5f7";
    const t = setTimeout(() => root.classList.remove("theme-anim"), 500);
    return () => clearTimeout(t);
  }, [theme]);

  // Follow the device setting while the user hasn't chosen.
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!savedTheme()) setTheme(systemTheme());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () =>
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* storage blocked */
      }
      return next;
    });

  return { theme, toggle };
}

export function ThemeToggle() {
  const { t } = useT();
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? t.common.lightMode : t.common.darkMode}
      title={dark ? t.common.lightMode : t.common.darkMode}
      className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.05] text-ink transition-colors hover:bg-black/[0.09] dark:bg-white/[0.1] dark:text-white dark:hover:bg-white/[0.16]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="block"
        >
          {dark ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

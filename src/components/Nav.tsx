import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { LANGS, useT } from "../i18n";
import { ThemeToggle } from "../motion/theme";
import { LogoMark, Wordmark } from "./Logo";
import { Segmented, spring } from "./ui";

const LINK_KEYS = ["check", "guide", "help", "salary", "annual", "interest", "calendar", "tools", "faq"] as const;

function LanguageSwitch() {
  const { lang, setLang, t } = useT();
  return <Segmented label={t.common.language} value={lang} onChange={setLang} options={LANGS} size="sm" />;
}

export function Nav() {
  const { t, lang } = useT();
  // Sinhala and Tamil labels are longer, so they need an extra-wide screen for inline links.
  const wide = lang === "en" ? "xl" : "2xl";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  const links = LINK_KEYS.map((k) => ({ href: `#${k}`, label: t.nav[k] }));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`glass border-b transition-colors duration-300 ${scrolled ? "hairline" : "border-transparent"}`}>
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-5 text-[13px]">
          <a href="#top" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-[15px]">
            <LogoMark size={26} />
            <Wordmark className="text-[17px] max-[400px]:sr-only" />
          </a>
          <ul className={`hidden items-center gap-6 ${wide === "xl" ? "xl:flex" : "2xl:flex"}`}>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="whitespace-nowrap text-ink/80 dark:text-white/80 hover:text-ink dark:hover:text-white transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
            <button
              className={`p-1 -mr-1 ${wide === "xl" ? "xl:hidden" : "2xl:hidden"}`}
              aria-label={open ? t.common.closeMenu : t.common.openMenu}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "x" : "m"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className={`glass border-b hairline overflow-hidden ${wide === "xl" ? "xl:hidden" : "2xl:hidden"}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
          >
            <ul className="px-5 py-4 space-y-1">
              {links.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-2xl font-semibold tracking-tight">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

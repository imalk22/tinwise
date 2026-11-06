import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LANGS, useT } from "../i18n";
import { ThemeToggle } from "../motion/theme";
import { PAGES } from "../pages";
import { useRouter } from "../router";
import { LogoMark, Wordmark } from "./Logo";
import { Segmented, spring } from "./ui";

function LanguageSwitch() {
  const { lang, setLang, t } = useT();
  return <Segmented label={t.common.language} value={lang} onChange={setLang} options={LANGS} size="sm" />;
}

export function Nav() {
  const { t, lang } = useT();
  // Sinhala and Tamil labels are longer, so they need an extra-wide screen for inline links.
  const wide = lang === "en" ? "lg" : "xl";
  const { path } = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));
  // Close the mobile menu whenever the page changes.
  useEffect(() => setOpen(false), [path]);

  const links = PAGES.map((p) => ({ href: p.path, label: t.pages[p.key].label, desc: t.pages[p.key].desc, icon: p.icon, tint: p.tint }));

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`glass border-b transition-colors duration-300 ${scrolled ? "hairline" : "border-transparent"}`}>
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-5 text-[13px]">
          <a href="/" aria-label="TINwise" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight text-[15px]">
            <LogoMark size={26} />
            <Wordmark className="text-[17px] max-[400px]:sr-only" />
          </a>
          <ul className={`hidden items-center gap-1 ${wide === "lg" ? "lg:flex" : "xl:flex"}`}>
            {links.map((l) => {
              const active = path === l.href;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors ${
                      active ? "text-ink dark:text-white" : "text-ink/70 hover:text-ink dark:text-white/70 dark:hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span layoutId="nav-active" transition={spring} className="absolute inset-0 rounded-full bg-black/[0.06] dark:bg-white/[0.1]" />
                    )}
                    <span className="relative">{l.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitch />
            <button
              className={`p-1 -mr-1 ${wide === "lg" ? "lg:hidden" : "xl:hidden"}`}
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
            className={`glass border-b hairline overflow-hidden ${wide === "lg" ? "lg:hidden" : "xl:hidden"}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring}
          >
            <ul className="mx-auto max-w-6xl space-y-1 px-3 py-4">
              {links.map((l, i) => {
                const Icon = l.icon;
                const active = path === l.href;
                return (
                  <motion.li key={l.href} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-4 rounded-2xl px-2 py-2.5 ${active ? "bg-black/[0.05] dark:bg-white/[0.08]" : ""}`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: l.tint }}>
                        <Icon size={19} strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xl font-semibold tracking-tight">{l.label}</span>
                        <span className="block truncate text-[13px] text-mute">{l.desc}</span>
                      </span>
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

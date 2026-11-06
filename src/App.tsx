import { MotionConfig, motion, useScroll, useSpring } from "motion/react";
import { Nav } from "./components/Nav";
import { LogoMark, Wordmark } from "./components/Logo";
import { LangProvider, useT } from "./i18n";
import { ReadyProvider } from "./motion/core";
import { Loader } from "./motion/Loader";
import { PointerEffects } from "./motion/PointerEffects";
import { PAGES, Routes } from "./pages";
import { RouterProvider } from "./router";

export default function App() {
  return (
    <LangProvider>
      <RouterProvider>
        <ReadyProvider>
          <Page />
        </ReadyProvider>
      </RouterProvider>
    </LangProvider>
  );
}

function Page() {
  const { t, lang, locale } = useT();
  const checked = formatDate(import.meta.env.VITE_RATES_CHECKED, lang, locale);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <MotionConfig reducedMotion="user">
      <Loader tagline={t.intro.tagline} />
      <PointerEffects />
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent" />
      <Nav />
      <main>
        <Routes />
      </main>
      <footer className="border-t hairline px-5 py-12 text-xs text-mute">
        <div className="mx-auto mb-10 flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <a href="/" className="flex items-center gap-2 text-ink dark:text-white">
            <LogoMark size={28} />
            <Wordmark className="text-[18px]" />
          </a>
          <nav aria-label={t.footer.explore}>
            <p className="mb-3 font-semibold text-ink dark:text-white">{t.footer.explore}</p>
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-[13px] sm:grid-cols-3">
              <li><a href="/" className="hover:text-ink dark:hover:text-white">{t.pages.home.label}</a></li>
              {PAGES.map((p) => (
                <li key={p.path}>
                  <a href={p.path} className="hover:text-ink dark:hover:text-white">{t.pages[p.key].label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mx-auto max-w-6xl space-y-3 border-t hairline pt-8 leading-relaxed">
          <p>
            {t.footer.disclaimer}{" "}
            <a className="underline" href="https://www.ird.gov.lk" target="_blank" rel="noreferrer">ird.gov.lk</a>.
          </p>
          <p>{t.footer.checked(checked)}</p>
          <p>{t.footer.privacy}</p>
          {t.footer.review && <p>{t.footer.review}</p>}
        </div>
      </footer>
    </MotionConfig>
  );
}

const MONTHS: Record<string, string[]> = {
  si: ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"],
  ta: ["ஜனவரி", "பெப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்", "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "ஒக்டோபர்", "நவம்பர்", "டிசம்பர்"],
};

/** "2026 නොවැම්බර් 6" style dates; many browsers have no Sinhala/Tamil month names built in. */
function formatDate(iso: string, lang: string, locale: string) {
  const d = new Date(`${iso}T00:00:00`);
  const months = MONTHS[lang];
  if (months) return `${d.getFullYear()} ${months[d.getMonth()]} ${d.getDate()}`;
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

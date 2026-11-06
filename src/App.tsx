import { MotionConfig, motion, useScroll, useSpring } from "motion/react";
import { lazy, Suspense } from "react";
import { Nav } from "./components/Nav";
import { LangProvider, useT } from "./i18n";
import { ReadyProvider } from "./motion/core";
import { Loader } from "./motion/Loader";
import { PointerEffects } from "./motion/PointerEffects";
import { AnnualEstimator } from "./sections/AnnualEstimator";
import { Calendar } from "./sections/Calendar";
import { Faq } from "./sections/Faq";
import { Hero } from "./sections/Hero";
import { InterestWht } from "./sections/InterestWht";
import { SalaryCalculator } from "./sections/SalaryCalculator";
import { TinChecker } from "./sections/TinChecker";
import { CtaBand, Marquee, Scrub, StatsBand } from "./sections/Story";
import { TinGuide } from "./sections/TinGuide";
import { Glossary } from "./sections/Glossary";
import { Help } from "./sections/Help";

// Below the fold and the heaviest section: load it after first paint.
const Tools = lazy(() => import("./sections/Tools").then((m) => ({ default: m.Tools })));

export default function App() {
  return (
    <LangProvider>
      <ReadyProvider>
        <Page />
      </ReadyProvider>
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
        <Hero />
        <StatsBand />
        <Marquee />
        <Scrub />
        <TinChecker />
        <TinGuide />
        <Help />
        <SalaryCalculator />
        <AnnualEstimator />
        <InterestWht />
        <Calendar />
        <Suspense fallback={<div id="tools" className="min-h-[60vh]" />}>
          <Tools />
        </Suspense>
        <Glossary />
        <Faq />
        <CtaBand />
      </main>
      <footer className="border-t hairline px-5 py-12 text-xs text-mute">
        <div className="mx-auto max-w-6xl space-y-3 leading-relaxed">
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

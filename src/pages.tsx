import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CalendarDays, ChevronRight, Compass, IdCard, Wrench, type LucideIcon } from "lucide-react";
import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Reveal } from "./components/ui";
import { useT } from "./i18n";
import { Kicker, RiseTitle } from "./motion/Text";
import { scrollToHash, useRouter, type PagePath } from "./router";
import { AnnualEstimator } from "./sections/AnnualEstimator";
import { Calendar } from "./sections/Calendar";
import { Faq } from "./sections/Faq";
import { Glossary } from "./sections/Glossary";
import { Help } from "./sections/Help";
import { Hero } from "./sections/Hero";
import { InterestWht } from "./sections/InterestWht";
import { SalaryCalculator } from "./sections/SalaryCalculator";
import { CtaBand, Marquee, Scrub, StatsBand } from "./sections/Story";
import { TinChecker } from "./sections/TinChecker";
import { TinGuide } from "./sections/TinGuide";

// The heaviest section: only load it when someone opens the Tools page.
const Tools = lazy(() => import("./sections/Tools").then((m) => ({ default: m.Tools })));

type PageKey = "tin" | "calculators" | "tools" | "calendar" | "learn";
type NavKey = "check" | "guide" | "help" | "salary" | "annual" | "interest" | "calendar" | "tools" | "glossary" | "faq";

/** Site map: page path, its dictionary key, icon, tint, and the sections it holds. */
export const PAGES: { path: PagePath; key: PageKey; icon: LucideIcon; tint: string; sections: NavKey[]; compact?: boolean }[] = [
  { path: "/tin", key: "tin", icon: IdCard, tint: "#0071e3", sections: ["check", "guide", "help"] },
  { path: "/calculators", key: "calculators", icon: Calculator, tint: "#5e5ce6", sections: ["salary", "annual", "interest"] },
  { path: "/tools", key: "tools", icon: Wrench, tint: "#bf5af2", sections: [], compact: true },
  { path: "/calendar", key: "calendar", icon: CalendarDays, tint: "#ff9f0a", sections: [] },
  { path: "/learn", key: "learn", icon: BookOpen, tint: "#30d158", sections: ["glossary", "faq"] },
];

/** Picks the page for the current path and fades it in. */
export function Routes() {
  const { path } = useRouter();
  const { t } = useT();
  const page = PAGES.find((p) => p.path === path);
  const known = path === "/" || !!page;

  useEffect(() => {
    document.title = page ? `${t.pages[page.key].label} — TINwise` : known ? t.meta.title : `404 — TINwise`;
    // Each page is its own canonical URL, so search engines index them separately.
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical && known) canonical.href = new URL(path, canonical.href).href;
  }, [page, known, path, t]);

  // New page: jump to its #section (or the top) once it has rendered.
  useEffect(() => scrollToHash(), [path]);

  return (
    <motion.div
      key={path}
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      // Drop the filter afterwards: a leftover filter would break position: fixed inside the page.
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {path === "/" ? <HomePage /> : page ? <PageBody pageKey={page.key} /> : <NotFound />}
    </motion.div>
  );
}

function PageBody({ pageKey }: { pageKey: PageKey }) {
  switch (pageKey) {
    case "tin":
      return (
        <Shell pageKey="tin">
          <TinChecker />
          <TinGuide />
          <Help />
        </Shell>
      );
    case "calculators":
      return (
        <Shell pageKey="calculators">
          <SalaryCalculator />
          <AnnualEstimator />
          <InterestWht />
        </Shell>
      );
    case "tools":
      return (
        <Shell pageKey="tools">
          <Suspense fallback={<div id="tools" className="min-h-[70vh]" />}>
            <Tools />
          </Suspense>
        </Shell>
      );
    case "calendar":
      return (
        <Shell pageKey="calendar">
          <Calendar />
        </Shell>
      );
    case "learn":
      return (
        <Shell pageKey="learn">
          <Glossary />
          <Faq />
        </Shell>
      );
  }
}

/* ---------- Home ---------- */

function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <Marquee />
      <Hub />
      <Scrub />
      <CtaBand />
    </>
  );
}

/** Grid of big cards, one per page. */
function Hub() {
  const { t } = useT();
  return (
    <section id="explore" className="relative isolate px-5 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <Reveal>
            <Kicker>{t.hub.kicker}</Kicker>
          </Reveal>
          <div className="mt-5">
            <RiseTitle a={t.hub.titleA} b={t.hub.titleB} />
          </div>
          <Reveal delay={0.15}>
            <p className="subhead mt-5">{t.hub.sub}</p>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {PAGES.map((p, i) => {
            const pg = t.pages[p.key];
            const Icon = p.icon;
            // Two big cards on top, three below.
            const span = i < 2 ? "md:col-span-3" : "md:col-span-2";
            return (
              <Reveal key={p.path} delay={i * 0.06} className={span}>
                <a href={p.path} className="card group relative flex h-full min-h-[15rem] flex-col overflow-hidden p-7 sm:p-8">
                  <span
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                    style={{ background: p.tint }}
                    aria-hidden="true"
                  />
                  <span className="relative grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]" style={{ background: p.tint }}>
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="relative mt-6 text-2xl font-semibold tracking-tight">{pg.label}</h3>
                  <p className="relative mt-2 text-[15px] leading-relaxed text-mute">{pg.desc}</p>
                  <span className="relative mt-auto inline-flex items-center gap-1 pt-6 text-[15px] font-medium text-accent dark:text-[#64b5ff]">
                    {t.hub.open}
                    <ArrowRight size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Inner page frame ---------- */

function Shell({ pageKey, children }: { pageKey: PageKey; children: ReactNode }) {
  return (
    <>
      <PageHero pageKey={pageKey} />
      {children}
      <NextPage pageKey={pageKey} />
    </>
  );
}

function PageHero({ pageKey }: { pageKey: PageKey }) {
  const { t } = useT();
  const page = PAGES.find((p) => p.key === pageKey)!;
  const pg = t.pages[pageKey];
  const Icon = page.icon;

  return (
    <header className="relative isolate overflow-hidden px-5 pb-6 pt-28 md:pt-36">
      <div
        className="page-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]"
        style={{ ["--tint" as string]: page.tint }}
        aria-hidden="true"
      />
      <div className="mx-auto max-w-4xl text-center">
        <motion.nav
          aria-label="Breadcrumb"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-1 text-sm text-mute"
        >
          <a href="/" className="hover:text-ink dark:hover:text-white">{t.pageNav.home}</a>
          <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
          <span aria-current="page" className="text-ink dark:text-white">{pg.label}</span>
        </motion.nav>

        <motion.span
          initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-[22px] text-white shadow-[0_18px_40px_-14px_var(--tint)]"
          style={{ background: page.tint, ["--tint" as string]: page.tint }}
        >
          <Icon size={30} strokeWidth={1.6} />
        </motion.span>

        {/* Compact pages skip the big title: their one section already has its own headline. */}
        {page.compact ? (
          <h1 className="sr-only">{pg.label}</h1>
        ) : (
          <>
            <div className="mt-7">
              <Kicker>{pg.kicker}</Kicker>
            </div>
            <div className="mt-5">
              <RiseTitle as="h1" a={pg.titleA} b={pg.titleB} className="display page-title" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="subhead mx-auto mt-6 max-w-2xl"
            >
              {pg.sub}
            </motion.p>
          </>
        )}

        {page.sections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="sr-only">{t.pageNav.onThisPage}</span>
            {page.sections.map((id, i) => (
              <a
                key={id}
                href={`#${id}`}
                className="magnetic inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[0.09] dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
              >
                <span className="text-xs font-semibold tabular-nums text-mute">{String(i + 1).padStart(2, "0")}</span>
                {t.nav[id]}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </header>
  );
}

/** Big "next page" card at the bottom of each inner page. */
function NextPage({ pageKey }: { pageKey: PageKey }) {
  const { t } = useT();
  const i = PAGES.findIndex((p) => p.key === pageKey);
  const next = PAGES[(i + 1) % PAGES.length];
  const Icon = next.icon;
  return (
    <section className="px-5 pb-24 pt-4">
      <Reveal>
        <a
          href={next.path}
          className="group relative mx-auto flex max-w-6xl items-center gap-5 overflow-hidden rounded-[32px] p-8 text-white sm:p-12"
          style={{ background: `linear-gradient(120deg, #0b1d55, ${next.tint})` }}
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon size={26} strokeWidth={1.6} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-white/70">{t.pageNav.next}</span>
            <span className="mt-1 block text-2xl font-semibold tracking-tight sm:text-3xl">{t.pages[next.key].label}</span>
            <span className="mt-1 block text-[15px] text-white/75">{t.pages[next.key].desc}</span>
          </span>
          <ArrowRight size={28} strokeWidth={1.75} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
        </a>
      </Reveal>
    </section>
  );
}

/* ---------- 404 ---------- */

function NotFound() {
  const { t } = useT();
  return (
    <section className="grid min-h-[80vh] place-items-center px-5 pt-24 text-center">
      <div>
        <motion.span
          initial={{ opacity: 0, scale: 0.6, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] bg-accent text-white"
        >
          <Compass size={30} strokeWidth={1.6} />
        </motion.span>
        <p className="display mt-8 text-[clamp(4rem,14vw,9rem)] font-bold leading-none tracking-[-0.05em] text-gradient">404</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{t.notFound.title}</h1>
        <p className="subhead mx-auto mt-3 max-w-md">{t.notFound.sub}</p>
        <a href="/" className="btn-primary magnetic mt-8 px-6 py-3">
          <ArrowLeft size={16} strokeWidth={2} /> {t.notFound.button}
        </a>
      </div>
    </section>
  );
}

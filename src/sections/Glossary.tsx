import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal, Section, SectionHeader } from "../components/ui";
import { useT } from "../i18n";

/** Searchable glossary of tax terms. Matches the short term, full name or definition. */
export function Glossary() {
  const { t } = useT();
  const g = t.glossary;
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return g.terms;
    return g.terms.filter((x) => `${x.term} ${x.full} ${x.def}`.toLowerCase().includes(needle));
  }, [q, g.terms]);

  return (
    <Section id="glossary" className="bg-white dark:bg-[#0a0a0a]">
      <SectionHeader n={1} eyebrow={g.eyebrow} a={g.titleA} b={g.titleB} sub={g.sub} />

      <Reveal>
        <label className="relative mx-auto mb-10 block max-w-md">
          <span className="sr-only">{g.search}</span>
          <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={g.search}
            className="field rounded-full pl-11 pr-11 text-base"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-black/[0.06] text-mute dark:bg-white/[0.1]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </label>
      </Reveal>

      <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((x) => (
            <motion.li
              layout
              key={x.term}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="card bg-canvas p-5 dark:bg-[#1c1c1e]"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold tracking-tight text-accent dark:text-[#64b5ff]">{x.term}</span>
                {x.full !== x.term && <span className="text-sm text-mute">{x.full}</span>}
              </div>
              <p className="mt-1.5 text-[15px] leading-relaxed">{x.def}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {results.length === 0 && <p className="mt-6 text-center text-mute">{g.empty}</p>}
    </Section>
  );
}

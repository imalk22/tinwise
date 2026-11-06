import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal, Section, SectionHeader, spring } from "../components/ui";
import { useT } from "../i18n";

export function Faq() {
  const { t } = useT();
  const FAQ = t.faq.items;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq" ambient={0}>
      <SectionHeader n={2} eyebrow={t.faq.eyebrow} a={t.faq.title} />
      <Reveal>
        <ul className="card mx-auto max-w-3xl divide-y hairline px-2 sm:px-4">
          {FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={i} className="hairline">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-4 py-5 text-left text-[17px] font-semibold tracking-tight"
                >
                  {f.q}
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={spring} className="shrink-0 text-mute">
                    <Plus size={20} strokeWidth={1.5} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-5 text-mute leading-relaxed">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </Section>
  );
}

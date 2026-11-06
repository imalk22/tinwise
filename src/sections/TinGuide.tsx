import { motion, useScroll, useSpring } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { useRef, useState } from "react";
import { Reveal, Section, SectionHeader, spring } from "../components/ui";
import { useT } from "../i18n";
import { useShown } from "../motion/core";

export function TinGuide() {
  const { t } = useT();
  const g = t.guide;
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (i: number) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 80%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <Section id="guide" className="bg-white dark:bg-[#0a0a0a]">
      <SectionHeader n={2} eyebrow={g.eyebrow} a={g.titleA} b={g.titleB} sub={g.sub} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ol ref={listRef} className="relative space-y-3">
          <span aria-hidden className="absolute left-[2.75rem] top-8 bottom-24 w-[2px] rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
            <motion.span style={{ scaleY: fill }} className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,#25aee3,#0071e3,#7d4cdb)]" />
          </span>
          {g.steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <Step n={i + 1} title={s.title} body={s.body} />
            </Reveal>
          ))}
          <Reveal delay={0.35}>
            <a
              href="https://www.ird.gov.lk"
              target="_blank"
              rel="noreferrer"
              className="btn-primary magnetic mt-3 px-7 py-3.5 text-[17px]"
            >
              {g.cta} <ArrowUpRight size={17} strokeWidth={2} />
            </a>
          </Reveal>
        </ol>

        <div className="space-y-6">
          <Reveal delay={0.1}>
            <div className="card p-7 bg-canvas dark:bg-[#1c1c1e]">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold tracking-tight">{g.docsTitle}</h3>
                <span className="text-sm tabular-nums text-mute">{checked.length}/{g.docs.length}</span>
              </div>
              <ul className="mt-5 space-y-1">
                {g.docs.map((d, i) => {
                  const on = checked.includes(i);
                  return (
                    <li key={i}>
                      <button onClick={() => toggle(i)} aria-pressed={on} className="flex w-full items-center gap-3 rounded-xl py-2 text-left">
                        <motion.span
                          animate={{ scale: on ? [1, 1.25, 1] : 1, backgroundColor: on ? "#30d158" : "rgba(0,0,0,0)" }}
                          transition={{ duration: 0.3 }}
                          className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border ${on ? "border-[#30d158]" : "border-mute/40"}`}
                        >
                          {on && <Check size={13} strokeWidth={3} className="text-white" />}
                        </motion.span>
                        <span className={`transition-colors ${on ? "text-mute line-through" : ""}`}>{d}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {g.tips.map((tip, i) => (
            <Reveal key={i} delay={0.15 + i * 0.06}>
              <motion.div whileHover={{ y: -3 }} transition={spring} className="card p-6 bg-canvas dark:bg-[#1c1c1e]">
                <h4 className="font-semibold">{tip.title}</h4>
                <p className="mt-1 text-[15px] text-mute">{tip.body}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  const [ref, shown] = useShown<HTMLLIElement>(0.6);
  return (
    <li ref={ref} className={`card relative flex gap-5 p-6 bg-canvas/80 backdrop-blur dark:bg-[#1c1c1e]/80 ${shown ? "shown" : ""}`}>
      <span className="step-dot relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-[15px] font-semibold text-white">
        {n}
      </span>
      <div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-mute leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

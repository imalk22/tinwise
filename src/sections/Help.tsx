import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Briefcase, IdCard, KeyRound, Landmark, MailX, Plane, ShieldAlert, WifiOff } from "lucide-react";
import { useState } from "react";
import { Reveal, Section, SectionHeader, spring } from "../components/ui";
import { useT } from "../i18n";

// Icons line up with t.help.issues by index.
const ICONS = [MailX, KeyRound, IdCard, WifiOff, Landmark, Plane, Briefcase, ShieldAlert];
const TINTS = ["#0071e3", "#5e5ce6", "#bf5af2", "#ff9f0a", "#30d158", "#25aee3", "#14b8c4", "#ff375f"];

/** TIN troubleshooter: pick a problem, get the steps. */
export function Help() {
  const { t } = useT();
  const h = t.help;
  const [active, setActive] = useState(0);
  const issue = h.issues[active];
  const Icon = ICONS[active];

  return (
    <Section id="help" ambient={2}>
      <SectionHeader n={3} eyebrow={h.eyebrow} a={h.titleA} b={h.titleB} sub={h.sub} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <ul role="tablist" aria-orientation="vertical" aria-label={h.eyebrow} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {h.issues.map((it, i) => {
              const I = ICONS[i];
              const on = i === active;
              return (
                <li key={i}>
                  <button
                    role="tab"
                    aria-selected={on}
                    aria-controls="help-panel"
                    onClick={() => setActive(i)}
                    className={`relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
                      on ? "" : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="help-active"
                        transition={spring}
                        className="absolute inset-0 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:bg-[#1c1c1e]"
                      />
                    )}
                    <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white" style={{ background: TINTS[i] }}>
                      <I size={17} strokeWidth={1.75} />
                    </span>
                    <span className={`relative text-[15px] font-medium ${on ? "" : "text-ink/80 dark:text-white/75"}`}>{it.q}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-20 lg:self-start">
          <div id="help-panel" role="tabpanel" className="card overflow-hidden p-7 sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: TINTS[active] }}>
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight">{issue.q}</h3>
                <p className="mt-2 text-mute">{issue.a}</p>
                <p className="mt-7 text-xs font-semibold uppercase tracking-wider text-mute">{h.steps}</p>
                <ol className="mt-3 space-y-3">
                  {issue.steps.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.06 }}
                      className="flex gap-3"
                    >
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/10 text-xs font-semibold text-accent dark:text-[#64b5ff]">
                        {i + 1}
                      </span>
                      <span className="text-[15px] leading-relaxed">{s}</span>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 rounded-2xl bg-black/[0.03] p-5 dark:bg-white/[0.05]">
              <p className="font-semibold">{h.contactTitle}</p>
              <p className="mt-1 text-sm text-mute">{h.contactBody}</p>
              <a href="https://www.ird.gov.lk" target="_blank" rel="noreferrer" className="btn-ghost magnetic -ml-3 mt-2 px-3 py-1.5 text-sm">
                {h.contactButton} <ArrowUpRight size={14} strokeWidth={2} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

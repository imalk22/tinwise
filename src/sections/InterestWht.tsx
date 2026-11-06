import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnimatedNumber, MoneyField, Note, Reveal, Section, SectionHeader } from "../components/ui";
import { useT } from "../i18n";
import { TAX_YEAR, interestWht } from "../lib/tax";

export function InterestWht() {
  const { t, money, pct } = useT();
  const s = t.interest;
  const [interest, setInterest] = useState(240_000);
  const [other, setOther] = useState(900_000);
  const r = interestWht(interest, other);

  return (
    <Section id="interest" ambient={2}>
      <SectionHeader n={6} eyebrow={s.eyebrow} a={s.titleA} b={s.titleB} sub={s.sub(pct(TAX_YEAR.interestWht, 0))} />
      <Reveal>
        <div className="card mx-auto grid max-w-4xl overflow-hidden md:grid-cols-2">
          <div className="space-y-5 p-7 sm:p-10">
            <MoneyField label={s.interestLabel} value={interest} onChange={setInterest} />
            <MoneyField label={s.otherLabel} value={other} onChange={setOther} hint={s.otherHint} />
          </div>
          <div className="bg-gradient-to-br from-[#f5f5f7] to-white dark:from-[#1c1c1e] dark:to-[#2c2c2e] p-7 sm:p-10">
            <p className="text-sm font-medium text-mute">{s.withheld}</p>
            <AnimatedNumber value={r.wht} format={money} className="mt-1 block text-5xl font-semibold tracking-[-0.04em]" />
            <p className="mt-2 text-mute">
              {s.youReceive} <AnimatedNumber value={r.net} format={money} className="font-medium text-ink dark:text-white" />
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={String(r.belowRelief)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mt-8 rounded-2xl p-5 ${r.belowRelief ? "bg-[#30d158]/12" : "bg-accent/10"}`}
              >
                <p className="font-semibold">{r.belowRelief ? s.canStop : s.counts}</p>
                <p className="mt-1 text-[15px] text-mute">
                  {r.belowRelief
                    ? s.canStopBody(money(r.total), money(TAX_YEAR.personalRelief))
                    : s.countsBody(money(r.actualTax), money(r.wht))}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
      <Note>{s.note}</Note>
    </Section>
  );
}

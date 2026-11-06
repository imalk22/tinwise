import { motion } from "motion/react";
import { useState } from "react";
import { AnimatedNumber, MoneyField, Note, Reveal, Section, SectionHeader, Segmented, spring } from "../components/ui";
import { useT } from "../i18n";
import { TAX_YEAR, monthlyApit, type BandSlice } from "../lib/tax";

const PRESETS = [100_000, 150_000, 250_000, 400_000, 750_000];
const BAND_COLORS = ["#64d2ff", "#0a84ff", "#5e5ce6", "#bf5af2", "#ff375f"];

export function SalaryCalculator() {
  const { t, money, pct } = useT();
  const s = t.salary;
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [amount, setAmount] = useState(250_000);

  const monthly = period === "month" ? amount : amount / 12;
  const r = monthlyApit(monthly);
  const factor = period === "month" ? 1 : 12;
  const per = period === "month" ? s.perMonth : s.perYear;

  return (
    <Section id="salary" ambient={1}>
      <SectionHeader n={4} eyebrow={s.eyebrow} a={s.titleA} b={s.titleB} accent="mute" breakLine sub={s.sub(money(TAX_YEAR.personalRelief / 12))} />

      <Reveal>
        <div className="card grid overflow-hidden md:grid-cols-2">
          <div className="p-7 sm:p-10">
            <Segmented
              label={s.periodLabel}
              value={period}
              onChange={(p) => {
                setAmount(Math.round(p === "year" ? monthly * 12 : monthly));
                setPeriod(p);
              }}
              options={[{ value: "month", label: s.monthly }, { value: "year", label: s.annual }]}
            />
            <div className="mt-7">
              <MoneyField label={s.gross(per)} value={amount} onChange={setAmount} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PRESETS.map((p) => {
                const v = p * factor;
                const on = Math.round(amount) === v;
                return (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.94 }}
                    transition={spring}
                    onClick={() => setAmount(v)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors ${
                      on ? "bg-accent text-white" : "bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08]"
                    }`}
                  >
                    {v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : `${v / 1000}k`}
                  </motion.button>
                );
              })}
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6">
              <Stat label={s.apit(per)} value={r.apit * factor} />
              <Stat label={s.effective} value={r.annual.effectiveRate} pct />
              <Stat label={s.topBand} value={r.annual.marginalRate} pct />
              <Stat label={s.taxFree} value={Math.min(monthly, TAX_YEAR.personalRelief / 12) * factor} />
            </dl>
          </div>

          <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#f5f5f7] to-white dark:from-[#1c1c1e] dark:to-[#2c2c2e] p-7 sm:p-10">
            <div>
              <p className="text-sm font-medium text-mute">{s.takeHome(per)}</p>
              <AnimatedNumber
                value={r.takeHome * factor}
                format={money}
                className="mt-2 block text-5xl sm:text-6xl font-semibold tracking-[-0.04em]"
              />
              <motion.p
                key={r.apit > 0 ? "tax" : "free"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  r.apit > 0 ? "bg-accent/10 text-accent dark:text-[#2997ff]" : "bg-[#30d158]/15 text-[#248a3d] dark:text-[#30d158]"
                }`}
              >
                {r.apit > 0 ? s.keep(pct(1 - r.annual.effectiveRate)) : s.noApit}
              </motion.p>
            </div>
            <BandChart slices={r.annual.slices} relief={r.annual.relief} gross={r.annual.assessable} />
          </div>
        </div>
      </Reveal>
      <Note>{s.note(TAX_YEAR.label)}</Note>
    </Section>
  );
}

function Stat({ label, value, pct: isPct }: { label: string; value: number; pct?: boolean }) {
  const { money, pct } = useT();
  return (
    <div>
      <dt className="text-sm text-mute">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">
        <AnimatedNumber value={value} format={isPct ? (n) => pct(n) : money} />
      </dd>
    </div>
  );
}

export function BandChart({ slices, relief, gross }: { slices: BandSlice[]; relief: number; gross: number }) {
  const { t } = useT();
  const total = Math.max(gross, 1);
  return (
    <div className="mt-10">
      <p className="mb-3 text-sm font-medium text-mute">{t.salary.chartTitle}</p>
      <div className="flex h-4 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
        <motion.div
          className="h-full bg-[#30d158]"
          animate={{ width: `${(relief / total) * 100}%` }}
          transition={spring}
        />
        {slices.map((s, i) => (
          <motion.div
            key={i}
            className="h-full"
            style={{ backgroundColor: BAND_COLORS[i] }}
            initial={{ width: 0 }}
            animate={{ width: `${(s.amount / total) * 100}%` }}
            transition={spring}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        <Legend color="#30d158" label={t.salary.relief} amount={relief} tax={0} />
        {slices.map((s, i) => (
          <Legend key={i} color={BAND_COLORS[i]} label={t.salary.band(Math.round(s.rate * 100))} amount={s.amount} tax={s.tax} />
        ))}
      </ul>
    </div>
  );
}

function Legend({ color, label, amount, tax }: { color: string; label: string; amount: number; tax: number }) {
  const { money } = useT();
  return (
    <motion.li layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 tabular-nums">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="flex-1 whitespace-nowrap">{label}</span>
      <span className="hidden text-mute sm:inline">{money(amount)}</span>
      <span className="w-28 text-right font-medium">{tax ? money(tax) : "—"}</span>
    </motion.li>
  );
}

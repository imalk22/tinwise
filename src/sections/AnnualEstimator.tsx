import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AnimatedNumber, MoneyField, Note, Reveal, Section, SectionHeader } from "../components/ui";
import { useT } from "../i18n";
import { TAX_YEAR, annualEstimate, type IncomeInput } from "../lib/tax";
import { BandChart } from "./SalaryCalculator";

const FIELD_ORDER: (keyof IncomeInput)[] = ["employment", "business", "rent", "interest", "foreign", "dividends", "apitPaid"];

const DEFAULTS: IncomeInput = { employment: 3_000_000, business: 0, rent: 0, interest: 120_000, dividends: 0, foreign: 0, apitPaid: 72_000 };

export function AnnualEstimator() {
  const { t, money, pct } = useT();
  const a = t.annual;
  const [input, setInput] = useState<IncomeInput>(DEFAULTS);
  const r = annualEstimate(input);
  const owe = r.balance > 0.5;
  const refund = r.balance < -0.5;

  const hintFor = (key: keyof IncomeInput) => {
    const f = a.fields;
    switch (key) {
      case "rent":
        return f.rent.hint(pct(TAX_YEAR.rentRelief, 0));
      case "interest":
        return f.interest.hint(pct(TAX_YEAR.interestWht, 0));
      case "dividends":
        return f.dividends.hint(pct(TAX_YEAR.dividendWht, 0));
      default:
        return f[key].hint;
    }
  };

  return (
    <Section id="annual" className="bg-white dark:bg-[#0a0a0a]">
      <SectionHeader n={2} eyebrow={a.eyebrow} a={a.titleA} b={a.titleB} sub={a.sub(TAX_YEAR.label)} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Reveal>
          <div className="card grid gap-5 p-7 sm:grid-cols-2 sm:p-9 bg-canvas dark:bg-[#1c1c1e]">
            {FIELD_ORDER.map((key) => (
              <MoneyField
                key={key}
                label={a.fields[key].label}
                hint={hintFor(key)}
                value={input[key]}
                onChange={(n) => setInput((p) => ({ ...p, [key]: n }))}
              />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-7 sm:p-9 bg-canvas dark:bg-[#1c1c1e]">
            <p className="text-sm font-medium text-mute">{a.totalTax}</p>
            <AnimatedNumber value={r.tax} format={money} className="mt-1 block text-5xl font-semibold tracking-[-0.04em]" />

            <dl className="mt-7 space-y-2.5 text-[15px]">
              <Row label={a.assessable} value={r.assessable} />
              <Row label={a.relief} value={-r.relief} />
              {r.rentRelief > 0 && <Row label={a.rentRelief} value={r.rentRelief} muted />}
              <Row label={a.taxable} value={r.taxable} strong />
              <div className="my-3 border-t hairline" />
              <Row label={a.apitDeducted} value={-input.apitPaid} />
              <Row label={a.interestCredit} value={-r.interestWht} />
            </dl>

            <AnimatePresence mode="wait">
              <motion.div
                key={owe ? "owe" : refund ? "refund" : "even"}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className={`mt-6 rounded-2xl p-5 ${owe ? "bg-[#ff9f0a]/12" : refund ? "bg-[#30d158]/12" : "bg-accent/10"}`}
              >
                <p className="text-sm font-medium">{owe ? a.owe : refund ? a.refund : a.even}</p>
                <AnimatedNumber value={Math.abs(r.balance)} format={money} className="mt-0.5 block text-3xl font-semibold tracking-tight" />
                <p className="mt-1 text-sm text-mute">{owe ? a.oweBody : refund ? a.refundBody : a.evenBody}</p>
              </motion.div>
            </AnimatePresence>

            {r.dividendWht > 0 && <p className="mt-4 text-sm text-mute">{a.dividendNote(money(r.dividendWht))}</p>}
            <BandChart slices={r.slices} relief={r.relief} gross={r.assessable} />
          </div>
        </Reveal>
      </div>
      <Note>{a.note(pct(TAX_YEAR.cgtRate, 0))}</Note>
    </Section>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: number; strong?: boolean; muted?: boolean }) {
  const { money } = useT();
  return (
    <div className={`flex justify-between gap-4 tabular-nums ${strong ? "font-semibold" : ""} ${muted ? "text-mute" : ""}`}>
      <dt>{label}</dt>
      <dd className="whitespace-nowrap">
        <AnimatedNumber value={value} format={(n) => (n < 0 ? `− ${money(-n)}` : money(n))} />
      </dd>
    </div>
  );
}

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Award, Banknote, Building2, Clock, Globe, ReceiptText, Target, TrendingUp } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AnimatedNumber, MoneyField, Note, NumberField, Reveal, Section, SectionHeader, Segmented, Slider, Toggle, spring } from "../components/ui";
import { useT } from "../i18n";
import { TAX_YEAR } from "../lib/tax";
import { PAYROLL, RULES, capitalGains, foreignIncome, gratuity, grossForTakeHome, latePenalties, payslip, realChange, vatPrice, vatSscl, type Activity } from "../lib/tools";

const TABS = [
  { key: "payslip", icon: ReceiptText },
  { key: "reverse", icon: Target },
  { key: "gratuity", icon: Award },
  { key: "cgt", icon: Building2 },
  { key: "vat", icon: Banknote },
  { key: "freelance", icon: Globe },
  { key: "inflation", icon: TrendingUp },
  { key: "penalty", icon: Clock },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function Tools() {
  const { t } = useT();
  const [tab, setTab] = useState<TabKey>("payslip");

  return (
    <Section id="tools" className="bg-white dark:bg-[#0a0a0a]">
      <SectionHeader n={8} eyebrow={t.tools.eyebrow} a={t.tools.titleA} b={t.tools.titleB} sub={t.tools.sub} />

      <Reveal>
        <div role="tablist" aria-label={t.tools.eyebrow} className="-mx-5 mb-8 flex snap-x gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 [scrollbar-width:none]">
          {TABS.map(({ key, icon: Icon }) => {
            const active = key === tab;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                aria-controls={`tool-${key}`}
                onClick={() => setTab(key)}
                className={`relative flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "text-white" : "text-ink/75 dark:text-white/75 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
              >
                {active && <motion.span layoutId="tool-tab" transition={spring} className="absolute inset-0 rounded-full bg-ink dark:bg-white/15" />}
                <Icon size={16} strokeWidth={1.75} className="relative" />
                <span className="relative whitespace-nowrap">{t.tools.tabs[key]}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          id={`tool-${tab}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === "payslip" && <PayslipTool />}
          {tab === "reverse" && <ReverseTool />}
          {tab === "gratuity" && <GratuityTool />}
          {tab === "cgt" && <CgtTool />}
          {tab === "vat" && <VatTool />}
          {tab === "freelance" && <FreelanceTool />}
          {tab === "inflation" && <InflationTool />}
          {tab === "penalty" && <PenaltyTool />}
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}

/* ---------- Layout helpers ---------- */

function ToolCard({ title, sub, inputs, result, note }: { title: string; sub: string; inputs: ReactNode; result: ReactNode; note: string }) {
  return (
    <>
      <div className="card grid overflow-hidden bg-canvas dark:bg-[#1c1c1e] md:grid-cols-2">
        <div className="space-y-5 p-7 sm:p-10">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-1 text-mute">{sub}</p>
          </div>
          {inputs}
        </div>
        <div className="flex flex-col bg-white dark:bg-[#2c2c2e] p-7 sm:p-10">{result}</div>
      </div>
      <Note>{note}</Note>
    </>
  );
}

function Big({ label, value, tone }: { label: string; value: number; tone?: "good" | "warn" }) {
  const { money } = useT();
  return (
    <div>
      <p className="text-sm font-medium text-mute">{label}</p>
      <AnimatedNumber
        value={value}
        format={money}
        className={`mt-1 block text-4xl font-semibold tracking-[-0.04em] lg:text-5xl ${tone === "good" ? "text-[#248a3d] dark:text-[#30d158]" : tone === "warn" ? "text-[#c93400] dark:text-[#ff9f0a]" : ""}`}
      />
    </div>
  );
}

function Line({ label, value, pct, strong, plain }: { label: string; value: number; pct?: boolean; strong?: boolean; plain?: boolean }) {
  const { money, pct: fmtPct } = useT();
  return (
    <div className={`flex justify-between gap-4 py-1 tabular-nums ${strong ? "font-semibold" : ""}`}>
      <dt className={strong ? "" : "text-mute"}>{label}</dt>
      <dd className="whitespace-nowrap">
        <AnimatedNumber value={value} format={plain ? (n) => String(Math.round(n)) : pct ? (n) => fmtPct(n) : (n) => (n < 0 ? `− ${money(-n)}` : money(n))} />
      </dd>
    </div>
  );
}

function Pill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <motion.p
      key={String(ok)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 text-[15px] ${ok ? "bg-[#30d158]/12" : "bg-[#ff9f0a]/12"}`}
    >
      {children}
    </motion.p>
  );
}

function Meter({ label, progress }: { label: string; progress: number }) {
  const { pct } = useT();
  const over = progress >= 1;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-mute">{label}</span>
        <span className="font-medium tabular-nums">{pct(Math.min(progress, 9.99), 0)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.1]">
        <motion.div
          className={`h-full rounded-full ${over ? "bg-[#ff9f0a]" : "bg-accent"}`}
          animate={{ width: `${Math.min(progress, 1) * 100}%` }}
          transition={spring}
        />
      </div>
    </div>
  );
}

/* ---------- Capital gains ---------- */

function CgtTool() {
  const { t, money, pct } = useT();
  const c = t.tools.cgt;
  const [salePrice, setSalePrice] = useState(25_000_000);
  const [cost, setCost] = useState(15_000_000);
  const [costs, setCosts] = useState(750_000);
  const [saleDate, setSaleDate] = useState("2026-11-15");
  const [residence, setResidence] = useState(false);
  const r = capitalGains({ salePrice, cost, costs, saleDate, principalResidence: residence });

  return (
    <ToolCard
      title={c.title}
      sub={c.sub}
      inputs={
        <>
          <MoneyField label={c.salePrice} value={salePrice} onChange={setSalePrice} />
          <MoneyField label={c.cost} value={cost} onChange={setCost} />
          <MoneyField label={c.costs} hint={c.costsHint} value={costs} onChange={setCosts} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-mute">{c.saleDate}</span>
            <input type="date" className="field" value={saleDate} onChange={(e) => e.target.value && setSaleDate(e.target.value)} />
          </label>
          <Toggle label={c.residence} hint={c.residenceHint} checked={residence} onChange={setResidence} />
        </>
      }
      result={
        <>
          <Big label={c.tax} value={r.tax} tone={r.tax > 0 ? "warn" : "good"} />
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={c.gain} value={r.gain} />
            <Line label={c.rate} value={r.rate} pct />
            <Line label={c.net} value={r.net} strong />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok={r.tax === 0}>
              {r.exempt ? c.exempt : r.gain <= 0 ? c.loss : c.rateNote(pct(r.rate, 0), money(r.tax))}
            </Pill>
          </div>
        </>
      }
      note={c.note}
    />
  );
}

/* ---------- VAT and SSCL ---------- */

function VatTool() {
  const { t, money, pct } = useT();
  const v = t.tools.vat;
  const [turnover, setTurnover] = useState(45_000_000);
  const [activity, setActivity] = useState<Activity>("services");
  const [priceMode, setPriceMode] = useState<"add" | "remove">("add");
  const [price, setPrice] = useState(10_000);
  const r = vatSscl(turnover, activity);
  const p = vatPrice(price, priceMode);
  const activities = Object.keys(RULES.ssclLiableShare) as Activity[];

  return (
    <ToolCard
      title={v.title}
      sub={v.sub}
      inputs={
        <>
          <MoneyField label={v.turnover} value={turnover} onChange={setTurnover} />
          <div>
            <span className="mb-2 block text-sm font-medium text-mute">{v.activity}</span>
            <div className="grid grid-cols-2 gap-2">
              {activities.map((a) => (
                <motion.button
                  key={a}
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  onClick={() => setActivity(a)}
                  aria-pressed={activity === a}
                  className={`rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${activity === a ? "border-accent bg-accent/[0.06]" : "hairline"}`}
                >
                  <span className="block font-medium">{v.activities[a]}</span>
                  <span className="text-xs text-mute">{v.liableShare(pct(RULES.ssclLiableShare[a], 0))}</span>
                </motion.button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border hairline p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-medium">{v.priceTitle}</span>
              <Segmented label={v.priceTitle} value={priceMode} onChange={setPriceMode} size="sm" options={[{ value: "add", label: v.add }, { value: "remove", label: v.remove }]} />
            </div>
            <MoneyField label={priceMode === "add" ? v.netPrice : v.grossPrice} value={price} onChange={setPrice} />
            <dl className="mt-3 text-sm">
              <Line label={v.net} value={p.net} />
              <Line label={v.vat(pct(RULES.vatRate, 0))} value={p.vat} />
              <Line label={v.gross} value={p.gross} strong />
            </dl>
          </div>
        </>
      }
      result={
        <>
          <Big label={v.ssclDue} value={r.sscl} tone={r.ssclRequired ? "warn" : "good"} />
          <p className="mt-2 text-sm text-mute">{v.perQuarter(money(r.ssclQuarterly))}</p>
          <div className="mt-8 space-y-5">
            <Meter label={v.ssclMeter(money(RULES.ssclThreshold))} progress={r.ssclProgress} />
            <Meter label={v.vatMeter(money(RULES.vatThreshold))} progress={r.vatProgress} />
          </div>
          <dl className="mt-6 border-t hairline pt-4 text-[15px]">
            <Line label={v.liable} value={r.liable} />
          </dl>
          <div className="mt-auto space-y-3 pt-7">
            <Pill ok={!r.ssclRequired}>{r.ssclRequired ? v.ssclYes : v.ssclNo}</Pill>
            <Pill ok={!r.vatRequired}>{r.vatRequired ? v.vatYes : v.vatNo}</Pill>
          </div>
        </>
      }
      note={v.note}
    />
  );
}

/* ---------- Foreign income ---------- */

const CURRENCIES = ["USD", "EUR", "GBP", "AUD"] as const;

function FreelanceTool() {
  const { t, pct } = useT();
  const f = t.tools.freelance;
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("USD");
  const [monthly, setMonthly] = useState(1500);
  const [rate, setRate] = useState(300);
  const [other, setOther] = useState(0);
  const r = foreignIncome(monthly, rate, other);

  return (
    <ToolCard
      title={f.title}
      sub={f.sub}
      inputs={
        <>
          <Segmented label={f.currency} value={currency} onChange={setCurrency} options={CURRENCIES.map((c) => ({ value: c, label: c }))} />
          <NumberField label={f.monthly(currency)} prefix={currency} value={monthly} onChange={setMonthly} />
          <NumberField
            label={f.rate(currency)}
            prefix={t.common.currency}
            value={rate}
            onChange={setRate}
            hint={
              <a href="https://www.cbsl.gov.lk/cbsl_custom/exrates/exrates.php" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent dark:text-[#2997ff]">
                {f.rateLink} <ArrowUpRight size={12} strokeWidth={2} />
              </a>
            }
          />
          <MoneyField label={f.other} hint={f.otherHint} value={other} onChange={setOther} />
        </>
      }
      result={
        <>
          <Big label={f.monthlyLkr} value={r.monthlyLkr} />
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={f.annualLkr} value={r.annualLkr} />
            <Line label={f.extraTax} value={r.extraTax} strong />
            <Line label={f.monthlySetAside} value={r.extraTax / 12} />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok={r.extraTax === 0}>{r.extraTax === 0 ? f.noTax : f.setAside(pct(r.marginalRate, 0))}</Pill>
          </div>
        </>
      }
      note={f.note}
    />
  );
}

/* ---------- Inflation ---------- */

function InflationTool() {
  const { t, money, pct } = useT();
  const i = t.tools.inflation;
  const [before, setBefore] = useState(200_000);
  const [after, setAfter] = useState(212_000);
  const [inflation, setInflation] = useState(RULES.latestCcpi * 100);
  const r = realChange(before, after, inflation / 100);
  const ahead = r.gap >= 0;

  return (
    <ToolCard
      title={i.title}
      sub={i.sub}
      inputs={
        <>
          <MoneyField label={i.before} value={before} onChange={setBefore} />
          <MoneyField label={i.after} value={after} onChange={setAfter} />
          <NumberField label={i.inflation} suffix="%" value={inflation} onChange={setInflation} hint={i.inflationHint(pct(RULES.latestCcpi), RULES.latestCcpiLabel)} />
        </>
      }
      result={
        <>
          <div>
            <p className="text-sm font-medium text-mute">{i.real}</p>
            <AnimatedNumber
              value={r.real}
              format={(n) => `${n >= 0 ? "+" : "−"}${pct(Math.abs(n))}`}
              className={`mt-1 block text-6xl font-semibold tracking-[-0.04em] ${ahead ? "text-[#248a3d] dark:text-[#30d158]" : "text-[#c93400] dark:text-[#ff9f0a]"}`}
            />
          </div>
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={i.nominal} value={r.nominal} pct />
            <Line label={i.keepUp} value={r.keepUp} strong />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok={ahead}>{ahead ? i.ahead(money(r.gap)) : i.behind(money(-r.gap))}</Pill>
          </div>
        </>
      }
      note={i.note}
    />
  );
}

/* ---------- Late penalties ---------- */

function PenaltyTool() {
  const { t, money } = useT();
  const p = t.tools.penalty;
  const [tax, setTax] = useState(150_000);
  const [payLate, setPayLate] = useState(3);
  const [fileLate, setFileLate] = useState(0);
  const r = latePenalties(tax, payLate, fileLate);

  return (
    <ToolCard
      title={p.title}
      sub={p.sub}
      inputs={
        <>
          <MoneyField label={p.tax} hint={p.taxHint} value={tax} onChange={setTax} />
          <Slider label={p.payLate} min={0} max={24} value={payLate} onChange={setPayLate} display={p.months(payLate)} />
          <Slider label={p.fileLate} min={0} max={24} value={fileLate} onChange={setFileLate} display={p.months(fileLate)} />
        </>
      }
      result={
        <>
          <Big label={p.total} value={r.total} tone={r.total > 0 ? "warn" : "good"} />
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={p.interest} value={r.interest} />
            <Line label={p.paymentPenalty} value={r.paymentPenalty} />
            <Line label={p.filingPenalty} value={r.filingPenalty} />
            <Line label={p.grandTotal} value={r.grandTotal} strong />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok={r.total === 0}>{r.total === 0 ? p.onTime : p.tip(money(r.total))}</Pill>
          </div>
        </>
      }
      note={p.note(TAX_YEAR.label)}
    />
  );
}

/* ---------- Payslip: EPF, ETF and APIT ---------- */

function PayslipTool() {
  const { t, money, pct } = useT();
  const p = t.tools.payslip;
  const [gross, setGross] = useState(250_000);
  const [sameBase, setSameBase] = useState(true);
  const [base, setBase] = useState(200_000);
  const r = payslip(gross, sameBase ? gross : base);

  return (
    <ToolCard
      title={p.title}
      sub={p.sub}
      inputs={
        <>
          <MoneyField label={p.gross} value={gross} onChange={setGross} />
          <Toggle label={p.sameBase} hint={p.sameBaseHint} checked={sameBase} onChange={setSameBase} />
          {!sameBase && <MoneyField label={p.base} hint={p.baseHint} value={base} onChange={setBase} />}
        </>
      }
      result={
        <>
          <Big label={p.takeHome} value={r.takeHome} tone="good" />
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={p.gross} value={r.gross} />
            <Line label={p.epf(pct(PAYROLL.epfEmployee, 0))} value={-r.epf} />
            <Line label={p.apit} value={-r.apit} />
            <Line label={p.takeHome} value={r.takeHome} strong />
            <div className="my-3 border-t hairline" />
            <Line label={p.employerEpf(pct(PAYROLL.epfEmployer, 0))} value={r.employerEpf} />
            <Line label={p.etf(pct(PAYROLL.etfEmployer, 0))} value={r.etf} />
            <Line label={p.employerCost} value={r.employerCost} strong />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok>{p.saved(money(r.epfSaved))}</Pill>
          </div>
        </>
      }
      note={p.note}
    />
  );
}

/* ---------- Reverse: what gross do I need? ---------- */

function ReverseTool() {
  const { t, money } = useT();
  const v = t.tools.reverse;
  const [target, setTarget] = useState(200_000);
  const [withEpf, setWithEpf] = useState(true);
  const gross = grossForTakeHome(target, withEpf);
  const r = withEpf ? payslip(gross) : { ...payslip(gross, 0) };

  return (
    <ToolCard
      title={v.title}
      sub={v.sub}
      inputs={
        <>
          <MoneyField label={v.target} value={target} onChange={setTarget} />
          <Toggle label={v.withEpf} hint={v.withEpfHint} checked={withEpf} onChange={setWithEpf} />
        </>
      }
      result={
        <>
          <Big label={v.needed} value={gross} />
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={v.epf} value={-r.epf} />
            <Line label={v.apit} value={-r.apit} />
            <Line label={v.youGet} value={r.takeHome} strong />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok>{v.tip(money(gross), money(gross * 12))}</Pill>
          </div>
        </>
      }
      note={v.note}
    />
  );
}

/* ---------- Gratuity ---------- */

function GratuityTool() {
  const { t, money } = useT();
  const g = t.tools.gratuity;
  const [salary, setSalary] = useState(180_000);
  const [years, setYears] = useState(8);
  const r = gratuity(salary, years);

  return (
    <ToolCard
      title={g.title}
      sub={g.sub}
      inputs={
        <>
          <MoneyField label={g.salary} hint={g.salaryHint} value={salary} onChange={setSalary} />
          <Slider label={g.years} min={0} max={40} value={years} onChange={setYears} display={g.yearsValue(years)} />
        </>
      }
      result={
        <>
          <Big label={g.amount} value={r.amount} tone={r.eligible ? "good" : undefined} />
          <dl className="mt-7 border-t hairline pt-4 text-[15px]">
            <Line label={g.perYear} value={salary * PAYROLL.gratuityMonthsPerYear} />
            <Line label={g.completed} value={r.completed} plain />
          </dl>
          <div className="mt-auto pt-7">
            <Pill ok={r.eligible}>{r.eligible ? g.eligible(money(r.amount)) : g.notYet(r.yearsToGo)}</Pill>
          </div>
        </>
      }
      note={g.note}
    />
  );
}

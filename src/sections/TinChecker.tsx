import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Reveal, Section, SectionHeader, spring } from "../components/ui";
import { useT } from "../i18n";

type Answers = {
  resident?: boolean;
  adult?: boolean;
  /** Indices into t.transactions. */
  transactions: number[];
  income?: "below" | "above" | "business";
};

const STEPS = ["resident", "adult", "transactions", "income", "result"] as const;

export function TinChecker() {
  const { t } = useT();
  const c = t.checker;
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [a, setA] = useState<Answers>({ transactions: [] });

  const go = (to: number) => {
    setDir(to > step ? 1 : -1);
    setStep(to);
  };
  const answer = (patch: Partial<Answers>) => {
    setA((prev) => ({ ...prev, ...patch }));
    go(step + 1);
  };
  const reset = () => {
    setA({ transactions: [] });
    go(0);
  };

  const progress = step / (STEPS.length - 1);

  return (
    <Section id="check" ambient={0}>
      <SectionHeader n={1} eyebrow={c.eyebrow} a={c.titleA} b={c.titleB} accent="mute" sub={c.sub} />
      <Reveal>
        <div className="card mx-auto max-w-2xl overflow-hidden">
          <div className="h-1 bg-black/[0.05] dark:bg-white/[0.08]">
            <motion.div className="h-full bg-accent" animate={{ width: `${progress * 100}%` }} transition={spring} />
          </div>
          <div className="relative min-h-[420px] p-7 sm:p-10">
            {step > 0 && step < 4 && (
              <button onClick={() => go(step - 1)} className="btn-ghost -ml-3 mb-2 px-3 py-1.5 text-sm">
                <ArrowLeft size={15} strokeWidth={2} /> {t.common.back}
              </button>
            )}
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d * 60, opacity: 0, filter: "blur(4px)" }),
                  center: { x: 0, opacity: 1, filter: "blur(0px)" },
                  exit: (d: number) => ({ x: d * -60, opacity: 0, filter: "blur(4px)" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {step === 0 && (
                  <Question title={c.residentQ} hint={c.residentHint}>
                    <Choice onClick={() => answer({ resident: true })}>{c.residentYes}</Choice>
                    <Choice onClick={() => answer({ resident: false })}>{c.residentNo}</Choice>
                  </Question>
                )}
                {step === 1 && (
                  <Question title={c.adultQ}>
                    <Choice onClick={() => answer({ adult: true })}>{c.yes}</Choice>
                    <Choice onClick={() => answer({ adult: false })}>{c.notYet}</Choice>
                  </Question>
                )}
                {step === 2 && (
                  <TransactionStep
                    selected={a.transactions}
                    onDone={(transactions) => answer({ transactions })}
                  />
                )}
                {step === 3 && (
                  <Question title={c.incomeQ} hint={c.incomeHint}>
                    <Choice onClick={() => answer({ income: "below" })}>{c.below} <Sub>{c.belowSub}</Sub></Choice>
                    <Choice onClick={() => answer({ income: "above" })}>{c.above} <Sub>{c.aboveSub}</Sub></Choice>
                    <Choice onClick={() => answer({ income: "business" })}>{c.business} <Sub>{c.businessSub}</Sub></Choice>
                  </Question>
                )}
                {step === 4 && <Result a={a} onReset={reset} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-3xl font-semibold tracking-tight">{title}</h3>
      {hint && <p className="mt-2 text-mute">{hint}</p>}
      <div className="mt-8 grid gap-3">{children}</div>
    </div>
  );
}

function Choice({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
      className="w-full rounded-2xl border hairline px-5 py-4 text-left text-[17px] font-medium hover:border-accent/50 hover:bg-accent/[0.04] transition-colors"
    >
      {children}
    </motion.button>
  );
}

const Sub = ({ children }: { children: React.ReactNode }) => (
  <span className="mt-0.5 block text-sm font-normal text-mute">{children}</span>
);

function TransactionStep({ selected, onDone }: { selected: number[]; onDone: (t: number[]) => void }) {
  const { t } = useT();
  const [picked, setPicked] = useState<number[]>(selected);
  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
  return (
    <div>
      <h3 className="text-3xl font-semibold tracking-tight">{t.checker.txQ}</h3>
      <p className="mt-2 text-mute">{t.checker.txHint}</p>
      <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
        {t.transactions.map((label, i) => {
          const on = picked.includes(i);
          return (
            <motion.button
              key={i}
              onClick={() => toggle(i)}
              whileTap={{ scale: 0.97 }}
              transition={spring}
              aria-pressed={on}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition-colors ${
                on ? "border-accent bg-accent/[0.06]" : "hairline"
              }`}
            >
              <motion.span
                animate={{ scale: on ? 1 : 0.85, backgroundColor: on ? "#0071e3" : "rgba(0,0,0,0)" }}
                transition={spring}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? "border-accent" : "border-mute/40"}`}
              >
                {on && <Check size={12} strokeWidth={3} className="text-white" />}
              </motion.span>
              {label}
            </motion.button>
          );
        })}
      </div>
      <button onClick={() => onDone(picked)} className="btn-primary mt-7 w-full py-3.5 text-[17px]">
        {picked.length ? t.checker.continue : t.checker.none}
      </button>
    </div>
  );
}

function Result({ a, onReset }: { a: Answers; onReset: () => void }) {
  const { t } = useT();
  const c = t.checker;
  const mustRegister = (a.resident && a.adult) || a.transactions.length > 0 || a.income === "business";
  const mayPayTax = a.income === "above" || a.income === "business";

  return (
    <div>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className={`grid h-16 w-16 place-items-center rounded-full ${mustRegister ? "bg-accent" : "bg-[#30d158]"}`}
      >
        <Check size={30} strokeWidth={2.5} className="text-white" />
      </motion.div>
      <h3 className="mt-6 text-3xl font-semibold tracking-tight">
        {mustRegister ? c.yesTitle : c.noTitle}
      </h3>
      <p className="mt-3 text-lg text-mute">
        {mustRegister
          ? a.resident && a.adult
            ? c.reasonResident
            : c.reasonTx
          : a.resident
            ? c.reasonUnder18
            : c.reasonNonResident}
      </p>

      <ul className="mt-8 space-y-3">
        <ResultRow ok={!mayPayTax} title={mayPayTax ? c.mayPay : c.noPay}>
          {mayPayTax ? c.mayPayBody : c.noPayBody}
        </ResultRow>
        {a.transactions.length > 0 && (
          <ResultRow ok={false} title={c.getBefore(a.transactions.length)}>
            {a.transactions.map((i) => t.transactions[i]).join(" · ")}
          </ResultRow>
        )}
        {a.income === "business" && (
          <ResultRow ok={false} title={c.fileYearly}>
            {c.fileYearlyBody}
          </ResultRow>
        )}
      </ul>

      <div className="mt-9 flex flex-wrap gap-3">
        {mustRegister && <a href="#guide" className="btn-primary px-6 py-3">{c.howRegister}</a>}
        {mayPayTax && <a href="#salary" className="btn-ghost px-5 py-3">{c.calcTax}</a>}
        <button onClick={onReset} className="btn-ghost px-5 py-3">
          <RotateCcw size={15} strokeWidth={2} /> {c.startOver}
        </button>
      </div>
    </div>
  );
}

function ResultRow({ ok, title, children }: { ok: boolean; title: string; children: React.ReactNode }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="flex gap-3 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] p-4"
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ok ? "bg-[#30d158]" : "bg-[#ff9f0a]"}`} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-[15px] text-mute">{children}</p>
      </div>
    </motion.li>
  );
}

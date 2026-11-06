import { motion } from "motion/react";
import { CalendarPlus } from "lucide-react";
import { Note, Reveal, Section, SectionHeader } from "../components/ui";
import { useT } from "../i18n";

interface Deadline {
  date: string; // ISO
  title: string;
  who: string;
}

/** Dates line up with t.calendar.items by index. */
export const DEADLINE_DATES = ["2026-11-01", "2026-11-15", "2026-11-30", "2027-02-15", "2027-05-15", "2027-09-30"];

const dayMs = 86_400_000;

function icsFor(d: Deadline, details: string) {
  const day = d.date.replace(/-/g, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TINwise//EN",
    "BEGIN:VEVENT",
    `UID:${day}-${d.title.replace(/\W+/g, "-")}@tinwise`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${day}`,
    `SUMMARY:${d.title}`,
    `DESCRIPTION:${d.who}. ${details}`,
    "BEGIN:VALARM",
    "TRIGGER:-P3D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${d.title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function Calendar() {
  const { t, locale } = useT();
  const deadlines: Deadline[] = DEADLINE_DATES.map((date, i) => ({ date, ...t.calendar.items[i] }));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Section id="calendar" className="bg-white dark:bg-[#0a0a0a]">
      <SectionHeader n={7} eyebrow={t.calendar.eyebrow} a={t.calendar.titleA} b={t.calendar.titleB} accent="mute" sub={t.calendar.sub} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deadlines.map((d, i) => {
          const date = new Date(d.date + "T00:00:00");
          const days = Math.round((date.getTime() - today.getTime()) / dayMs);
          const past = days < 0;
          const soon = !past && days <= 30;
          return (
            <Reveal key={d.date} delay={i * 0.05}>
              <motion.a
                href={icsFor(d, t.calendar.icsDetails)}
                download={`${d.date}-tinwise.ics`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className={`card group flex h-full flex-col p-6 bg-canvas dark:bg-[#1c1c1e] ${past ? "opacity-55" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#ff3b30]">
                      {date.toLocaleString(locale, { month: "short" })}
                    </p>
                    <p className="text-4xl font-semibold tracking-tight tabular-nums">{date.getDate()}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
                      past ? "bg-black/[0.05] text-mute dark:bg-white/[0.08]" : soon ? "bg-[#ff9f0a]/15 text-[#c93400] dark:text-[#ff9f0a]" : "bg-accent/10 text-accent dark:text-[#2997ff]"
                    }`}
                  >
                    {past ? t.calendar.passed : days === 0 ? t.calendar.today : t.calendar.days(days)}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight">{d.title}</h3>
                <p className="mt-1 text-sm text-mute">{d.who}</p>
                <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent dark:text-[#2997ff] opacity-80 group-hover:opacity-100">
                  <CalendarPlus size={15} strokeWidth={1.75} /> {t.calendar.add}
                </span>
              </motion.a>
            </Reveal>
          );
        })}
      </div>
      <Note>{t.calendar.note}</Note>
    </Section>
  );
}

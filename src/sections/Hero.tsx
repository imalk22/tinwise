import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, Gift, Languages, ShieldCheck, Wallet } from "lucide-react";
import { useRef } from "react";
import { useT } from "../i18n";
import { finePointer, useReady } from "../motion/core";
import { Mesh } from "../motion/Mesh";
import { AssembleText, pieceCount } from "../motion/Text";

const EASE = [0.16, 1, 0.3, 1] as const;

const FLOATER_STYLE = [
  { pos: "left-[4%] top-[30%]", ico: "linear-gradient(135deg,#25aee3,#0071e3)", Icon: Gift, delay: "1.1s" },
  { pos: "right-[5%] top-[24%]", ico: "linear-gradient(135deg,#7d4cdb,#0a3aa8)", Icon: Wallet, delay: "1.3s" },
  { pos: "right-[9%] top-[56%]", ico: "linear-gradient(135deg,#14b8c4,#0ea5a4)", Icon: Languages, delay: "1.5s" },
];

export function Hero() {
  const { t, lang } = useT();
  const { ready } = useReady();
  const ref = useRef<HTMLElement>(null);

  // Scroll: content lifts and fades, the card drifts.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-8, 4]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Pointer: layers drift at different depths.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const contentX = useTransform(sx, (v) => v * -14);
  const contentY = useTransform(sy, (v) => v * -10);
  const floatX = useTransform(sx, (v) => v * 34);
  const floatY = useTransform(sy, (v) => v * 26);
  const auroraX = useTransform(sx, (v) => v * -40);
  const auroraY = useTransform(sy, (v) => v * -30);

  const onMove = (e: React.PointerEvent) => {
    if (!finePointer()) return;
    const b = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - b.left) / b.width - 0.5);
    my.set((e.clientY - b.top) / b.height - 0.5);
  };

  const after = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(8px)" },
    animate: ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1, delay, ease: EASE },
  });

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative overflow-hidden px-5 pt-36 pb-16 md:pt-44 md:pb-24"
    >
      {/* Aurora + network mesh */}
      <motion.div aria-hidden style={{ x: auroraX, y: auroraY }} className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-[85%] rounded-full bg-[#0071e3]/25 blur-[110px] dark:bg-[#0071e3]/35"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-40 h-[460px] w-[460px] -translate-x-[10%] rounded-full bg-[#bf5af2]/20 blur-[110px] dark:bg-[#bf5af2]/30"
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-72 h-[380px] w-[380px] translate-x-[30%] rounded-full bg-[#ff375f]/15 blur-[110px]"
          animate={{ x: [0, 30, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <Mesh className="-z-10 opacity-80" />

      {/* Floating glass chips (desktop) */}
      <motion.div aria-hidden style={{ x: floatX, y: floatY }} className="pointer-events-none absolute inset-0 hidden lg:block">
        {t.floaters.map((f, i) => {
          const { pos, ico, Icon, delay } = FLOATER_STYLE[i];
          return (
            <div key={i} className={`floater ${pos}`} style={{ transitionDelay: delay }}>
              <span className="floater__ico" style={{ background: ico }}>
                <Icon size={19} strokeWidth={1.75} />
              </span>
              <span>
                <b>{f.title}</b>
                <small>{f.sub}</small>
              </span>
            </div>
          );
        })}
      </motion.div>

      <motion.div style={{ opacity: fade, y: lift }} className="relative mx-auto max-w-4xl text-center">
        <motion.div style={{ x: contentX, y: contentY }}>
          <motion.a
            {...after(0)}
            href="#check"
            className="glass magnetic mb-8 inline-flex items-center gap-2 rounded-full border hairline px-4 py-1.5 text-[13px] font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30d158] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30d158]" />
            </span>
            {t.hero.badge}
            <ArrowRight size={14} strokeWidth={2} />
          </motion.a>

          {/* One line on desktop; wraps between the two phrases only on narrow phones. */}
          <h1 className="display hero-title md:-mx-[min(10vw,8rem)] overflow-hidden pb-[0.12em] text-[clamp(2.6rem,7vw,5.6rem)]">
            <span className="inline-block">
              <AssembleText text={t.hero.title1} />
            </span>{" "}
            <span className="inline-block">
              <AssembleText text={t.hero.title2} grad offset={pieceCount(t.hero.title1, lang)} />
            </span>
          </h1>

          <div className="mt-8">
            <span className="hero-rule" />
            <motion.p {...after(0.9)} className="subhead mx-auto max-w-2xl">
              {t.hero.sub}
            </motion.p>
          </div>

          <motion.div {...after(1.1)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a href="#check" className="btn-primary magnetic px-7 py-3 text-[17px] shadow-[0_10px_30px_-10px_rgba(0,113,227,0.6)]">
              {t.hero.ctaCheck}
            </a>
            <a href="#salary" className="btn-ghost magnetic px-6 py-3 text-[17px]">
              {t.hero.ctaCalc} <ArrowRight size={16} strokeWidth={2} />
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating TIN card with a rotating colour border */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 20 }}
        animate={ready ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
        transition={{ duration: 1.2, delay: 1.2, ease: EASE }}
        style={{ perspective: 1200 }}
        className="mx-auto mt-20 max-w-md"
      >
        <motion.div style={{ y: cardY, rotate: cardRotate, scale: cardScale }}>
          <div className="tilt ring-border relative aspect-[1.6/1] rounded-[26px] text-white shadow-[0_40px_80px_-20px_rgba(0,60,180,0.45)]">
            <div className="absolute inset-0 overflow-hidden rounded-[26px] p-7">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a84ff] via-[#5e5ce6] to-[#bf5af2]" />
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
              />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">{t.hero.cardLabel}</p>
                    <p className="mt-1 text-sm font-medium text-white/90">{t.hero.cardIssuer}</p>
                  </div>
                  <ShieldCheck size={22} strokeWidth={1.5} className="text-white/90" />
                </div>
                <div>
                  <p className="font-mono text-2xl sm:text-3xl tracking-[0.2em]">1234 5678 9</p>
                  <p className="mt-2 text-xs text-white/70">{t.hero.cardSample}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.a {...after(1.6)} href="#stats" aria-label={t.hero.ctaCheck} className="mt-24 block text-mute">
        <span className="scroll-cue">
          <span />
        </span>
      </motion.a>
    </section>
  );
}

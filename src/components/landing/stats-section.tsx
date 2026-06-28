"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, Home, CheckCircle2, Lock, Eye, Database,
  Fingerprint, FileCheck2, Server, Globe2, Quote,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onGetStarted: () => void;
};

/** Hook: contador animado que arranca cuando el elemento es visible */
function useCountUp(target: number, durationMs = 1600, decimals = 0) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (prefersReduced) {
            setVal(target);
          } else {
            const start = performance.now();
            const tick = (now: number) => {
              const p = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(target * eased);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
          io.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, durationMs, prefersReduced]);
  return { val, ref };
}

// ---------- Stats con contador ----------
function StatCard({
  value, suffix, decimals = 0, label, icon: Icon, color, delay,
}: {
  value: number; suffix?: string; decimals?: number;
  label: string; icon: React.ElementType; color: string; delay: number;
}) {
  const { val, ref } = useCountUp(value, 1600, decimals);
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10 ring-amber-500/20",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10 ring-violet-500/20",
    sky: "text-sky-600 dark:text-sky-400 bg-sky-500/10 ring-sky-500/20",
  };
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className="relative group"
    >
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-5 sm:p-6 text-center hover:shadow-lg transition-shadow relative overflow-hidden h-full">
        <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full ${c.split(" ")[1]} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
        <div className="relative z-10">
          <div className={`h-11 w-11 rounded-xl ${c} ring-1 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold tabular-nums mb-1">
            <span ref={ref} className={c.split(" ")[0]}>
              {decimals > 0 ? val.toFixed(decimals) : Math.round(val)}
            </span>
            {suffix && <span className={c.split(" ")[0]}>{suffix}</span>}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm leading-snug">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Visualización de la hash chain ----------
function HashChainVisual() {
  const blocks = [
    { id: "Bloque 0", hash: "8a3f…d1c2", tx: "Pago Móvil · 3-A · USD 45" },
    { id: "Bloque 1", hash: "f2b9…7e40", tx: "Gasto · Pintura fachada" },
    { id: "Bloque 2", hash: "1c4d…a93f", tx: "Pago Móvil · 4-B · Bs 27.990" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-card to-amber-950/20 p-5 sm:p-6 relative overflow-hidden"
    >
      <div className="absolute -top-16 -right-16 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Fingerprint className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold">Cadena inmutable de transacciones</div>
            <div className="text-[10px] text-muted-foreground">Cada bloque sella el anterior con SHA-256</div>
          </div>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" /> Audit-ready
          </span>
        </div>

        <div className="space-y-2">
          {blocks.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.5 }}
              className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background/60 p-3"
            >
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  #{i}
                </div>
                {i < blocks.length - 1 && (
                  <motion.div
                    className="w-px h-3 bg-emerald-500/40"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.18 }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate">{b.tx}</div>
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-0.5">
                  <FileCheck2 className="h-2.5 w-2.5 text-emerald-500" />
                  <span className="font-mono">sha256: {b.hash}</span>
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 ml-auto" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          Verificado en tiempo real · No se puede alterar retroactivamente
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Trust badges ----------
function TrustBadges() {
  const badges = [
    { icon: Globe2, label: "Hecho en Venezuela" },
    { icon: Server, label: "Tasa BCV diaria" },
    { icon: Eye, label: "Transparencia total" },
    { icon: Database, label: "30+ módulos" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-wrap justify-center gap-2 sm:gap-3"
    >
      {badges.map((b, i) => (
        <motion.span
          key={b.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45 + i * 0.08 }}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] text-muted-foreground"
        >
          <b.icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {b.label}
        </motion.span>
      ))}
    </motion.div>
  );
}

export function StatsSection({ onGetStarted }: Props) {
  const stats = [
    { value: 100, suffix: "%", label: "Local Venezuela — sin servidores externos", icon: Home, color: "emerald", delay: 0 },
    { value: 256, label: "Criptografía SHA-256 en cada transacción", icon: ShieldCheck, color: "amber", delay: 0.08 },
    { value: 24, suffix: "/7", label: "Acceso desde cualquier dispositivo", icon: CheckCircle2, color: "violet", delay: 0.16 },
    { value: 30, suffix: "+", label: "Módulos activables según tu condominio", icon: Database, color: "sky", delay: 0.24 },
    { value: 4, label: "Claves IA con rotación automática (Groq)", icon: Lock, color: "emerald", delay: 0.32 },
    { value: 0, suffix: "$", label: "Costo oculto — sin comisiones por transacción", icon: FileCheck2, color: "amber", delay: 0.4 },
  ];

  return (
    <section id="stats" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Transparencia verificable
          </motion.span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Confianza que se puede auditar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Cada bolívar y cada dólar quedan registrados de forma criptográfica. Nada se pierde, nada se altera.
          </p>
        </motion.div>

        {/* Grid de stats (6) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-12">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Hash chain visual + quote */}
        <div className="grid lg:grid-cols-5 gap-4 mb-12">
          <div className="lg:col-span-3">
            <HashChainVisual />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 rounded-2xl border bg-card p-6 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Quote className="h-7 w-7 text-amber-500/40 mb-3" />
              <p className="text-sm leading-relaxed text-foreground">
                &ldquo;Por fin puedo mostrar a los vecinos exactamente dónde está cada bolívar. La hash chain nos
                devolvió la confianza que habíamos perdido con las planillas de Excel.&rdquo;
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-3 mt-5 pt-4 border-t">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center text-white font-bold text-xs">
                MR
              </div>
              <div>
                <div className="text-xs font-semibold">María Rodríguez</div>
                <div className="text-[10px] text-muted-foreground">Admin · Residencias Los Olivos, Caracas</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <TrustBadges />

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button size="lg" onClick={onGetStarted} className="rounded-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-8">
            Empieza hoy — es gratis
          </Button>
          <p className="text-xs text-muted-foreground mt-3">Sin tarjeta de crédito · Cancela cuando quieras</p>
        </motion.div>
      </div>
    </section>
  );
}

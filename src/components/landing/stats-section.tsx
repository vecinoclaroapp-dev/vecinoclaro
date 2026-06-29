"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, Home, CheckCircle2, Lock, Eye, Database,
  FileCheck2, Server, Globe2, Quote, Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

// ---------- Testimonios ----------
type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  highlight?: boolean;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Por fin puedo mostrar a los vecinos exactamente dónde está cada bolívar. La cadena de transacciones nos devolvió la confianza que habíamos perdido con las planillas de Excel.",
    name: "María Rodríguez",
    role: "Admin · Residencias Los Olivos, Caracas",
    initials: "MR",
    gradient: "from-emerald-400 to-amber-400",
    highlight: true,
  },
  {
    quote:
      "La verificación de comprobantes con IA me ahorra unas 6 horas semanales. Ya no tengo que revisar captura por captura en WhatsApp.",
    name: "José Martínez",
    role: "Tesorero · Torre Miranda, Valencia",
    initials: "JM",
    gradient: "from-amber-400 to-rose-400",
  },
  {
    quote:
      "Mis vecinos pagan por Pago Móvil y en segundos el sistema lo detecta. La conciliación que antes tomaba 3 días ahora es automática.",
    name: "Carolina Pérez",
    role: "Admin · Conjunto Las Acacias, Maracay",
    initials: "CP",
    gradient: "from-violet-400 to-emerald-400",
  },
  {
    quote:
      "Como residente, ver mi saldo en USD y Bs al mismo tiempo con la tasa BCV del día me da tranquilidad. Sé exactamente cuánto debo.",
    name: "Luis Hernández",
    role: "Residente · Edificio Bolívar, Barquisimeto",
    initials: "LH",
    gradient: "from-sky-400 to-violet-400",
  },
  {
    quote:
      "Las votaciones por indiviso respetan la Ley de Propiedad Horizontal. Las asambleas ya no son un caos de manos levantadas.",
    name: "Ana Gómez",
    role: "Moderadora · Residencias El Ávila, Caracas",
    initials: "AG",
    gradient: "from-rose-400 to-amber-400",
  },
];

function TestimonialsSection() {
  return (
    <div className="mb-8">
      {/* Título de la subsección */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold uppercase tracking-wide mb-3"
        >
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          Lo que dicen quienes ya lo usan
        </motion.span>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Testimonios</h3>
      </motion.div>

      {/* Grid de testimonios: 1 destacado + 4 pequeños */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border bg-card p-5 sm:p-6 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all flex flex-col ${
              t.highlight ? "md:col-span-2 lg:col-span-1 lg:row-span-2" : ""
            }`}
          >
            <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${t.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className="relative z-10 flex flex-col h-full">
              <Quote className={`h-7 w-7 mb-3 ${t.highlight ? "text-amber-500/50" : "text-emerald-500/40"}`} />
              <p className={`leading-relaxed text-foreground flex-1 ${t.highlight ? "text-base sm:text-lg" : "text-sm"}`}>
                &ldquo;{t.quote}&rdquo;
              </p>
              {/* Estrellas */}
              <div className="flex items-center gap-0.5 mt-4">
                {[0, 1, 2, 3, 4].map((s) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 + s * 0.05, type: "spring", stiffness: 200 }}
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </motion.span>
                ))}
              </div>
              {/* Autor */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-foreground/10">
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{t.role}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
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
    <section id="stats" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden">
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
          className="text-center mb-10"
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Testimonios */}
        <TestimonialsSection />

        {/* Trust badges */}
        <TrustBadges />
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Wallet, ShieldCheck, Zap, TrendingUp, ArrowRight, CheckCircle2,
  Vote, Megaphone, Bell, Bot, KeyRound, FileText, Banknote,
  Sparkles, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

type Props = {
  onGetStarted: () => void;
  featuresRef?: React.RefObject<HTMLDivElement>;
};

/** Hook: contador animado que arranca cuando el elemento es visible */
function useCountUp(target: number, durationMs = 1400) {
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
              setVal(Math.round(target * eased));
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

const colorMap: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/20",
    glow: "group-hover:shadow-amber-500/20",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-950/60",
    text: "text-violet-700 dark:text-violet-400",
    ring: "ring-violet-500/20",
    glow: "group-hover:shadow-violet-500/20",
  },
  sky: {
    bg: "bg-sky-100 dark:bg-sky-950/60",
    text: "text-sky-700 dark:text-sky-400",
    ring: "ring-sky-500/20",
    glow: "group-hover:shadow-sky-500/20",
  },
  rose: {
    bg: "bg-rose-100 dark:bg-rose-950/60",
    text: "text-rose-700 dark:text-rose-400",
    ring: "ring-rose-500/20",
    glow: "group-hover:shadow-rose-500/20",
  },
};

// ---------- Mini-visuales para cada card pequeña ----------
function MiniReceipt() {
  return (
    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/40 p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-emerald-500/20 flex items-center justify-center">
            <FileText className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">comprobante.jpg</span>
        </div>
        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">IA 98%</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-1 flex-1 rounded-full bg-emerald-500/15 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: "0%" }}
            whileInView={{ width: "98%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
        <span>Monto, fecha y banco verificados</span>
      </div>
    </div>
  );
}

function MiniBCV() {
  const { val, ref } = useCountUp(622);
  return (
    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/40 p-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">TASA BCV HOY</span>
        <div className="flex items-center gap-1">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[9px] text-muted-foreground">en vivo</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span ref={ref} className="text-lg font-bold tabular-nums text-amber-600 dark:text-amber-400">{val}</span>
        <span className="text-[10px] text-muted-foreground">Bs/USD</span>
        <span className="ml-auto text-[9px] font-medium text-emerald-600 flex items-center gap-0.5">
          <TrendingUp className="h-2.5 w-2.5" /> +0.3%
        </span>
      </div>
    </div>
  );
}

function MiniPaymentMethods() {
  const methods = ["Pago Móvil", "Zelle", "Transferencia", "Efectivo"];
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {methods.map((m, i) => (
        <motion.span
          key={m}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 * i, duration: 0.3 }}
          className="text-[9px] font-medium px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15"
        >
          {m}
        </motion.span>
      ))}
    </div>
  );
}

function MiniUniqueCode() {
  return (
    <div className="mt-3 rounded-lg border border-sky-500/20 bg-sky-50/60 dark:bg-sky-950/40 p-2.5 font-mono">
      <div className="text-[9px] text-muted-foreground mb-1">Código de tu vivienda</div>
      <div className="flex items-center gap-2">
        <KeyRound className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
        <span className="text-sm font-bold tracking-wider text-sky-700 dark:text-sky-400">3A-RSRZ</span>
        <span className="ml-auto text-[9px] text-muted-foreground">único</span>
      </div>
    </div>
  );
}

function MiniVoting() {
  return (
    <div className="mt-3 space-y-1.5">
      {[
        { label: "A favor", pct: 78, color: "bg-emerald-500" },
        { label: "En contra", pct: 18, color: "bg-rose-400" },
        { label: "Abstención", pct: 4, color: "bg-muted-foreground/40" },
      ].map((row, i) => (
        <div key={row.label}>
          <div className="flex justify-between text-[9px] mb-0.5">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-semibold tabular-nums">{row.pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={`h-full ${row.color}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${row.pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 + i * 0.15, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniAnnouncement() {
  return (
    <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/40 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Megaphone className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400">AVISO URGENTE</span>
        <span className="ml-auto text-[9px] text-muted-foreground">hace 2h</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">Corte de agua programado mañana 8 am – 12 pm</p>
    </div>
  );
}

function MiniRoles() {
  const roles = [
    { r: "A", c: "bg-emerald-500" },
    { r: "T", c: "bg-amber-500" },
    { r: "M", c: "bg-violet-500" },
    { r: "V", c: "bg-sky-500" },
  ];
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {roles.map((x, i) => (
        <motion.div
          key={x.r}
          initial={{ scale: 0, rotate: -30 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 * i, type: "spring", stiffness: 200 }}
          className={`h-7 w-7 rounded-full ${x.c} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background`}
        >
          {x.r}
        </motion.div>
      ))}
      <span className="ml-1 text-[9px] text-muted-foreground">Admin · Tesorero · Moderador · Vecino</span>
    </div>
  );
}

function MiniNotifications() {
  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="relative">
        <div className="h-7 w-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <Bell className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <motion.span
          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 text-white text-[7px] font-bold flex items-center justify-center"
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >3</motion.span>
      </div>
      <div className="text-[10px] text-muted-foreground">
        <div className="font-medium text-foreground">3 eventos nuevos</div>
        <div>pago · aviso · votación</div>
      </div>
    </div>
  );
}

// ---------- Card principal grande ----------
function BigFeatureCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6 }}
      className="md:col-span-2 md:row-span-2 rounded-3xl border bg-card p-7 relative overflow-hidden group shadow-sm hover:shadow-xl transition-shadow"
    >
      <div className="absolute -top-24 -right-24 h-72 w-72 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
            <Wallet className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-xl">Contabilidad bimonetaria</h3>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Destacada</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              USD + VES en paralelo con snapshot de tasa BCV. Cada transacción queda registrada con hash SHA-256 inmutable.
            </p>
          </div>
        </div>

        {/* Mock de transacción realista */}
        <div className="mt-auto rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-50/80 to-amber-50/40 dark:from-emerald-950/40 dark:to-amber-950/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pago Móvil · Apto 3-A</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              confirmado
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground">Monto USD</div>
              <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">+USD 45.00</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">Equivalente</div>
              <div className="text-lg font-bold tabular-nums text-ves">Bs 27.990,00</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/10">
            <div>
              <div className="text-[9px] text-muted-foreground">Tasa BCV aplicada</div>
              <div className="text-xs font-bold tabular-nums text-amber-600 dark:text-amber-400">622,21 Bs/USD</div>
            </div>
            <div className="flex items-center gap-2 justify-end text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> SHA-256</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-600" /> Inmutable</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Card pequeña genérica ----------
type SmallFeature = {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  visual?: React.ReactNode;
};

function SmallFeatureCard({ feat, index }: { feat: SmallFeature; index: number }) {
  const c = colorMap[feat.color];
  const Icon = feat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl border bg-card p-5 relative overflow-hidden group shadow-sm hover:shadow-lg ${c.glow} transition-all`}
    >
      <div className={`absolute -top-12 -right-12 h-32 w-32 ${c.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center ring-1 ${c.ring} shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className={`h-4.5 w-4.5 ${c.text}`} />
          </div>
          <h3 className="font-bold text-sm leading-tight">{feat.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-1">{feat.desc}</p>
        {feat.visual}
      </div>
    </motion.div>
  );
}

export function FeaturesSection({ onGetStarted, featuresRef }: Props) {
  const prefersReduced = useReducedMotion();

  const smallFeatures: SmallFeature[] = [
    {
      icon: ShieldCheck, title: "Comprobantes con IA Groq",
      desc: "OCR + detección de fraude con Llama 3.2 90B Vision. 4 API keys con rotación.",
      color: "emerald", visual: <MiniReceipt />,
    },
    {
      icon: TrendingUp, title: "Tasa BCV automática",
      desc: "Sincronización diaria con DolarApi.com + fallback manual.",
      color: "amber", visual: <MiniBCV />,
    },
    {
      icon: Zap, title: "Pagos locales VE",
      desc: "Conversión automática USD/VES con todos los métodos del país.",
      color: "emerald", visual: <MiniPaymentMethods />,
    },
    {
      icon: KeyRound, title: "Cuentas de pago únicas",
      desc: "Cada vivienda tiene su código de referencia para conciliación automática.",
      color: "sky", visual: <MiniUniqueCode />,
    },
    {
      icon: Vote, title: "Votaciones por indiviso",
      desc: "Peso conforme a la Ley de Propiedad Horizontal de Venezuela.",
      color: "emerald", visual: <MiniVoting />,
    },
    {
      icon: Megaphone, title: "Avisos y morosos",
      desc: "Cartelera digital + lista de morosidad discreta con montos USD/VES.",
      color: "amber", visual: <MiniAnnouncement />,
    },
    {
      icon: Bot, title: "Roles avanzados",
      desc: "Admin, Tesorero, Moderador y Residente — todos con vivienda y pagos.",
      color: "violet", visual: <MiniRoles />,
    },
    {
      icon: Bell, title: "Notificaciones + Email",
      desc: "Avisos automáticos por correo Gmail y en la app cuando hay eventos.",
      color: "rose", visual: <MiniNotifications />,
    },
  ];

  return (
    <section
      id="features"
      ref={featuresRef}
      className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: prefersReduced ? undefined : "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Construido para Venezuela
          </motion.span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-6 mb-4 tracking-tight">
            Todo lo que tu condominio necesita
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Una plataforma completa con más de 30 módulos activables. Estas son las funciones destacadas:
          </p>

          {/* Pills de categorías */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { label: "Pagos", icon: Banknote },
              { label: "Transparencia", icon: ShieldCheck },
              { label: "Comunicación", icon: Megaphone },
              { label: "Seguridad", icon: KeyRound },
            ].map((p, i) => (
              <motion.span
                key={p.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] text-muted-foreground"
              >
                <p.icon className="h-3 w-3" />
                {p.label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Bento grid */}
        <div className="grid md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
          <BigFeatureCard />
          {smallFeatures.map((feat, i) => (
            <SmallFeatureCard key={feat.title} feat={feat} index={i + 1} />
          ))}
        </div>

        {/* Footer con contador de módulos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>
              Y mucho más: gastos, presupuesto, fondos, marketplace, documentos, obras, seguridad, visitantes, vehículos…
            </span>
          </div>
          <Button size="sm" onClick={onGetStarted} className="rounded-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shrink-0">
            <Sparkles className="h-3.5 w-3.5" />
            Crear cuenta gratis
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

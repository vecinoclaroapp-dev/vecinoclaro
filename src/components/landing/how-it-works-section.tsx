"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Users, Home, KeyRound, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onGetStarted: () => void;
};

// ---------- Mocks visuales por paso ----------
function MockRegister() {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/80 p-3 space-y-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="ml-1 text-[8px] text-muted-foreground">vecinoclaro.app</span>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 rounded bg-foreground/5 w-3/4" />
        <div className="h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center px-2">
          <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">tu@correo.com</span>
        </div>
        <div className="h-6 rounded-md bg-foreground/5 border border-foreground/10 flex items-center px-2">
          <span className="text-[9px] text-muted-foreground">••••••••</span>
        </div>
        <motion.div
          className="h-6 rounded-md bg-amber-400 flex items-center justify-center"
          initial={{ scale: 0.95 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <span className="text-[9px] font-bold text-emerald-950">Crear cuenta</span>
        </motion.div>
      </div>
    </div>
  );
}

function MockWizard() {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/80 p-3 space-y-2 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((s) => (
            <motion.div
              key={s}
              className="h-1 w-6 rounded-full"
              initial={{ backgroundColor: "hsl(var(--muted))" }}
              whileInView={{ backgroundColor: s === 0 ? "rgb(16 185 129)" : "hsl(var(--muted))" }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * s }}
            />
          ))}
        </div>
        <span className="ml-auto text-[8px] text-muted-foreground">paso 1/3</span>
      </div>
      <div className="text-[9px] font-semibold">Datos del condominio</div>
      <div className="space-y-1">
        <div className="h-5 rounded bg-foreground/5 px-1.5 flex items-center">
          <span className="text-[8px] text-muted-foreground">Residencias Los Olivos</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-5 rounded bg-foreground/5 px-1.5 flex items-center">
            <span className="text-[8px] text-muted-foreground">12 viviendas</span>
          </div>
          <div className="h-5 rounded bg-foreground/5 px-1.5 flex items-center">
            <span className="text-[8px] text-muted-foreground">Caracas</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-foreground/5">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-medium">Tasa BCV sincronizada</span>
      </div>
    </div>
  );
}

function MockInvite() {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/80 p-3 space-y-2 shadow-sm">
      <div className="text-[9px] font-semibold mb-1">Tu código de invitación</div>
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 border-dashed p-2.5 text-center">
        <div className="text-[8px] text-muted-foreground mb-0.5">Comparte con tus vecinos</div>
        <div className="font-mono text-base font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-400">VEC-7K3M</div>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex -space-x-1.5">
          {["bg-emerald-400", "bg-amber-400", "bg-violet-400"].map((c, i) => (
            <motion.div
              key={i}
              className={`h-4 w-4 rounded-full ${c} ring-1 ring-background`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.15, type: "spring", stiffness: 200 }}
            />
          ))}
          <div className="h-4 w-4 rounded-full bg-foreground/10 ring-1 ring-background flex items-center justify-center">
            <span className="text-[7px] font-bold text-muted-foreground">+9</span>
          </div>
        </div>
        <span className="ml-1 text-[8px] text-muted-foreground">12 vecinos unidos</span>
      </div>
    </div>
  );
}

function MockPayments() {
  return (
    <div className="rounded-xl border border-foreground/10 bg-background/80 p-3 space-y-1.5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-semibold">Conciliación automática</span>
        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">9/12</span>
      </div>
      {[
        { apt: "3-A", status: "ok", amt: "USD 45" },
        { apt: "3-B", status: "ok", amt: "USD 45" },
        { apt: "4-A", status: "pending", amt: "Bs 2.7k" },
        { apt: "4-B", status: "ok", amt: "USD 45" },
      ].map((row, i) => (
        <motion.div
          key={row.apt}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 + i * 0.1 }}
          className="flex items-center gap-1.5 text-[8px]"
        >
          <div className={`h-1.5 w-1.5 rounded-full ${row.status === "ok" ? "bg-emerald-500" : "bg-amber-400"}`} />
          <span className="font-medium">Apto {row.apt}</span>
          <span className="ml-auto text-muted-foreground">{row.amt}</span>
          {row.status === "ok" ? (
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
          ) : (
            <Clock className="h-2.5 w-2.5 text-amber-400" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

const steps = [
  {
    step: "01",
    title: "Crea tu cuenta",
    desc: "Registro gratuito. Sin tarjeta de crédito. En 30 segundos estás adentro.",
    icon: Users,
    color: "emerald",
    time: "30 seg",
    mock: <MockRegister />,
  },
  {
    step: "02",
    title: "Configura el condominio",
    desc: "Wizard guiado de 3 pasos: datos del edificio, tasa BCV automática. Listo.",
    icon: Home,
    color: "amber",
    time: "1 min",
    mock: <MockWizard />,
  },
  {
    step: "03",
    title: "Invita residentes",
    desc: "Comparte un código. Tus vecinos registran su puerta y color. Cero fricción.",
    icon: KeyRound,
    color: "violet",
    time: "30 seg",
    mock: <MockInvite />,
  },
  {
    step: "04",
    title: "Gestiona pagos",
    desc: "Comprobantes con IA. Conciliación automática. Reportes en tiempo real.",
    icon: CheckCircle2,
    color: "sky",
    time: "en vivo",
    mock: <MockPayments />,
  },
];

const colorMap: Record<string, { bg: string; text: string; ring: string; accent: string }> = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-950/60",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-950/60",
    text: "text-amber-700 dark:text-amber-400",
    ring: "ring-amber-500/20",
    accent: "text-amber-600 dark:text-amber-400",
  },
  violet: {
    bg: "bg-violet-100 dark:bg-violet-950/60",
    text: "text-violet-700 dark:text-violet-400",
    ring: "ring-violet-500/20",
    accent: "text-violet-600 dark:text-violet-400",
  },
  sky: {
    bg: "bg-sky-100 dark:bg-sky-950/60",
    text: "text-sky-700 dark:text-sky-400",
    ring: "ring-sky-500/20",
    accent: "text-sky-600 dark:text-sky-400",
  },
};

export function HowItWorksSection({ onGetStarted }: Props) {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 30%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/[0.02] via-transparent to-amber-950/[0.02] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.1] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: prefersReduced ? undefined : "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wide mb-5"
          >
            <Clock className="h-3.5 w-3.5" />
            Onboarding en menos de 3 minutos
          </motion.span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Del caos al control total
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Cuatro pasos. Cero curva de aprendizaje. Tu condominio operando hoy mismo.
          </p>
        </motion.div>

        {/* Comparación rápida: antes vs después */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto mb-16"
        >
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">Antes · el caos</div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="line-through opacity-70">Excel perdido en WhatsApp</li>
              <li className="line-through opacity-70">Comprobantes en carpetas sueltas</li>
              <li className="line-through opacity-70">"¿Quién no ha pagado?"</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Después · control</div>
            <ul className="space-y-1 text-xs text-foreground">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Todo en un solo lugar</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> IA verifica cada pago</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Morosidad en tiempo real</li>
            </ul>
          </div>
        </motion.div>

        {/* Pasos con línea conectora */}
        <div ref={sectionRef} className="relative">
          {/* Línea conectora de fondo */}
          <div className="hidden md:block absolute top-[88px] left-0 right-0 h-0.5 bg-foreground/10" />
          {/* Línea conectora animada (progreso) */}
          <motion.div
            className="hidden md:block absolute top-[88px] left-0 h-0.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-500 origin-left"
            style={{ width: prefersReduced ? "100%" : lineHeight }}
          />

          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const c = colorMap[s.color];
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                  className="relative"
                >
                  {/* Nodo en la línea */}
                  <div className="hidden md:flex absolute top-[72px] left-1/2 -translate-x-1/2 z-20">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + 0.3, type: "spring", stiffness: 200 }}
                      className={`h-8 w-8 rounded-full ${c.bg} ring-4 ring-background flex items-center justify-center`}
                    >
                      <StepIcon className={`h-4 w-4 ${c.text}`} />
                    </motion.div>
                  </div>

                  {/* Card */}
                  <div className="md:mt-32 rounded-2xl border bg-card p-5 shadow-sm hover:shadow-lg transition-shadow group relative overflow-hidden">
                    {/* Número gigante de fondo */}
                    <div className={`absolute -top-2 -right-1 text-7xl font-bold ${c.text} opacity-10 leading-none select-none`}>
                      {s.step}
                    </div>

                    <div className="relative z-10">
                      {/* En móvil, mostrar el icono arriba */}
                      <div className="md:hidden flex items-center gap-2 mb-3">
                        <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center ring-1 ${c.ring}`}>
                          <StepIcon className={`h-4.5 w-4.5 ${c.text}`} />
                        </div>
                        <span className={`text-2xl font-bold tabular-nums ${c.accent}`}>{s.step}</span>
                      </div>

                      <div className="hidden md:flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${c.accent}`}>Paso {s.step}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/5 text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {s.time}
                        </span>
                      </div>

                      <h3 className="font-bold text-base mb-1.5">{s.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{s.desc}</p>

                      {/* Mock visual */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.12 + 0.4 }}
                      >
                        {s.mock}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 rounded-2xl border bg-card px-6 py-4 shadow-sm">
            <div className="text-left">
              <div className="text-xs text-muted-foreground">¿Listo para empezar?</div>
              <div className="font-bold text-sm">Tu primer mes es gratis</div>
            </div>
            <Button size="sm" onClick={onGetStarted} className="rounded-full gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              Comenzar ahora
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

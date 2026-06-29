"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown, Heart, Award, Zap, Shield, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onGetStarted: () => void;
};

export function MembershipSection({ onGetStarted }: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <section id="membership" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 overflow-hidden">
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wide mb-5"
          >
            <Crown className="h-3.5 w-3.5" />
            Membresía · 3B
          </motion.span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Bueno, Bonito y <span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">Barato</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            El mejor servicio de gestión de condominios te lo da <strong className="text-foreground">TU VecinoClaro</strong>. Siendo el mejor de Venezuela.
          </p>
        </motion.div>

        {/* 3B Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: Heart,
              title: "Bueno",
              color: "emerald",
              desc: "Plataforma completa con 30+ módulos, IA de comprobantes con Groq Llama 3.2 90B Vision, hash chain SHA-256 inmutable y soporte bimonetario real con snapshot de tasa BCV.",
            },
            {
              icon: Award,
              title: "Bonito",
              color: "amber",
              desc: "Diseño moderno con shadcn/ui, animaciones fluidas con Framer Motion, PWA instalable en cualquier dispositivo, y experiencia tipo app nativa sin fricción.",
            },
            {
              icon: Zap,
              title: "Barato",
              color: "sky",
              desc: "Solo $2 USD por apartamento al mes. Un condominio de 12 viviendas paga $24/mes. Accesible para cualquier condominio de Venezuela, sin comisiones ocultas.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
              emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-500/20" },
              amber: { bg: "bg-amber-100 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-500/20" },
              sky: { bg: "bg-sky-100 dark:bg-sky-950/60", text: "text-sky-700 dark:text-sky-400", ring: "ring-sky-500/20" },
            };
            const c = colorMap[item.color];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              >
                <div className={`absolute -top-12 -right-12 h-32 w-32 ${c.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                <div className="relative z-10">
                  <div className={`h-12 w-12 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${c.text}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing destacado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white p-8 sm:p-12 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold uppercase tracking-wide mb-4">
                <Sparkles className="h-3 w-3" /> Precio justo
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold mb-3">
                Solo <span className="text-amber-400">$2 USD</span><br />
                por apartamento al mes
              </h3>
              <p className="text-emerald-100/80 text-sm leading-relaxed mb-6">
                Cobrado a tasa BCV del día. El condominio paga el total según su número de apartamentos activos. Sin comisiones ocultas, sin contratos forzosos, cancela cuando quieras.
              </p>
              <Button size="lg" onClick={onGetStarted} className="rounded-full gap-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold shadow-lg shadow-amber-400/30 px-8">
                <Crown className="h-4 w-4" />
                Empezar ahora
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { label: "Condominio de 8 viviendas", cost: "$16 USD/mes" },
                { label: "Condominio de 12 viviendas", cost: "$24 USD/mes" },
                { label: "Condominio de 24 viviendas", cost: "$48 USD/mes" },
                { label: "Condominio de 50 viviendas", cost: "$100 USD/mes" },
              ].map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center justify-between rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-sm text-emerald-100">{row.label}</span>
                  </div>
                  <span className="font-bold tabular-nums text-amber-400">{row.cost}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Diferenciadores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-16"
        >
          <p className="text-sm text-muted-foreground mb-6">
            <Shield className="inline h-4 w-4 mr-1 text-emerald-600" />
            ¿Por qué VecinoClaro es el mejor de Venezuela?
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {[
              "Transparencia SHA-256",
              "IA Groq Llama 3.2 90B",
              "Bimonetario real",
              "100% local VE",
              "30+ módulos",
              "PWA instalable",
            ].map((badge, i) => (
              <motion.span
                key={badge}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] text-muted-foreground"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {badge}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { CinematicFooter } from "@/components/ui/motion-footer";
import {
  Wallet, ShieldCheck, Zap, TrendingUp, ArrowRight, CheckCircle2,
  FileText, Banknote, Menu, X, Vote, Megaphone, Bell, Bot,
  KeyRound, Home, Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onGetStarted: () => void;
  onLogin: () => void;
  onJoinResident: () => void;
};

export function LandingPage({ onGetStarted, onLogin }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const featuresEl = featuresRef.current;
      if (!featuresEl) return;
      const rect = featuresEl.getBoundingClientRect();
      const shouldHide = rect.top < 100 && rect.bottom > 100;
      setNavVisible(!shouldHide);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const keyFeatures = [
    {
      icon: Wallet,
      title: "Contabilidad bimonetaria",
      desc: "USD + VES en paralelo con snapshot de tasa BCV. Cada transacción queda registrada con hash SHA-256 inmutable.",
      color: "emerald", size: "lg",
      visual: (
        <div className="rounded-xl bg-muted/40 border p-4 space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pago Móvil — Apto 3-A</span>
            <span className="font-bold tabular-nums text-emerald-600">+USD 45.00</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Equivalente VES</span>
            <span className="font-bold tabular-nums text-ves">Bs 27.990,00</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t">
            <span className="text-muted-foreground">Tasa BCV aplicada</span>
            <span className="font-bold tabular-nums text-amber-600">622,21 Bs/USD</span>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> SHA-256</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><ShieldCheck className="h-3 w-3 text-emerald-600" /> Inmutable</span>
          </div>
        </div>
      ),
    },
    { icon: ShieldCheck, title: "Comprobantes con IA Groq", desc: "OCR + detección de fraude con Llama 3.2 90B Vision. 4 API keys con rotación.", color: "violet", size: "sm" },
    { icon: TrendingUp, title: "Tasa BCV automática", desc: "Sincronización diaria con DolarApi.com + fallback manual.", color: "amber", size: "sm" },
    { icon: Zap, title: "Pagos locales VE", desc: "Pago Móvil, Zelle, Transferencia, Efectivo. Conversión automática USD/VES.", color: "emerald", size: "sm" },
    { icon: KeyRound, title: "Cuentas de pago únicas", desc: "Cada vivienda tiene su código de referencia para conciliación automática.", color: "sky", size: "sm" },
    { icon: Vote, title: "Votaciones con peso por indiviso", desc: "Conforme a la Ley de Propiedad Horizontal de Venezuela.", color: "emerald", size: "sm" },
    { icon: Megaphone, title: "Avisos y morosos", desc: "Cartelera digital + lista de morosidad discreta con montos USD/VES.", color: "amber", size: "sm" },
    { icon: Bot, title: "Roles avanzados", desc: "Admin, Tesorero, Moderador y Residente — todos con vivienda y pagos.", color: "violet", size: "sm" },
    { icon: Bell, title: "Notificaciones + Email", desc: "Avisos automáticos por correo Gmail y en la app cuando hay eventos.", color: "emerald", size: "sm" },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-400" },
    amber: { bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-400" },
    violet: { bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-400" },
    sky: { bg: "bg-sky-100 dark:bg-sky-950/50", text: "text-sky-700 dark:text-sky-400" },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* NAVBAR con show/hide */}
      <AnimatePresence>
        {navVisible && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed top-0 inset-x-0 z-50 px-4 py-3"
          >
            <nav className="mx-auto max-w-5xl flex items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-emerald-950/90 backdrop-blur-xl shadow-lg shadow-emerald-950/20 border border-white/10">
              <div className="flex items-center gap-2.5 shrink-0">
                <img src="/logo-vecinoclaro.jpg" alt="VecinoClaro" className="h-8 w-8 rounded-lg object-cover" />
                <span className="font-bold text-sm text-white tracking-tight">VecinoClaro</span>
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm text-emerald-100/80 mx-auto">
                <a href="#features" className="hover:text-white transition-colors">Funciones</a>
                <a href="#how" className="hover:text-white transition-colors">Cómo funciona</a>
                <a href="#stats" className="hover:text-white transition-colors">Confianza</a>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="ghost" size="sm" onClick={onLogin} className="text-emerald-100 hover:text-white hover:bg-white/10 text-sm">Iniciar sesión</Button>
                <Button size="sm" onClick={onGetStarted} className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm rounded-full px-5 py-2 shadow-md shadow-amber-400/30 transition-all">Crear cuenta</Button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-emerald-100 p-1.5" aria-label="Menú">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </nav>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden mx-auto max-w-5xl mt-2 rounded-2xl bg-emerald-950/95 backdrop-blur-xl border border-white/10 p-4 space-y-1">
                  <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-emerald-100 hover:text-white">Funciones</a>
                  <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-emerald-100 hover:text-white">Cómo funciona</a>
                  <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-emerald-100 hover:text-white">Confianza</a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>

      {/* HERO */}
      <HeroGeometric
        badge="VecinoClaro · Cuentas Claras, Vecinos Claros"
        title1="Administra tu condominio"
        title2="en dólares y bolívares"
        subtitle="La plataforma hecha para la realidad venezolana. Tasa BCV automática, pago móvil, Zelle, comprobantes con IA y libro contable inmutable."
      />

      {/* FEATURES — diseño único dinámico */}
      <section id="features" ref={featuresRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 reveal overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Construido para Venezuela
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-6 mb-4 tracking-tight">Todo lo que tu condominio necesita</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">Una plataforma completa con 30+ módulos activables. Estas son las funciones destacadas:</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 auto-rows-[minmax(160px,auto)]">
            {keyFeatures.map((feat, i) => {
              const Icon = feat.icon;
              const c = colorMap[feat.color];
              const isLarge = feat.size === "lg";
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border bg-card p-6 card-hover relative overflow-hidden group ${isLarge ? "md:col-span-2 md:row-span-2" : ""}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${c.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
                      </div>
                      {isLarge && (
                        <div>
                          <h3 className="font-bold text-lg">{feat.title}</h3>
                          <p className={`text-xs ${c.text} font-medium`}>Destacada</p>
                        </div>
                      )}
                    </div>
                    {!isLarge && <h3 className="font-bold text-base mb-1">{feat.title}</h3>}
                    <p className={`text-sm text-muted-foreground leading-relaxed ${isLarge ? "max-w-md" : ""}`}>{feat.desc}</p>
                    {feat.visual}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">Y mucho más: gastos, presupuesto, fondos, marketplace, documentos, seguridad, visitantes...</p>
            <Button size="sm" variant="outline" onClick={onGetStarted} className="rounded-full gap-1.5">Ver todas las funciones <ArrowRight className="h-3.5 w-3.5" /></Button>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS — decorado con glassmorphism */}
      <section id="how" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 reveal overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent pointer-events-none hidden md:block" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">Del caos al control total</h2>
            <p className="text-muted-foreground">En menos de 3 minutos tu condominio está operando</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Crea tu cuenta", desc: "Registro gratuito. Sin tarjeta de crédito.", icon: Users },
              { step: "02", title: "Configura el condominio", desc: "Wizard guiado: datos, tasa BCV. Listo.", icon: Home },
              { step: "03", title: "Invita residentes", desc: "Comparte tu código. Ellos registran su puerta.", icon: KeyRound },
              { step: "04", title: "Gestiona pagos", desc: "Comprobantes con IA. Reportes en tiempo real.", icon: CheckCircle2 },
            ].map((s, i) => {
              const StepIcon = s.icon;
              return (
                <motion.div key={s.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="relative">
                  <div className="relative backdrop-blur-md bg-foreground/[0.03] border border-foreground/[0.08] rounded-2xl p-6 hover:bg-foreground/[0.06] transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                        <StepIcon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{s.step}</span>
                    </div>
                    <h3 className="font-bold text-base mb-1">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS — decorado con glassmorphism */}
      <section id="stats" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-20 reveal overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="rounded-3xl backdrop-blur-md bg-foreground/[0.03] border border-foreground/[0.08] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="text-center mb-10 relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Confianza que se puede auditar</h2>
              <p className="text-sm text-muted-foreground">Tecnología pensada para la transparencia total</p>
            </motion.div>
            <div className="relative z-10 grid md:grid-cols-3 gap-8 text-center">
              {[
                { value: "100%", label: "Local Venezuela", icon: Home },
                { value: "SHA-256", label: "Auditoría criptográfica", icon: ShieldCheck },
                { value: "24/7", label: "Acceso desde cualquier dispositivo", icon: CheckCircle2 },
              ].map((stat, i) => {
                const StatIcon = stat.icon;
                return (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-3">
                      <StatIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mb-1">{stat.value}</div>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CINEMATIC FOOTER */}
      <CinematicFooter onGetStarted={onGetStarted} onLogin={onLogin} />
    </div>
  );
}

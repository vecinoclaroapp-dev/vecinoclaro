"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { CinematicFooter } from "@/components/ui/motion-footer";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { StatsSection } from "@/components/landing/stats-section";
import { MembershipSection } from "@/components/landing/membership-section";

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
      // Navbar visible SOLO en el hero (scrollY < 50 o features aún no entró al viewport)
      // Una vez que features entra (rect.top <= 80), se oculta para siempre hasta volver arriba
      const atTop = window.scrollY < 50;
      const featuresNotReached = rect.top > 80;
      setNavVisible(atTop || featuresNotReached);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              <div className="hidden md:flex items-center gap-5 text-sm text-emerald-100/80 mx-auto">
                <a href="#features" className="hover:text-white transition-colors">Funciones</a>
                <a href="#how" className="hover:text-white transition-colors">Cómo funciona</a>
                <a href="#stats" className="hover:text-white transition-colors">Confianza</a>
                <a href="#membership" className="hover:text-white transition-colors text-amber-300 font-semibold">Membresía</a>
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
                  <a href="#membership" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 text-sm text-amber-300 font-semibold hover:text-amber-200">Membresía</a>
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

      {/* FEATURES — bento enriquecido con mini-visuales por card */}
      <FeaturesSection onGetStarted={onGetStarted} featuresRef={featuresRef} />

      {/* HOW IT WORKS — pasos con línea conectora animada + mocks */}
      <HowItWorksSection onGetStarted={onGetStarted} />

      {/* STATS — contadores animados + hash chain visual + quote */}
      <StatsSection onGetStarted={onGetStarted} />

      {/* MEMBERSHIP — 3B (Bueno, Bonito, Barato) + pricing + diferenciadores */}
      <MembershipSection onGetStarted={onGetStarted} />

      {/* CINEMATIC FOOTER */}
      <CinematicFooter onGetStarted={onGetStarted} onLogin={onLogin} />
    </div>
  );
}

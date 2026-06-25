"use client";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Wallet,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  FileText,
  Banknote,
  Menu,
} from "lucide-react";
import { useState } from "react";

type Props = {
  onGetStarted: () => void;
  onLogin: () => void;
};

export function LandingPage({ onGetStarted, onLogin }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* ===== NAVBAR FIJA SUPERIOR ===== */}
      <header className="fixed top-0 inset-x-0 z-50 bg-emerald-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-white">
              <p className="font-bold text-sm leading-tight">CondominioDigital</p>
              <p className="text-[10px] text-emerald-300 leading-tight tracking-wider">VENEZUELA</p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-emerald-100">
            <a href="#features" className="hover:text-white transition-colors">Funciones</a>
            <a href="#how" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#stats" className="hover:text-white transition-colors">Confianza</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogin}
              className="text-emerald-100 hover:text-white hover:bg-white/10"
            >
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              onClick={onGetStarted}
              className="bg-amber-400 hover:bg-amber-500 text-emerald-950 font-semibold gap-1.5"
            >
              <span className="hidden sm:inline">Crear cuenta</span>
              <span className="sm:hidden">Empezar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-emerald-100 hover:text-white hover:bg-white/10 h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Nav móvil */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/10 bg-emerald-950 px-4 py-3 space-y-1">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-emerald-100 hover:text-white">Funciones</a>
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-emerald-100 hover:text-white">Cómo funciona</a>
            <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-emerald-100 hover:text-white">Confianza</a>
          </nav>
        )}
      </header>

      {/* ===== HERO con componente 21st.dev ===== */}
      <div className="pt-16">
        <HeroGeometric
          badge="CondominioDigital VE · Bimonetario"
          title1="Administra tu condominio"
          title2="en dólares y bolívares"
          subtitle="La plataforma hecha para la realidad venezolana. Tasa BCV automática, pago móvil, Zelle y libro contable inmutable con auditoría criptográfica."
          cta={
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Button size="lg" onClick={onGetStarted} className="gap-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-semibold shadow-lg shadow-amber-500/20">
                Crear cuenta gratis <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={onLogin} className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
                Ya tengo cuenta
              </Button>
            </div>
          }
        />
      </div>

      {/* ===== SECCIÓN: Funciones ===== */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              Construido para Venezuela
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-3 tracking-tight">
              Todo lo que tu condominio necesita
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Inspirado en Vivook, adaptado a la realidad bimonetaria venezolana. Tasa BCV en tiempo real, pago móvil, Zelle y contabilidad inmutable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Wallet, title: "Contabilidad bimonetaria", desc: "Maneja USD y VES en paralelo. Cada transacción guarda el snapshot de la tasa BCV del día.", color: "emerald" },
              { icon: TrendingUp, title: "Tasa BCV automática", desc: "Sincronización diaria con DolarApi.com. Si no hay internet, fallback a la última tasa guardada o manual.", color: "amber" },
              { icon: ShieldCheck, title: "Auditoría criptográfica", desc: "Libro contable inmutable con hash chain SHA-256. Cada asiento encadenado al anterior. Trazabilidad total.", color: "emerald" },
              { icon: Zap, title: "Pagos locales VE", desc: "Pago Móvil, Transferencia Nacional (20+ bancos), Zelle y Efectivo. Conversión automática USD/VES.", color: "amber" },
              { icon: FileText, title: "Facturas y estados de cuenta", desc: "Genera facturas mensuales por vivienda. Estado de cuenta completo con saldo, pagos y penalidades.", color: "emerald" },
              { icon: Banknote, title: "Gastos y proveedores", desc: "Registra egresos con comprobantes digitales. Cuentas por pagar con aprobación del admin.", color: "amber" },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-soft-lg hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${f.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400"}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN: Cómo funciona ===== */}
      <section id="how" className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/50 dark:bg-emerald-950/10 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
              Del caos de hojas de cálculo al control total
            </h2>
            <p className="text-muted-foreground">En menos de 3 minutos tu condominio está operando</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Crea tu cuenta", desc: "Registro gratuito. Sin tarjeta de crédito." },
              { step: "02", title: "Configura el condominio", desc: "Wizard guiado: datos, viviendas, tasa BCV." },
              { step: "03", title: "Registra pagos", desc: "Cada movimiento se refleja al instante en los saldos." },
              { step: "04", title: "Consulta reportes", desc: "Reportes bimonetarios en tiempo real, exportables." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-5xl font-bold text-emerald-200 dark:text-emerald-900 mb-3 tabular-nums">
                  {s.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN: Stats ===== */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-background scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 md:p-12 text-white relative overflow-hidden shadow-soft-lg">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="relative z-10 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold tabular-nums mb-1">100%</div>
                <p className="text-emerald-100 text-sm">Local Venezuela</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tabular-nums mb-1">SHA-256</div>
                <p className="text-emerald-100 text-sm">Auditoría criptográfica</p>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tabular-nums mb-1">24/7</div>
                <p className="text-emerald-100 text-sm">Acceso desde cualquier dispositivo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 items-center justify-center mb-6 shadow-soft-lg">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            Empieza a administrar tu condominio hoy
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Sin costos de activación. Sin comisiones por transacción. Solo claridad y control total.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button size="lg" onClick={onGetStarted} className="gap-2">
              Crear cuenta gratis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onLogin}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-card py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">CondominioDigital VE</p>
              <p className="text-xs text-muted-foreground">Gestión bimonetaria · v2.1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap justify-center">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Ledger inmutable SHA-256</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-amber-600" /> Tasa BCV DolarApi</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 100% local VE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

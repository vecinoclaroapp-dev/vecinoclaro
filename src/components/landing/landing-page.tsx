"use client";

import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Wallet,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  FileText,
  Banknote,
  BookOpen,
} from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  onGetStarted: () => void;
  onLogin: () => void;
};

export function LandingPage({ onGetStarted, onLogin }: Props) {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== HERO con componente 21st.dev ===== */}
      <HeroGeometric
        badge="CondominioDigital VE · Bimonetario"
        title1="Administra tu condominio"
        title2="en dólares y bolívares"
        subtitle="La plataforma hecha para la realidad venezolana. Tasa BCV automática, pago móvil, Zelle y libro contable inmutable con auditoría criptográfica."
        cta={
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button size="lg" onClick={onGetStarted} className="gap-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-semibold">
              Crear cuenta gratis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={onLogin} className="gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white">
              Ya tengo cuenta
            </Button>
          </div>
        }
      />

      {/* ===== SECCIÓN: Por qué CondominioDigital VE ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide">
              Construido para Venezuela
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-3">
              Todo lo que tu condominio necesita
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Inspirado en Vivook, adaptado a la realidad bimonetaria venezolana. Tasa BCV en tiempo real, pago móvil, Zelle y contabilidad inmutable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wallet,
                title: "Contabilidad bimonetaria",
                desc: "Maneja USD y VES en paralelo. Cada transacción guarda el snapshot de la tasa BCV del día.",
                color: "emerald",
              },
              {
                icon: TrendingUp,
                title: "Tasa BCV automática",
                desc: "Sincronización diaria con DolarApi.com. Si no hay internet, fallback a la última tasa guardada o manual.",
                color: "amber",
              },
              {
                icon: ShieldCheck,
                title: "Auditoría criptográfica",
                desc: "Libro contable inmutable con hash chain SHA-256. Cada asiento encadenado al anterior. Trazabilidad total.",
                color: "emerald",
              },
              {
                icon: Zap,
                title: "Pagos locales VE",
                desc: "Pago Móvil, Transferencia Nacional (20+ bancos), Zelle y Efectivo. Conversión automática USD/VES.",
                color: "amber",
              },
              {
                icon: FileText,
                title: "Facturas y estados de cuenta",
                desc: "Genera facturas mensuales por vivienda. Estado de cuenta completo con saldo, pagos y penalidades.",
                color: "emerald",
              },
              {
                icon: Banknote,
                title: "Gastos y proveedores",
                desc: "Registra egresos con comprobantes digitales. Cuentas por pagar con aprobación del admin.",
                color: "amber",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/50 dark:bg-emerald-950/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
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

      {/* ===== SECCIÓN: Estadística / prueba social ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 md:p-12 text-white relative overflow-hidden">
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
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 items-center justify-center mb-6">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
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
              <p className="text-xs text-muted-foreground">Gestión bimonetaria · v2.0.0</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Ledger inmutable SHA-256</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-amber-600" /> Tasa BCV DolarApi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

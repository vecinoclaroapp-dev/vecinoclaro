"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboardingStep } from "@/hooks/use-auth";
import { useSyncBcv } from "@/hooks/use-api";
import { Building2, Home, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, Loader2, MapPin, Phone, IdCard, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { onComplete: () => void };

const STEPS = [
  { id: 0, label: "Residencia", icon: Building2, desc: "Datos del condominio" },
  { id: 1, label: "Edificios", icon: Home, desc: "Estructura del condominio" },
  { id: 2, label: "Mensualidad", icon: DollarSign, desc: "Costo mensual" },
  { id: 3, label: "Finalizar", icon: CheckCircle2, desc: "¡Listo!" },
];

export function AdminOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const runStep = useOnboardingStep();
  const syncBcv = useSyncBcv();

  const [condo, setCondo] = useState({
    name: "", rif: "", address: "", city: "",
    adminPhone: "", presidentName: "", presidentCedula: "",
    baseFeeUSD: 0,
  });
  const [numBuildings, setNumBuildings] = useState("");

  const finish = async () => {
    setLoading(true);
    try {
      await runStep.mutateAsync({ step: "condominium", ...condo, baseFeeUSD: Number(condo.baseFeeUSD) || 0 });
      // Crear viviendas placeholder según número de edificios
      const n = parseInt(numBuildings) || 1;
      const residences = [];
      for (let b = 1; b <= n; b++) {
        residences.push({ number: `Edificio ${b}`, floor: "", type: "APARTMENT", aliquot: 1, ownerName: "", ownerPhone: "", ownerEmail: "" });
      }
      await runStep.mutateAsync({ step: "residences", residences });
      try { await syncBcv.mutateAsync(); } catch {}
      await runStep.mutateAsync({ step: "complete" });
      toast.success("¡Condominio configurado!");
      onComplete();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-amber-400/20 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <div className="relative mx-auto">
            <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full" />
            <Loader2 className="h-14 w-14 animate-spin text-amber-400 mx-auto relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Configurando tu condominio...</h2>
            <p className="text-emerald-200/60 text-sm mt-2">Esto tomará unos segundos</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo-vecinoclaro.png" alt="VecinoClaro" className="h-16 w-16 mx-auto object-contain mb-3" />
          <h1 className="text-2xl font-bold">Configura tu condominio</h1>
          <p className="text-sm text-muted-foreground mt-1">Paso {step + 1} de {STEPS.length}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center">
                <div className={cn("flex flex-col items-center transition-all", i <= step ? "" : "opacity-30")}>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950 scale-110" : "bg-muted text-muted-foreground")}>
                    {i < step ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className="text-[10px] mt-1.5 font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("w-12 sm:w-16 h-0.5 mx-2 mb-5 rounded transition-colors", i < step ? "bg-emerald-500" : "bg-muted")} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* Paso 0: Datos del condominio */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-base">Datos de la residencia</h3>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Nombre de la residencia *</Label>
                    <Input placeholder="Residencias Los Olivos" value={condo.name} onChange={(e) => setCondo({ ...condo, name: e.target.value })} className="h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>RIF *</Label>
                      <Input placeholder="J-12345678-9" value={condo.rif} onChange={(e) => setCondo({ ...condo, rif: e.target.value })} className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Ciudad</Label>
                      <Input placeholder="Caracas" value={condo.city} onChange={(e) => setCondo({ ...condo, city: e.target.value })} className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Dirección *</Label>
                    <Input placeholder="Av. Principal, sector..." value={condo.address} onChange={(e) => setCondo({ ...condo, address: e.target.value })} className="h-11" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</Label>
                      <Input placeholder="+58 212-..." value={condo.adminPhone} onChange={(e) => setCondo({ ...condo, adminPhone: e.target.value })} className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Presidente / Representante</Label>
                      <Input placeholder="Nombre completo" value={condo.presidentName} onChange={(e) => setCondo({ ...condo, presidentName: e.target.value })} className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1"><IdCard className="h-3 w-3" /> Cédula del presidente</Label>
                    <Input placeholder="V-12.345.678" value={condo.presidentCedula} onChange={(e) => setCondo({ ...condo, presidentCedula: e.target.value })} className="h-11" />
                  </div>
                  <Button className="w-full h-11 gap-2" disabled={!condo.name || !condo.rif || !condo.address} onClick={() => setStep(1)}>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paso 1: Edificios */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-lg">
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                      <Home className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold text-base">Estructura del condominio</h3>
                  </div>

                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-4">¿Cuántos edificios tiene el condominio o urbanización?</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-lg font-bold" onClick={() => setNumBuildings(String(Math.max(1, parseInt(numBuildings || "1") - 1)))}>
                        −
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={numBuildings}
                        onChange={(e) => setNumBuildings(e.target.value)}
                        className="w-24 text-center text-2xl font-bold h-16"
                        placeholder="1"
                      />
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl text-lg font-bold" onClick={() => setNumBuildings(String((parseInt(numBuildings || "0") || 0) + 1))}>
                        +
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      {numBuildings && parseInt(numBuildings) > 1
                        ? `Condominio con ${numBuildings} edificios`
                        : "Condominio con un solo edificio"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5" onClick={() => setStep(0)}>
                      <ArrowLeft className="h-4 w-4" /> Atrás
                    </Button>
                    <Button className="flex-1 gap-2" onClick={() => setStep(2)}>
                      Continuar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paso 2: Mensualidad */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-base">Costo de mensualidad</h3>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Costo mensual por vivienda (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">USD</span>
                      <Input type="number" step="0.01" placeholder="45.00" value={condo.baseFeeUSD || ""} onChange={(e) => setCondo({ ...condo, baseFeeUSD: Number(e.target.value) })} className="pl-12 h-12 text-lg font-bold" />
                    </div>
                    <p className="text-xs text-muted-foreground">Se convertirá a Bs automáticamente con la tasa BCV del día.</p>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50/50 dark:from-emerald-950/20 dark:to-amber-950/10 border border-emerald-200 dark:border-emerald-900/40 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Total esperado por mes</p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      USD {(condo.baseFeeUSD * (parseInt(numBuildings) || 1)).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {parseInt(numBuildings) || 1} {parseInt(numBuildings) === 1 ? "edificio" : "edificios"} × USD {condo.baseFeeUSD || 0}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4" /> Atrás
                    </Button>
                    <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
                      Continuar <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Paso 3: Finalizar */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-lg">¡Todo listo!</h3>
                    <p className="text-sm text-muted-foreground">Revisa los datos antes de finalizar</p>
                  </div>

                  <div className="rounded-xl border bg-card p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Residencia</span>
                      <span className="font-semibold">{condo.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">RIF</span>
                      <span className="font-semibold">{condo.rif}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Dirección</span>
                      <span className="font-semibold text-right max-w-[60%] truncate">{condo.address}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Presidente</span>
                      <span className="font-semibold">{condo.presidentName || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Edificios</span>
                      <span className="font-semibold">{parseInt(numBuildings) || 1}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Mensualidad</span>
                      <span className="font-semibold text-emerald-600">USD {condo.baseFeeUSD || 0} / vivienda</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-1.5" onClick={() => setStep(2)}>
                      <ArrowLeft className="h-4 w-4" /> Atrás
                    </Button>
                    <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" onClick={finish}>
                      <CheckCircle2 className="h-4 w-4" /> Finalizar proceso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

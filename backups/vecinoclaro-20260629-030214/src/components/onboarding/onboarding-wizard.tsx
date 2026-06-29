"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStep } from "@/hooks/use-auth";
import { useSyncBcv } from "@/hooks/use-api";
import { RESIDENCE_TYPES } from "@/lib/constants";
import { formatNumber, formatUSD } from "@/lib/money";
import { toast } from "sonner";
import {
  Building2,
  Home,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  Wallet,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Residence = {
  number: string;
  floor: string;
  type: string;
  aliquot: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
};

const STEPS = [
  { id: 0, label: "Condominio", icon: Building2, desc: "Datos básicos" },
  { id: 1, label: "Viviendas", icon: Home, desc: "Unidades del edificio" },
  { id: 2, label: "Tasa BCV", icon: TrendingUp, desc: "Configura el cambio" },
  { id: 3, label: "Listo", icon: Sparkles, desc: "Empieza a usar" },
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const runStep = useOnboardingStep();
  const syncBcv = useSyncBcv();

  // Paso 1
  const [condo, setCondo] = useState({
    name: "",
    rif: "",
    address: "",
    city: "",
    adminName: "",
    adminPhone: "",
    adminEmail: "",
    baseFeeUSD: "",
  });

  // Paso 2
  const [residences, setResidences] = useState<Residence[]>([
    { number: "", floor: "", type: "APARTMENT", aliquot: 1, ownerName: "", ownerPhone: "", ownerEmail: "" },
  ]);

  // Paso 3
  const [manualRate, setManualRate] = useState("");
  const [bcvRate, setBcvRate] = useState<number | null>(null);

  const addResidence = () => {
    setResidences([...residences, { number: "", floor: "", type: "APARTMENT", aliquot: 1, ownerName: "", ownerPhone: "", ownerEmail: "" }]);
  };
  const removeResidence = (i: number) => setResidences(residences.filter((_, idx) => idx !== i));
  const updateResidence = (i: number, field: keyof Residence, value: string | number) =>
    setResidences(residences.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  const submitCondo = async () => {
    if (!condo.name.trim() || !condo.rif.trim()) {
      toast.error("Nombre y RIF son obligatorios");
      return;
    }
    try {
      await runStep.mutateAsync({ step: "condominium", ...condo, baseFeeUSD: Number(condo.baseFeeUSD) || 0 });
      toast.success("Condominio creado");
      setStep(1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const submitResidences = async () => {
    const valid = residences.filter((r) => r.number.trim());
    if (valid.length === 0) {
      toast.error("Agrega al menos una vivienda con número");
      return;
    }
    try {
      await runStep.mutateAsync({ step: "residences", residences: valid });
      toast.success(`${valid.length} viviendas registradas`);
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const submitBcv = async () => {
    try {
      // Intenta BCV primero
      const result = await syncBcv.mutateAsync();
      if (result.message && result.source === "FALLBACK") {
        // No llegó del BCV, usar manual si existe
        if (manualRate && Number(manualRate) > 0) {
          const r = await runStep.mutateAsync({ step: "bcv", manualRate: Number(manualRate) });
          setBcvRate(r.rate);
        } else {
          toast.error("BCV no respondió. Ingresa la tasa manualmente.");
          return;
        }
      } else {
        setBcvRate(result.rate);
      }
      // Marca el paso del onboarding
      await runStep.mutateAsync({ step: "bcv" });
      toast.success("Tasa configurada");
      setStep(3);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const finish = async () => {
    try {
      await runStep.mutateAsync({ step: "complete" });
      toast.success("¡Todo listo! Bienvenido a VecinoClaro");
      onComplete();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">Configuremos tu condominio</h1>
          <p className="text-sm text-muted-foreground">Te guiamos paso a paso. Toma menos de 3 minutos.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                      done ? "bg-emerald-600 text-white" : active ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn("text-[11px] font-medium", active ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2 mb-5 rounded", i < step ? "bg-emerald-500" : "bg-muted")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card content */}
        <Card className="shadow-xl border-emerald-100 dark:border-emerald-900/30">
          <CardContent className="p-6 md:p-8">
            {/* Paso 0: Condominio */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" /> Datos del condominio
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Identifica tu edificio o conjunto residencial.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Nombre del condominio *</Label>
                    <Input id="name" placeholder="Residencias La Trinidad" value={condo.name} onChange={(e) => setCondo({ ...condo, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rif">RIF *</Label>
                    <Input id="rif" placeholder="J-12345678-9" value={condo.rif} onChange={(e) => setCondo({ ...condo, rif: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea id="address" rows={2} placeholder="Av. Principal, Urb..." value={condo.address} onChange={(e) => setCondo({ ...condo, address: e.target.value })} />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" placeholder="Caracas" value={condo.city} onChange={(e) => setCondo({ ...condo, city: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Teléfono admin</Label>
                    <Input id="phone" placeholder="+58 412-..." value={condo.adminPhone} onChange={(e) => setCondo({ ...condo, adminPhone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fee">Cuota base USD/mes</Label>
                    <Input id="fee" type="number" step="0.01" placeholder="45.00" value={condo.baseFeeUSD} onChange={(e) => setCondo({ ...condo, baseFeeUSD: e.target.value })} />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={submitCondo} disabled={runStep.isPending} className="gap-1.5">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 1: Viviendas */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Home className="h-5 w-5 text-emerald-600" /> Viviendas del condominio
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Registra las unidades. Puedes editarlas después.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={addResidence} className="gap-1.5 shrink-0">
                    <Plus className="h-4 w-4" /> Agregar
                  </Button>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto scroll-fine pr-1">
                  {residences.map((r, i) => (
                    <div key={i} className="rounded-xl border p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="font-mono">Vivienda {i + 1}</Badge>
                        {residences.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => removeResidence(i)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-4 gap-2">
                        <Input placeholder="Número * (12-A)" value={r.number} onChange={(e) => updateResidence(i, "number", e.target.value)} />
                        <Input placeholder="Piso" value={r.floor} onChange={(e) => updateResidence(i, "floor", e.target.value)} />
                        <Select value={r.type} onValueChange={(v) => updateResidence(i, "type", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {RESIDENCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input type="number" step="0.1" placeholder="Alícuota (1)" value={r.aliquot || ""} onChange={(e) => updateResidence(i, "aliquot", Number(e.target.value) || 1)} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2 mt-2">
                        <Input placeholder="Propietario" value={r.ownerName} onChange={(e) => updateResidence(i, "ownerName", e.target.value)} />
                        <Input placeholder="Teléfono" value={r.ownerPhone} onChange={(e) => updateResidence(i, "ownerPhone", e.target.value)} />
                        <Input placeholder="Correo" value={r.ownerEmail} onChange={(e) => updateResidence(i, "ownerEmail", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(0)} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                  <Button onClick={submitResidences} disabled={runStep.isPending} className="gap-1.5">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 2: BCV */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" /> Tasa de cambio BCV
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Necesaria para la contabilidad bimonetaria USD/VES.</p>
                </div>

                <div className="rounded-xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/50 to-amber-50/30 dark:from-emerald-950/20 dark:to-amber-950/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Tasa oficial</p>
                      <p className="text-sm text-muted-foreground">Sincroniza automáticamente con el BCV</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => syncBcv.mutate()} disabled={syncBcv.isPending} className="gap-1.5">
                      <RefreshCw className={cn("h-3.5 w-3.5", syncBcv.isPending && "animate-spin")} />
                      Sincronizar
                    </Button>
                  </div>
                  {syncBcv.data && (
                    <div className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatNumber(syncBcv.data.rate)} <span className="text-sm font-normal text-muted-foreground">Bs/USD</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-2">¿No se pudo sincronizar? Ingresa la tasa manualmente:</p>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="manual">Tasa manual (Bs/USD)</Label>
                      <Input id="manual" type="number" step="0.01" placeholder="148.32" value={manualRate} onChange={(e) => setManualRate(e.target.value)} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Puedes actualizarla cuando quieras desde el panel.</p>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5">
                    <ArrowLeft className="h-4 w-4" /> Atrás
                  </Button>
                  <Button onClick={submitBcv} disabled={runStep.isPending || syncBcv.isPending} className="gap-1.5">
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 3: Listo */}
            {step === 3 && (
              <div className="text-center space-y-6 py-4">
                <div className="inline-flex h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/50 items-center justify-center mb-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">¡Todo listo!</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Tu condominio está configurado. Ya puedes registrar pagos, generar cargos y llevar la contabilidad bimonetaria.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                  {[
                    { icon: Wallet, label: "Pagos" },
                    { icon: Zap, label: "Servicios" },
                    { icon: ShieldCheck, label: "Auditoría" },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl border p-3 bg-background">
                      <f.icon className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                      <p className="text-xs font-medium">{f.label}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={finish} size="lg" className="gap-2 mt-4">
                  Entrar al panel <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Tus datos están protegidos. Contabilidad inmutable con hash SHA-256.
        </p>
      </div>
    </div>
  );
}

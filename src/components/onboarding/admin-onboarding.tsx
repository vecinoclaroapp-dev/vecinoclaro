"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOnboardingStep } from "@/hooks/use-auth";
import { useSyncBcv } from "@/hooks/use-api";
import { RESIDENCE_TYPES } from "@/lib/constants";
import { Building2, Home, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = { onComplete: () => void };

type Residence = { number: string; floor: string; type: string; aliquot: number; ownerName: string; ownerPhone: string; ownerEmail: string };

const STEPS = [
  { id: 0, label: "Residencia", icon: Building2, desc: "Datos del condominio" },
  { id: 1, label: "Viviendas", icon: Home, desc: "Apartamentos del edificio" },
  { id: 2, label: "Mensualidad", icon: TrendingUp, desc: "Costo y configuración" },
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

  const [residences, setResidences] = useState<Residence[]>([
    { number: "", floor: "", type: "APARTMENT", aliquot: 1, ownerName: "", ownerPhone: "", ownerEmail: "" },
  ]);

  const [numApartments, setNumApartments] = useState("");

  const addResidence = () => setResidences([...residences, { number: "", floor: "", type: "APARTMENT", aliquot: 1, ownerName: "", ownerPhone: "", ownerEmail: "" }]);
  const removeResidence = (i: number) => setResidences(residences.filter((_, idx) => idx !== i));
  const updateResidence = (i: number, field: string, value: string | number) => setResidences(residences.map((r, idx) => idx === i ? { ...r, [field]: value } : r));

  // Generar viviendas automáticas según número
  const generateResidences = () => {
    const n = parseInt(numApartments);
    if (!n || n < 1 || n > 200) { toast.error("Ingresa un número válido (1-200)"); return; }
    const auto: Residence[] = [];
    for (let i = 1; i <= n; i++) {
      auto.push({ number: String(i), floor: Math.ceil(i / 4).toString(), type: "APARTMENT", aliquot: 1, ownerName: "", ownerPhone: "", ownerEmail: "" });
    }
    setResidences(auto);
    toast.success(`${n} viviendas generadas`);
  };

  const finish = async () => {
    setLoading(true);
    try {
      // Paso 1: crear condominio
      await runStep.mutateAsync({ step: "condominium", ...condo, baseFeeUSD: Number(condo.baseFeeUSD) || 0 });
      // Paso 2: crear viviendas
      const valid = residences.filter((r) => r.number.trim());
      if (valid.length > 0) await runStep.mutateAsync({ step: "residences", residences: valid });
      // Paso 3: sincronizar BCV
      try { await syncBcv.mutateAsync(); } catch {}
      // Paso 4: completar
      await runStep.mutateAsync({ step: "complete" });
      toast.success("¡Condominio configurado!");
      onComplete();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800">
        <div className="text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-white">Configurando tu condominio...</h2>
            <p className="text-emerald-200/70 text-sm mt-1">Esto tomará unos segundos</p>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo-vecinoclaro.png" alt="VecinoClaro" className="h-14 w-14 mx-auto object-contain mb-3" />
          <h1 className="text-2xl font-bold">Configura tu condominio</h1>
          <p className="text-sm text-muted-foreground mt-1">Paso {step + 1} de {STEPS.length}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center">
                <div className={cn("flex flex-col items-center", i <= step ? "" : "opacity-40")}>
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950" : "bg-muted")}>
                    {i < step ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className="text-[10px] mt-1 font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("w-12 h-0.5 mx-2 mb-5 rounded", i < step ? "bg-emerald-500" : "bg-muted")} />}
              </div>
            );
          })}
        </div>

        {/* Paso 0: Datos del condominio */}
        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Datos de la residencia</CardTitle><CardDescription>Información básica del condominio</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5"><Label>Nombre de la residencia *</Label><Input placeholder="Residencias Los Olivos" value={condo.name} onChange={(e) => setCondo({ ...condo, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>RIF *</Label><Input placeholder="J-12345678-9" value={condo.rif} onChange={(e) => setCondo({ ...condo, rif: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Ciudad</Label><Input placeholder="Caracas" value={condo.city} onChange={(e) => setCondo({ ...condo, city: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Dirección *</Label><Input placeholder="Av. Principal, sector..." value={condo.address} onChange={(e) => setCondo({ ...condo, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Teléfono</Label><Input placeholder="+58 212-..." value={condo.adminPhone} onChange={(e) => setCondo({ ...condo, adminPhone: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Presidente / Representante legal</Label><Input placeholder="Nombre completo" value={condo.presidentName} onChange={(e) => setCondo({ ...condo, presidentName: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Cédula del presidente</Label><Input placeholder="V-12.345.678" value={condo.presidentCedula} onChange={(e) => setCondo({ ...condo, presidentCedula: e.target.value })} /></div>
              <Button className="w-full gap-2" disabled={!condo.name || !condo.rif || !condo.address} onClick={() => setStep(1)}>Continuar <ArrowRight className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        )}

        {/* Paso 1: Viviendas */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Viviendas del condominio</CardTitle><CardDescription>¿Cuántos apartamentos tiene?</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input type="number" placeholder="Ej: 12" value={numApartments} onChange={(e) => setNumApartments(e.target.value)} />
                <Button variant="outline" onClick={generateResidences}>Generar</Button>
              </div>
              <div className="max-h-64 overflow-y-auto scroll-fine space-y-2">
                {residences.map((r, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder="N°" className="w-16" value={r.number} onChange={(e) => updateResidence(i, "number", e.target.value)} />
                    <Input placeholder="Piso" className="w-16" value={r.floor} onChange={(e) => updateResidence(i, "floor", e.target.value)} />
                    {residences.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeResidence(i)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addResidence}><Plus className="h-3.5 w-3.5" /> Agregar vivienda</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Atrás</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(2)}>Continuar <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Mensualidad */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Costo de mensualidad</CardTitle><CardDescription>Configura el pago mensual de los residentes</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Costo mensual por vivienda (USD)</Label>
                <Input type="number" step="0.01" placeholder="45.00" value={condo.baseFeeUSD || ""} onChange={(e) => setCondo({ ...condo, baseFeeUSD: Number(e.target.value) })} />
                <p className="text-xs text-muted-foreground">Este es el monto que cada vivienda debe pagar mensualmente. Se convertirá a Bs automáticamente con la tasa BCV.</p>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Total esperado por mes</p>
                <p className="text-lg font-bold tabular-nums text-emerald-600">USD {(condo.baseFeeUSD * residences.filter(r => r.number.trim()).length).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{residences.filter(r => r.number.trim()).length} viviendas × USD {condo.baseFeeUSD || 0}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Atrás</Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(3)}>Continuar <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Finalizar */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>¡Todo listo!</CardTitle><CardDescription>Revisa los datos antes de finalizar</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Residencia:</span><span className="font-semibold">{condo.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">RIF:</span><span className="font-semibold">{condo.rif}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dirección:</span><span className="font-semibold">{condo.address}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Presidente:</span><span className="font-semibold">{condo.presidentName || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Viviendas:</span><span className="font-semibold">{residences.filter(r => r.number.trim()).length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mensualidad:</span><span className="font-semibold">USD {condo.baseFeeUSD || 0} / vivienda</span></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Atrás</Button>
                <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={finish}>
                  <CheckCircle2 className="h-4 w-4" /> Finalizar proceso
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

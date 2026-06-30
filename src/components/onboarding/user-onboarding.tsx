"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRegister } from "@/hooks/use-auth";
import { Home, KeyRound, DoorOpen, User, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Phone, IdCard, Users } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  onAuthed: () => void;
  onBack: () => void;
};

const DOOR_COLORS = [
  { name: "Blanco", value: "#ffffff" },
  { name: "Madera", value: "#8b4513" },
  { name: "Negro", value: "#1a1a1a" },
  { name: "Rojo", value: "#dc2626" },
  { name: "Azul", value: "#2563eb" },
  { name: "Verde", value: "#16a34a" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Naranja", value: "#ea580c" },
];

export function UserOnboarding({ onAuthed, onBack }: Props) {
  const register = useRegister();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "account" | "loading">("details");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    inviteCode: "",
    residenceLabel: "",
    doorName: "",
    doorColor: "#8b4513",
    cedula: "",
    phone: "",
    numHabitantes: "",
  });

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const verifyDetails = () => {
    if (!data.inviteCode.trim()) { toast.error("Ingresa el código de invitación"); return; }
    if (!data.residenceLabel.trim()) { toast.error("Indica tu número de puerta/vivienda"); return; }
    if (!data.cedula.trim()) { toast.error("Ingresa tu cédula"); return; }
    if (!data.phone.trim()) { toast.error("Ingresa tu teléfono"); return; }
    setStep("account");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) { toast.error("Ingresa tu nombre completo"); return; }
    setLoading(true);
    setStep("loading");
    try {
      await register.mutateAsync(form);
      // Vincular al condominio
      const linkRes = await fetch("/api/residents/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.inviteCode.trim().toUpperCase(), residenceLabel: data.residenceLabel }),
      });
      if (!linkRes.ok) {
        const j = await linkRes.json();
        toast.warning("Cuenta creada. No se pudo vincular: " + (j.error || "código inválido"));
      } else {
        toast.success("¡Cuenta creada y vinculada!");
      }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.refresh();
      onAuthed();
    } catch (e) {
      toast.error((e as Error).message);
      setStep("account");
      setLoading(false);
    }
  };

  // Pantalla de carga
  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800">
        <div className="text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto" />
          <div>
            <h2 className="text-xl font-bold text-white">Creando tu cuenta...</h2>
            <p className="text-emerald-200/70 text-sm mt-1">Vinculando con tu condominio</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <Card>
          <CardHeader className="text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-2">
              <Home className="h-7 w-7 text-emerald-700 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl">Soy Usuario</CardTitle>
            <CardDescription>
              {step === "details" ? "Configura tu vivienda" : "Crea tu cuenta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "details" ? (
              <div className="space-y-4">
                {/* Código de invitación */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Código de invitación *</Label>
                  <Input placeholder="EJ: VEC-7K3M" value={data.inviteCode} onChange={(e) => setData({ ...data, inviteCode: e.target.value.toUpperCase() })} className="font-mono text-center uppercase" />
                </div>

                {/* Puerta / Vivienda */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><DoorOpen className="h-3.5 w-3.5" /> Número de puerta / Vivienda *</Label>
                  <Input placeholder="Ej: 3-A, PH, Casa 5" value={data.residenceLabel} onChange={(e) => setData({ ...data, residenceLabel: e.target.value })} />
                </div>

                {/* Nombre de la puerta (opcional) */}
                <div className="space-y-1.5">
                  <Label>Nombre de la puerta <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input placeholder="Ej: Casa de Pedro" value={data.doorName} onChange={(e) => setData({ ...data, doorName: e.target.value })} />
                </div>

                {/* Color de puerta */}
                <div className="space-y-1.5">
                  <Label>Color de tu puerta</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOOR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setData({ ...data, doorColor: c.value })}
                        className={`h-9 w-9 rounded-lg border-2 transition-all ${data.doorColor === c.value ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" : "border-border"}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Cédula */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><IdCard className="h-3.5 w-3.5" /> Cédula *</Label>
                  <Input placeholder="V-12.345.678" value={data.cedula} onChange={(e) => setData({ ...data, cedula: e.target.value })} />
                </div>

                {/* Teléfono */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Teléfono *</Label>
                  <Input placeholder="+58 412-..." value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                </div>

                {/* Número de habitantes */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Personas que habitan la vivienda</Label>
                  <Input type="number" min="1" max="20" placeholder="Ej: 4" value={data.numHabitantes} onChange={(e) => setData({ ...data, numHabitantes: e.target.value })} />
                </div>

                <Button className="w-full gap-2" onClick={verifyDetails}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {/* Resumen */}
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs space-y-1 border border-emerald-200 dark:border-emerald-900">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">Tu vivienda:</p>
                  <p>Código: <span className="font-mono">{data.inviteCode}</span></p>
                  <p>Puerta: <span className="font-medium">{data.residenceLabel}</span></p>
                  <p>Cédula: <span className="font-medium">{data.cedula}</span></p>
                  <p>Teléfono: <span className="font-medium">{data.phone}</span></p>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Nombre completo *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pedro Pérez" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="pedro@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Contraseña *</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" minLength={6} />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep("details")}><ArrowLeft className="h-4 w-4" /> Atrás</Button>
                  <Button type="submit" className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
                    <CheckCircle2 className="h-4 w-4" /> Finalizar proceso
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {step === "details" && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            ¿No tienes un código? Pídelo al administrador de tu condominio.
          </p>
        )}
      </div>
    </div>
  );
}

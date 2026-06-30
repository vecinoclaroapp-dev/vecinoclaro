"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRegister } from "@/hooks/use-auth";
import { Home, KeyRound, DoorOpen, User, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Phone, IdCard, Users, Palette } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  onAuthed: () => void;
  onBack: () => void;
};

const DOOR_COLORS = [
  { name: "Blanco", value: "#f8f8f8" },
  { name: "Madera", value: "#8b4513" },
  { name: "Negro", value: "#1a1a1a" },
  { name: "Rojo", value: "#dc2626" },
  { name: "Azul", value: "#2563eb" },
  { name: "Verde", value: "#16a34a" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Naranja", value: "#ea580c" },
  { name: "Morado", value: "#9333ea" },
  { name: "Rosado", value: "#ec4899" },
];

export function UserOnboarding({ onAuthed, onBack }: Props) {
  const register = useRegister();
  const router = useRouter();
  const [step, setStep] = useState<"details" | "account" | "loading">("details");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    inviteCode: "", residenceLabel: "", doorName: "", doorColor: "#8b4513",
    cedula: "", phone: "", numHabitantes: "",
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

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 bg-emerald-400/20 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <div className="relative mx-auto">
            <div className="absolute inset-0 bg-emerald-400/30 blur-2xl rounded-full" />
            <Loader2 className="h-14 w-14 animate-spin text-emerald-400 mx-auto relative z-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Creando tu cuenta...</h2>
            <p className="text-emerald-200/60 text-sm mt-2">Vinculando con tu condominio</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-amber-50/30 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10 p-4">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6 group">
          <div className="h-7 w-7 rounded-full border flex items-center justify-center group-hover:bg-muted transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          Volver
        </button>

        <Card className="border-emerald-100 dark:border-emerald-900/30 shadow-xl">
          <CardContent className="pt-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-3 shadow-lg shadow-emerald-400/20">
                <Home className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold">Soy Usuario</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "details" ? "Configura tu vivienda" : "Crea tu cuenta"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === "details" ? (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-4">
                  {/* Código */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs"><KeyRound className="h-3.5 w-3.5" /> Código de invitación *</Label>
                    <Input placeholder="VEC-7K3M" value={data.inviteCode} onChange={(e) => setData({ ...data, inviteCode: e.target.value.toUpperCase() })} className="font-mono text-center uppercase h-11 text-lg tracking-wider" />
                  </div>

                  {/* Puerta */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs"><DoorOpen className="h-3.5 w-3.5" /> Puerta *</Label>
                      <Input placeholder="3-A" value={data.residenceLabel} onChange={(e) => setData({ ...data, residenceLabel: e.target.value })} className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nombre (opcional)</Label>
                      <Input placeholder="Casa de Pedro" value={data.doorName} onChange={(e) => setData({ ...data, doorName: e.target.value })} className="h-11" />
                    </div>
                  </div>

                  {/* Color */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs"><Palette className="h-3.5 w-3.5" /> Color de tu puerta</Label>
                    <div className="flex flex-wrap gap-2">
                      {DOOR_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setData({ ...data, doorColor: c.value })}
                          className={cn("h-9 w-9 rounded-xl border-2 transition-all", data.doorColor === c.value ? "border-emerald-500 scale-110 ring-2 ring-emerald-200 dark:ring-emerald-900" : "border-border hover:scale-105")}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cédula + Teléfono */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs"><IdCard className="h-3.5 w-3.5" /> Cédula *</Label>
                      <Input placeholder="V-12.345.678" value={data.cedula} onChange={(e) => setData({ ...data, cedula: e.target.value })} className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs"><Phone className="h-3.5 w-3.5" /> Teléfono *</Label>
                      <Input placeholder="+58 412-..." value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className="h-11" />
                    </div>
                  </div>

                  {/* Habitantes */}
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> ¿Cuántas personas habitan la vivienda?</Label>
                    <Input type="number" min="1" max="20" placeholder="Ej: 4" value={data.numHabitantes} onChange={(e) => setData({ ...data, numHabitantes: e.target.value })} className="h-11" />
                  </div>

                  <Button className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20" onClick={verifyDetails}>
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    ¿No tienes un código? Pídelo al administrador de tu condominio.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <form onSubmit={submit} className="space-y-4">
                    {/* Resumen */}
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50/50 dark:from-emerald-950/20 dark:to-amber-950/10 border border-emerald-200 dark:border-emerald-900/40 p-4 space-y-1.5 text-xs">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1"><Home className="h-3.5 w-3.5" /> Tu vivienda</p>
                      <div className="flex justify-between"><span className="text-muted-foreground">Código:</span><span className="font-mono font-medium">{data.inviteCode}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Puerta:</span><span className="font-medium">{data.residenceLabel}</span></div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Color:</span>
                        <div className="flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded border border-border" style={{ backgroundColor: data.doorColor }} />
                          <span className="font-medium">{DOOR_COLORS.find(c => c.value === data.doorColor)?.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Cédula:</span><span className="font-medium">{data.cedula}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Teléfono:</span><span className="font-medium">{data.phone}</span></div>
                      {data.numHabitantes && <div className="flex justify-between"><span className="text-muted-foreground">Habitantes:</span><span className="font-medium">{data.numHabitantes}</span></div>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs"><User className="h-3.5 w-3.5" /> Nombre completo *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Pedro Pérez" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" /> Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="pedro@email.com" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs"><Lock className="h-3.5 w-3.5" /> Contraseña *</Label>
                      <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" minLength={6} className="h-11" />
                      <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="gap-1.5" onClick={() => setStep("details")}>
                        <ArrowLeft className="h-4 w-4" /> Atrás
                      </Button>
                      <Button type="submit" className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                        <CheckCircle2 className="h-4 w-4" /> Finalizar proceso
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

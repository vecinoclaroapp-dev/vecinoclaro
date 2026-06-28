"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRegister } from "@/hooks/use-auth";
import { Home, ArrowLeft, ArrowRight, KeyRound, DoorOpen, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  onAuthed: () => void;
  onBack: () => void;
};

export function ResidentJoinScreen({ onAuthed, onBack }: Props) {
  const register = useRegister();
  const router = useRouter();
  const [step, setStep] = useState<"invite" | "account">("invite");
  const [invite, setInvite] = useState("");
  const [residenceLabel, setResidenceLabel] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const verifyInvite = () => {
    if (!invite.trim()) {
      toast.error("Ingresa un código de invitación");
      return;
    }
    if (!residenceLabel.trim()) {
      toast.error("Indica tu vivienda (ej: 1-A)");
      return;
    }
    setStep("account");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Ingresa tu nombre completo");
      return;
    }
    try {
      await register.mutateAsync(form);
      // After register, link to condominium via invite code
      const linkRes = await fetch("/api/residents/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: invite, residenceLabel }),
      });
      if (!linkRes.ok) {
        const j = await linkRes.json();
        toast.error(j.error || "No se pudo vincular al condominio");
        return;
      }
      toast.success("¡Cuenta creada y vinculada!");
      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      router.refresh();
      onAuthed();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:from-amber-950/20 dark:via-background dark:to-emerald-950/30 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al selector de rol
        </button>

        <Card>
          <CardHeader className="text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mb-2">
              <Home className="h-7 w-7 text-amber-700 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl">Únete a tu condominio</CardTitle>
            <CardDescription>
              {step === "invite"
                ? "Ingresa el código que te dio tu administrador"
                : "Crea tu cuenta de residente"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "invite" ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" /> Código de invitación
                  </Label>
                  <Input
                    id="code"
                    placeholder="EJ: CONDO-ABC123"
                    value={invite}
                    onChange={(e) => setInvite(e.target.value.toUpperCase())}
                    className="font-mono text-center uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="res" className="flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5" /> Tu vivienda
                  </Label>
                  <Input
                    id="res"
                    placeholder="Ej: 1-A, Local 2, Casa 5"
                    value={residenceLabel}
                    onChange={(e) => setResidenceLabel(e.target.value)}
                  />
                </div>
                <Button className="w-full gap-1.5" onClick={verifyInvite}>
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Nombre completo
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Pedro Pérez"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="pedro@email.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pass" className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Contraseña
                  </Label>
                  <Input
                    id="pass"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  <p className="font-medium">Resumen:</p>
                  <p>Código: <span className="font-mono">{invite}</span></p>
                  <p>Vivienda: <span className="font-medium">{residenceLabel}</span></p>
                </div>
                <Button
                  type="submit"
                  className="w-full gap-1.5"
                  disabled={register.isPending}
                >
                  {register.isPending ? "Creando cuenta..." : "Crear cuenta y unirme"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          ¿No tienes un código? Pídelo al administrador de tu condominio.
        </p>
      </div>
    </div>
  );
}

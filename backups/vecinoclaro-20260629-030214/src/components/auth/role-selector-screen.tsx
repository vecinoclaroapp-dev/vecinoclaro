"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Home, ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSelectAdmin: () => void;
  onSelectResident: () => void;
  onBack: () => void;
};

export function RoleSelectorScreen({ onSelectAdmin, onSelectResident, onBack }: Props) {
  const [hovered, setHovered] = useState<"admin" | "resident" | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/30 dark:via-background dark:to-amber-950/20 p-4">
      <div className="w-full max-w-3xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="text-center mb-8">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-emerald-600 flex items-center justify-center mb-4">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">¿Cómo quieres usar VecinoClaro?</h1>
          <p className="text-muted-foreground mt-2">
            Elige tu rol para configurar tu cuenta
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Admin */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              hovered === "admin" && "ring-2 ring-emerald-500"
            )}
            onMouseEnter={() => setHovered("admin")}
            onMouseLeave={() => setHovered(null)}
            onClick={onSelectAdmin}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold">Soy Administrador</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Gestiona un condominio: viviendas, pagos, gastos, facturas, votaciones y más.
                Onboarding guiado de 4 pasos.
              </p>
              <Button className="w-full gap-1.5 mt-auto">
                Comenzar como admin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Resident */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              hovered === "resident" && "ring-2 ring-amber-500"
            )}
            onMouseEnter={() => setHovered("resident")}
            onMouseLeave={() => setHovered(null)}
            onClick={onSelectResident}
          >
            <CardContent className="p-6 flex flex-col items-center text-center h-full">
              <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mb-4">
                <Home className="h-8 w-8 text-amber-700 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold">Soy Residente</h2>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Accede a tu panel de residente: pagos, facturas, avisos, votaciones y solicitudes.
                Necesitas un código de invitación de tu administrador.
              </p>
              <Button variant="outline" className="w-full gap-1.5 mt-auto border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/30">
                Tengo código de invitación
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Podrás cambiar de rol más adelante desde tu perfil
        </p>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Building2, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onSelectAdmin: () => void;
  onSelectUser: () => void;
  onBack: () => void;
};

export function RoleSelectorScreen({ onSelectAdmin, onSelectUser, onBack }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 relative overflow-hidden">
      {/* Decoraciones */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo + volver */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-emerald-200 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/logo-vecinoclaro.png" alt="VecinoClaro" className="h-9 w-9 object-contain" />
            <span className="font-bold text-sm text-white">VecinoClaro</span>
          </div>
        </div>

        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            ¿Tú quién eres?
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base">
            Selecciona tu rol para personalizar tu experiencia
          </p>
        </div>

        {/* Cards de selección */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Admin / Condominio */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ y: -4 }}
            onClick={onSelectAdmin}
            className="group relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 hover:border-amber-400/50 p-6 sm:p-8 text-left transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 h-32 w-32 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-colors" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="h-7 w-7 text-emerald-950" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Soy Condominio</h3>
              <p className="text-sm text-emerald-100/70 leading-relaxed mb-4">
                Gestiono un condominio. Quiero registrar pagos, ver morosos, generar facturas y administrar viviendas.
              </p>
              <div className="flex items-center gap-1.5 text-amber-300 text-sm font-semibold">
                Configurar condominio
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Usuario / Residente */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -4 }}
            onClick={onSelectUser}
            className="group relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 hover:border-emerald-400/50 p-6 sm:p-8 text-left transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 h-32 w-32 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-colors" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Soy Usuario</h3>
              <p className="text-sm text-emerald-100/70 leading-relaxed mb-4">
                Vivo en un condominio que ya usa VecinoClaro. Quiero ver mis facturas, hacer pagos y subir comprobantes.
              </p>
              <div className="flex items-center gap-1.5 text-emerald-300 text-sm font-semibold">
                Unirme a mi condominio
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Info adicional */}
        <p className="text-center text-xs text-emerald-200/50 mt-8">
          Podrás cambiar tu rol más tarde si lo necesitas.
          Si eres administrador, se te guiará por un asistente de configuración.
        </p>
      </div>
    </div>
  );
}

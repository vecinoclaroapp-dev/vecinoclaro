"use client";

import { motion } from "framer-motion";
import { Building2, User, ArrowLeft, ArrowRight } from "lucide-react";

type Props = {
  onSelectAdmin: () => void;
  onSelectUser: () => void;
  onBack: () => void;
};

export function RoleSelectorScreen({ onSelectAdmin, onSelectUser, onBack }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Volver + logo */}
        <div className="flex items-center justify-between mb-10">
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
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight"
          >
            ¿Tú quién eres?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-emerald-100/70 text-base"
          >
            Selecciona tu rol para continuar con el registro
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Condominio */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectAdmin}
            className="group relative rounded-3xl bg-white/5 backdrop-blur-md border-2 border-white/10 hover:border-amber-400/60 p-8 text-left transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 h-40 w-40 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-colors" />
            <div className="relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-amber-400/20">
                <Building2 className="h-8 w-8 text-emerald-950" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Soy Condominio</h3>
              <p className="text-sm text-emerald-100/60 leading-relaxed mb-5">
                Gestiono un condominio o residencia. Quiero administrar pagos, viviendas, facturas y toda la gestión del edificio.
              </p>
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                Configurar mi condominio
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Usuario */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectUser}
            className="group relative rounded-3xl bg-white/5 backdrop-blur-md border-2 border-white/10 hover:border-emerald-400/60 p-8 text-left transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 h-40 w-40 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-colors" />
            <div className="relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-400/20">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Soy Usuario</h3>
              <p className="text-sm text-emerald-100/60 leading-relaxed mb-5">
                Vivo en un condominio que ya usa VecinoClaro. Quiero ver mis facturas, hacer pagos y subir comprobantes.
              </p>
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                Unirme a mi condominio
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

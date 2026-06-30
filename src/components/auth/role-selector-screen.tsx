"use client";

import { motion } from "framer-motion";
import { Building2, User, ArrowLeft, ArrowRight, Check } from "lucide-react";

type Props = {
  onSelectAdmin: () => void;
  onSelectUser: () => void;
  onBack: () => void;
};

export function RoleSelectorScreen({ onSelectAdmin, onSelectUser, onBack }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 relative overflow-hidden">
      {/* Decoraciones */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-emerald-200 hover:text-white transition-colors group">
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            Volver
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5"
          >
            <img src="/logo-vecinoclaro.png" alt="VecinoClaro" className="h-10 w-10 object-contain" />
            <span className="font-bold text-base text-white tracking-tight">VecinoClaro</span>
          </motion.div>
        </div>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Cuenta creada
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            ¿Tú quién eres?
          </h1>
          <p className="text-emerald-100/60 text-base sm:text-lg max-w-md mx-auto">
            Selecciona tu rol para continuar con el proceso correspondiente
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {/* Condominio */}
          <motion.button
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectAdmin}
            className="group relative rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-amber-400/50 p-8 text-left transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 h-48 w-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-amber-400/30">
                <Building2 className="h-8 w-8 text-emerald-950" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Soy Condominio</h3>
              <p className="text-sm text-emerald-100/50 leading-relaxed mb-6">
                Gestiono un condominio o residencia. Quiero administrar pagos, viviendas, facturas y toda la gestión del edificio.
              </p>
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                <span>Configurar mi condominio</span>
                <div className="h-6 w-6 rounded-full bg-amber-400/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </motion.button>

          {/* Usuario */}
          <motion.button
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSelectUser}
            className="group relative rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-emerald-400/50 p-8 text-left transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 h-48 w-48 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-emerald-400/30">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Soy Usuario</h3>
              <p className="text-sm text-emerald-100/50 leading-relaxed mb-6">
                Vivo en un condominio que ya usa VecinoClaro. Quiero ver mis facturas, hacer pagos y subir comprobantes.
              </p>
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                <span>Unirme a mi condominio</span>
                <div className="h-6 w-6 rounded-full bg-emerald-400/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-emerald-200/40 mt-10"
        >
          Cada rol tiene un proceso de configuración distinto. Podrás cambiarlo más tarde si lo necesitas.
        </motion.p>
      </div>
    </div>
  );
}

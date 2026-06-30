"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
        setRegistration(reg);
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
        setInterval(() => { reg.update().catch(() => {}); }, 60 * 60 * 1000);
      } catch (err) {
        console.debug("SW registration failed:", err);
      }
    };
    register();
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) { registration.waiting.postMessage("SKIP_WAITING"); }
    window.location.reload();
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="rounded-2xl bg-emerald-950 text-white shadow-2xl border border-emerald-700 p-4 flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
          <RefreshCw className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">Nueva versión disponible</p>
          <p className="text-xs text-emerald-200 mt-0.5">Hay una versión más reciente de VecinoClaro. Actualiza para tener las últimas mejoras.</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={applyUpdate} className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold h-8 gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Actualizar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setUpdateAvailable(false)} className="text-emerald-200 hover:bg-white/10 h-8">Ahora no</Button>
          </div>
        </div>
        <button onClick={() => setUpdateAvailable(false)} className="text-emerald-300 hover:text-white shrink-0" aria-label="Cerrar">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "vecinoclaro-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000;

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);
    };
    checkStandalone();
    if (isStandalone) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) return;
    }

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIos) {
      const timer = setTimeout(() => setShowIosInstructions(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowBanner(false);
    setShowIosInstructions(false);
  };

  if (isStandalone) return null;

  if (showBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white shadow-2xl border border-emerald-700 p-4">
          <div className="flex items-start gap-3 mb-3">
            <img src="/icon-192.png" alt="VecinoClaro" className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Instala VecinoClaro</p>
              <p className="text-xs text-emerald-200 mt-0.5">Acceso rápido desde tu pantalla de inicio. Funciona sin conexión.</p>
            </div>
            <button onClick={dismiss} className="text-emerald-300 hover:text-white shrink-0" aria-label="Cerrar"><X className="h-4 w-4" /></button>
          </div>
          <Button size="sm" onClick={handleInstall} className="w-full bg-gradient-to-r from-amber-400 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-emerald-950 font-bold h-9 gap-1.5">
            <Download className="h-4 w-4" /> Instalar ahora
          </Button>
        </div>
      </div>
    );
  }

  if (showIosInstructions) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white shadow-2xl border border-emerald-700 p-4">
          <div className="flex items-start gap-3 mb-3">
            <img src="/icon-192.png" alt="VecinoClaro" className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Instala VecinoClaro</p>
              <p className="text-xs text-emerald-200 mt-0.5">Sigue estos pasos en Safari:</p>
            </div>
            <button onClick={dismiss} className="text-emerald-300 hover:text-white shrink-0" aria-label="Cerrar"><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[10px] shrink-0">1</div>
              <span>Toca el botón <Share className="inline h-3 w-3 text-amber-300" /> Compartir</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[10px] shrink-0">2</div>
              <span>Selecciona "Agregar a inicio" <Plus className="inline h-3 w-3 text-amber-300" /></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-100">
              <div className="h-6 w-6 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[10px] shrink-0">3</div>
              <span>Toca "Agregar" para confirmar</span>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={dismiss} className="w-full text-emerald-200 hover:bg-white/10 h-8">Entendido</Button>
        </div>
      </div>
    );
  }
  return null;
}

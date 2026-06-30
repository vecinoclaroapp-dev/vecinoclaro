"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

const DISMISS_KEY = "vecinoclaro-push-dismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000;

export function PushPermissionPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === "undefined") return "default";
    if (!("Notification" in window)) return "denied";
    return Notification.permission;
  });
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (!isStandalone) return;
    if (permission !== "default") return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) return;
    }
    const timer = setTimeout(() => setShowPrompt(true), 5000);
    return () => clearTimeout(timer);
  }, [permission]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        toast.success("Notificaciones activadas", { description: "Recibirás avisos de pagos, votaciones y novedades." });
        new Notification("VecinoClaro", { body: "¡Notificaciones activadas! Te avisaremos de novedades.", icon: "/icon-192.png", badge: "/icon-192.png", tag: "vecinoclaro-welcome" });
      }
    } catch {
      toast.error("Error al solicitar permiso de notificaciones");
    }
    setShowPrompt(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  if (permission !== "default" || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
      <div className="rounded-2xl bg-white dark:bg-emerald-950 shadow-2xl border border-border dark:border-emerald-700 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground">Activa las notificaciones</p>
            <p className="text-xs text-muted-foreground mt-0.5">Recibe avisos de pagos aprobados, votaciones nuevas y avisos urgentes de tu condominio.</p>
          </div>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground shrink-0" aria-label="Cerrar"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={requestPermission} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Activar
          </Button>
          <Button size="sm" variant="outline" onClick={dismiss} className="h-8">Ahora no</Button>
        </div>
      </div>
    </div>
  );
}

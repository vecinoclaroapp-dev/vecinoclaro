"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

// Estado vacío consistente para todas las vistas
// Resuelve el patrón recurrente: "Estados vacíos pobres"
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 flex items-center justify-center mb-4 ring-1 ring-emerald-100 dark:ring-emerald-900/40">
        <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-semibold text-base mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4 gap-1.5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Cabecera de página con jerarquía clara
// Resuelve el patrón recurrente: "Jerarquía visual débil"
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5 leading-tight">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

// Sección dentro de una página
export function SectionHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="h-4 w-4 text-emerald-600 shrink-0" />}
        <div className="min-w-0">
          <h3 className="font-semibold text-base leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

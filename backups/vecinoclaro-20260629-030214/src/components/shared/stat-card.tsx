"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatColor = "emerald" | "amber" | "rose" | "sky" | "violet";

const colorMap: Record<StatColor, { bg: string; text: string; ring: string }> = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-100 dark:ring-emerald-900/50" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-100 dark:ring-amber-900/50" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-100 dark:ring-rose-900/50" },
  sky: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-400", ring: "ring-sky-100 dark:ring-sky-900/50" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-400", ring: "ring-violet-100 dark:ring-violet-900/50" },
};

export function StatCard({
  label,
  value,
  secondary,
  icon: Icon,
  color = "emerald",
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  secondary?: React.ReactNode;
  icon: LucideIcon;
  color?: StatColor;
  loading?: boolean;
  className?: string;
}) {
  const c = colorMap[color];
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center ring-1", c.bg, c.text, c.ring)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24 mb-1" />
        ) : (
          <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
        )}
        {secondary && <div className="text-xs text-muted-foreground mt-1">{secondary}</div>}
      </CardContent>
    </Card>
  );
}

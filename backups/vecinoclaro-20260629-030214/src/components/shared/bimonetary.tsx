"use client";

import { formatUSD, formatVES } from "@/lib/money";
import { cn } from "@/lib/utils";

// Display bimonetario: muestra USD (primario) y VES (secundario)
export function BimonetaryAmount({
  usd,
  ves,
  rate,
  className,
  size = "md",
  emphasize = "usd",
}: {
  usd: number;
  ves?: number;
  rate?: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  emphasize?: "usd" | "ves";
}) {
  const sizeMap = {
    sm: { primary: "text-sm", secondary: "text-xs" },
    md: { primary: "text-base", secondary: "text-xs" },
    lg: { primary: "text-2xl", secondary: "text-sm" },
    xl: { primary: "text-3xl md:text-4xl", secondary: "text-sm md:text-base" },
  };
  const s = sizeMap[size];

  if (emphasize === "ves") {
    return (
      <div className={cn("flex flex-col leading-tight", className)}>
        <span className={cn("font-bold tabular-nums text-ves", s.primary)}>{formatVES(ves ?? 0)}</span>
        {usd !== undefined && (
          <span className={cn("text-muted-foreground tabular-nums", s.secondary)}>
            ≈ {formatUSD(usd)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col leading-tight", className)}>
      <span className={cn("font-bold tabular-nums text-usd", s.primary)}>{formatUSD(usd)}</span>
      {ves !== undefined && (
        <span className={cn("text-muted-foreground tabular-nums", s.secondary)}>
          ≈ {formatVES(ves)}
          {rate ? ` · ${rate.toFixed(2)} Bs/USD` : ""}
        </span>
      )}
    </div>
  );
}

// Pill dual: USD | VES en línea
export function BimonetaryPill({
  usd,
  ves,
  className,
}: {
  usd: number;
  ves: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-semibold tabular-nums text-usd">{formatUSD(usd)}</span>
      <span className="text-muted-foreground">·</span>
      <span className="font-medium tabular-nums text-ves text-sm">{formatVES(ves)}</span>
    </div>
  );
}

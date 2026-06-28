"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { BookOpen, Search, LogIn, LogOut, DoorOpen, User, Car } from "lucide-react";
import { cn } from "@/lib/utils";

type AccessEntry = {
  id: string;
  timestamp: string;
  direction: "IN" | "OUT";
  subjectName?: string;
  subjectType?: "VISITOR" | "RESIDENT" | "STAFF" | "VEHICLE";
  documentId?: string;
  plate?: string;
  destinationLabel?: string;
  guardName?: string;
  notes?: string;
};

export function AccessLogView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  const { data, isLoading } = useQuery<AccessEntry[]>({
    queryKey: ["access-log"],
    queryFn: async () => {
      const r = await fetch("/api/access-log");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const entries = data ?? [];
  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      (e.subjectName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.plate ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (e.destinationLabel ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || e.direction === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora de Acceso"
        subtitle="Historial de entradas y salidas"
        icon={BookOpen}
        actions={
          <Button variant="outline" className="gap-1.5" onClick={() => window.print()}>
            Exportar
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, placa o destino..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="IN">Entradas</SelectItem>
                <SelectItem value="OUT">Salidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={search || filter !== "ALL" ? "Sin resultados" : "Bitácora vacía"}
              description={
                search || filter !== "ALL"
                  ? "Prueba con otra búsqueda."
                  : "Las entradas y salidas registradas por los guardias aparecerán aquí."
              }
            />
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <div className="divide-y">
                {filtered.map((e) => {
                  const isIn = e.direction === "IN";
                  const Icon = isIn ? LogIn : LogOut;
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-4 hover:bg-muted/40">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                          isIn
                            ? "bg-emerald-100 dark:bg-emerald-950/50"
                            : "bg-amber-100 dark:bg-amber-950/50"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isIn ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">
                            {e.subjectName ?? e.plate ?? "Desconocido"}
                          </p>
                          <Badge variant="outline" className="capitalize">
                            {e.subjectType === "VEHICLE" ? (
                              <Car className="h-3 w-3 mr-1" />
                            ) : (
                              <User className="h-3 w-3 mr-1" />
                            )}
                            {(e.subjectType ?? "visitor").toLowerCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-muted-foreground">
                          {e.plate && <span className="font-mono">{e.plate}</span>}
                          {e.destinationLabel && (
                            <span className="flex items-center gap-1">
                              <DoorOpen className="h-3 w-3" /> {e.destinationLabel}
                            </span>
                          )}
                          {e.guardName && <span>· Guardia: {e.guardName}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium tabular-nums">
                          {new Date(e.timestamp).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(e.timestamp).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

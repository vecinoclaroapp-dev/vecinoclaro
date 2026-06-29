"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Users, Search, Phone, Mail, Home, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

type DirectoryEntry = {
  id: string;
  name: string;
  role?: "ADMIN" | "RESIDENT" | "STAFF";
  residenceLabel?: string;
  phone?: string;
  email?: string;
  position?: string;
  hasOwnership?: boolean;
};

const roleConfig = {
  ADMIN: { label: "Administrador", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  RESIDENT: { label: "Residente", cls: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300" },
  STAFF: { label: "Personal", cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
} as const;

export function DirectoryView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "RESIDENT" | "STAFF">("ALL");

  const { data, isLoading } = useQuery<DirectoryEntry[]>({
    queryKey: ["directory"],
    queryFn: async () => {
      const r = await fetch("/api/directory");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const entries = data ?? [];
  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.residenceLabel ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || e.role === filter;
    return matchSearch && matchFilter;
  });

  const initials = (name: string) =>
    name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const counts = {
    ALL: entries.length,
    ADMIN: entries.filter((e) => e.role === "ADMIN").length,
    RESIDENT: entries.filter((e) => e.role === "RESIDENT").length,
    STAFF: entries.filter((e) => e.role === "STAFF").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio"
        subtitle="Residentes, personal y administradores"
        icon={Users}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {([
          ["ALL", "Todos", counts.ALL],
          ["ADMIN", "Admins", counts.ADMIN],
          ["RESIDENT", "Residentes", counts.RESIDENT],
          ["STAFF", "Personal", counts.STAFF],
        ] as const).map(([key, label, count]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            className="justify-between"
            onClick={() => setFilter(key)}
          >
            <span className="flex items-center gap-1.5">
              {key === "ADMIN" && <Shield className="h-3.5 w-3.5" />}
              {key === "RESIDENT" && <User className="h-3.5 w-3.5" />}
              {key === "STAFF" && <Users className="h-3.5 w-3.5" />}
              {label}
            </span>
            <Badge variant={filter === key ? "secondary" : "outline"} className="h-5">
              {count}
            </Badge>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o vivienda..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={search || filter !== "ALL" ? "Sin resultados" : "Directorio vacío"}
              description={
                search || filter !== "ALL"
                  ? "Prueba con otra búsqueda o filtro."
                  : "Cuando registres residentes y personal, aparecerán aquí."
              }
            />
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="divide-y">
                {filtered.map((e) => {
                  const role = e.role ?? "RESIDENT";
                  const cfg = roleConfig[role];
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-4 hover:bg-muted/40 transition">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className={cn("text-xs font-medium", cfg.cls)}>
                          {initials(e.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{e.name}</p>
                          <Badge className={cn(cfg.cls)}>{cfg.label}</Badge>
                          {e.hasOwnership && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                              Propietario
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {e.residenceLabel && (
                            <span className="flex items-center gap-1">
                              <Home className="h-3 w-3" /> {e.residenceLabel}
                            </span>
                          )}
                          {e.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {e.phone}
                            </span>
                          )}
                          {e.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {e.email}
                            </span>
                          )}
                          {e.position && <span>· {e.position}</span>}
                        </div>
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

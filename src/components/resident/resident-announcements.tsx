"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Megaphone, Pin, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  createdAt: string;
  type?: "INFO" | "WARNING" | "URGENT";
};

const typeStyles = {
  INFO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  WARNING: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  URGENT: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
} as const;

export function ResidentAnnouncements() {
  const { data, isLoading } = useQuery<Announcement[]>({
    queryKey: ["announcements", "resident"],
    queryFn: async () => {
      const r = await fetch("/api/announcements");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const items = (data ?? []).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avisos del Condominio"
        subtitle="Comunicados importantes"
        icon={Megaphone}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-2/3" /></CardHeader>
              <CardContent><Skeleton className="h-16 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Megaphone}
              title="No hay avisos"
              description="Los avisos del administrador aparecerán aquí."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const type = a.type ?? "INFO";
            return (
              <Card
                key={a.id}
                className={a.pinned ? "border-amber-300 dark:border-amber-800" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {a.pinned && <Pin className="h-4 w-4 text-amber-600" />}
                      {a.title}
                    </CardTitle>
                    <Badge className={cn("capitalize", typeStyles[type])}>
                      {type === "URGENT" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {type.toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{a.body}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(a.createdAt).toLocaleDateString("es-VE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

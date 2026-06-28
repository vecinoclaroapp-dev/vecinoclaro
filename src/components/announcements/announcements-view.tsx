"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Megaphone, AlertTriangle, Pin, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned?: boolean;
  createdAt: string;
  type?: "INFO" | "WARNING" | "URGENT";
};

type Moroso = {
  id: string;
  label: string;
  outstanding: number;
  months: number;
};

export function AnnouncementsView() {
  const announcements = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const r = await fetch("/api/announcements");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const morosos = useQuery<Moroso[]>({
    queryKey: ["morosos"],
    queryFn: async () => {
      const r = await fetch("/api/morosos");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const items = announcements.data ?? [];
  const morososList = morosos.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avisos y Morosos"
        subtitle="Comunicados del condominio y estado de cuentas"
        icon={Megaphone}
      />

      <Tabs defaultValue="avisos">
        <TabsList>
          <TabsTrigger value="avisos" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" /> Avisos
          </TabsTrigger>
          <TabsTrigger value="morosos" className="gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5" /> Morosos
            {morososList.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5">
                {morososList.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avisos" className="space-y-3 mt-4">
          {announcements.isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={Megaphone}
                  title="No hay avisos publicados"
                  description="Los avisos importantes del condominio aparecerán aquí."
                />
              </CardContent>
            </Card>
          ) : (
            items
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map((a) => <AnnouncementCard key={a.id} item={a} />)
          )}
        </TabsContent>

        <TabsContent value="morosos" className="mt-4">
          {morosos.isLoading ? (
            <Card>
              <CardContent className="space-y-2 p-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </CardContent>
            </Card>
          ) : morososList.length === 0 ? (
            <Card>
              <CardContent className="p-0">
                <EmptyState
                  icon={ShieldAlert}
                  title="No hay residentes morosos"
                  description="Todas las viviendas están al día con sus pagos."
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Viviendas con saldos pendientes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {morososList.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{m.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.months} {m.months === 1 ? "mes" : "meses"} de atraso
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                        )}
                      >
                        USD {m.outstanding.toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const typeStyles = {
    INFO: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    WARNING: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    URGENT: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
  } as const;
  const type = item.type ?? "INFO";
  return (
    <Card className={item.pinned ? "border-amber-300 dark:border-amber-800" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {item.pinned && <Pin className="h-4 w-4 text-amber-600" />}
            {item.title}
          </CardTitle>
          <Badge className={cn("capitalize", typeStyles[type])}>{type.toLowerCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
          {item.body}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(item.createdAt).toLocaleDateString("es-VE")}
        </div>
      </CardContent>
    </Card>
  );
}

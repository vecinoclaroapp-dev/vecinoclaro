"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Calendar as CalIcon, Plus, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: string;
  type?: "EVENT" | "MAINTENANCE" | "MEETING" | "PAYMENT";
  location?: string;
};

const typeColor: Record<string, string> = {
  EVENT: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  MAINTENANCE: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  MEETING: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  PAYMENT: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
};

export function CalendarView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const [form, setForm] = useState({ title: "", description: "", date: "", type: "EVENT", location: "" });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const { data, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar", year, month],
    queryFn: async () => {
      const r = await fetch(`/api/calendar?year=${year}&month=${month + 1}`);
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Evento creado");
      setOpen(false);
      setForm({ title: "", description: "", date: "", type: "EVENT", location: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const events = data ?? [];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventsByDay = new Map<number, CalendarEvent[]>();
  events.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const arr = eventsByDay.get(day) ?? [];
      arr.push(e);
      eventsByDay.set(day, arr);
    }
  });

  const monthLabel = cursor.toLocaleDateString("es-VE", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        subtitle="Eventos, reuniones y mantenimientos"
        icon={CalIcon}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nuevo evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo evento</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Título</Label>
                  <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Fecha</Label>
                  <Input id="d" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="l">Lugar</Label>
                  <Input id="l" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Descripción</Label>
                  <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.title.trim() || !form.date} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Guardando..." : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={CalIcon}
              title="No hay eventos este mes"
              description="Crea reuniones, mantenimientos o eventos del condominio."
              actionLabel="Nuevo evento"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base capitalize">{monthLabel}</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCursor(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5">
              {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
                <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
              {[...Array(firstDay)].map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dayEvents = eventsByDay.get(day) ?? [];
                return (
                  <div
                    key={day}
                    className="min-h-20 rounded-md border p-1.5 text-xs hover:bg-muted/50 transition"
                  >
                    <div className="font-medium text-muted-foreground mb-1">{day}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={cn(
                            "rounded px-1 py-0.5 truncate",
                            typeColor[ev.type ?? "EVENT"]
                          )}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-muted-foreground text-[10px]">+{dayEvents.length - 2} más</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" /> Próximos eventos
              </h4>
              {events.slice(0, 5).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={cn(typeColor[ev.type ?? "EVENT"])}>
                      {new Date(ev.date).toLocaleDateString("es-VE", { day: "2-digit", month: "short" })}
                    </Badge>
                    <span className="truncate">{ev.title}</span>
                  </div>
                  {ev.location && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <MapPin className="h-3 w-3" /> {ev.location}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

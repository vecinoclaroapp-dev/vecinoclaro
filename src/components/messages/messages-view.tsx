"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { MessageSquare, Send, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  author: string;
  recipient?: string;
  body: string;
  createdAt: string;
  unread?: boolean;
};

export function MessagesView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ recipient: "", body: "" });

  const { data, isLoading } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      const r = await fetch("/api/messages");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const send = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Mensaje enviado");
      setOpen(false);
      setForm({ recipient: "", body: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const messages = data ?? [];
  const filtered = messages.filter(
    (m) =>
      !search ||
      m.author.toLowerCase().includes(search.toLowerCase()) ||
      m.body.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) =>
    name
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mensajes"
        subtitle="Bandeja de comunicación del condominio"
        icon={MessageSquare}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Nuevo mensaje
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo mensaje</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="r">Para</Label>
                  <Input id="r" placeholder="Vivienda o destinatario" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b">Mensaje</Label>
                  <Textarea id="b" rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={send.isPending || !form.body.trim()} onClick={() => send.mutate(form)}>
                  {send.isPending ? "Enviando..." : "Enviar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mensajes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={search ? "Sin resultados" : "Sin mensajes"}
              description={search ? "Prueba con otra búsqueda." : "Inicia una conversación con un residente."}
            />
          ) : (
            <ScrollArea className="h-[60vh]">
              <div className="divide-y">
                {filtered.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-muted/40 transition",
                      m.unread && "bg-emerald-50/40 dark:bg-emerald-950/10"
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-medium dark:bg-emerald-950/50 dark:text-emerald-300">
                        {initials(m.author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm truncate">{m.author}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(m.createdAt).toLocaleDateString("es-VE")}
                        </span>
                      </div>
                      {m.recipient && (
                        <p className="text-xs text-muted-foreground">Para: {m.recipient}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.body}</p>
                    </div>
                    {m.unread && (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

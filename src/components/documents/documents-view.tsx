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
import { FileText, Plus, Download, Eye, File, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DocItem = {
  id: string;
  name: string;
  description?: string;
  type?: string;
  size?: number;
  url?: string;
  category?: string;
  createdAt: string;
};

const categoryColor: Record<string, string> = {
  ACTA: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  FINANCIERO: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  LEGAL: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
  GENERAL: "bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
};

export function DocumentsView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "GENERAL", url: "" });

  const { data, isLoading } = useQuery<DocItem[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const r = await fetch("/api/documents");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Documento subido");
      setOpen(false);
      setForm({ name: "", description: "", category: "GENERAL", url: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const docs = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Actas, estados financieros y legales"
        icon={FileText}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Subir documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="n">Nombre</Label>
                  <Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c">Categoría</Label>
                  <Input id="c" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="ACTA, FINANCIERO, LEGAL, GENERAL" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="u">URL del archivo</Label>
                  <Input id="u" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Descripción</Label>
                  <Input id="d" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.name.trim()} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Subiendo..." : "Subir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={FileText}
              title="No hay documentos"
              description="Sube actas, estados financieros y documentos legales del condominio."
              actionLabel="Subir documento"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => {
            const cat = doc.category?.toUpperCase() ?? "GENERAL";
            return (
              <Card key={doc.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                    <File className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <Badge className={cn(categoryColor[cat] ?? categoryColor.GENERAL)}>{cat}</Badge>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(doc.createdAt).toLocaleDateString("es-VE")}
                      {doc.size && <span>· {(doc.size / 1024).toFixed(0)} KB</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" title="Ver">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Descargar" asChild>
                      <a href={doc.url ?? "#"} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
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

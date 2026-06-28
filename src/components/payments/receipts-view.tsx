"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Receipt, Plus, Upload, Eye, Clock, CheckCircle2, XCircle, FileImage } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatUSD, formatDate } from "@/lib/money";

type Receipt = {
  id: string;
  fileName: string;
  url?: string;
  amount?: number;
  currency?: string;
  residenceLabel?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
  notes?: string;
};

const statusConfig = {
  PENDING: { label: "Pendiente", Icon: Clock, cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  VERIFIED: { label: "Verificado", Icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
  REJECTED: { label: "Rechazado", Icon: XCircle, cls: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300" },
} as const;

export function ReceiptsView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fileName: "", amount: "", notes: "" });

  const { data, isLoading } = useQuery<Receipt[]>({
    queryKey: ["receipts"],
    queryFn: async () => {
      const r = await fetch("/api/receipts");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const upload = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: body.fileName,
          amount: body.amount ? Number(body.amount) : null,
          notes: body.notes,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Comprobante subido");
      setOpen(false);
      setForm({ fileName: "", amount: "", notes: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const receipts = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comprobantes"
        subtitle="Comprobantes de pago subidos por residentes"
        icon={Receipt}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Subir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir comprobante</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Archivo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-emerald-400 transition cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click o arrastra un archivo</p>
                  </div>
                  <Input
                    placeholder="O pega la URL del archivo"
                    value={form.fileName}
                    onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a">Monto (USD)</Label>
                  <Input id="a" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="n">Notas</Label>
                  <Input id="n" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={upload.isPending || !form.fileName.trim()} onClick={() => upload.mutate(form)}>
                  {upload.isPending ? "Subiendo..." : "Subir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : receipts.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No hay comprobantes"
              description="Los residentes pueden subir comprobantes de pago desde su panel."
              actionLabel="Subir"
              onAction={() => setOpen(true)}
            />
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <div className="divide-y">
                {receipts.map((rc) => {
                  const cfg = statusConfig[rc.status] ?? statusConfig.PENDING;
                  const Icon = cfg.Icon;
                  return (
                    <div key={rc.id} className="p-4 flex items-center gap-3 hover:bg-muted/40">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                        <FileImage className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{rc.fileName}</p>
                          <Badge className={cn("gap-1", cfg.cls)}>
                            <Icon className="h-3 w-3" /> {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {rc.residenceLabel && <span>{rc.residenceLabel}</span>}
                          {rc.amount != null && <span>Monto: {formatUSD(rc.amount)}</span>}
                          <span>{formatDate(rc.uploadedAt)}</span>
                          {rc.notes && <span className="truncate max-w-xs">· {rc.notes}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" title="Ver" asChild>
                        <a href={rc.url ?? "#"} target="_blank" rel="noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
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

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { ShoppingBag, Plus, Tag, MapPin, Phone, User, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatUSD } from "@/lib/money";

type Listing = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: "USD" | "VES";
  category?: string;
  condition?: "NEW" | "USED";
  sellerName?: string;
  sellerPhone?: string;
  location?: string;
  imageUrl?: string;
  createdAt: string;
};

const CATEGORIES = ["Muebles", "Electrodomésticos", "Vehículos", "Inmobiliaria", "Servicios", "Otros"];

export function MarketplaceView() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Otros",
    sellerName: "",
    sellerPhone: "",
  });

  const { data, isLoading } = useQuery<Listing[]>({
    queryKey: ["marketplace"],
    queryFn: async () => {
      const r = await fetch("/api/marketplace");
      if (!r.ok) throw new Error("Error");
      return r.json();
    },
  });

  const create = useMutation({
    mutationFn: async (body: typeof form) => {
      const r = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          price: Number(body.price) || 0,
          currency: "USD",
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace"] });
      toast.success("Publicación creada");
      setOpen(false);
      setForm({ title: "", description: "", price: "", category: "Otros", sellerName: "", sellerPhone: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace"
        subtitle="Compraventa entre residentes"
        icon={ShoppingBag}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" /> Publicar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva publicación</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Título</Label>
                  <Input id="t" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="p">Precio (USD)</Label>
                    <Input id="p" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Categoría</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="sn">Tu nombre</Label>
                    <Input id="sn" value={form.sellerName} onChange={(e) => setForm({ ...form, sellerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sp">Teléfono</Label>
                    <Input id="sp" value={form.sellerPhone} onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Descripción</Label>
                  <Textarea id="d" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={create.isPending || !form.title.trim()} onClick={() => create.mutate(form)}>
                  {create.isPending ? "Publicando..." : "Publicar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-32 w-full rounded-b-none" />
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={ShoppingBag}
              title="No hay publicaciones"
              description="Publica muebles, electrodomésticos, vehículos o servicios para otros residentes."
              actionLabel="Publicar"
              onAction={() => setOpen(true)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <Card key={it.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 flex items-center justify-center">
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="h-10 w-10 text-emerald-400" />
                )}
              </div>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-tight">{it.title}</CardTitle>
                  <Badge className={cn("gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300")}>
                    <DollarSign className="h-3 w-3" />
                    {formatUSD(it.price)}
                  </Badge>
                </div>
                {it.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{it.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1">
                  {it.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {it.category}
                    </span>
                  )}
                  {it.sellerName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {it.sellerName}
                    </span>
                  )}
                  {it.sellerPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {it.sellerPhone}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  useExpenses,
  useCreateExpense,
  useSuppliers,
  useCreateSupplier,
  useFunds,
  useBcvRate,
} from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatUSD, formatVES, formatDate, formatNumber, formatInt, usdToVes, round2, sum } from "@/lib/money";
import { Plus, Receipt, Building, TrendingDown, FileText, Trash2, Pencil, Banknote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = [
  { value: "ELECTRICIDAD", label: "Electricidad" },
  { value: "AGUA", label: "Agua" },
  { value: "SEGURIDAD", label: "Seguridad" },
  { value: "LIMPIEZA", label: "Limpieza" },
  { value: "MANTENIMIENTO", label: "Mantenimiento" },
  { value: "NOMINA", label: "Nómina" },
  { value: "IMPUESTOS", label: "Impuestos" },
  { value: "OTRO", label: "Otro" },
];

const PAYMENT_METHODS_EXPENSE = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "PAGO_MOVIL", label: "Pago Móvil" },
  { value: "CHEQUE", label: "Cheque" },
];

type ExpenseForm = {
  concept: string;
  description: string;
  category: string;
  amountUSD: string;
  supplierId: string;
  fundId: string;
  date: string;
  paymentMethod: string;
  reference: string;
};

type SupplierForm = {
  name: string;
  rif: string;
  contactName: string;
  phone: string;
  email: string;
  category: string;
};

const today = new Date().toISOString().split("T")[0];

export function ExpensesView() {
  const { data, isLoading } = useExpenses({ limit: 200 });
  const { data: suppliersData } = useSuppliers();
  const { data: fundsData } = useFunds();
  const { data: bcv } = useBcvRate();
  const create = useCreateExpense();
  const createSupplier = useCreateSupplier();

  const [open, setOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [form, setForm] = useState<ExpenseForm>({
    concept: "",
    description: "",
    category: "MANTENIMIENTO",
    amountUSD: "",
    supplierId: "",
    fundId: "",
    date: today,
    paymentMethod: "TRANSFERENCIA",
    reference: "",
  });
  const [supplierForm, setSupplierForm] = useState<SupplierForm>({
    name: "",
    rif: "",
    contactName: "",
    phone: "",
    email: "",
    category: "OTRO",
  });

  const rate = bcv?.rate ?? 0;
  const expenses = data?.expenses ?? [];
  const suppliers = suppliersData?.suppliers ?? [];
  const funds = fundsData?.funds ?? [];

  const totalExpenses = sum(expenses.map((e) => e.amountUSD));
  const totalExpensesVES = sum(expenses.map((e) => e.amountVES));

  const submit = async () => {
    if (!form.concept.trim()) { toast.error("Ingresa el concepto"); return; }
    if (!form.amountUSD || parseFloat(form.amountUSD) <= 0) { toast.error("Monto inválido"); return; }
    try {
      await create.mutateAsync({
        concept: form.concept,
        description: form.description || undefined,
        category: form.category,
        amountUSD: parseFloat(form.amountUSD),
        supplierId: form.supplierId || null,
        fundId: form.fundId || null,
        date: form.date,
        paymentMethod: form.paymentMethod,
        reference: form.reference || undefined,
      });
      toast.success("Gasto registrado");
      setOpen(false);
      setForm({ concept: "", description: "", category: "MANTENIMIENTO", amountUSD: "", supplierId: "", fundId: "", date: today, paymentMethod: "TRANSFERENCIA", reference: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const submitSupplier = async () => {
    if (!supplierForm.name.trim()) { toast.error("Nombre obligatorio"); return; }
    try {
      await createSupplier.mutateAsync(supplierForm);
      toast.success("Proveedor creado");
      setSupplierOpen(false);
      setSupplierForm({ name: "", rif: "", contactName: "", phone: "", email: "", category: "OTRO" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Total egresos</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatUSD(totalExpenses)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(totalExpensesVES)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Gastos registrados</span>
            </div>
            <p className="text-xl font-bold tabular-nums mt-1">{formatInt(expenses.length)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Building className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Proveedores</span>
            </div>
            <p className="text-xl font-bold tabular-nums mt-1">{formatInt(suppliers.length)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSupplierOpen(true)}>
              <Plus className="h-4 w-4" /> Proveedor
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Registrar gasto
            </Button>
          </div>
        </div>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" />
                {formatInt(expenses.length)} gastos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : expenses.length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium">No hay gastos registrados</p>
                  <p className="text-xs text-muted-foreground mt-1">Registra el primer egreso del condominio.</p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto scroll-fine">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card border-y z-10">
                      <tr className="text-left text-xs text-muted-foreground">
                        <th className="font-medium py-3 px-4">Fecha</th>
                        <th className="font-medium py-3 px-4">Concepto</th>
                        <th className="font-medium py-3 px-4 hidden md:table-cell">Categoría</th>
                        <th className="font-medium py-3 px-4 hidden lg:table-cell">Proveedor</th>
                        <th className="font-medium py-3 px-4 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{formatDate(e.date)}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{e.concept}</div>
                            {e.reference && <div className="text-[10px] text-muted-foreground font-mono">ref: {e.reference}</div>}
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">{e.category}</Badge>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell text-xs">{e.supplierName ?? "—"}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-bold tabular-nums text-rose-600 dark:text-rose-400">−{formatUSD(e.amountUSD)}</div>
                            <div className="text-xs text-muted-foreground tabular-nums">{formatVES(e.amountVES)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-amber-600" />
                Proveedores
              </CardTitle>
              <CardDescription>Directorio de proveedores del condominio</CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="py-12 text-center">
                  <Building className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium">No hay proveedores</p>
                  <p className="text-xs text-muted-foreground mt-1">Agrega proveedores para asociarlos a gastos.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {suppliers.map((s) => (
                    <div key={s.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{s.name}</h4>
                        {s.category && <Badge variant="outline" className="text-[10px]">{s.category}</Badge>}
                      </div>
                      {s.rif && <p className="text-xs text-muted-foreground font-mono">{s.rif}</p>}
                      {s.contactName && <p className="text-xs mt-1">{s.contactName}</p>}
                      {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                      {s.email && <p className="text-xs text-muted-foreground truncate">{s.email}</p>}
                      {s.bankName && s.bankAccount && (
                        <div className="mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                          <Banknote className="h-3 w-3 inline mr-1" />
                          {s.bankName} · {s.bankAccount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog nuevo gasto */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scroll-fine">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" /> Registrar gasto
            </DialogTitle>
            <DialogDescription>
              Tasa BCV: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatNumber(rate)} Bs/USD</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="concept">Concepto *</Label>
              <Input id="concept" placeholder="Pago de electricidad" value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" rows={2} placeholder="Detalle del gasto..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cat">Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Monto USD *</Label>
                <Input id="amount" type="number" step="0.01" placeholder="0.00" value={form.amountUSD} onChange={(e) => setForm({ ...form, amountUSD: e.target.value })} />
                {rate > 0 && form.amountUSD && (
                  <p className="text-xs text-muted-foreground tabular-nums">≈ {formatVES(round2(usdToVes(parseFloat(form.amountUSD) || 0, rate)))}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Proveedor</Label>
                <Select value={form.supplierId} onValueChange={(v) => setForm({ ...form, supplierId: v === "none" ? "" : v })}>
                  <SelectTrigger id="supplier"><SelectValue placeholder="Sin proveedor" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin proveedor</SelectItem>
                    {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fund">Fondo</Label>
                <Select value={form.fundId} onValueChange={(v) => setForm({ ...form, fundId: v === "none" ? "" : v })}>
                  <SelectTrigger id="fund"><SelectValue placeholder="Sin fondo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin fondo específico</SelectItem>
                    {funds.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pm">Método de pago</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                  <SelectTrigger id="pm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS_EXPENSE.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">Referencia</Label>
              <Input id="ref" placeholder="N° de transferencia, cheque..." value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={create.isPending}>Registrar gasto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog nuevo proveedor */}
      <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-amber-600" /> Nuevo proveedor
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sname">Nombre / Razón social *</Label>
              <Input id="sname" placeholder="Corpoelec" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="srif">RIF</Label>
                <Input id="srif" placeholder="J-XXXXXXXX-X" value={supplierForm.rif} onChange={(e) => setSupplierForm({ ...supplierForm, rif: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="scat">Categoría</Label>
                <Select value={supplierForm.category} onValueChange={(v) => setSupplierForm({ ...supplierForm, category: v })}>
                  <SelectTrigger id="scat"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scontact">Persona de contacto</Label>
              <Input id="scontact" value={supplierForm.contactName} onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="sphone">Teléfono</Label>
                <Input id="sphone" placeholder="+58 212-..." value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="semail">Correo</Label>
                <Input id="semail" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierOpen(false)}>Cancelar</Button>
            <Button onClick={submitSupplier} disabled={createSupplier.isPending}>Crear proveedor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

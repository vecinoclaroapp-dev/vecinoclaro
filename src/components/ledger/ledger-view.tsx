"use client";

import { useState } from "react";
import { useLedger } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENTRY_CATEGORIES, type EntryCategory } from "@/lib/constants";
import { formatUSD, formatVES, formatDateTime, formatDate, formatInt, truncateHash } from "@/lib/money";
import { useAppStore } from "@/store/app-store";
import { BookOpen, Search, ArrowDownCircle, ArrowUpCircle, Link2, Shield, Hash, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

export function LedgerView() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const { data, isLoading } = useLedger({ limit: 200 });

  const entries = data?.entries ?? [];
  const filtered = entries.filter((e) => {
    const matchSearch =
      e.residenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.concept.toLowerCase().includes(search.toLowerCase()) ||
      e.reference?.toLowerCase().includes(search.toLowerCase()) ||
      e.hash.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || e.type === filterType;
    const matchCat = filterCategory === "ALL" || e.category === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  // Totales filtrados
  const credits = filtered.filter((e) => e.type === "CREDIT");
  const debits = filtered.filter((e) => e.type === "DEBIT");
  const totalCreditUSD = credits.reduce((s, e) => s + e.amountUSD, 0);
  const totalDebitUSD = debits.reduce((s, e) => s + e.amountUSD, 0);

  return (
    <div className="space-y-5">
      {/* Banner de inmutabilidad */}
      <Card className="border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
        <CardContent className="py-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Libro contable inmutable · Hash chain SHA-256</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Cada asiento se encadena criptográficamente al anterior. Los saldos se calculan sumando los asientos; ningún registro monetario puede modificarse ni eliminarse. Esto garantiza auditoría completa y trazabilidad forensic.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right shrink-0">
            <span className="text-xs text-muted-foreground">Total asientos</span>
            <span className="font-bold tabular-nums">{formatInt(entries.length)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Resumen contable */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Créditos (abonos)</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatUSD(totalCreditUSD)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(credits.reduce((s, e) => s + e.amountVES, 0))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Débitos (cargos)</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{formatUSD(totalDebitUSD)}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVES(debits.reduce((s, e) => s + e.amountVES, 0))}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Balance neto</span>
            </div>
            <p className={cn("text-xl font-bold tabular-nums", totalDebitUSD - totalCreditUSD > 0 ? "text-amber-600" : "text-emerald-600")}>
              {formatUSD(totalDebitUSD - totalCreditUSD)}
            </p>
            <p className="text-xs text-muted-foreground">Por cobrar (vista filtrada)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por vivienda, concepto, referencia o hash..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los tipos</SelectItem>
            <SelectItem value="CREDIT">Créditos (abonos)</SelectItem>
            <SelectItem value="DEBIT">Débitos (cargos)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {Object.entries(ENTRY_CATEGORIES).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla del libro */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            Asientos contables · {formatInt(filtered.length)} registros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto scroll-fine">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card border-y z-10">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="font-medium py-3 px-4">Fecha</th>
                    <th className="font-medium py-3 px-4">Tipo</th>
                    <th className="font-medium py-3 px-4">Vivienda</th>
                    <th className="font-medium py-3 px-4 hidden md:table-cell">Concepto</th>
                    <th className="font-medium py-3 px-4 text-right">Monto</th>
                    <th className="font-medium py-3 px-4 hidden lg:table-cell">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No hay asientos que coincidan</td></tr>
                  ) : (
                    filtered.map((e) => {
                      const isCredit = e.type === "CREDIT";
                      const cat = ENTRY_CATEGORIES[e.category as EntryCategory];
                      return (
                        <tr key={e.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{formatDate(e.date)}</td>
                          <td className="py-3 px-4">
                            <div className={cn("flex items-center gap-1.5", isCredit ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                              {isCredit ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                              <span className="text-xs font-semibold">{isCredit ? "Crédito" : "Débito"}</span>
                            </div>
                            {cat && <Badge variant="outline" className="text-[9px] h-4 mt-0.5 px-1">{cat.label}</Badge>}
                          </td>
                          <td className="py-3 px-4 font-semibold">{e.residenceNumber}</td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="text-sm">{e.concept}</div>
                            {e.reference && <div className="text-[10px] text-muted-foreground font-mono">ref: {e.reference}</div>}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className={cn("font-bold tabular-nums", isCredit ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                              {isCredit ? "+" : "−"}{formatUSD(e.amountUSD)}
                            </div>
                            <div className="text-xs text-muted-foreground tabular-nums">{formatVES(e.amountVES)}</div>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                              <Fingerprint className="h-3 w-3" />
                              <span className="tabular-nums">{truncateHash(e.hash, 16)}</span>
                            </div>
                            {e.prevHash && (
                              <div className="text-[9px] font-mono text-muted-foreground/60 tabular-nums pl-4">
                                ← {truncateHash(e.prevHash, 12)}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, EmptyState } from "@/components/shared/layout";
import { Vote, Clock, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PollOption = {
  id: string;
  text: string;
  votes: number;
  weight: number;
};

type Poll = {
  id: string;
  title: string;
  description?: string;
  status: "OPEN" | "CLOSED";
  endDate?: string;
  options: PollOption[];
  totalVotes: number;
  totalWeight: number;
  hasVoted?: boolean;
};

export function ResidentPolls() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Poll | null>(null);

  const { data, isLoading } = useQuery<Poll[]>({
    queryKey: ["polls", "resident"],
    queryFn: async () => {
      const r = await fetch("/api/polls");
      if (!r.ok) return [];
      return r.json();
    },
  });

  const vote = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const r = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error al votar");
      return j;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls"] });
      toast.success("Voto registrado");
      setSelected(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const polls = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Votaciones"
        subtitle="Tu voto vale 1 (peso indiviso por vivienda)"
        icon={Vote}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={Vote}
              title="No hay votaciones activas"
              description="Cuando el administrador abra una votación, podrás participar aquí."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {polls.map((poll) => {
            const isOpen = poll.status === "OPEN";
            const canVote = isOpen && !poll.hasVoted;
            return (
              <Card key={poll.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{poll.title}</CardTitle>
                    <Badge
                      className={cn(
                        isOpen
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-400"
                      )}
                    >
                      {isOpen ? <Clock className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {isOpen ? "Abierta" : "Cerrada"}
                    </Badge>
                  </div>
                  {poll.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{poll.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {poll.options.map((opt) => {
                    const pct = poll.totalWeight > 0 ? (opt.weight / poll.totalWeight) * 100 : 0;
                    return (
                      <div key={opt.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium">{opt.text}</span>
                          <span className="text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {poll.totalVotes} votos · {poll.totalWeight} peso
                    </div>
                    {canVote ? (
                      <Button size="sm" onClick={() => setSelected(poll)} className="gap-1">
                        <Vote className="h-3.5 w-3.5" /> Votar
                      </Button>
                    ) : poll.hasVoted ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Ya votaste
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              Selecciona una opción. Tu voto no se puede cambiar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selected?.options.map((opt) => (
              <Button
                key={opt.id}
                variant="outline"
                className="w-full justify-start text-left"
                disabled={vote.isPending}
                onClick={() =>
                  selected && vote.mutate({ pollId: selected.id, optionId: opt.id })
                }
              >
                {opt.text}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

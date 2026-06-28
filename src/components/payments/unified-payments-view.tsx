"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/layout";
import { CreditCard, Receipt, Landmark } from "lucide-react";
import { PaymentsView } from "@/components/payments/payments-view";
import { ReceiptsView } from "@/components/payments/receipts-view";
import { PaymentReferencesView } from "@/components/admin/payment-references-view";

export function UnifiedPaymentsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos"
        subtitle="Registro, comprobantes y cuentas bancarias"
        icon={CreditCard}
      />

      <Tabs defaultValue="pagos">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="pagos" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" /> Pagos
          </TabsTrigger>
          <TabsTrigger value="comprobantes" className="gap-1.5">
            <Receipt className="h-3.5 w-3.5" /> Comprobantes
          </TabsTrigger>
          <TabsTrigger value="cuentas" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" /> Cuentas de pago
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pagos" className="mt-4">
          <PaymentsView />
        </TabsContent>
        <TabsContent value="comprobantes" className="mt-4">
          <ReceiptsView />
        </TabsContent>
        <TabsContent value="cuentas" className="mt-4">
          <PaymentReferencesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

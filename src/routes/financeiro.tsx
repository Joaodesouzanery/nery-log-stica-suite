import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { FinancialAgroCrud } from "@/components/financial-agro-crud";
import { useDemoMode } from "@/hooks/use-demo-mode";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro Agro - Nery Logistica" },
      {
        name: "description",
        content: "Gestao financeira agro completa com dados reais e modo demo separado.",
      },
    ],
  }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  const { demoMode } = useDemoMode();

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro Agro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {demoMode
              ? "Modo DEMO ligado: dados demonstrativos isolados dos cadastros reais."
              : "Modo DEMO desligado: exibindo somente dados reais do Supabase."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Periodo aplicado: Janeiro 2026.")}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Calendar className="w-4 h-4" />
            Janeiro 2026
          </button>
          <button
            onClick={() => toast.info("Use a exportacao por modulo apos carregar os dados reais.")}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <FinancialAgroCrud />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { useDemoMode } from "@/hooks/use-demo-mode";
import {
  PeriodPicker,
  defaultPeriod,
  type PeriodValue,
} from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { FinancialAgroCrud } from "@/components/financial-agro-crud";
import {
  CashflowModule,
  DefaultsModule,
  UnitCostsModule,
  StockModule,
  BreakEvenModule,
  PurchasingModule,
  RuralCreditModule,
  PricingModule,
  HectareModule,
  HarvestBudgetModule,
  FieldRoiModule,
  LeaseModule,
  ContractsModule,
} from "@/components/financial-modules";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Nery Logística" },
      {
        name: "description",
        content: "Gestão financeira completa com dashboards, CRUD e exportação por área.",
      },
    ],
  }),
  component: FinanceiroPage,
});

type TabDef = {
  id: string;
  label: string;
  render: () => React.ReactNode;
};

const tabs: TabDef[] = [
  { id: "visao-geral", label: "Visão Geral", render: () => <FinancialAgroCrud /> },
  { id: "fluxo", label: "Fluxo de Caixa", render: () => <CashflowModule /> },
  { id: "custos", label: "Custos por Unidade", render: () => <UnitCostsModule /> },
  { id: "inadimplencia", label: "Inadimplência", render: () => <DefaultsModule /> },
  { id: "estoque", label: "Estoque", render: () => <StockModule /> },
  { id: "equilibrio", label: "Ponto de Equilíbrio", render: () => <BreakEvenModule /> },
  { id: "compras", label: "Compras", render: () => <PurchasingModule /> },
  { id: "credito", label: "Crédito Rural", render: () => <RuralCreditModule /> },
  { id: "precos", label: "Tabela de Preços", render: () => <PricingModule /> },
  { id: "hectare", label: "Custo por Hectare", render: () => <HectareModule /> },
  { id: "safra", label: "Orçamento de Safra", render: () => <HarvestBudgetModule /> },
  { id: "roi", label: "Rentabilidade", render: () => <FieldRoiModule /> },
  { id: "arrendamento", label: "Arrendamento", render: () => <LeaseModule /> },
  { id: "contratos", label: "Contratos", render: () => <ContractsModule /> },
];

function FinanceiroPage() {
  const { demoMode } = useDemoMode();
  const [tab, setTab] = useState<string>("visao-geral");
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriod());

  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  const handleExport = () => {
    toast.success(`Exportação preparada para "${active.label}" (${period.label}).`);
  };

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro Agro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {demoMode
              ? "Modo DEMO ligado: dados demonstrativos isolados dos cadastros reais."
              : "Modo DEMO desligado: exibindo somente dados reais cadastrados."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodPicker value={period} onChange={setPeriod} />
          <button
            onClick={handleExport}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Exportar {active.label}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border -mb-px">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {t.id === "visao-geral" && <LayoutDashboard className="w-3.5 h-3.5" />}
              {t.label}
            </button>
          );
        })}
      </div>

      <div>{active.render()}</div>
    </div>
  );
}

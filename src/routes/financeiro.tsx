import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Banknote,
  AlertTriangle,
  Calculator,
  Boxes,
  Scale,
  ShoppingCart,
  Landmark,
  Tags,
  MapPin,
  ClipboardList,
  Sprout,
  FileText,
  FileSignature,
  Download,
  Calendar,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — Nery Logística" },
      { name: "description", content: "Gestão financeira completa: fluxo de caixa, custos, safra e contratos." },
    ],
  }),
  component: FinanceiroPage,
});

const modules = [
  { id: "fluxo", label: "Fluxo de Caixa & Custos", icon: Banknote, Comp: CashflowModule },
  { id: "inadimplencia", label: "Inadimplência", icon: AlertTriangle, Comp: DefaultsModule },
  { id: "custos", label: "Custos por Unidade", icon: Calculator, Comp: UnitCostsModule },
  { id: "estoque", label: "Estoque Acabados", icon: Boxes, Comp: StockModule },
  { id: "equilibrio", label: "Ponto de Equilíbrio", icon: Scale, Comp: BreakEvenModule },
  { id: "compras", label: "Gestão de Compras", icon: ShoppingCart, Comp: PurchasingModule },
  { id: "credito", label: "Crédito Rural", icon: Landmark, Comp: RuralCreditModule },
  { id: "precos", label: "Tabela de Preços", icon: Tags, Comp: PricingModule },
  { id: "hectare", label: "Custo por Hectare", icon: MapPin, Comp: HectareModule },
  { id: "safra", label: "Orçamento de Safra", icon: ClipboardList, Comp: HarvestBudgetModule },
  { id: "roi", label: "Rentabilidade Field-by-Field", icon: Sprout, Comp: FieldRoiModule },
  { id: "arrendamento", label: "Arrendamento", icon: FileText, Comp: LeaseModule },
  { id: "contratos", label: "Contratos", icon: FileSignature, Comp: ContractsModule },
];

function FinanceiroPage() {
  const [active, setActive] = useState(modules[0].id);
  const ActiveComp = modules.find((m) => m.id === active)!.Comp;

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo de volta. Controle total da operação financeira da Nery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted">
            <Calendar className="w-4 h-4" />
            Janeiro 2026
          </button>
          <button className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sub-sidebar */}
        <nav className="col-span-12 lg:col-span-3 xl:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-2 sticky top-20">
            <ul className="space-y-0.5">
              {modules.map((m) => {
                const active2 = active === m.id;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setActive(m.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-colors",
                        active2
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <m.icon className={cn("w-4 h-4 shrink-0", active2 && "text-primary")} />
                      <span className="leading-tight">{m.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Content */}
        <div className="col-span-12 lg:col-span-9 xl:col-span-10 min-w-0">
          <ActiveComp />
        </div>
      </div>
    </div>
  );
}

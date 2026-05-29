import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Banknote,
  Boxes,
  Calculator,
  ClipboardList,
  Edit3,
  FileSignature,
  FileText,
  Landmark,
  MapPin,
  Plus,
  Scale,
  ShoppingCart,
  Sprout,
  Tags,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createFinancialRecord,
  deleteFinancialRecord,
  FinancialRecord,
  isSupabaseConfigured,
  listFinancialRecords,
  updateFinancialRecord,
} from "@/lib/supabase-financial";
import { useDemoMode } from "@/hooks/use-demo-mode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
};

type ModuleConfig = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
};

type RecordsByModule = Record<string, FinancialRecord[]>;

const financialModules: ModuleConfig[] = [
  {
    id: "fluxo",
    label: "Fluxo de Caixa Simples",
    shortLabel: "Fluxo",
    description: "Registro de entradas e saidas adaptado ao produtor.",
    icon: Banknote,
    fields: [
      { key: "descricao", label: "Descricao" },
      { key: "tipo", label: "Tipo" },
      { key: "categoria", label: "Categoria" },
      { key: "valor", label: "Valor", type: "number" },
      { key: "data", label: "Data", type: "date" },
    ],
  },
  {
    id: "custos",
    label: "Custos por Unidade",
    shortLabel: "Custos",
    description: "Calculo automatico do custo de producao por duzia, saca ou kg.",
    icon: Calculator,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "unidade", label: "Unidade" },
      { key: "custo_total", label: "Custo total", type: "number" },
      { key: "quantidade", label: "Quantidade", type: "number" },
      { key: "preco_venda", label: "Preco venda", type: "number" },
    ],
  },
  {
    id: "inadimplencia",
    label: "Controle de Inadimplencia",
    shortLabel: "Inadimplencia",
    description: "Alertas de pagamentos pendentes de clientes.",
    icon: AlertTriangle,
    fields: [
      { key: "cliente", label: "Cliente" },
      { key: "valor", label: "Valor", type: "number" },
      { key: "vencimento", label: "Vencimento", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "estoque",
    label: "Gestao de Estoque de Produtos Acabados",
    shortLabel: "Estoque",
    description: "Produtos prontos para venda imediata, reservas e validade.",
    icon: Boxes,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "saldo", label: "Saldo", type: "number" },
      { key: "reservado", label: "Reservado", type: "number" },
      { key: "validade", label: "Validade", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "equilibrio",
    label: "Calculo de Ponto de Equilibrio",
    shortLabel: "Equilibrio",
    description: "Quanto vender para cobrir os custos.",
    icon: Scale,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "preco_venda", label: "Preco venda", type: "number" },
      { key: "custo_variavel", label: "Custo variavel", type: "number" },
      { key: "custo_fixo", label: "Custo fixo", type: "number" },
    ],
  },
  {
    id: "compras",
    label: "Gestao de Compras",
    shortLabel: "Compras",
    description: "Lista baseada na necessidade de insumos.",
    icon: ShoppingCart,
    fields: [
      { key: "insumo", label: "Insumo" },
      { key: "estoque_atual", label: "Estoque atual", type: "number" },
      { key: "estoque_minimo", label: "Estoque minimo", type: "number" },
      { key: "consumo_semanal", label: "Consumo semanal", type: "number" },
      { key: "fornecedor", label: "Fornecedor" },
    ],
  },
  {
    id: "credito",
    label: "Controle de Credito Rural",
    shortLabel: "Credito",
    description: "Acompanhamento de parcelas de financiamentos.",
    icon: Landmark,
    fields: [
      { key: "contrato", label: "Contrato" },
      { key: "banco", label: "Banco" },
      { key: "saldo_devedor", label: "Saldo devedor", type: "number" },
      { key: "parcela", label: "Parcela", type: "number" },
      { key: "vencimento", label: "Vencimento", type: "date" },
    ],
  },
  {
    id: "precos",
    label: "Tabela de Precos Dinamica",
    shortLabel: "Precos",
    description: "Precos para atacado, varejo e assinaturas.",
    icon: Tags,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "varejo", label: "Varejo", type: "number" },
      { key: "atacado", label: "Atacado", type: "number" },
      { key: "assinatura", label: "Assinatura", type: "number" },
      { key: "promocao", label: "Promocao" },
    ],
  },
  {
    id: "hectare",
    label: "Custo por Hectare",
    shortLabel: "Hectare",
    description: "Real x planejado por talhao e por safra.",
    icon: MapPin,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "safra", label: "Safra" },
      { key: "real", label: "Real", type: "number" },
      { key: "planejado", label: "Planejado", type: "number" },
    ],
  },
  {
    id: "safra",
    label: "Orcamento de Safra",
    shortLabel: "Safra",
    description: "Insumos, mao de obra, maquinario e curva de desembolso.",
    icon: ClipboardList,
    fields: [
      { key: "etapa", label: "Etapa" },
      { key: "categoria", label: "Categoria" },
      { key: "valor", label: "Valor", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "roi",
    label: "Rentabilidade Field-by-Field",
    shortLabel: "ROI",
    description: "ROI por talhao, hibrido e variedade.",
    icon: Sprout,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "hibrido", label: "Hibrido" },
      { key: "receita", label: "Receita", type: "number" },
      { key: "custo", label: "Custo", type: "number" },
    ],
  },
  {
    id: "arrendamento",
    label: "Controle de Arrendamento",
    shortLabel: "Arrendamento",
    description: "Custo por area, vencimentos e historico de reajustes.",
    icon: FileText,
    fields: [
      { key: "contrato", label: "Contrato" },
      { key: "area", label: "Area ha", type: "number" },
      { key: "valor_ha", label: "R$/ha", type: "number" },
      { key: "vencimento", label: "Vencimento", type: "date" },
    ],
  },
  {
    id: "contratos",
    label: "Gestao de Contratos",
    shortLabel: "Contratos",
    description: "Compra de insumos, venda de graos e fixacoes.",
    icon: FileSignature,
    fields: [
      { key: "contrato", label: "Contrato" },
      { key: "tipo", label: "Tipo" },
      { key: "quantidade", label: "Quantidade", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
];

const demoRecords: RecordsByModule = {
  fluxo: [
    record("fluxo", "1", {
      descricao: "Venda de ovos caipira",
      tipo: "entrada",
      categoria: "Vendas",
      valor: "18400",
      data: "2026-05-22",
    }),
    record("fluxo", "2", {
      descricao: "Racao poedeiras",
      tipo: "saida",
      categoria: "Insumos",
      valor: "5200",
      data: "2026-05-21",
    }),
    record("fluxo", "3", {
      descricao: "Assinaturas de cestas",
      tipo: "entrada",
      categoria: "CSA",
      valor: "9700",
      data: "2026-05-19",
    }),
  ],
  custos: [
    record("custos", "1", {
      produto: "Ovos caipira",
      unidade: "duzia",
      custo_total: "4820",
      quantidade: "1000",
      preco_venda: "9.90",
    }),
    record("custos", "2", {
      produto: "Mel",
      unidade: "kg",
      custo_total: "3100",
      quantidade: "220",
      preco_venda: "32",
    }),
  ],
  inadimplencia: [
    record("inadimplencia", "1", {
      cliente: "Mercado Central",
      valor: "3200",
      vencimento: "2026-05-20",
      status: "pendente",
    }),
    record("inadimplencia", "2", {
      cliente: "Restaurante Aurora",
      valor: "5800",
      vencimento: "2026-06-02",
      status: "a vencer",
    }),
  ],
  estoque: [
    record("estoque", "1", {
      produto: "Ovos caipira",
      saldo: "1240",
      reservado: "320",
      validade: "2026-06-08",
      status: "pronto",
    }),
    record("estoque", "2", {
      produto: "Mel silvestre",
      saldo: "180",
      reservado: "45",
      validade: "2027-01-10",
      status: "pronto",
    }),
  ],
  equilibrio: [
    record("equilibrio", "1", {
      produto: "Ovos caipira",
      preco_venda: "9.90",
      custo_variavel: "4.82",
      custo_fixo: "1200",
    }),
  ],
  compras: [
    record("compras", "1", {
      insumo: "Racao inicial",
      estoque_atual: "420",
      estoque_minimo: "800",
      consumo_semanal: "210",
      fornecedor: "Agro Sul",
    }),
    record("compras", "2", {
      insumo: "Caixas kraft",
      estoque_atual: "180",
      estoque_minimo: "300",
      consumo_semanal: "90",
      fornecedor: "Embalagens Norte",
    }),
  ],
  credito: [
    record("credito", "1", {
      contrato: "Custeio 2026",
      banco: "Banco do Brasil",
      saldo_devedor: "320000",
      parcela: "28400",
      vencimento: "2026-06-15",
    }),
  ],
  precos: [
    record("precos", "1", {
      produto: "Ovos caipira",
      varejo: "9.90",
      atacado: "8.40",
      assinatura: "7.80",
      promocao: "Combo semanal",
    }),
  ],
  hectare: [
    record("hectare", "1", {
      talhao: "Talhao A",
      safra: "2025/26",
      real: "3420",
      planejado: "3200",
    }),
  ],
  safra: [
    record("safra", "1", {
      etapa: "Plantio",
      categoria: "Insumos",
      valor: "48000",
      status: "aprovado",
    }),
  ],
  roi: [
    record("roi", "1", {
      talhao: "Talhao B",
      hibrido: "Pioneer P3380",
      receita: "412000",
      custo: "280000",
    }),
  ],
  arrendamento: [
    record("arrendamento", "1", {
      contrato: "Fazenda Vale Verde",
      area: "120",
      valor_ha: "1850",
      vencimento: "2026-09-30",
    }),
  ],
  contratos: [
    record("contratos", "1", {
      contrato: "Venda soja - Cargill",
      tipo: "Venda",
      quantidade: "5000",
      status: "Em aberto",
    }),
  ],
};

function record(module: string, id: string, payload: Record<string, string>): FinancialRecord {
  return { id: `${module}-demo-${id}`, module, payload };
}

function num(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateValue(value: unknown) {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatValue(value: string | undefined, field?: FieldConfig) {
  if (!value) return "-";
  if (field?.type === "number") return num(value).toLocaleString("pt-BR");
  return value;
}

function emptyPayload(module: ModuleConfig) {
  return Object.fromEntries(module.fields.map((field) => [field.key, ""]));
}

function moduleSummary(moduleId: string, records: FinancialRecord[]) {
  switch (moduleId) {
    case "fluxo": {
      const entradas = records
        .filter((r) => String(r.payload.tipo).toLowerCase().includes("entrada"))
        .reduce((sum, r) => sum + num(r.payload.valor), 0);
      const saidas = records
        .filter((r) => String(r.payload.tipo).toLowerCase().includes("saida"))
        .reduce((sum, r) => sum + num(r.payload.valor), 0);
      return {
        headline: formatMoney(entradas - saidas),
        caption: `${formatMoney(entradas)} entradas - ${formatMoney(saidas)} saidas`,
        tone: entradas >= saidas ? "success" : "danger",
      };
    }
    case "custos": {
      const first = records[0]?.payload;
      const unitCost = first ? num(first.custo_total) / Math.max(num(first.quantidade), 1) : 0;
      return {
        headline: formatMoney(unitCost),
        caption: first ? `Custo por ${first.unidade || "unidade"}` : "Sem custo calculado",
        tone: "info",
      };
    }
    case "inadimplencia": {
      const today = new Date();
      const overdue = records.filter((r) => {
        const due = dateValue(r.payload.vencimento);
        return due
          ? due < today && !String(r.payload.status).toLowerCase().includes("pago")
          : false;
      });
      return {
        headline: formatMoney(overdue.reduce((sum, r) => sum + num(r.payload.valor), 0)),
        caption: `${overdue.length} pagamentos vencidos`,
        tone: overdue.length ? "danger" : "success",
      };
    }
    case "estoque": {
      const available = records.reduce(
        (sum, r) => sum + Math.max(num(r.payload.saldo) - num(r.payload.reservado), 0),
        0,
      );
      return {
        headline: available.toLocaleString("pt-BR"),
        caption: "unidades disponiveis",
        tone: "success",
      };
    }
    case "equilibrio": {
      const first = records[0]?.payload;
      const margin = first ? num(first.preco_venda) - num(first.custo_variavel) : 0;
      const point = margin > 0 && first ? Math.ceil(num(first.custo_fixo) / margin) : 0;
      return {
        headline: point.toLocaleString("pt-BR"),
        caption: "unidades para equilibrio",
        tone: point ? "warning" : "info",
      };
    }
    case "compras": {
      const urgent = records.filter(
        (r) => num(r.payload.estoque_atual) < num(r.payload.estoque_minimo),
      );
      return {
        headline: String(urgent.length),
        caption: "insumos para comprar",
        tone: urgent.length ? "warning" : "success",
      };
    }
    case "credito": {
      const due = records.reduce((sum, r) => sum + num(r.payload.parcela), 0);
      return { headline: formatMoney(due), caption: "proximas parcelas", tone: "warning" };
    }
    case "precos": {
      const avg = records.length
        ? records.reduce((sum, r) => sum + num(r.payload.varejo), 0) / records.length
        : 0;
      return { headline: formatMoney(avg), caption: "preco medio varejo", tone: "info" };
    }
    default:
      return {
        headline: String(records.length),
        caption: "registros cadastrados",
        tone: "default",
      };
  }
}

function buildDashboard(recordsByModule: RecordsByModule) {
  const fluxo = recordsByModule.fluxo ?? [];
  const estoque = recordsByModule.estoque ?? [];
  const compras = recordsByModule.compras ?? [];
  const inadimplencia = recordsByModule.inadimplencia ?? [];
  const credito = recordsByModule.credito ?? [];

  const entradas = fluxo
    .filter((r) => String(r.payload.tipo).toLowerCase().includes("entrada"))
    .reduce((sum, r) => sum + num(r.payload.valor), 0);
  const saidas = fluxo
    .filter((r) => String(r.payload.tipo).toLowerCase().includes("saida"))
    .reduce((sum, r) => sum + num(r.payload.valor), 0);
  const estoquePronto = estoque.reduce(
    (sum, r) => sum + Math.max(num(r.payload.saldo) - num(r.payload.reservado), 0),
    0,
  );
  const comprasPendentes = compras.filter(
    (r) => num(r.payload.estoque_atual) < num(r.payload.estoque_minimo),
  ).length;
  const vencidos = inadimplencia.filter((r) => {
    const due = dateValue(r.payload.vencimento);
    return due
      ? due < new Date() && !String(r.payload.status).toLowerCase().includes("pago")
      : false;
  });
  const parcelas = credito.reduce((sum, r) => sum + num(r.payload.parcela), 0);

  return {
    entradas,
    saidas,
    saldo: entradas - saidas,
    estoquePronto,
    comprasPendentes,
    inadimplencia: vencidos.reduce((sum, r) => sum + num(r.payload.valor), 0),
    parcelas,
    chart: [
      { label: "Entradas", valor: entradas },
      { label: "Saidas", valor: saidas },
      { label: "Inadimpl.", valor: vencidos.reduce((sum, r) => sum + num(r.payload.valor), 0) },
      { label: "Parcelas", valor: parcelas },
    ],
  };
}

export function FinancialAgroCrud() {
  const { demoMode } = useDemoMode();
  const queryResults = useQueries({
    queries: financialModules.map((module) => ({
      queryKey: ["financial-records", module.id],
      queryFn: () => listFinancialRecords(module.id),
      enabled: !demoMode,
    })),
  });

  const recordsByModule = useMemo(() => {
    if (demoMode) return demoRecords;
    return Object.fromEntries(
      financialModules.map((module, index) => [module.id, queryResults[index].data ?? []]),
    ) as RecordsByModule;
  }, [demoMode, queryResults]);

  const dashboard = useMemo(() => buildDashboard(recordsByModule), [recordsByModule]);
  const loading = queryResults.some((query) => query.isLoading);

  return (
    <div className="space-y-6">
      {!demoMode && !isSupabaseConfigured && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
          Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar e salvar dados reais no
          Supabase.
        </div>
      )}

      <FinancialDashboard dashboard={dashboard} demoMode={demoMode} loading={loading} />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {financialModules.map((module) => {
          const summary = moduleSummary(module.id, recordsByModule[module.id] ?? []);
          return (
            <a
              key={module.id}
              href={`#${module.id}`}
              className="rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/60"
            >
              <div className="flex items-center gap-2 font-medium">
                <module.icon className="h-4 w-4 text-primary" />
                {module.shortLabel}
              </div>
              <div className="mt-2 text-lg font-semibold">{summary.headline}</div>
              <div className="text-xs text-muted-foreground">{summary.caption}</div>
            </a>
          );
        })}
      </div>

      <div className="grid gap-5">
        {financialModules.map((module) => (
          <ModuleSection
            key={module.id}
            module={module}
            demoMode={demoMode}
            records={recordsByModule[module.id] ?? []}
          />
        ))}
      </div>
    </div>
  );
}

function FinancialDashboard({
  dashboard,
  demoMode,
  loading,
}: {
  dashboard: ReturnType<typeof buildDashboard>;
  demoMode: boolean;
  loading: boolean;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dashboard Financeiro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {demoMode
              ? "Resumo demonstrativo do financeiro agro."
              : "Resumo dos dados reais cadastrados."}
          </p>
        </div>
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          {loading ? "Carregando" : demoMode ? "DEMO" : "REAL"}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <DashKpi
          label="Saldo"
          value={formatMoney(dashboard.saldo)}
          tone={dashboard.saldo >= 0 ? "success" : "danger"}
        />
        <DashKpi label="Entradas" value={formatMoney(dashboard.entradas)} tone="success" />
        <DashKpi label="Saidas" value={formatMoney(dashboard.saidas)} tone="danger" />
        <DashKpi
          label="Inadimplencia"
          value={formatMoney(dashboard.inadimplencia)}
          tone={dashboard.inadimplencia ? "warning" : "success"}
        />
        <DashKpi
          label="Estoque pronto"
          value={dashboard.estoquePronto.toLocaleString("pt-BR")}
          tone="info"
        />
        <DashKpi
          label="Compras pend."
          value={String(dashboard.comprasPendentes)}
          tone={dashboard.comprasPendentes ? "warning" : "success"}
        />
      </div>

      <div className="mt-5 h-64">
        <ResponsiveContainer>
          <BarChart data={dashboard.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="valor" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function DashKpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "warning" | "info";
}) {
  const classes = {
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning-foreground",
    info: "text-primary",
  };
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold", classes[tone])}>{value}</div>
    </div>
  );
}

function ModuleSection({
  module,
  demoMode,
  records,
}: {
  module: ModuleConfig;
  demoMode: boolean;
  records: FinancialRecord[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialRecord | null>(null);
  const [payload, setPayload] = useState<Record<string, string>>(emptyPayload(module));
  const summary = moduleSummary(module.id, records);

  const createMutation = useMutation({
    mutationFn: createFinancialRecord,
    onSuccess: () => {
      toast.success("Registro adicionado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["financial-records", module.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateFinancialRecord,
    onSuccess: () => {
      toast.success("Registro atualizado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["financial-records", module.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFinancialRecord,
    onSuccess: () => {
      toast.success("Registro excluido.");
      void queryClient.invalidateQueries({ queryKey: ["financial-records", module.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const beginCreate = () => {
    if (demoMode) {
      toast.info("Desligue o modo DEMO para cadastrar dados reais.");
      return;
    }
    setEditing(null);
    setPayload(emptyPayload(module));
    setOpen(true);
  };

  const beginEdit = (recordToEdit: FinancialRecord) => {
    if (demoMode) {
      toast.info("Dados demo nao podem ser editados.");
      return;
    }
    setEditing(recordToEdit);
    setPayload({ ...emptyPayload(module), ...recordToEdit.payload });
    setOpen(true);
  };

  const submit = () => {
    if (demoMode) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }
    createMutation.mutate({ module: module.id, payload });
  };

  return (
    <section id={module.id} className="scroll-mt-20 rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <module.icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold">{module.label}</h3>
              <p className="text-xs text-muted-foreground">{module.description}</p>
            </div>
          </div>
        </div>
        <button
          onClick={beginCreate}
          className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar
          </span>
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <div className="text-xs text-muted-foreground">Resumo calculado</div>
          <div className="mt-1 text-lg font-semibold">{summary.headline}</div>
          <div className="text-xs text-muted-foreground">{summary.caption}</div>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <div className="text-xs text-muted-foreground">Registros</div>
          <div className="mt-1 text-lg font-semibold">{records.length}</div>
          <div className="text-xs text-muted-foreground">
            {demoMode ? "Somente leitura" : "Editavel"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <div className="text-xs text-muted-foreground">Motor de regra</div>
          <div className="mt-1 text-lg font-semibold">Ativo</div>
          <div className="text-xs text-muted-foreground">calculo automatico por modulo</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {module.fields.map((field) => (
                <th key={field.key} className="py-3 pr-4 font-medium">
                  {field.label}
                </th>
              ))}
              <th className="py-3 text-right font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((recordItem) => (
              <tr key={recordItem.id} className="border-b border-border last:border-0">
                {module.fields.map((field) => (
                  <td key={field.key} className="py-3 pr-4">
                    {formatValue(recordItem.payload[field.key], field)}
                  </td>
                ))}
                <td className="py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => beginEdit(recordItem)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted"
                      aria-label="Editar"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (demoMode) {
                          toast.info("Dados demo nao podem ser excluidos.");
                          return;
                        }
                        if (window.confirm("Excluir este registro?")) {
                          deleteMutation.mutate(recordItem.id);
                        }
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-destructive hover:bg-muted"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td
                  colSpan={module.fields.length + 1}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum registro real cadastrado neste modulo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar registro" : "Adicionar registro"}</DialogTitle>
            <DialogDescription>{module.label}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {module.fields.map((field) => (
              <label key={field.key} className="grid gap-1.5 text-sm">
                <span className="text-muted-foreground">{field.label}</span>
                <input
                  type={field.type ?? "text"}
                  value={payload[field.key] ?? ""}
                  onChange={(event) =>
                    setPayload((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
            ))}
          </div>
          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="h-9 rounded-lg border border-border px-3 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AlertTriangle, BarChart3, LineChart, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { OperationAreaPage, type OperationModuleConfig } from "@/components/operation-area-crud";
import type { OperationRecord } from "@/lib/supabase-operations";

export const Route = createFileRoute("/inteligencia")({
  head: () => ({
    meta: [
      { title: "Inteligência - Nery Agro" },
      {
        name: "description",
        content:
          "Relatórios, gráficos de desempenho, alertas de preços CEASA/CNA e perdas com causas.",
      },
    ],
  }),
  component: InteligenciaPage,
});

const AREA = "inteligencia";

const modules: OperationModuleConfig[] = [
  {
    id: "lucratividade",
    label: "Lucratividade por Cultura Comparada",
    shortLabel: "Lucratividade",
    description: "Receita, custo, margem e safra por cultura.",
    icon: TrendingUp,
    fields: [
      { key: "cultura", label: "Cultura" },
      { key: "safra", label: "Safra" },
      { key: "receita", label: "Receita", type: "number" },
      { key: "custo", label: "Custo", type: "number" },
      { key: "margem", label: "Margem", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "desempenho",
    label: "Desempenho Mês a Mês / Ano a Ano",
    shortLabel: "Desempenho",
    description: "Indicadores por período, comparativo e tendência em gráficos.",
    icon: LineChart,
    fields: [
      { key: "periodo", label: "Período" },
      { key: "indicador", label: "Indicador" },
      { key: "valor", label: "Valor", type: "number" },
      { key: "comparativo", label: "Comparativo", type: "number" },
      { key: "ano", label: "Ano" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "precos",
    label: "Alertas de Preços CEASA/CNA",
    shortLabel: "Preços",
    description: "Alertas configuráveis por produto, praça/fonte e limite de preço.",
    icon: AlertTriangle,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "fonte", label: "Praça/Fonte" },
      { key: "preco", label: "Preço", type: "number" },
      { key: "limite_alerta", label: "Limite de alerta", type: "number" },
      { key: "data", label: "Data", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "perdas",
    label: "Relatório de Perdas com Causas",
    shortLabel: "Perdas",
    description: "Produto/cultura, volume perdido, causa, valor estimado e ação.",
    icon: BarChart3,
    fields: [
      { key: "produto", label: "Produto/Cultura" },
      { key: "volume_perdido", label: "Volume perdido", type: "number" },
      { key: "causa", label: "Causa" },
      { key: "valor_estimado", label: "Valor estimado", type: "number" },
      { key: "acao", label: "Ação" },
      { key: "status", label: "Status" },
    ],
  },
];

const demoByModule: Record<string, OperationRecord[]> = {
  lucratividade: [
    record("lucratividade", "1", {
      cultura: "Tomate",
      safra: "2025/26",
      receita: "148000",
      custo: "92000",
      margem: "56000",
      status: "Acima da meta",
    }),
    record("lucratividade", "2", {
      cultura: "Alface",
      safra: "2025/26",
      receita: "82000",
      custo: "51000",
      margem: "31000",
      status: "Estável",
    }),
    record("lucratividade", "3", {
      cultura: "Milho verde",
      safra: "2025/26",
      receita: "116000",
      custo: "87000",
      margem: "29000",
      status: "Atenção",
    }),
  ],
  desempenho: [
    record("desempenho", "1", {
      periodo: "Jan",
      indicador: "Receita",
      valor: "68000",
      comparativo: "61000",
      ano: "2026",
      status: "OK",
    }),
    record("desempenho", "2", {
      periodo: "Fev",
      indicador: "Receita",
      valor: "73000",
      comparativo: "65500",
      ano: "2026",
      status: "OK",
    }),
    record("desempenho", "3", {
      periodo: "Mar",
      indicador: "Receita",
      valor: "70500",
      comparativo: "69000",
      ano: "2026",
      status: "Estável",
    }),
  ],
  precos: [
    record("precos", "1", {
      produto: "Tomate",
      fonte: "CEASA Curitiba",
      preco: "88",
      limite_alerta: "80",
      data: "2026-05-31",
      status: "Alerta",
    }),
    record("precos", "2", {
      produto: "Alface",
      fonte: "CNA",
      preco: "42",
      limite_alerta: "38",
      data: "2026-05-31",
      status: "Monitorar",
    }),
  ],
  perdas: [
    record("perdas", "1", {
      produto: "Tomate",
      volume_perdido: "340",
      causa: "Transporte",
      valor_estimado: "4200",
      acao: "Revisar embalagem e rota.",
      status: "Em ação",
    }),
    record("perdas", "2", {
      produto: "Folhosas",
      volume_perdido: "120",
      causa: "Calor",
      valor_estimado: "1350",
      acao: "Antecipar colheita.",
      status: "Revisar",
    }),
  ],
};

function record(module: string, id: string, payload: Record<string, string>): OperationRecord {
  return {
    id: `demo-${AREA}-${module}-${id}`,
    area: AREA,
    module,
    payload,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

function num(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function InteligenciaPage() {
  return (
    <OperationAreaPage
      area={AREA}
      title="Inteligência"
      description="Relatórios, gráficos e alertas configuráveis para apoiar decisões da fazenda."
      modules={modules}
      demoByModule={demoByModule}
      renderModuleAddon={renderCharts}
    />
  );
}

function renderCharts(module: OperationModuleConfig, records: OperationRecord[]) {
  if (!["lucratividade", "desempenho", "perdas"].includes(module.id) || records.length === 0) {
    return null;
  }

  if (module.id === "desempenho") {
    const data = records.map((recordItem) => ({
      name: recordItem.payload.periodo,
      valor: num(recordItem.payload.valor),
      comparativo: num(recordItem.payload.comparativo),
    }));
    return (
      <ChartShell title="Desempenho comparado">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="valor" stroke="var(--color-primary)" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="comparativo"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartShell>
    );
  }

  const data = records.map((recordItem) => ({
    name: recordItem.payload.cultura ?? recordItem.payload.produto,
    receita: num(recordItem.payload.receita),
    custo: num(recordItem.payload.custo),
    margem: num(recordItem.payload.margem),
    perdas: num(recordItem.payload.valor_estimado),
  }));

  return (
    <ChartShell title={module.id === "perdas" ? "Perdas estimadas" : "Lucratividade comparada"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
          <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
          <Tooltip />
          {module.id === "perdas" ? (
            <Bar dataKey="perdas" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
          ) : (
            <>
              <Bar dataKey="receita" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="custo" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="margem" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function ChartShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <div className="mt-3 h-64">{children}</div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import {
  Calendar,
  CheckCircle2,
  Download,
  Gauge,
  MessageCircle,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/stat-card";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { TrackingMap } from "@/components/tracking-map";
import { PeriodPicker, defaultPeriod, type PeriodValue } from "@/components/period-picker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nery Logística" },
      {
        name: "description",
        content: "Visão geral em tempo real das operações Nery Logística.",
      },
    ],
  }),
  component: DashboardPage,
});

type ShipmentRow = {
  id: string;
  exp: string;
  cat: string;
  driver: string;
  date: string;
  dest: string;
  weight: string;
  status: "Separando" | "Em trânsito" | "Entregue";
};

const demoRows: ShipmentRow[] = [
  {
    id: "#100512-25-700JKT",
    exp: "Nery Express",
    cat: "Carga Padrão",
    driver: "João Pereira",
    date: "26 Jan, 2026",
    dest: "São Paulo, SP",
    weight: "15,8 kg",
    status: "Separando",
  },
  {
    id: "#170845-25-800NYK",
    exp: "RodoNery",
    cat: "Carga Expressa",
    driver: "Carla Souza",
    date: "25 Jan, 2026",
    dest: "Rio de Janeiro, RJ",
    weight: "7,2 kg",
    status: "Em trânsito",
  },
  {
    id: "#220915-25-913BSB",
    exp: "Nery Cargo",
    cat: "Carga Padrão",
    driver: "Marcos Lima",
    date: "24 Jan, 2026",
    dest: "Brasília, DF",
    weight: "22,4 kg",
    status: "Entregue",
  },
  {
    id: "#330217-25-441POA",
    exp: "Nery Express",
    cat: "Carga Refrigerada",
    driver: "Ana Ribeiro",
    date: "23 Jan, 2026",
    dest: "Porto Alegre, RS",
    weight: "9,6 kg",
    status: "Em trânsito",
  },
];

const shipmentSeries = Array.from({ length: 16 }, (_, i) => ({
  x: i,
  label: `S${Math.floor(i / 4) + 1}`,
  current: 280 + Math.round(Math.sin(i / 2) * 30 + (i === 6 ? 60 : 0) + i * 2),
  previous: 250 + Math.round(Math.cos(i / 2) * 10 + i),
}));

const statusStyle: Record<ShipmentRow["status"], string> = {
  Separando: "bg-warning/15 text-warning-foreground border-warning/30",
  "Em trânsito": "bg-primary/15 text-primary border-primary/30",
  Entregue: "bg-success/15 text-success border-success/30",
};

function downloadCsv(rows: ShipmentRow[]) {
  const header = ["ID", "Expedição", "Categoria", "Motorista", "Data", "Destino", "Peso", "Status"];
  const lines = rows.map((r) => [r.id, r.exp, r.cat, r.driver, r.date, r.dest, r.weight, r.status]);
  const csv = [header, ...lines]
    .map((line) => line.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cargas-nery.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function DashboardPage() {
  const { demoMode } = useDemoMode();
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriod());
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [onlyTransit, setOnlyTransit] = useState(false);
  const rows = useMemo(() => (demoMode ? demoRows : []), [demoMode]);

  const visibleRows = useMemo(() => {
    return rows
      .filter((r) => (onlyTransit ? r.status === "Em trânsito" : true))
      .filter((r) =>
        Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => (sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));
  }, [onlyTransit, query, rows, sortAsc]);

  const onTime = demoMode ? "98%" : "0%";
  const total = demoMode ? "2.983" : "0";
  const fleet = demoMode ? "203" : "0";
  const driverScore = demoMode ? "95%" : "0%";

  return (
    <div className="px-8 py-6 space-y-5 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {demoMode
              ? "Dados demonstrativos da operação."
              : "Dados reais da operação cadastrada."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodPicker value={period} onChange={setPeriod} />
          <button
            onClick={() => downloadCsv(visibleRows)}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Big tracking map on top */}
      <TrackingMap />

      {/* KPIs + Revenue */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={CheckCircle2}
            label="Entregas no Prazo"
            value={onTime}
            delta={demoMode ? "+3%" : undefined}
          />
          <StatCard
            icon={Package}
            label="Total de Entregas"
            value={total}
            delta={demoMode ? "+209" : undefined}
          />
          <StatCard
            icon={Truck}
            label="Frota Ativa"
            value={fleet}
            delta={demoMode ? "+12" : undefined}
          />
          <StatCard
            icon={Gauge}
            label="Score do Motorista"
            value={driverScore}
            delta={demoMode ? "+5%" : undefined}
          />
        </div>

        <div className="col-span-12 lg:col-span-4 bg-card border border-border rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Receita</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Resumo de fretes do mês.</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-xs">
            <div>
              <div className="text-muted-foreground">Padrão</div>
              <div className="font-semibold text-foreground mt-1">
                {demoMode ? "R$ 90.000" : "R$ 0"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Expressa</div>
              <div className="font-semibold text-foreground mt-1">
                {demoMode ? "R$ 50.000" : "R$ 0"}
              </div>
            </div>
          </div>
          <div className="relative h-28 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ name: "v", value: demoMode ? 75 : 0, fill: "var(--color-primary)" }]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  background={{ fill: "var(--color-muted)" }}
                  dataKey="value"
                  cornerRadius={6}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
              <div className="text-[11px] text-muted-foreground">Total</div>
              <div className="text-lg font-semibold">{demoMode ? "R$ 140.000" : "R$ 0"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery stats chart */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Estatísticas de Entregas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Performance de entregas e status mensal.
            </p>
          </div>
          <button
            onClick={() => toast.info("Agrupamento mensal aplicado.")}
            className="h-8 px-3 rounded-md border border-border text-xs flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5" /> Mensal
          </button>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={demoMode ? shipmentSeries : []}>
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
              <Area
                type="monotone"
                dataKey="previous"
                stroke="var(--color-chart-2)"
                fill="var(--color-chart-2)"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="var(--color-primary)"
                fill="var(--color-primary)"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deliveries table */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar aqui..."
            className="h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm flex-1 min-w-[200px] max-w-xs"
          />
          <button
            onClick={() => setSortAsc((value) => !value)}
            className="h-9 px-3 rounded-lg border border-border text-sm"
          >
            Ordenar
          </button>
          <button
            onClick={() => setOnlyTransit((value) => !value)}
            className="h-9 px-3 rounded-lg border border-border text-sm"
          >
            {onlyTransit ? "Todos" : "Filtrar"}
          </button>
          <div className="flex-1" />
          <button
            onClick={() =>
              toast.info(
                demoMode
                  ? "Cargas demonstrativas. Desligue o modo DEMO para cadastrar uma carga real."
                  : "Cadastre uma nova carga em Logística e Distribuição.",
              )
            }
            className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            + Adicionar Carga
          </button>
          <button
            onClick={() => downloadCsv(visibleRows)}
            className="h-9 px-3 rounded-lg border border-border text-sm"
          >
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="font-medium py-3 pl-2">#</th>
                <th className="font-medium py-3">ID da Carga</th>
                <th className="font-medium py-3">Expedição</th>
                <th className="font-medium py-3">Categoria</th>
                <th className="font-medium py-3">Motorista</th>
                <th className="font-medium py-3">Data</th>
                <th className="font-medium py-3">Destino</th>
                <th className="font-medium py-3">Peso</th>
                <th className="font-medium py-3 pr-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r, i) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="py-3 pl-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-3 font-medium">{r.id}</td>
                  <td className="py-3">{r.exp}</td>
                  <td className="py-3">{r.cat}</td>
                  <td className="py-3">{r.driver}</td>
                  <td className="py-3 text-muted-foreground">{r.date}</td>
                  <td className="py-3">{r.dest}</td>
                  <td className="py-3">{r.weight}</td>
                  <td className="py-3 pr-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-md border font-medium ${statusStyle[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    {demoMode
                      ? "Nenhuma carga encontrada para o filtro."
                      : "Nenhuma carga real cadastrada."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Phone/Chat row helpers — quick driver actions */}
        <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => toast.info("Conversa com motorista aberta.")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </button>
          <button
            onClick={() => toast.info("Acionamento telefônico registrado.")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted"
          >
            <Phone className="w-3.5 h-3.5" /> Ligar
          </button>
        </div>
      </div>
    </div>
  );
}

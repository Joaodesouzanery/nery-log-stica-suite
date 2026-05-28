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
  ExternalLink,
  Gauge,
  MessageCircle,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/stat-card";
import { useDemoMode } from "@/hooks/use-demo-mode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard - Nery Logistica" },
      { name: "description", content: "Visao geral em tempo real das operacoes Nery Logistica." },
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
  status: "Separando" | "Em transito" | "Entregue";
};

const demoRows: ShipmentRow[] = [
  {
    id: "#100512-25-700JKT",
    exp: "Nery Express",
    cat: "Carga Padrao",
    driver: "Joao Pereira",
    date: "26 Jan, 2026",
    dest: "Sao Paulo, SP",
    weight: "15.8 kg",
    status: "Separando",
  },
  {
    id: "#170845-25-800NYK",
    exp: "RodoNery",
    cat: "Carga Expressa",
    driver: "Carla Souza",
    date: "25 Jan, 2026",
    dest: "Rio de Janeiro, RJ",
    weight: "7.2 kg",
    status: "Em transito",
  },
  {
    id: "#220915-25-913BSB",
    exp: "Nery Cargo",
    cat: "Carga Padrao",
    driver: "Marcos Lima",
    date: "24 Jan, 2026",
    dest: "Brasilia, DF",
    weight: "22.4 kg",
    status: "Entregue",
  },
  {
    id: "#330217-25-441POA",
    exp: "Nery Express",
    cat: "Carga Refrigerada",
    driver: "Ana Ribeiro",
    date: "23 Jan, 2026",
    dest: "Porto Alegre, RS",
    weight: "9.6 kg",
    status: "Em transito",
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
  "Em transito": "bg-primary/15 text-primary border-primary/30",
  Entregue: "bg-success/15 text-success border-success/30",
};

function downloadCsv(rows: ShipmentRow[]) {
  const header = ["ID", "Expedicao", "Categoria", "Motorista", "Data", "Destino", "Peso", "Status"];
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

function MapboxTrackingMap({ demoMode }: { demoMode: boolean }) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  if (!token) {
    return (
      <div className="mt-3 h-36 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground flex items-center justify-center text-center">
        Configure VITE_MAPBOX_TOKEN para renderizar o mapa Mapbox.
      </div>
    );
  }

  const geojson = encodeURIComponent(
    JSON.stringify({
      type: "Feature",
      properties: { stroke: "#f97316", "stroke-width": 3 },
      geometry: {
        type: "LineString",
        coordinates: [
          [-46.6333, -23.5505],
          [-45.2, -23.1],
          [-43.1729, -22.9068],
        ],
      },
    }),
  );
  const overlays = [
    "pin-s-a+f97316(-46.6333,-23.5505)",
    "pin-s-b+22c55e(-43.1729,-22.9068)",
    `geojson(${geojson})`,
  ].join(",");
  const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays}/-44.8,-23.2,6/640x260?access_token=${token}`;

  return (
    <div className="mt-3 h-36 rounded-lg overflow-hidden border border-border bg-muted">
      <img
        src={url}
        alt={
          demoMode
            ? "Mapa Mapbox demonstrativo da carga em transito"
            : "Mapa Mapbox de rastreamento"
        }
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function DashboardPage() {
  const { demoMode } = useDemoMode();
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [onlyTransit, setOnlyTransit] = useState(false);
  const rows = useMemo(() => (demoMode ? demoRows : []), [demoMode]);

  const visibleRows = useMemo(() => {
    return rows
      .filter((r) => (onlyTransit ? r.status === "Em transito" : true))
      .filter((r) => Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()))
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
          <h1 className="text-2xl font-semibold tracking-tight">Visao Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {demoMode ? "Dados demonstrativos da operacao." : "Dados reais da operacao cadastrada."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Filtro de periodo aplicado: Janeiro 2026.")}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Calendar className="w-4 h-4" />
            Janeiro 2026
          </button>
          <button
            onClick={() => downloadCsv(visibleRows)}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-3">
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

        <div className="col-span-12 lg:col-span-3 bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Receita</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Resumo de fretes do mes.</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-xs">
            <div>
              <div className="text-muted-foreground">Padrao</div>
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

        <div className="col-span-12 lg:col-span-3 bg-card border border-border rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Rastreamento</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Status ao vivo das cargas.</p>
            </div>
          </div>
          <MapboxTrackingMap demoMode={demoMode} />
          <div className="mt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID da carga</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-medium border border-primary/30">
                {demoMode ? "Em transito" : "Sem carga"}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 font-medium">
              {demoMode ? "#170845-25-800NYK" : "Nenhuma carga real cadastrada"}
              {demoMode && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Motorista</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                M
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {demoMode ? "Marcos Lima" : "Sem motorista"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {demoMode ? "Nery Express" : "Aguardando cadastro"}
                </div>
              </div>
              <button
                onClick={() => toast.info("Conversa do motorista aberta.")}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => toast.info("Acionamento telefonico registrado.")}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Estatisticas de Entregas</h3>
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

      <div className="bg-card border border-border rounded-lg p-5">
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
                  ? "Carga demonstrativa pronta para cadastro real."
                  : "Conecte o cadastro de cargas reais para adicionar.",
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
                <th className="font-medium py-3">Expedicao</th>
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
      </div>
    </div>
  );
}

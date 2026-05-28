import { createFileRoute } from "@tanstack/react-router";
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
  CheckCircle2,
  Package,
  Truck,
  Gauge,
  Calendar,
  Download,
  ExternalLink,
  MessageCircle,
  Phone,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nery Logística" },
      { name: "description", content: "Visão geral em tempo real das operações Nery Logística." },
    ],
  }),
  component: DashboardPage,
});

const shipmentSeries = Array.from({ length: 16 }, (_, i) => ({
  x: i,
  label: `S${Math.floor(i / 4) + 1}`,
  current: 280 + Math.round(Math.sin(i / 2) * 30 + (i === 6 ? 60 : 0) + Math.random() * 15),
  previous: 250 + Math.round(Math.cos(i / 2) * 10 + Math.random() * 10),
}));

const tableRows = [
  { id: "#100512-25-700JKT", exp: "Nery Express", cat: "Carga Padrão", driver: "João Pereira", date: "26 Jan, 2026", dest: "São Paulo, SP", weight: "15.8 kg", status: "Separando" },
  { id: "#170845-25-800NYK", exp: "RodoNery", cat: "Carga Expressa", driver: "Carla Souza", date: "25 Jan, 2026", dest: "Rio de Janeiro, RJ", weight: "7.2 kg", status: "Em trânsito" },
  { id: "#220915-25-913BSB", exp: "Nery Cargo", cat: "Carga Padrão", driver: "Marcos Lima", date: "24 Jan, 2026", dest: "Brasília, DF", weight: "22.4 kg", status: "Entregue" },
  { id: "#330217-25-441POA", exp: "Nery Express", cat: "Carga Refrigerada", driver: "Ana Ribeiro", date: "23 Jan, 2026", dest: "Porto Alegre, RS", weight: "9.6 kg", status: "Em trânsito" },
];

const statusStyle: Record<string, string> = {
  "Separando": "bg-warning/15 text-warning-foreground border-warning/30",
  "Em trânsito": "bg-primary/15 text-primary border-primary/30",
  "Entregue": "bg-success/15 text-success border-success/30",
};

function DashboardPage() {
  return (
    <div className="px-8 py-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance em tempo real da operação Nery Logística.
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

      {/* Grid: 4 stat cards (2x2) + revenue + tracking */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-5">
          <StatCard icon={CheckCircle2} label="Entregas no Prazo" value="98%" delta="+3%" />
          <StatCard icon={Package} label="Total de Entregas" value="2.983" delta="+209" />
          <StatCard icon={Truck} label="Frota Ativa" value="203" delta="+12" />
          <StatCard icon={Gauge} label="Score do Motorista" value="95%" delta="+5%" />
        </div>

        {/* Revenue */}
        <div className="col-span-12 lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Receita</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Resumo de fretes do mês.</p>
            </div>
            <button className="text-muted-foreground">⋯</button>
          </div>
          <div className="flex justify-between mt-5 text-xs">
            <div>
              <div className="text-muted-foreground">Padrão</div>
              <div className="font-semibold text-foreground mt-1">R$ 90.000</div>
            </div>
            <div>
              <div className="text-muted-foreground">Expressa</div>
              <div className="font-semibold text-foreground mt-1">R$ 50.000</div>
            </div>
          </div>
          <div className="relative h-36 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ name: "v", value: 75, fill: "var(--color-primary)" }]}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background={{ fill: "var(--color-muted)" }} dataKey="value" cornerRadius={6} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
              <div className="text-[11px] text-muted-foreground">Total</div>
              <div className="text-xl font-semibold">R$ 140.000</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <span className="text-success font-medium">+12%</span> vs mês anterior
          </div>
        </div>

        {/* Tracking */}
        <div className="col-span-12 lg:col-span-3 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">Rastreamento</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Status ao vivo das cargas.</p>
            </div>
            <button className="text-muted-foreground">⋯</button>
          </div>
          <div className="mt-4 h-32 rounded-xl bg-gradient-to-br from-primary/10 via-chart-2/10 to-muted overflow-hidden relative border border-border">
            <svg viewBox="0 0 200 100" className="w-full h-full opacity-70">
              <path d="M10 80 Q 60 20, 120 50 T 195 30" stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeDasharray="3 3" />
              <circle cx="10" cy="80" r="4" fill="var(--color-primary)" />
              <circle cx="195" cy="30" r="4" fill="var(--color-primary)" />
            </svg>
          </div>
          <div className="mt-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID da carga</span>
              <span className="px-2 py-0.5 rounded-md bg-warning/15 text-warning-foreground text-[10px] font-medium border border-warning/30">Em trânsito</span>
            </div>
            <div className="flex items-center gap-1 mt-1 font-medium">
              #170845-25-800NYK <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <ol className="mt-4 space-y-3 text-xs">
            {[
              { d: "27 Jan 2026", t: "Em trânsito", h: "09:15", on: true },
              { d: "26 Jan 2026", t: "Centro de triagem", h: "06:21", on: true },
              { d: "25 Jan 2026", t: "Pedido confirmado", h: "06:21", on: true },
            ].map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  {i < 2 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{s.d}</div>
                  <div className="text-muted-foreground">{s.t}</div>
                </div>
                <div className="text-muted-foreground">{s.h}</div>
              </li>
            ))}
          </ol>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Motorista</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground text-xs font-semibold">M</div>
              <div className="flex-1">
                <div className="text-sm font-medium">Marcos Lima</div>
                <div className="text-xs text-muted-foreground">Nery Express</div>
              </div>
              <button className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted">
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted">
                <Phone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Estatísticas de Entregas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Performance de entregas e status mensal.
            </p>
          </div>
          <button className="h-8 px-3 rounded-md border border-border text-xs flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Mensal
          </button>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={shipmentSeries}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="previous" stroke="var(--color-chart-2)" fill="url(#g2)" strokeWidth={2} />
              <Area type="monotone" dataKey="current" stroke="var(--color-primary)" fill="url(#g1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground justify-end mt-2">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Este mês</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-chart-2" />Mês anterior</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              placeholder="Buscar aqui..."
              className="w-full h-9 px-3 bg-muted/50 border border-border rounded-lg text-sm"
            />
          </div>
          <button className="h-9 px-3 rounded-lg border border-border text-sm">Ordenar</button>
          <button className="h-9 px-3 rounded-lg border border-border text-sm">Filtrar</button>
          <div className="flex-1" />
          <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            + Adicionar Carga
          </button>
          <button className="h-9 px-3 rounded-lg border border-border text-sm">Exportar CSV</button>
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
              {tableRows.map((r, i) => (
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
                    <span className={`text-xs px-2 py-1 rounded-md border font-medium ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Download,
  Edit3,
  Plus,
  Trash2,
  Truck,
  Users,
  MapPin,
  Building2,
  Wrench,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import {
  createOperationRecord,
  deleteOperationRecord,
  listOperationRecords,
  OperationRecord,
  updateOperationRecord,
} from "@/lib/supabase-operations";
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
import { TrackingMap, useTrackingData } from "@/components/tracking-map";
import {
  PeriodPicker,
  defaultPeriod,
  type PeriodValue,
} from "@/components/period-picker";

export const Route = createFileRoute("/logistica")({
  head: () => ({
    meta: [
      { title: "Logística e Distribuição — Nery Logística" },
      {
        name: "description",
        content:
          "Cadastro e acompanhamento de cargas, motoristas, rotas, frota e bases da operação Nery.",
      },
    ],
  }),
  component: LogisticaPage,
});

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
  hint?: string;
};

type ModuleConfig = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
};

const modules: ModuleConfig[] = [
  {
    id: "cargas",
    label: "Cargas",
    description: "Pedidos em separação, em trânsito e entregues. Posiciona pinos no mapa.",
    icon: Truck,
    fields: [
      { key: "codigo", label: "Código" },
      { key: "cliente", label: "Cliente" },
      { key: "origem", label: "Cidade de Origem" },
      { key: "origem_lat", label: "Latitude Origem", type: "number", hint: "-23.55" },
      { key: "origem_lng", label: "Longitude Origem", type: "number", hint: "-46.63" },
      { key: "destino", label: "Cidade de Destino" },
      { key: "destino_lat", label: "Latitude Destino", type: "number" },
      { key: "destino_lng", label: "Longitude Destino", type: "number" },
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "valor", label: "Valor (R$)", type: "number" },
      { key: "motorista", label: "Motorista" },
      { key: "placa", label: "Placa do Veículo" },
      { key: "status", label: "Status", hint: "Em trânsito · Entregue · Atrasado · Aguardando" },
      { key: "eta", label: "ETA", type: "date" },
    ],
  },
  {
    id: "motoristas",
    label: "Motoristas",
    description: "Equipe ativa, escala, posição atual e desempenho.",
    icon: Users,
    fields: [
      { key: "nome", label: "Nome" },
      { key: "cnh", label: "CNH" },
      { key: "telefone", label: "Telefone" },
      { key: "veiculo", label: "Veículo padrão" },
      { key: "atual_lat", label: "Latitude Atual", type: "number" },
      { key: "atual_lng", label: "Longitude Atual", type: "number" },
      { key: "status", label: "Status", hint: "Disponível · Em rota · Folga" },
      { key: "score", label: "Score", type: "number" },
    ],
  },
  {
    id: "rotas",
    label: "Rotas",
    description: "Trajetos planejados com custo, SLA e paradas.",
    icon: MapPin,
    fields: [
      { key: "nome", label: "Nome da rota" },
      { key: "origem", label: "Origem" },
      { key: "origem_lat", label: "Latitude Origem", type: "number" },
      { key: "origem_lng", label: "Longitude Origem", type: "number" },
      { key: "destino", label: "Destino" },
      { key: "destino_lat", label: "Latitude Destino", type: "number" },
      { key: "destino_lng", label: "Longitude Destino", type: "number" },
      { key: "distancia", label: "Distância (km)", type: "number" },
      { key: "sla", label: "SLA (h)", type: "number" },
      { key: "paradas", label: "Paradas intermediárias" },
    ],
  },
  {
    id: "frota",
    label: "Frota",
    description: "Veículos da operação com posição e situação.",
    icon: Wrench,
    fields: [
      { key: "placa", label: "Placa" },
      { key: "modelo", label: "Modelo" },
      { key: "tipo", label: "Tipo", hint: "Carreta · Truck · VUC · Van" },
      { key: "capacidade", label: "Capacidade (kg)", type: "number" },
      { key: "atual_lat", label: "Latitude Atual", type: "number" },
      { key: "atual_lng", label: "Longitude Atual", type: "number" },
      { key: "status", label: "Status", hint: "Disponível · Em rota · Manutenção" },
      { key: "ultima_manutencao", label: "Última manutenção", type: "date" },
    ],
  },
  {
    id: "bases",
    label: "Bases e Filiais",
    description: "Matriz, filiais e centros de distribuição.",
    icon: Building2,
    fields: [
      { key: "nome", label: "Nome" },
      { key: "tipo", label: "Tipo", hint: "Matriz · Filial · Centro de Distribuição" },
      { key: "endereco", label: "Endereço" },
      { key: "cidade", label: "Cidade / UF" },
      { key: "lat", label: "Latitude", type: "number" },
      { key: "lng", label: "Longitude", type: "number" },
      { key: "responsavel", label: "Responsável" },
    ],
  },
];

const AREA = "logistica";

type TabId = "visao-geral" | (typeof modules)[number]["id"];

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  ...modules.map((m) => ({ id: m.id as TabId, label: m.label, icon: m.icon })),
];

function emptyPayload(m: ModuleConfig) {
  return Object.fromEntries(m.fields.map((f) => [f.key, ""]));
}

function LogisticaPage() {
  const { demoMode } = useDemoMode();
  const [tab, setTab] = useState<TabId>("visao-geral");
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriod());

  const current = modules.find((m) => m.id === tab);

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logística e Distribuição</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {demoMode
              ? "Modo DEMO ligado: exemplos isolados dos dados reais."
              : "Modo DEMO desligado: exibindo dados reais cadastrados."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodPicker value={period} onChange={setPeriod} />
          <button
            onClick={() => toast.info("Use a exportação dentro de cada aba para baixar os dados.")}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Exportar visão geral
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border -mb-px">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "visao-geral" && <OverviewTab />}
      {current && <ModuleTab module={current} />}
    </div>
  );
}

function OverviewTab() {
  const { stats, loading } = useTrackingData();
  return (
    <div className="space-y-5">
      <TrackingMap
        title="Mapa Operacional"
        subtitle="Visualização ao vivo de cargas, motoristas e bases cadastradas."
        height="h-[480px]"
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OverviewCard label="Cargas totais" value={loading ? "—" : String(stats.total)} />
        <OverviewCard label="Em trânsito" value={loading ? "—" : String(stats.trans)} tone="text-primary" />
        <OverviewCard label="Entregues" value={loading ? "—" : String(stats.entregues)} tone="text-success" />
        <OverviewCard label="Atrasadas" value={loading ? "—" : String(stats.atrasadas)} tone="text-destructive" />
      </div>
    </div>
  );
}

function OverviewCard({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function ModuleTab({ module }: { module: ModuleConfig }) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OperationRecord | null>(null);
  const [payload, setPayload] = useState<Record<string, string>>(emptyPayload(module));

  const query = useQuery({
    queryKey: ["operation-records", module.id],
    queryFn: () => listOperationRecords(module.id),
    enabled: !demoMode,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const records = useMemo<OperationRecord[]>(
    () => (demoMode ? [] : query.data ?? []),
    [demoMode, query.data],
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["operation-records", module.id] });
    void queryClient.invalidateQueries({ queryKey: ["operation-records", "logistica", "all"] });
  };

  const createMutation = useMutation({
    mutationFn: createOperationRecord,
    onSuccess: () => {
      toast.success("Registro adicionado.");
      setOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = useMutation({
    mutationFn: updateOperationRecord,
    onSuccess: () => {
      toast.success("Registro atualizado.");
      setOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteOperationRecord,
    onSuccess: () => {
      toast.success("Registro excluído.");
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const beginCreate = () => {
    if (demoMode) return toast.info("Desligue o modo DEMO para cadastrar dados reais.");
    setEditing(null);
    setPayload(emptyPayload(module));
    setOpen(true);
  };
  const beginEdit = (rec: OperationRecord) => {
    if (demoMode) return toast.info("Dados demo não podem ser editados.");
    setEditing(rec);
    setPayload({ ...emptyPayload(module), ...rec.payload });
    setOpen(true);
  };
  const submit = () => {
    if (demoMode) return;
    if (editing) updateMutation.mutate({ id: editing.id, payload });
    else createMutation.mutate({ area: AREA, module: module.id, payload });
  };

  const handleExport = () => {
    if (records.length === 0) {
      toast.info("Nenhum registro para exportar.");
      return;
    }
    const header = module.fields.map((f) => f.label);
    const lines = records.map((r) => module.fields.map((f) => r.payload[f.key] ?? ""));
    const csv = [header, ...lines]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nery-${module.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loading = !demoMode && query.isLoading;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <module.icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">{module.label}</h3>
            <p className="text-xs text-muted-foreground">{module.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="h-9 rounded-lg border border-border px-3 text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
          <button
            onClick={beginCreate}
            className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {module.fields.slice(0, 6).map((f) => (
                <th key={f.key} className="py-3 pr-4 font-medium">
                  {f.label}
                </th>
              ))}
              <th className="py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading &&
              records.map((rec) => (
                <tr key={rec.id} className="border-b border-border last:border-0">
                  {module.fields.slice(0, 6).map((f) => (
                    <td key={f.key} className="py-3 pr-4">
                      {rec.payload[f.key] ?? "—"}
                    </td>
                  ))}
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => beginEdit(rec)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted"
                        aria-label="Editar"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (demoMode) return toast.info("Dados demo não podem ser excluídos.");
                          if (window.confirm("Excluir este registro?")) deleteMutation.mutate(rec.id);
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
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum registro real cadastrado neste módulo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar registro" : "Adicionar registro"}</DialogTitle>
            <DialogDescription>{module.label}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {module.fields.map((f) => (
              <label key={f.key} className="grid gap-1.5 text-sm">
                <span className="text-muted-foreground">
                  {f.label}
                  {f.hint && <span className="ml-1 text-[10px] opacity-70">({f.hint})</span>}
                </span>
                <input
                  type={f.type ?? "text"}
                  step={f.type === "number" ? "any" : undefined}
                  value={payload[f.key] ?? ""}
                  onChange={(e) =>
                    setPayload((cur) => ({ ...cur, [f.key]: e.target.value }))
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

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  CalendarClock,
  CheckSquare,
  Edit3,
  HeartPulse,
  MapPinned,
  PackageCheck,
  Plus,
  Rabbit,
  Route as RouteIcon,
  Sprout,
  Trash2,
  Truck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { CartoMap } from "@/components/carto-map";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { isSupabaseConfigured } from "@/lib/supabase-financial";
import {
  createOperationRecord,
  deleteOperationRecord,
  listOperationRecords,
  OperationRecord,
  updateOperationRecord,
} from "@/lib/supabase-operations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/logistica")({
  head: () => ({
    meta: [
      { title: "Logistica e Distribuicao - Nery Logistica" },
      {
        name: "description",
        content: "Roteirizacao, fretes, embalagens, cestas, expedicao e pecuaria.",
      },
    ],
  }),
  component: LogisticaPage,
});

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
};

type OperationModule = {
  id: string;
  area: "logistica" | "pecuaria";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
};

const modules: OperationModule[] = [
  {
    id: "roteirizacao",
    area: "logistica",
    label: "Roteirizacao de Entrega",
    description: "Otimizacao de rotas urbanas, paradas e motorista.",
    icon: RouteIcon,
    fields: [
      { key: "rota", label: "Rota" },
      { key: "motorista", label: "Motorista" },
      { key: "veiculo", label: "Veiculo" },
      { key: "paradas", label: "Paradas", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "fretes",
    area: "logistica",
    label: "Gestao de Fretes",
    description: "Custos de transporte proprio e logistica externa.",
    icon: Truck,
    fields: [
      { key: "rota", label: "Rota" },
      { key: "transportadora", label: "Transportadora" },
      { key: "km", label: "Km", type: "number" },
      { key: "custo", label: "Custo", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "embalagens",
    area: "logistica",
    label: "Controle de Embalagens",
    description: "Caixas, vidros, rotulos, sacolas e reposicao.",
    icon: Boxes,
    fields: [
      { key: "item", label: "Item" },
      { key: "saldo", label: "Saldo", type: "number" },
      { key: "minimo", label: "Minimo", type: "number" },
      { key: "fornecedor", label: "Fornecedor" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "cestas",
    area: "logistica",
    label: "Cestas e Assinaturas",
    description: "Clientes recorrentes, frequencia, pausa e proxima entrega.",
    icon: PackageCheck,
    fields: [
      { key: "cliente", label: "Cliente" },
      { key: "plano", label: "Plano" },
      { key: "frequencia", label: "Frequencia" },
      { key: "proxima_entrega", label: "Proxima entrega", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "expedicao",
    area: "logistica",
    label: "Checklist de Expedicao",
    description: "Conferencia de itens antes do carregamento.",
    icon: CheckSquare,
    fields: [
      { key: "pedido", label: "Pedido" },
      { key: "itens", label: "Itens", type: "number" },
      { key: "conferidos", label: "Conferidos", type: "number" },
      { key: "responsavel", label: "Responsavel" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "animal",
    area: "pecuaria",
    label: "Ficha Individual por Animal",
    description: "Historico de saude, peso, linhagem e identificacao.",
    icon: Rabbit,
    fields: [
      { key: "identificacao", label: "Identificacao" },
      { key: "especie", label: "Especie" },
      { key: "peso", label: "Peso kg", type: "number" },
      { key: "linhagem", label: "Linhagem" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "vacinacao",
    area: "pecuaria",
    label: "Controle de Vacinacao",
    description: "Calendario sanitario com notificacoes.",
    icon: HeartPulse,
    fields: [
      { key: "animal_grupo", label: "Animal/grupo" },
      { key: "vacina", label: "Vacina" },
      { key: "data", label: "Data", type: "date" },
      { key: "proxima_dose", label: "Proxima dose", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "reprodutivo",
    area: "pecuaria",
    label: "Ciclo Reprodutivo",
    description: "Coberturas, gestacao, nascimentos e previsoes.",
    icon: CalendarClock,
    fields: [
      { key: "matriz", label: "Matriz" },
      { key: "evento", label: "Evento" },
      { key: "data", label: "Data", type: "date" },
      { key: "previsao", label: "Previsao", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "producao-animal",
    area: "pecuaria",
    label: "Producao Diaria",
    description: "Coleta de leite, ovos ou mel por animal ou grupo.",
    icon: WalletCards,
    fields: [
      { key: "grupo", label: "Grupo" },
      { key: "produto", label: "Produto" },
      { key: "quantidade", label: "Quantidade", type: "number" },
      { key: "data", label: "Data", type: "date" },
      { key: "observacao", label: "Observacao" },
    ],
  },
  {
    id: "pastagem",
    area: "pecuaria",
    label: "Gestao de Pastagem",
    description: "Rodizio de piquetes e descanso do solo.",
    icon: Sprout,
    fields: [
      { key: "piquete", label: "Piquete" },
      { key: "lote", label: "Lote" },
      { key: "dias_uso", label: "Dias de uso", type: "number" },
      { key: "dias_descanso", label: "Dias descanso", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
];

const demoRecords: Record<string, OperationRecord[]> = {
  roteirizacao: [
    op("roteirizacao", "1", "logistica", {
      rota: "Centro - Restaurantes",
      motorista: "Marcos Lima",
      veiculo: "HR-V 02",
      paradas: "18",
      status: "Em rota",
    }),
    op("roteirizacao", "2", "logistica", {
      rota: "Zona Norte CSA",
      motorista: "Ana Ribeiro",
      veiculo: "VUC 01",
      paradas: "24",
      status: "Planejada",
    }),
  ],
  fretes: [
    op("fretes", "1", "logistica", {
      rota: "Fazenda - CEASA",
      transportadora: "Terceiro",
      km: "86",
      custo: "720",
      status: "Aprovado",
    }),
  ],
  embalagens: [
    op("embalagens", "1", "logistica", {
      item: "Caixa kraft P",
      saldo: "180",
      minimo: "300",
      fornecedor: "Pack Norte",
      status: "Comprar",
    }),
    op("embalagens", "2", "logistica", {
      item: "Vidro 500ml",
      saldo: "620",
      minimo: "350",
      fornecedor: "Vidros Vale",
      status: "OK",
    }),
  ],
  cestas: [
    op("cestas", "1", "logistica", {
      cliente: "Clube Organicos",
      plano: "Familia",
      frequencia: "Semanal",
      proxima_entrega: "2026-06-03",
      status: "Ativa",
    }),
  ],
  expedicao: [
    op("expedicao", "1", "logistica", {
      pedido: "#CSA-2048",
      itens: "42",
      conferidos: "38",
      responsavel: "Carla",
      status: "Pendente",
    }),
  ],
  animal: [
    op("animal", "1", "pecuaria", {
      identificacao: "OV-019",
      especie: "Galinhas",
      peso: "2.1",
      linhagem: "Rhode Island",
      status: "Produtiva",
    }),
  ],
  vacinacao: [
    op("vacinacao", "1", "pecuaria", {
      animal_grupo: "Lote A",
      vacina: "Newcastle",
      data: "2026-05-12",
      proxima_dose: "2026-08-12",
      status: "Em dia",
    }),
  ],
  reprodutivo: [
    op("reprodutivo", "1", "pecuaria", {
      matriz: "CAB-07",
      evento: "Cobertura",
      data: "2026-05-18",
      previsao: "2026-10-10",
      status: "Acompanhar",
    }),
  ],
  "producao-animal": [
    op("producao-animal", "1", "pecuaria", {
      grupo: "Galinheiro 1",
      produto: "Ovos",
      quantidade: "680",
      data: "2026-05-28",
      observacao: "pico semanal",
    }),
  ],
  pastagem: [
    op("pastagem", "1", "pecuaria", {
      piquete: "Piquete 3",
      lote: "Cabras leiteiras",
      dias_uso: "4",
      dias_descanso: "22",
      status: "Descanso",
    }),
  ],
};

function op(
  module: string,
  id: string,
  area: "logistica" | "pecuaria",
  payload: Record<string, string>,
): OperationRecord {
  return { id: `${module}-demo-${id}`, module, area, payload };
}

function num(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyPayload(module: OperationModule) {
  return Object.fromEntries(module.fields.map((field) => [field.key, ""]));
}

function formatValue(value: string | undefined, field?: FieldConfig) {
  if (!value) return "-";
  if (field?.type === "number") return num(value).toLocaleString("pt-BR");
  return value;
}

function moduleMetric(module: OperationModule, records: OperationRecord[]) {
  switch (module.id) {
    case "roteirizacao":
      return `${records.reduce((sum, r) => sum + num(r.payload.paradas), 0)} paradas`;
    case "fretes":
      return records
        .reduce((sum, r) => sum + num(r.payload.custo), 0)
        .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    case "embalagens":
      return `${records.filter((r) => num(r.payload.saldo) < num(r.payload.minimo)).length} reposicoes`;
    case "cestas":
      return `${records.filter((r) => String(r.payload.status).toLowerCase().includes("ativa")).length} ativas`;
    case "expedicao":
      return `${records.reduce((sum, r) => sum + Math.max(num(r.payload.itens) - num(r.payload.conferidos), 0), 0)} faltantes`;
    case "producao-animal":
      return `${records.reduce((sum, r) => sum + num(r.payload.quantidade), 0).toLocaleString("pt-BR")} un.`;
    default:
      return `${records.length} registros`;
  }
}

function LogisticaPage() {
  const { demoMode } = useDemoMode();
  const queryResults = useQueries({
    queries: modules.map((module) => ({
      queryKey: ["operation-records", module.id],
      queryFn: () => listOperationRecords(module.id),
      enabled: !demoMode,
    })),
  });

  const recordsByModule = useMemo(() => {
    if (demoMode) return demoRecords;
    return Object.fromEntries(
      modules.map((module, index) => [module.id, queryResults[index].data ?? []]),
    ) as Record<string, OperationRecord[]>;
  }, [demoMode, queryResults]);

  const routeCount = recordsByModule.roteirizacao?.length ?? 0;
  const stops = (recordsByModule.roteirizacao ?? []).reduce(
    (sum, r) => sum + num(r.payload.paradas),
    0,
  );
  const freightCost = (recordsByModule.fretes ?? []).reduce(
    (sum, r) => sum + num(r.payload.custo),
    0,
  );
  const activeBoxes = (recordsByModule.cestas ?? []).filter((r) =>
    String(r.payload.status).toLowerCase().includes("ativa"),
  ).length;

  return (
    <div className="min-h-screen bg-black px-5 py-5 text-white">
      <div className="mx-auto max-w-[1700px] overflow-hidden rounded-xl border border-white/10 bg-[#070707] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Logistica e Distribuicao</h1>
            <p className="text-sm text-white/50">
              Entregas, assinaturas, expedicao e pequenos animais em uma operacao unica.
            </p>
          </div>
          <div className="rounded-md border border-white/10 px-3 py-1 text-xs text-white/60">
            {demoMode ? "DEMO" : "REAL"}
          </div>
        </header>

        <main className="space-y-5 p-6">
          {!demoMode && !isSupabaseConfigured && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para salvar dados reais.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <OpsKpi
              icon={RouteIcon}
              label="Rotas ativas"
              value={String(routeCount)}
              hint={`${stops} paradas`}
            />
            <OpsKpi
              icon={Truck}
              label="Fretes"
              value={freightCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              hint="custo externo"
            />
            <OpsKpi
              icon={PackageCheck}
              label="Cestas"
              value={String(activeBoxes)}
              hint="assinaturas ativas"
            />
            <OpsKpi
              icon={Rabbit}
              label="Animais/grupos"
              value={String(recordsByModule.animal?.length ?? 0)}
              hint="monitorados"
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Mapa Operacional</h2>
                    <p className="text-xs text-white/45">CARTO Dark Matter sem token externo</p>
                  </div>
                </div>
                <span className="rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
                  Em rota
                </span>
              </div>
              <CartoMap
                variant="dark"
                className="h-[460px] rounded-none border-0"
                centerLabel="Malha de entregas"
                route={[
                  { x: 18, y: 70 },
                  { x: 34, y: 58 },
                  { x: 52, y: 47 },
                  { x: 68, y: 36 },
                  { x: 82, y: 28 },
                ]}
                points={[
                  { label: "Fazenda", x: 18, y: 70, tone: "success" },
                  { label: "CSA", x: 52, y: 47, tone: "warning" },
                  { label: "Centro", x: 82, y: 28, tone: "primary" },
                ]}
              />
            </section>

            <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <SideMetric label="Entregas hoje" value={String(stops)} hint="paradas planejadas" />
              <SideMetric
                label="Reposicao embalagem"
                value={moduleMetric(modules[2], recordsByModule.embalagens ?? [])}
                hint="abaixo do minimo"
              />
              <SideMetric
                label="Checklist"
                value={moduleMetric(modules[4], recordsByModule.expedicao ?? [])}
                hint="antes do carregamento"
              />
              <SideMetric
                label="Producao animal"
                value={moduleMetric(modules[8], recordsByModule["producao-animal"] ?? [])}
                hint="coleta registrada"
              />
            </aside>
          </div>

          <section className="grid gap-4 lg:grid-cols-2">
            {modules.map((module) => (
              <OperationModuleCard
                key={module.id}
                module={module}
                demoMode={demoMode}
                records={recordsByModule[module.id] ?? []}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

function OpsKpi({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-white/50" />
        <div className="flex gap-1">
          {Array.from({ length: 9 }, (_, index) => (
            <span
              key={index}
              className={cn("h-5 w-1 rounded-full", index > 5 ? "bg-white" : "bg-white/20")}
            />
          ))}
        </div>
      </div>
      <div className="mt-6 text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="text-sm text-white/45">{hint}</div>
    </div>
  );
}

function SideMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-white/45">{hint}</div>
    </div>
  );
}

function OperationModuleCard({
  module,
  demoMode,
  records,
}: {
  module: OperationModule;
  demoMode: boolean;
  records: OperationRecord[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OperationRecord | null>(null);
  const [payload, setPayload] = useState<Record<string, string>>(emptyPayload(module));

  const createMutation = useMutation({
    mutationFn: createOperationRecord,
    onSuccess: () => {
      toast.success("Registro adicionado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["operation-records", module.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateOperationRecord,
    onSuccess: () => {
      toast.success("Registro atualizado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["operation-records", module.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOperationRecord,
    onSuccess: () => {
      toast.success("Registro excluido.");
      void queryClient.invalidateQueries({ queryKey: ["operation-records", module.id] });
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

  const beginEdit = (record: OperationRecord) => {
    if (demoMode) {
      toast.info("Dados demo nao podem ser editados.");
      return;
    }
    setEditing(record);
    setPayload({ ...emptyPayload(module), ...record.payload });
    setOpen(true);
  };

  const submit = () => {
    if (demoMode) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
      return;
    }
    createMutation.mutate({ area: module.area, module: module.id, payload });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <module.icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">{module.label}</h3>
            <p className="text-xs text-white/45">{module.description}</p>
          </div>
        </div>
        <button
          onClick={beginCreate}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-white/10 px-2 text-xs hover:bg-white/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo
        </button>
      </div>
      <div className="mb-3 rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="text-xs text-white/45">Resumo</div>
        <div className="mt-1 text-lg font-semibold">{moduleMetric(module, records)}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-white/40">
              {module.fields.slice(0, 3).map((field) => (
                <th key={field.key} className="py-2 pr-3 font-medium">
                  {field.label}
                </th>
              ))}
              <th className="py-2 text-right font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-white/10 last:border-0">
                {module.fields.slice(0, 3).map((field) => (
                  <td key={field.key} className="py-2 pr-3 text-white/80">
                    {formatValue(record.payload[field.key], field)}
                  </td>
                ))}
                <td className="py-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => beginEdit(record)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 hover:bg-white/10"
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
                        if (window.confirm("Excluir este registro?"))
                          deleteMutation.mutate(record.id);
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-red-300 hover:bg-white/10"
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
                <td colSpan={4} className="py-8 text-center text-sm text-white/45">
                  Nenhum registro real cadastrado.
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
    </div>
  );
}

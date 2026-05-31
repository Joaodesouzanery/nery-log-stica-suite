import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  AudioLines,
  BellRing,
  CalendarDays,
  CloudSun,
  Droplets,
  Edit3,
  LayoutDashboard,
  Leaf,
  MapPinned,
  Microscope,
  Plus,
  QrCode,
  ScanSearch,
  Sprout,
  Tractor,
  Trash2,
  Upload,
  Wheat,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CartoMap, type MapPoint, type MapRoute } from "@/components/carto-map";
import { useDemoMode } from "@/hooks/use-demo-mode";
import {
  createFieldRecord,
  deleteFieldRecord,
  FieldRecord,
  listFieldRecords,
  updateFieldRecord,
} from "@/lib/supabase-field";
import { isSupabaseConfigured } from "@/lib/supabase-financial";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/campo")({
  head: () => ({
    meta: [
      { title: "Campo - Nery Logistica" },
      {
        name: "description",
        content: "Gestao de talhoes, plantio, manejo, rastreabilidade e estimativa de safra.",
      },
    ],
  }),
  component: CampoPage,
});

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "gps" | "url";
  options?: string[];
};

type CampoModule = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
};

type RecordsByModule = Record<string, FieldRecord[]>;

const statusOptions = ["Planejado", "Em andamento", "Concluido", "Alerta", "Bloqueado"];

const campoModules: CampoModule[] = [
  {
    id: "areas",
    label: "Areas e Talhoes",
    shortLabel: "Talhoes",
    description: "Mapeamento visual das areas, historico do solo e coordenadas GPS.",
    icon: MapPinned,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "area_ha", label: "Area ha", type: "number" },
      { key: "cultura", label: "Cultura" },
      { key: "uso_solo", label: "Historico de uso do solo", type: "textarea" },
      { key: "coordenadas", label: "Coordenadas GPS", type: "gps" },
      { key: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  {
    id: "calendario",
    label: "Calendario de Plantio/Colheita",
    shortLabel: "Calendario",
    description: "Cronograma visual baseado em sazonalidade e alertas de colheita.",
    icon: CalendarDays,
    fields: [
      { key: "cultura", label: "Cultura" },
      { key: "talhao", label: "Talhao" },
      { key: "plantio_inicio", label: "Janela plantio inicio", type: "date" },
      { key: "colheita_prevista", label: "Colheita prevista", type: "date" },
      { key: "sazonalidade", label: "Sazonalidade" },
      {
        key: "alerta",
        label: "Alerta de colheita",
        type: "select",
        options: ["7 dias", "15 dias", "30 dias"],
      },
    ],
  },
  {
    id: "diario",
    label: "Diario de Campo Digital",
    shortLabel: "Diario",
    description: "Notas, fotos, audio e observacoes com geolocalizacao.",
    icon: AudioLines,
    fields: [
      { key: "titulo", label: "Titulo" },
      { key: "talhao", label: "Talhao" },
      { key: "observacao", label: "Observacao", type: "textarea" },
      { key: "foto_url", label: "Foto URL", type: "url" },
      { key: "audio_url", label: "Audio URL", type: "url" },
      { key: "gps", label: "GPS", type: "gps" },
      { key: "offline_status", label: "Registro offline-first" },
    ],
  },
  {
    id: "insumos",
    label: "Registro de Insumos",
    shortLabel: "Insumos",
    description: "Sementes, fertilizantes e defensivos aplicados por talhao.",
    icon: Leaf,
    fields: [
      { key: "insumo", label: "Insumo" },
      {
        key: "tipo",
        label: "Tipo",
        type: "select",
        options: ["Semente", "Fertilizante", "Defensivo"],
      },
      { key: "talhao", label: "Talhao" },
      { key: "dose", label: "Dose" },
      { key: "carencia", label: "Carencia dias", type: "number" },
      { key: "custo_hectare", label: "Custo por hectare", type: "number" },
    ],
  },
  {
    id: "pragas",
    label: "Manejo de Pragas e Doencas",
    shortLabel: "Pragas",
    description: "Historico de ocorrencias, mapa de focos e tratamentos.",
    icon: ScanSearch,
    fields: [
      { key: "ocorrencia", label: "Ocorrencia" },
      { key: "talhao", label: "Talhao" },
      {
        key: "severidade",
        label: "Severidade",
        type: "select",
        options: ["Baixa", "Media", "Alta"],
      },
      { key: "tratamento", label: "Tratamento", type: "textarea" },
      { key: "receituario", label: "Receituario agronomico" },
      { key: "gps", label: "GPS do foco", type: "gps" },
      { key: "carencia", label: "Carencia pos-aplicacao", type: "number" },
    ],
  },
  {
    id: "lotes",
    label: "Rastreabilidade de Lotes",
    shortLabel: "Lotes",
    description: "QR Code por lote, cadeia de custodia e conformidade organica.",
    icon: QrCode,
    fields: [
      { key: "lote", label: "Lote" },
      { key: "origem", label: "Origem" },
      { key: "talhao", label: "Talhao" },
      { key: "custodia", label: "Cadeia de custodia", type: "textarea" },
      {
        key: "conformidade",
        label: "Conformidade organica",
        type: "select",
        options: ["Conforme", "Em analise", "Nao conforme"],
      },
    ],
  },
  {
    id: "solo",
    label: "Gestao de Solo",
    shortLabel: "Solo",
    description: "Analises quimicas, calagem e historico por talhao.",
    icon: Microscope,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "ph", label: "pH", type: "number" },
      { key: "mo", label: "MO", type: "number" },
      { key: "ctc", label: "CTC", type: "number" },
      { key: "calagem", label: "Recomendacao de calagem", type: "textarea" },
      { key: "data_laudo", label: "Data do laudo", type: "date" },
    ],
  },
  {
    id: "irrigacao",
    label: "Controle de Irrigacao",
    shortLabel: "Irrigacao",
    description: "Turnos de rega, consumo por talhao e integracao IoT preparada.",
    icon: Droplets,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "turno", label: "Turno automatico" },
      { key: "consumo_m3", label: "Consumo m3", type: "number" },
      { key: "sensor_iot", label: "Sensor IoT" },
      { key: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  {
    id: "meteorologia",
    label: "Previsao Meteorologica",
    shortLabel: "Clima",
    description: "Previsao de 7 dias, alertas push preparados e historico climatico.",
    icon: CloudSun,
    fields: [
      { key: "local", label: "Local" },
      { key: "periodo", label: "Periodo" },
      {
        key: "risco",
        label: "Risco",
        type: "select",
        options: ["Geada", "Chuva", "Seca", "Normal"],
      },
      { key: "previsao_7d", label: "Previsao 7 dias", type: "textarea" },
      { key: "alerta_push", label: "Alerta push" },
    ],
  },
  {
    id: "maquinario",
    label: "Gestao de Maquinario",
    shortLabel: "Maquinas",
    description: "Manutencao preventiva, horimetro e custo operacional.",
    icon: Tractor,
    fields: [
      { key: "maquina", label: "Maquina" },
      { key: "horimetro", label: "Horimetro", type: "number" },
      { key: "troca_oleo", label: "Troca de oleo", type: "date" },
      { key: "manutencao", label: "Alerta de manutencao" },
      { key: "custo_operacional", label: "Custo operacional", type: "number" },
    ],
  },
  {
    id: "estimativa",
    label: "Estimativa de Safra",
    shortLabel: "Safra",
    description: "Produtividade esperada, historico e cenarios por talhao.",
    icon: Wheat,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "cultura", label: "Cultura" },
      { key: "produtividade", label: "Produtividade esperada", type: "number" },
      { key: "historico", label: "Comparacao historica" },
      {
        key: "cenario",
        label: "Cenario",
        type: "select",
        options: ["Otimista", "Base", "Pessimista"],
      },
    ],
  },
  {
    id: "planejamento",
    label: "Planejamento de Plantio por Talhao",
    shortLabel: "Plantio",
    description: "Variedade, taxa de semeadura, espacamento e janela de plantio.",
    icon: Sprout,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "variedade", label: "Variedade" },
      { key: "taxa_semeadura", label: "Taxa de semeadura" },
      { key: "espacamento", label: "Espacamento" },
      { key: "meta_produtividade", label: "Meta produtividade", type: "number" },
      { key: "janela_valida", label: "Validacao da janela" },
    ],
  },
  {
    id: "prescricao",
    label: "Mapa de Prescricao",
    shortLabel: "Prescricao",
    description: "Taxa variavel por zona, exportacao para maquina preparada e historico.",
    icon: MapPinned,
    fields: [
      { key: "zona", label: "Zona de manejo" },
      { key: "talhao", label: "Talhao" },
      { key: "semente", label: "Semente" },
      { key: "fertilizante", label: "Fertilizante" },
      { key: "defensivo", label: "Defensivo" },
      { key: "exportacao", label: "Arquivo para maquina" },
    ],
  },
  {
    id: "modelo",
    label: "Monitoramento + Modelo de Cultura",
    shortLabel: "Modelo",
    description: "Simulacao de crescimento por clima, solo, manejo e genetica.",
    icon: Leaf,
    fields: [
      { key: "cultura", label: "Cultura" },
      { key: "talhao", label: "Talhao" },
      { key: "estagio", label: "Estagio fenologico" },
      { key: "projecao", label: "Projecao produtividade", type: "number" },
      { key: "sensibilidade", label: "Sensibilidade ao clima", type: "textarea" },
    ],
  },
  {
    id: "scouting",
    label: "Scouting de Campo",
    shortLabel: "Scouting",
    description: "Notas, fotos e alertas georreferenciados para o agronomo.",
    icon: ScanSearch,
    fields: [
      { key: "alerta", label: "Alerta" },
      { key: "talhao", label: "Talhao" },
      { key: "foto_url", label: "Foto URL", type: "url" },
      { key: "gps", label: "GPS", type: "gps" },
      { key: "responsavel", label: "Agronomo" },
      { key: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
  {
    id: "pre-colheita",
    label: "Estimativa Pre-Colheita",
    shortLabel: "Pre-colheita",
    description: "Amostragem digital para logistica, contratos e projecao por talhao.",
    icon: Wheat,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "amostragem", label: "Amostragem digital", type: "textarea" },
      { key: "projecao", label: "Projecao por talhao", type: "number" },
      { key: "contratos", label: "Saida para contratos" },
    ],
  },
  {
    id: "analise-solo",
    label: "Analise de Solo Integrada",
    shortLabel: "Laudos",
    description: "Importacao de laudos, recomendacao automatica e historico por camada.",
    icon: Upload,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "laudo_url", label: "Laudo URL", type: "url" },
      { key: "camada", label: "Camada" },
      { key: "recomendacao", label: "Recomendacao automatica", type: "textarea" },
      { key: "data", label: "Data", type: "date" },
    ],
  },
  {
    id: "nitrogenio",
    label: "Gestao de Nitrogenio",
    shortLabel: "Nitrogenio",
    description: "Dose preditiva por clima e solo, janelas e risco de chuva.",
    icon: Leaf,
    fields: [
      { key: "talhao", label: "Talhao" },
      { key: "dose", label: "Dose preditiva", type: "number" },
      { key: "janela", label: "Janela de aplicacao" },
      { key: "risco_chuva", label: "Risco de perda por chuva" },
      { key: "status", label: "Status", type: "select", options: statusOptions },
    ],
  },
];

const demoRecords: RecordsByModule = {
  areas: [
    record("areas", "1", {
      talhao: "Talhao A",
      area_ha: "18",
      cultura: "Hortalicas",
      uso_solo: "Rotacao com milho verde e adubacao organica.",
      coordenadas: "22,70;36,56;55,48;72,40",
      status: "Em andamento",
    }),
    record("areas", "2", {
      talhao: "Talhao B",
      area_ha: "12",
      cultura: "Mandioca",
      uso_solo: "Pousio curto e cobertura vegetal.",
      coordenadas: "20,42;38,36;55,30;70,25",
      status: "Planejado",
    }),
  ],
  calendario: [
    record("calendario", "1", {
      cultura: "Hortalicas",
      talhao: "Talhao A",
      plantio_inicio: "2026-06-05",
      colheita_prevista: "2026-08-12",
      sazonalidade: "Inverno seco",
      alerta: "15 dias",
    }),
  ],
  diario: [
    record("diario", "1", {
      titulo: "Vistoria pos-chuva",
      talhao: "Talhao A",
      observacao: "Solo com boa infiltracao e sem erosao visivel.",
      foto_url: "",
      audio_url: "",
      gps: "-23.5505,-46.6333",
      offline_status: "Sincronizado",
    }),
  ],
  insumos: [
    record("insumos", "1", {
      insumo: "Composto organico",
      tipo: "Fertilizante",
      talhao: "Talhao A",
      dose: "2 t/ha",
      carencia: "0",
      custo_hectare: "480",
    }),
  ],
  pragas: [
    record("pragas", "1", {
      ocorrencia: "Lagarta",
      talhao: "Talhao A",
      severidade: "Media",
      tratamento: "Monitorar bordadura e aplicar biologico se aumentar.",
      receituario: "BIO-2026-009",
      gps: "52,47",
      carencia: "3",
    }),
  ],
  lotes: [
    record("lotes", "1", {
      lote: "ORG-2026-001",
      origem: "Talhao A",
      talhao: "Talhao A",
      custodia: "Colheita, higienizacao, embalagem e expedicao registrados.",
      conformidade: "Conforme",
    }),
  ],
};

function record(module: string, id: string, payload: Record<string, string>): FieldRecord {
  return { id: `${module}-demo-${id}`, module, payload };
}

function num(value: unknown) {
  const parsed = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyPayload(module: CampoModule) {
  return Object.fromEntries(module.fields.map((field) => [field.key, ""]));
}

function formatValue(value: string | undefined, field?: FieldConfig) {
  if (!value) return "-";
  if (field?.type === "number") return num(value).toLocaleString("pt-BR");
  return value;
}

function parseRoute(value: unknown) {
  const points = String(value ?? "")
    .split(";")
    .map((pair) => {
      const [x, y] = pair.split(",").map((part) => num(part.trim()));
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
    })
    .filter((point): point is { x: number; y: number } => Boolean(point));
  return points.length > 1 ? points : [];
}

function parseFocus(value: unknown) {
  const [x, y] = String(value ?? "")
    .split(",")
    .map((part) => num(part.trim()));
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined;
}

function moduleSummary(module: CampoModule, records: FieldRecord[]) {
  switch (module.id) {
    case "areas":
      return {
        headline: `${records.reduce((sum, item) => sum + num(item.payload.area_ha), 0).toLocaleString("pt-BR")} ha`,
        caption: `${records.length} talhoes mapeados`,
      };
    case "insumos":
      return {
        headline: records
          .reduce((sum, item) => sum + num(item.payload.custo_hectare), 0)
          .toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
        caption: "custo/ha registrado",
      };
    case "pragas":
      return {
        headline: String(records.filter((item) => item.payload.severidade === "Alta").length),
        caption: "focos criticos",
      };
    default:
      return { headline: String(records.length), caption: "registros" };
  }
}

function queueOfflineDiary(payload: Record<string, string>) {
  const key = "nery-campo-diario-pendente";
  const current = JSON.parse(localStorage.getItem(key) || "[]") as Array<Record<string, string>>;
  localStorage.setItem(
    key,
    JSON.stringify([{ ...payload, offline_status: "Pendente" }, ...current]),
  );
}

function CampoPage() {
  const { demoMode } = useDemoMode();
  const queryResults = useQueries({
    queries: campoModules.map((module) => ({
      queryKey: ["field-records", module.id],
      queryFn: () => listFieldRecords(module.id),
      enabled: !demoMode,
    })),
  });

  const recordsByModule = useMemo(() => {
    if (demoMode) return demoRecords;
    return Object.fromEntries(
      campoModules.map((module, index) => [module.id, queryResults[index].data ?? []]),
    ) as RecordsByModule;
  }, [demoMode, queryResults]);

  const talhoes = recordsByModule.areas ?? [];
  const routes = talhoes
    .map((item) => {
      const points = parseRoute(item.payload.coordenadas);
      if (!points.length) return null;
      return {
        id: item.id,
        label: item.payload.talhao || "Talhao",
        points,
        status: item.payload.status,
        description: item.payload.uso_solo,
        tone: "success" as const,
        meta: {
          Cultura: item.payload.cultura,
          Area: item.payload.area_ha ? `${item.payload.area_ha} ha` : undefined,
        },
      };
    })
    .filter((route): route is NonNullable<typeof route> => Boolean(route));
  const pragaPoints = (recordsByModule.pragas ?? [])
    .map((item) => {
      const point = parseFocus(item.payload.gps);
      if (!point) return null;
      return {
        id: item.id,
        label: item.payload.ocorrencia || "Foco",
        x: point.x,
        y: point.y,
        tone: item.payload.severidade === "Alta" ? ("danger" as const) : ("warning" as const),
        status: item.payload.severidade,
        description: item.payload.tratamento,
      };
    })
    .filter((point): point is NonNullable<typeof point> => Boolean(point));

  const hectares = talhoes.reduce((sum, item) => sum + num(item.payload.area_ha), 0);
  const alerts = [...(recordsByModule.pragas ?? []), ...(recordsByModule.meteorologia ?? [])]
    .length;

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Talhoes, manejo, rastreabilidade, clima e planejamento agricola em uma tela operacional.
          </p>
        </div>
        <div className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground">
          {demoMode ? "DEMO" : "REAL"}
        </div>
      </div>

      <div className="space-y-6">
        {!demoMode && !isSupabaseConfigured && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
            Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para salvar dados reais no Campo.
          </div>
        )}

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_430px]">
            <div>
              <div className="grid gap-3 md:grid-cols-4">
                <CampoKpi label="Talhoes" value={String(talhoes.length)} hint="areas cadastradas" />
                <CampoKpi
                  label="Area total"
                  value={`${hectares.toLocaleString("pt-BR")} ha`}
                  hint="mapeada"
                />
                <CampoKpi label="Alertas" value={String(alerts)} hint="campo e clima" />
                <CampoKpi
                  label="Lotes"
                  value={String(recordsByModule.lotes?.length ?? 0)}
                  hint="rastreaveis"
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {campoModules.map((module) => {
                  const summary = moduleSummary(module, recordsByModule[module.id] ?? []);
                  return (
                    <a
                      key={module.id}
                      href={`#${module.id}`}
                      className="rounded-lg border border-border bg-background/60 p-3 text-sm transition hover:bg-muted/60"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <module.icon className="h-4 w-4 text-primary" />
                        <span className="truncate">{module.shortLabel}</span>
                      </div>
                      <div className="mt-2 text-lg font-semibold">{summary.headline}</div>
                      <div className="text-xs text-muted-foreground">{summary.caption}</div>
                    </a>
                  );
                })}
              </div>
            </div>
            <CartoMap
              variant="positron"
              className="h-[380px]"
              centerLabel="Mapa de talhoes"
              routes={routes}
              points={pragaPoints}
              route={routes[0]?.points}
            />
          </div>
        </section>

        <div className="grid gap-5">
          {campoModules.map((module) => (
            <CampoModuleSection
              key={module.id}
              module={module}
              demoMode={demoMode}
              records={recordsByModule[module.id] ?? []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CampoKpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function CampoModuleSection({
  module,
  demoMode,
  records,
}: {
  module: CampoModule;
  demoMode: boolean;
  records: FieldRecord[];
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FieldRecord | null>(null);
  const [payload, setPayload] = useState<Record<string, string>>(emptyPayload(module));
  const summary = moduleSummary(module, records);

  const createMutation = useMutation({
    mutationFn: createFieldRecord,
    onSuccess: () => {
      toast.success("Registro adicionado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["field-records", module.id] });
    },
    onError: (error) => {
      if (module.id === "diario") {
        queueOfflineDiary(payload);
        toast.info("Registro salvo na fila offline do Diario.");
        setOpen(false);
        return;
      }
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFieldRecord,
    onSuccess: () => {
      toast.success("Registro atualizado.");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["field-records", module.id] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFieldRecord,
    onSuccess: () => {
      toast.success("Registro excluido.");
      void queryClient.invalidateQueries({ queryKey: ["field-records", module.id] });
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

  const beginEdit = (recordItem: FieldRecord) => {
    if (demoMode) {
      toast.info("Dados demo nao podem ser editados.");
      return;
    }
    setEditing(recordItem);
    setPayload({ ...emptyPayload(module), ...recordItem.payload });
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
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <module.icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">{module.label}</h3>
            <p className="text-xs text-muted-foreground">{module.description}</p>
          </div>
        </div>
        <button
          onClick={beginCreate}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <CampoKpi label="Resumo" value={summary.headline} hint={summary.caption} />
        <CampoKpi
          label="Registros"
          value={String(records.length)}
          hint={demoMode ? "somente leitura" : "editavel"}
        />
        <CampoKpi
          label="Automacao"
          value={module.id === "diario" ? "Offline" : "Ativa"}
          hint="v1 funcional"
        />
      </div>

      {module.id === "lotes" && <LotTraceability records={records} />}
      {module.id === "calendario" && <CalendarStrip records={records} />}
      {module.id === "diario" && <OfflineNote />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {module.fields.slice(0, 5).map((field) => (
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
                {module.fields.slice(0, 5).map((field) => (
                  <td key={field.key} className="py-3 pr-4 max-w-64 truncate">
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
                        if (window.confirm("Excluir este registro?"))
                          deleteMutation.mutate(recordItem.id);
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
                  colSpan={module.fields.slice(0, 5).length + 1}
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
              <FieldInput
                key={field.key}
                field={field}
                value={payload[field.key] ?? ""}
                onChange={(value) => setPayload((current) => ({ ...current, [field.key]: value }))}
              />
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

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  const baseClass =
    "rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  const fillGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalizacao indisponivel neste navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        onChange(`${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`),
      () => toast.error("Nao foi possivel capturar o GPS."),
    );
  };

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="text-muted-foreground">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(baseClass, "min-h-24 py-2")}
        />
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(baseClass, "h-10")}
        >
          <option value="">Selecione</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "gps" ? (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="lat,lng ou x,y;..."
            className={cn(baseClass, "h-10 flex-1")}
          />
          <button
            type="button"
            onClick={fillGps}
            className="h-10 rounded-md border border-border px-3 text-xs hover:bg-muted"
          >
            GPS
          </button>
        </div>
      ) : (
        <input
          type={field.type === "url" ? "url" : (field.type ?? "text")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(baseClass, "h-10")}
        />
      )}
    </label>
  );
}

function LotTraceability({ records }: { records: FieldRecord[] }) {
  if (!records.length) return null;
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      {records.slice(0, 3).map((recordItem) => (
        <div key={recordItem.id} className="rounded-lg border border-border bg-background/60 p-3">
          <div className="flex items-center gap-3">
            <FakeQr value={recordItem.payload.lote || recordItem.id} />
            <div>
              <div className="font-medium">{recordItem.payload.lote || "Lote"}</div>
              <div className="text-xs text-muted-foreground">
                {recordItem.payload.conformidade || "Sem conformidade"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FakeQr({ value }: { value: string }) {
  const cells = Array.from(
    { length: 25 },
    (_, index) => (value.charCodeAt(index % value.length) + index) % 3 !== 0,
  );
  return (
    <div className="grid h-12 w-12 grid-cols-5 gap-0.5 rounded-md border border-border bg-white p-1">
      {cells.map((filled, index) => (
        <span key={index} className={cn("rounded-[1px]", filled ? "bg-black" : "bg-white")} />
      ))}
    </div>
  );
}

function CalendarStrip({ records }: { records: FieldRecord[] }) {
  if (!records.length) return null;
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      {records.slice(0, 3).map((recordItem) => (
        <div key={recordItem.id} className="rounded-lg border border-border bg-background/60 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BellRing className="h-4 w-4 text-primary" />
            {recordItem.payload.cultura || "Cultura"}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Plantio {recordItem.payload.plantio_inicio || "-"} / Colheita{" "}
            {recordItem.payload.colheita_prevista || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}

function OfflineNote() {
  return (
    <div className="mb-4 rounded-lg border border-border bg-background/60 p-3 text-sm text-muted-foreground">
      O Diario salva registros em uma fila local se o Supabase estiver indisponivel. Campos de foto
      e audio aceitam URL nesta v1.
    </div>
  );
}

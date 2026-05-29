import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Download, Edit3, Plus, Trash2, Truck, Users, MapPin } from "lucide-react";
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

export const Route = createFileRoute("/logistica")({
  head: () => ({
    meta: [
      { title: "Logística e Distribuição - Nery Logística" },
      {
        name: "description",
        content: "Cadastro e acompanhamento de cargas, motoristas e rotas da operação Nery.",
      },
    ],
  }),
  component: LogisticaPage,
});

type FieldConfig = { key: string; label: string; type?: "text" | "number" | "date" };

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
    description: "Pedidos em separação, em trânsito e entregues.",
    icon: Truck,
    fields: [
      { key: "codigo", label: "Código" },
      { key: "origem", label: "Origem" },
      { key: "destino", label: "Destino" },
      { key: "peso", label: "Peso (kg)", type: "number" },
      { key: "status", label: "Status" },
      { key: "data", label: "Data", type: "date" },
    ],
  },
  {
    id: "motoristas",
    label: "Motoristas",
    description: "Equipe ativa, escala e desempenho.",
    icon: Users,
    fields: [
      { key: "nome", label: "Nome" },
      { key: "cnh", label: "CNH" },
      { key: "veiculo", label: "Veículo" },
      { key: "telefone", label: "Telefone" },
      { key: "score", label: "Score", type: "number" },
    ],
  },
  {
    id: "rotas",
    label: "Rotas",
    description: "Trajetos planejados com custo e SLA.",
    icon: MapPin,
    fields: [
      { key: "nome", label: "Rota" },
      { key: "origem", label: "Origem" },
      { key: "destino", label: "Destino" },
      { key: "distancia", label: "Distância (km)", type: "number" },
      { key: "sla", label: "SLA (h)", type: "number" },
    ],
  },
];

const AREA = "logistica";

function emptyPayload(m: ModuleConfig) {
  return Object.fromEntries(m.fields.map((f) => [f.key, ""]));
}

function LogisticaPage() {
  const { demoMode } = useDemoMode();

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logística e Distribuição</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {demoMode
              ? "Modo DEMO ligado: exemplos isolados dos dados reais."
              : "Modo DEMO desligado: exibindo dados reais cadastrados."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Período aplicado: Janeiro 2026.")}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Calendar className="w-4 h-4" />
            Janeiro 2026
          </button>
          <button
            onClick={() => toast.info("Exportação preparada para cargas reais.")}
            className="h-10 px-4 rounded-lg border border-border bg-card text-sm flex items-center gap-2 hover:bg-muted"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        {modules.map((m) => (
          <ModuleSection key={m.id} module={m} demoMode={demoMode} />
        ))}
      </div>
    </div>
  );
}

function ModuleSection({ module, demoMode }: { module: ModuleConfig; demoMode: boolean }) {
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

  const records = useMemo<OperationRecord[]>(() => (demoMode ? [] : query.data ?? []), [demoMode, query.data]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["operation-records", module.id] });

  const createMutation = useMutation({
    mutationFn: createOperationRecord,
    onSuccess: () => {
      toast.success("Registro adicionado.");
      setOpen(false);
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = useMutation({
    mutationFn: updateOperationRecord,
    onSuccess: () => {
      toast.success("Registro atualizado.");
      setOpen(false);
      void invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteOperationRecord,
    onSuccess: () => {
      toast.success("Registro excluído.");
      void invalidate();
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {module.fields.map((f) => (
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
                <td colSpan={module.fields.length + 1} className="py-10 text-center text-sm text-muted-foreground">
                  Carregando…
                </td>
              </tr>
            )}
            {!loading &&
              records.map((rec) => (
                <tr key={rec.id} className="border-b border-border last:border-0">
                  {module.fields.map((f) => (
                    <td key={f.key} className="py-3 pr-4">
                      {rec.payload[f.key] ?? "-"}
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
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-destructive hover:bg-muted",
                        )}
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
                <td colSpan={module.fields.length + 1} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum registro real cadastrado neste módulo.
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
            {module.fields.map((f) => (
              <label key={f.key} className="grid gap-1.5 text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <input
                  type={f.type ?? "text"}
                  value={payload[f.key] ?? ""}
                  onChange={(e) => setPayload((cur) => ({ ...cur, [f.key]: e.target.value }))}
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </label>
            ))}
          </div>
          <DialogFooter>
            <button onClick={() => setOpen(false)} className="h-9 rounded-lg border border-border px-3 text-sm">
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

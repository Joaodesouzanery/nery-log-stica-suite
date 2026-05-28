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

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date";
};

type ModuleConfig = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldConfig[];
};

const commonMoneyFields: FieldConfig[] = [
  { key: "nome", label: "Nome" },
  { key: "categoria", label: "Categoria" },
  { key: "valor", label: "Valor", type: "number" },
  { key: "status", label: "Status" },
];

const financialModules: ModuleConfig[] = [
  {
    id: "fluxo",
    label: "Fluxo de Caixa & Custos",
    description: "Entradas, saidas, custo por unidade e DRE simplificado.",
    icon: Banknote,
    fields: [...commonMoneyFields, { key: "data", label: "Data", type: "date" }],
  },
  {
    id: "inadimplencia",
    label: "Controle de Inadimplencia",
    description: "Cronograma de vencimentos, alertas e regua de cobranca.",
    icon: AlertTriangle,
    fields: [
      { key: "cliente", label: "Cliente" },
      { key: "valor", label: "Valor", type: "number" },
      { key: "vencimento", label: "Vencimento", type: "date" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "custos",
    label: "Custos por Unidade",
    description: "Custo por duzia, saca ou kg com margem unitaria.",
    icon: Calculator,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "unidade", label: "Unidade" },
      { key: "custo", label: "Custo", type: "number" },
      { key: "preco", label: "Preco de venda", type: "number" },
    ],
  },
  {
    id: "estoque",
    label: "Estoque de Produtos Acabados",
    description: "Saldo em tempo real, validade e reserva por pedido.",
    icon: Boxes,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "sku", label: "SKU" },
      { key: "saldo", label: "Saldo", type: "number" },
      { key: "validade", label: "Validade", type: "date" },
    ],
  },
  {
    id: "equilibrio",
    label: "Ponto de Equilibrio",
    description: "Quanto vender para cobrir custos.",
    icon: Scale,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "preco", label: "Preco", type: "number" },
      { key: "custo_variavel", label: "Custo variavel", type: "number" },
      { key: "custo_fixo", label: "Custo fixo", type: "number" },
    ],
  },
  {
    id: "compras",
    label: "Gestao de Compras",
    description: "Necessidade de insumos, cotacao e aprovacao.",
    icon: ShoppingCart,
    fields: [
      { key: "insumo", label: "Insumo" },
      { key: "fornecedor", label: "Fornecedor" },
      { key: "quantidade", label: "Quantidade", type: "number" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: "credito",
    label: "Credito Rural",
    description: "Financiamentos, parcelas, juros e saldo devedor.",
    icon: Landmark,
    fields: [
      { key: "contrato", label: "Contrato" },
      { key: "banco", label: "Banco" },
      { key: "saldo", label: "Saldo devedor", type: "number" },
      { key: "vencimento", label: "Vencimento", type: "date" },
    ],
  },
  {
    id: "precos",
    label: "Tabela de Precos Dinamica",
    description: "Regras por canal, volume e periodo promocional.",
    icon: Tags,
    fields: [
      { key: "produto", label: "Produto" },
      { key: "canal", label: "Canal" },
      { key: "preco", label: "Preco", type: "number" },
      { key: "promocao", label: "Promocao" },
    ],
  },
  {
    id: "hectare",
    label: "Custo por Hectare",
    description: "Real x planejado por talhao e safra.",
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
    description: "Insumos, mao de obra, maquinario e desembolso.",
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
    description: "Custo por area, vencimentos e reajustes.",
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

const demoRecords: Record<string, FinancialRecord[]> = Object.fromEntries(
  financialModules.map((module) => [
    module.id,
    [
      {
        id: `${module.id}-demo-1`,
        module: module.id,
        payload: Object.fromEntries(
          module.fields.map((field, index) => [
            field.key,
            field.type === "number"
              ? String([12500, 850, 36, 4200][index] ?? 100)
              : field.type === "date"
                ? "2026-02-15"
                : `${field.label} demo`,
          ]),
        ),
      },
      {
        id: `${module.id}-demo-2`,
        module: module.id,
        payload: Object.fromEntries(
          module.fields.map((field, index) => [
            field.key,
            field.type === "number"
              ? String([8300, 240, 18, 1900][index] ?? 50)
              : field.type === "date"
                ? "2026-03-10"
                : `${field.label} demo 2`,
          ]),
        ),
      },
    ],
  ]),
);

function formatValue(value: string | undefined, field?: FieldConfig) {
  if (!value) return "-";
  if (field?.type === "number") {
    const number = Number(value);
    if (Number.isFinite(number)) return number.toLocaleString("pt-BR");
  }
  return value;
}

function sumNumeric(records: FinancialRecord[]) {
  return records.reduce((total, record) => {
    const firstNumber = Object.values(record.payload).find((value) =>
      Number.isFinite(Number(value)),
    );
    return total + (firstNumber ? Number(firstNumber) : 0);
  }, 0);
}

function emptyPayload(module: ModuleConfig) {
  return Object.fromEntries(module.fields.map((field) => [field.key, ""]));
}

export function FinancialAgroCrud() {
  const { demoMode } = useDemoMode();
  const [active, setActive] = useState(financialModules[0].id);
  const activeModule =
    financialModules.find((module) => module.id === active) ?? financialModules[0];

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto border border-border bg-card rounded-lg p-2">
        <div className="flex min-w-max gap-1">
          {financialModules.map((module) => {
            const selected = active === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setActive(module.id)}
                className={cn(
                  "h-9 px-3 rounded-md text-sm flex items-center gap-2 whitespace-nowrap transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <module.icon className="h-4 w-4" />
                {module.label}
              </button>
            );
          })}
        </div>
      </div>

      <ModuleCrud key={activeModule.id} module={activeModule} demoMode={demoMode} />
    </div>
  );
}

function ModuleCrud({ module, demoMode }: { module: ModuleConfig; demoMode: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialRecord | null>(null);
  const [payload, setPayload] = useState<Record<string, string>>(emptyPayload(module));

  const query = useQuery({
    queryKey: ["financial-records", module.id],
    queryFn: () => listFinancialRecords(module.id),
    enabled: !demoMode,
  });

  const records = useMemo(
    () => (demoMode ? (demoRecords[module.id] ?? []) : (query.data ?? [])),
    [demoMode, module.id, query.data],
  );
  const total = useMemo(() => sumNumeric(records), [records]);

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

  const beginEdit = (record: FinancialRecord) => {
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
    createMutation.mutate({ module: module.id, payload });
  };

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{module.label}</h2>
          <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
        </div>
        <button
          onClick={beginCreate}
          className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {!demoMode && !isSupabaseConfigured && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
          Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para carregar e salvar dados reais no
          Supabase.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Registros" value={String(records.length)} />
        <Kpi label="Total numerico" value={total.toLocaleString("pt-BR")} />
        <Kpi label="Origem" value={demoMode ? "DEMO" : "REAL"} />
        <Kpi
          label="Status"
          value={
            demoMode ? "Somente leitura" : isSupabaseConfigured ? "Supabase" : "Config pendente"
          }
        />
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                {module.fields.map((field) => (
                  <th key={field.key} className="py-3 pr-4 font-medium">
                    {field.label}
                  </th>
                ))}
                <th className="py-3 font-medium text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading && !demoMode && (
                <tr>
                  <td
                    colSpan={module.fields.length + 1}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Carregando dados reais...
                  </td>
                </tr>
              )}
              {records.map((record) => (
                <tr key={record.id} className="border-b border-border last:border-0">
                  {module.fields.map((field) => (
                    <td key={field.key} className="py-3 pr-4">
                      {formatValue(record.payload[field.key], field)}
                    </td>
                  ))}
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => beginEdit(record)}
                        className="h-8 w-8 rounded-md border border-border inline-flex items-center justify-center hover:bg-muted"
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
                        className="h-8 w-8 rounded-md border border-border inline-flex items-center justify-center text-destructive hover:bg-muted"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!query.isLoading && records.length === 0 && (
                <tr>
                  <td
                    colSpan={module.fields.length + 1}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum registro real cadastrado nesta aba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
              className="h-9 px-3 rounded-lg border border-border text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={submit}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tracking-tight mt-1">{value}</div>
    </div>
  );
}

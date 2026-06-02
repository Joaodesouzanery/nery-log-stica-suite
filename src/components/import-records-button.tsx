import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import readXlsxFile from "read-excel-file/browser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ImportField = {
  key: string;
  label: string;
  type?: string;
};

type ImportRecordsButtonProps = {
  fields: ImportField[];
  disabled?: boolean;
  className?: string;
  onImport: (rows: Record<string, string>[]) => unknown | Promise<unknown>;
};

type ImportStep = "map" | "preview";

type ValidationIssue = {
  row: number;
  field: string;
  message: string;
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function cellToString(value: unknown) {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function detectDelimiter(line: string) {
  const comma = (line.match(/,/g) ?? []).length;
  const semicolon = (line.match(/;/g) ?? []).length;
  return semicolon > comma ? ";" : ",";
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  const delimiter = detectDelimiter(text.split(/\r?\n/)[0] ?? "");
  let cell = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function buildAliasMap(fields: ImportField[]) {
  const aliases = new Map<string, string>();
  fields.forEach((field) => {
    aliases.set(normalize(field.key), field.key);
    aliases.set(normalize(field.label), field.key);
  });
  return aliases;
}

function dateValue(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const br = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, day, month, year] = br;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10);
}

function numberValue(value: string) {
  if (!value) return "";
  const normalizedValue = value.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalizedValue);
  return Number.isFinite(parsed) ? String(parsed) : value;
}

function validateValue(field: ImportField, value: string): string | null {
  if (!value) return null;
  if (field.type === "number") {
    const normalizedValue = value.replace(/\./g, "").replace(",", ".");
    return Number.isFinite(Number(normalizedValue)) ? null : "Número inválido";
  }
  if (field.type === "date") {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateValue(value)) ? null : "Data inválida";
  }
  if (field.type === "gps" && value && !/^-?\d+([.,]\d+)?\s*,\s*-?\d+([.,]\d+)?$/.test(value)) {
    return "GPS deve estar em latitude,longitude";
  }
  return null;
}

function buildPayloads({
  headers,
  dataRows,
  mapping,
  fields,
}: {
  headers: string[];
  dataRows: unknown[][];
  mapping: Record<number, string>;
  fields: ImportField[];
}) {
  const fieldsByKey = new Map(fields.map((field) => [field.key, field]));
  const issues: ValidationIssue[] = [];
  const payloads = dataRows
    .map((row, rowIndex) => {
      const payload = Object.fromEntries(fields.map((field) => [field.key, ""])) as Record<
        string,
        string
      >;
      headers.forEach((_, index) => {
        const key = mapping[index];
        const field = fieldsByKey.get(key);
        if (!field) return;
        const raw = cellToString(row[index]);
        const prepared =
          field.type === "number" ? numberValue(raw) : field.type === "date" ? dateValue(raw) : raw;
        const issue = validateValue(field, prepared);
        if (issue) issues.push({ row: rowIndex + 2, field: field.label, message: issue });
        payload[key] = prepared;
      });
      return payload;
    })
    .filter((row) => Object.values(row).some((value) => value.trim() !== ""));
  return { payloads, issues };
}

export function ImportRecordsButton({
  fields,
  disabled,
  className,
  onImport,
}: ImportRecordsButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("map");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<unknown[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);

  const aliases = useMemo(() => buildAliasMap(fields), [fields]);
  const { payloads, issues } = useMemo(
    () => buildPayloads({ headers, dataRows, mapping, fields }),
    [dataRows, fields, headers, mapping],
  );
  const mappedCount = Object.values(mapping).filter(Boolean).length;

  const parseFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const matrix =
      lowerName.endsWith(".csv") || file.type.includes("csv")
        ? parseCsv(await file.text())
        : await readXlsxFile(file);
    const [headerRow, ...rows] = matrix;
    const parsedHeaders = (headerRow ?? []).map((header) => cellToString(header));
    const nextMapping = Object.fromEntries(
      parsedHeaders.map((header, index) => [index, aliases.get(normalize(header)) ?? ""]),
    );

    if (!parsedHeaders.length || !rows.length) {
      toast.info("A planilha precisa ter cabeçalho e pelo menos uma linha de dados.");
      return;
    }

    setHeaders(parsedHeaders);
    setDataRows(rows);
    setMapping(nextMapping);
    setStep("map");
    setOpen(true);
  };

  const confirm = async () => {
    if (issues.length) {
      toast.error("Corrija o mapeamento ou os valores inválidos antes de importar.");
      return;
    }
    if (!payloads.length || mappedCount === 0) {
      toast.error("Mapeie pelo menos uma coluna com dados para importar.");
      return;
    }

    setImporting(true);
    try {
      await onImport(payloads);
      toast.success(`${payloads.length} registros importados.`);
      setOpen(false);
      setHeaders([]);
      setDataRows([]);
      setMapping({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao importar registros.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (disabled) {
            toast.info("Desligue o modo DEMO para importar dados reais.");
            return;
          }
          inputRef.current?.click();
        }}
        className={
          className ??
          "flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm hover:bg-muted"
        }
      >
        <Upload className="h-3.5 w-3.5" />
        Importar
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void parseFile(file);
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar planilha</DialogTitle>
            <DialogDescription>
              Mapeie as colunas, confira a validação e salve os registros na aba atual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={cn(
                "rounded-md border px-2 py-1",
                step === "map" ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              1. Mapeamento
            </span>
            <span
              className={cn(
                "rounded-md border px-2 py-1",
                step === "preview" ? "border-primary bg-primary/10 text-primary" : "border-border",
              )}
            >
              2. Validação e prévia
            </span>
            <span className="rounded-md border border-border px-2 py-1">
              {payloads.length} linhas detectadas
            </span>
          </div>

          {step === "map" ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Coluna da planilha</th>
                    <th className="px-3 py-2 font-medium">Exemplo</th>
                    <th className="px-3 py-2 font-medium">Campo da aba</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map((header, index) => (
                    <tr key={`${header}-${index}`} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium">{header || `Coluna ${index + 1}`}</td>
                      <td className="max-w-[220px] truncate px-3 py-2 text-muted-foreground">
                        {cellToString(dataRows[0]?.[index]) || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={mapping[index] ?? ""}
                          onChange={(event) =>
                            setMapping((current) => ({ ...current, [index]: event.target.value }))
                          }
                          className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                        >
                          <option value="">Ignorar coluna</option>
                          {fields.map((field) => (
                            <option key={field.key} value={field.key}>
                              {field.label}
                              {field.type ? ` (${field.type})` : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                  issues.length
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-success/30 bg-success/10 text-success",
                )}
              >
                {issues.length ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {issues.length
                  ? `${issues.length} problema(s) encontrados.`
                  : "Mapeamento validado e pronto para salvar."}
              </div>
              {issues.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-lg border border-border">
                  {issues.slice(0, 30).map((issue, index) => (
                    <div
                      key={`${issue.row}-${issue.field}-${index}`}
                      className="border-b border-border px-3 py-2 text-xs last:border-0"
                    >
                      Linha {issue.row} · {issue.field}: {issue.message}
                    </div>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      {fields.slice(0, 7).map((field) => (
                        <th key={field.key} className="px-3 py-2 font-medium">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payloads.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        {fields.slice(0, 7).map((field) => (
                          <td key={field.key} className="max-w-[180px] truncate px-3 py-2">
                            {row[field.key] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="h-9 rounded-lg border border-border px-3 text-sm"
            >
              Cancelar
            </button>
            {step === "preview" && (
              <button
                onClick={() => setStep("map")}
                className="h-9 rounded-lg border border-border px-3 text-sm"
              >
                Voltar
              </button>
            )}
            {step === "map" ? (
              <button
                onClick={() => setStep("preview")}
                disabled={mappedCount === 0}
                className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                Validar prévia
              </button>
            ) : (
              <button
                onClick={confirm}
                disabled={importing || issues.length > 0 || !payloads.length}
                className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                Importar {payloads.length} registros
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

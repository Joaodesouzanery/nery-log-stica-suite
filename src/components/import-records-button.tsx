import { useRef, useState } from "react";
import { Upload } from "lucide-react";
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

type ImportField = {
  key: string;
  label: string;
};

type ImportRecordsButtonProps = {
  fields: ImportField[];
  disabled?: boolean;
  className?: string;
  onImport: (rows: Record<string, string>[]) => unknown | Promise<unknown>;
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
  return String(value);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
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
    } else if (char === "," && !quoted) {
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

function rowsToPayloads(rows: unknown[][], fields: ImportField[], aliases: Map<string, string>) {
  const [headerRow, ...dataRows] = rows;
  const headers = (headerRow ?? []).map((header) => cellToString(header));
  return dataRows
    .map((row) => {
      const payload: Record<string, string> = {};
      row.forEach((value, index) => {
        const key = aliases.get(normalize(headers[index] ?? ""));
        if (key) payload[key] = cellToString(value);
      });
      return { ...Object.fromEntries(fields.map((field) => [field.key, ""])), ...payload };
    })
    .filter((row) => Object.values(row).some((value) => value.trim() !== ""));
}

export function ImportRecordsButton({
  fields,
  disabled,
  className,
  onImport,
}: ImportRecordsButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const aliases = new Map<string, string>();
  fields.forEach((field) => {
    aliases.set(normalize(field.key), field.key);
    aliases.set(normalize(field.label), field.key);
  });

  const parseFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const matrix =
      lowerName.endsWith(".csv") || file.type.includes("csv")
        ? parseCsv(await file.text())
        : await readXlsxFile(file);
    const rows = rowsToPayloads(matrix, fields, aliases);

    if (!rows.length) {
      toast.info("Nenhuma linha válida encontrada na planilha.");
      return;
    }
    setPreviewRows(rows);
    setOpen(true);
  };

  const confirm = async () => {
    setImporting(true);
    try {
      await onImport(previewRows);
      toast.success(`${previewRows.length} registros importados.`);
      setOpen(false);
      setPreviewRows([]);
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
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prévia da importação</DialogTitle>
            <DialogDescription>
              Confira as primeiras linhas antes de criar os registros reais.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  {fields.slice(0, 5).map((field) => (
                    <th key={field.key} className="px-3 py-2 font-medium">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 8).map((row, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    {fields.slice(0, 5).map((field) => (
                      <td key={field.key} className="px-3 py-2">
                        {row[field.key] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="h-9 rounded-lg border border-border px-3 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={confirm}
              disabled={importing}
              className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Importar {previewRows.length} registros
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

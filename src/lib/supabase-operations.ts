import { isSupabaseConfigured } from "@/lib/supabase-financial";

export type OperationRecord = {
  id: string;
  area: string;
  module: string;
  payload: Record<string, string>;
  created_at?: string;
  updated_at?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function getEndpoint(path: string) {
  if (!SUPABASE_URL) return "";
  return `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new Error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar dados reais.");
  }

  const response = await fetch(getEndpoint(path), {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Falha ao comunicar com o Supabase.");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function listOperationRecords(module: string): Promise<OperationRecord[]> {
  if (!isSupabaseConfigured) return [];
  return request<OperationRecord[]>(
    `operation_records?module=eq.${encodeURIComponent(module)}&select=*&order=created_at.desc`,
  );
}

export async function createOperationRecord(input: {
  area: string;
  module: string;
  payload: Record<string, string>;
}): Promise<OperationRecord> {
  const rows = await request<OperationRecord[]>("operation_records", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return rows[0];
}

export async function updateOperationRecord(input: {
  id: string;
  payload: Record<string, string>;
}): Promise<OperationRecord> {
  const rows = await request<OperationRecord[]>(`operation_records?id=eq.${input.id}`, {
    method: "PATCH",
    body: JSON.stringify({ payload: input.payload, updated_at: new Date().toISOString() }),
  });
  return rows[0];
}

export async function deleteOperationRecord(id: string): Promise<void> {
  await request<void>(`operation_records?id=eq.${id}`, {
    method: "DELETE",
  });
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AutomationConfigRow = {
  key: string;
  value: string;
  label: string;
  description: string | null;
  group_name: string;
  sort_order: number;
  updated_at: string;
};

export type AutomationConfig = Record<string, string>;

// Returns the full rows (for admin UI) using a provided Supabase client.
export async function getAutomationConfigRows(
  supabase: SupabaseClient
): Promise<AutomationConfigRow[]> {
  const { data } = await supabase
    .from("automation_config")
    .select("key, value, label, description, group_name, sort_order, updated_at")
    .order("group_name")
    .order("sort_order");
  return (data ?? []) as AutomationConfigRow[];
}

// Returns a flat key→value map for use in cron jobs and API routes.
export async function loadConfig(): Promise<AutomationConfig> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return {};

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("automation_config")
    .select("key, value");

  const cfg: AutomationConfig = {};
  for (const row of data ?? []) cfg[row.key as string] = row.value as string;
  return cfg;
}

// Replaces {variable} placeholders in a template string.
export function interpolate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { DEFAULT_CURRENCY } from "@/lib/currency";

/** Reads the admin-configurable platform currency (ISO 4217 code, e.g. PKR/USD/AED). */
export async function getPlatformCurrency(supabase: SupabaseClient): Promise<string> {
  const { data } = await supabase
    .from("automation_config")
    .select("value")
    .eq("key", "platform_currency")
    .maybeSingle();
  return (data?.value as string) || DEFAULT_CURRENCY;
}

/** Same as getPlatformCurrency, but creates its own request-scoped client — for server components that don't already have one handy. */
export async function getPlatformCurrencyServer(): Promise<string> {
  return getPlatformCurrency(createServerSupabase());
}

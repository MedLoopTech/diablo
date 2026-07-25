"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabase } from "@/lib/env";

export function createBrowserSupabase() {
  const { url, anonKey } = requireSupabase();
  return createBrowserClient(url, anonKey);
}

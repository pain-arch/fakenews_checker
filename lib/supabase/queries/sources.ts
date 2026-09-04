import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SourceRow } from "@/lib/supabase/types";

const SOURCE_COLUMNS = "id, name, listing_url, parser_strategy, is_active, logo_url, created_at, updated_at";

function fail(operation: string, code?: string): never {
  console.error(`[supabase:sources] ${operation} failed.`, { code: code ?? "unknown" });
  throw new Error("Unable to load configured news sources.");
}

export async function listActiveSources(): Promise<SourceRow[]> {
  const result = await getSupabaseServerClient()
    .from("sources")
    .select(SOURCE_COLUMNS)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (result.error) fail("Active source query", result.error.code);
  return result.data;
}

export async function getActiveSource(sourceId: string): Promise<SourceRow | null> {
  const result = await getSupabaseServerClient()
    .from("sources")
    .select(SOURCE_COLUMNS)
    .eq("id", sourceId)
    .eq("is_active", true)
    .maybeSingle();
  if (result.error) fail("Active source lookup", result.error.code);
  return result.data;
}

export async function resolveActiveSources(requested: readonly string[]): Promise<SourceRow[]> {
  const sources = await listActiveSources();
  const selections = new Set(requested.map((value) => value.trim().toLocaleLowerCase()).filter(Boolean));
  if (selections.size === 0) return sources;
  return sources.filter(
    (source) => selections.has(source.id.toLocaleLowerCase()) || selections.has(source.name.toLocaleLowerCase()),
  );
}

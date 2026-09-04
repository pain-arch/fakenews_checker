import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LogInsert, LogLevel, LogRow } from "@/lib/supabase/types";

const LOG_COLUMNS = "id, level, event, message, run_id, source_id, article_id, context, created_at";
const MAX_LOG_LIMIT = 200;

export type LogFilters = {
  level?: LogLevel;
  runId?: string;
  sourceId?: string;
  articleId?: string;
  limit?: number;
};

export async function appendLog(input: LogInsert): Promise<LogRow> {
  const result = await getSupabaseServerClient().from("logs").insert(input).select(LOG_COLUMNS).single();
  if (result.error) {
    console.error("[supabase:logs] Log insert failed.", { event: input.event, code: result.error.code });
    throw new Error("Unable to persist the pipeline log event.");
  }
  return result.data;
}

export async function listRecentLogs(filters: LogFilters = {}): Promise<LogRow[]> {
  const limit = Number.isInteger(filters.limit) && (filters.limit ?? 0) > 0
    ? Math.min(filters.limit as number, MAX_LOG_LIMIT)
    : 50;
  let query = getSupabaseServerClient().from("logs").select(LOG_COLUMNS);
  if (filters.level) query = query.eq("level", filters.level);
  if (filters.runId) query = query.eq("run_id", filters.runId);
  if (filters.sourceId) query = query.eq("source_id", filters.sourceId);
  if (filters.articleId) query = query.eq("article_id", filters.articleId);
  const result = await query.order("created_at", { ascending: false }).limit(limit);
  if (result.error) {
    console.error("[supabase:logs] Recent logs query failed.", { code: result.error.code });
    throw new Error("Unable to load recent pipeline logs.");
  }
  return result.data;
}

import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Json,
  OxylabsScheduleInsert,
  OxylabsScheduleRow,
  OxylabsScheduleRunInsert,
  OxylabsScheduleRunRow,
  ScheduleProcessingStatus,
} from "@/lib/supabase/types";

const SCHEDULE_COLUMNS =
  "id, source_id, oxylabs_schedule_id, is_active, last_synced_at, created_at, updated_at";
const RUN_COLUMNS =
  "id, schedule_id, oxylabs_run_id, oxylabs_job_id, result_status, processing_status, started_at, completed_at, processed_at, summary, error_message, created_at, updated_at";
const MAX_RUN_LIMIT = 200;

function fail(operation: string, code?: string): never {
  console.error(`[supabase:oxylabs-schedules] ${operation} failed.`, { code: code ?? "unknown" });
  throw new Error("Unable to access stored Oxylabs schedule state.");
}

export async function listSchedules(): Promise<OxylabsScheduleRow[]> {
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedules")
    .select(SCHEDULE_COLUMNS)
    .order("created_at", { ascending: true });
  if (result.error) fail("Schedule list query", result.error.code);
  return result.data;
}

export async function findScheduleBySource(sourceId: string): Promise<OxylabsScheduleRow | null> {
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedules")
    .select(SCHEDULE_COLUMNS)
    .eq("source_id", sourceId)
    .maybeSingle();
  if (result.error) fail("Schedule source lookup", result.error.code);
  return result.data;
}

export async function findScheduleByRemoteId(remoteId: string): Promise<OxylabsScheduleRow | null> {
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedules")
    .select(SCHEDULE_COLUMNS)
    .eq("oxylabs_schedule_id", remoteId)
    .maybeSingle();
  if (result.error) fail("Remote schedule lookup", result.error.code);
  return result.data;
}

export async function upsertSchedule(input: OxylabsScheduleInsert): Promise<OxylabsScheduleRow> {
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedules")
    .upsert(input, { onConflict: "source_id" })
    .select(SCHEDULE_COLUMNS)
    .single();
  if (result.error) fail("Schedule upsert", result.error.code);
  return result.data;
}

export async function upsertScheduleRun(input: OxylabsScheduleRunInsert): Promise<OxylabsScheduleRunRow> {
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedule_runs")
    .upsert(input, { onConflict: "schedule_id,oxylabs_job_id" })
    .select(RUN_COLUMNS)
    .single();
  if (result.error) fail("Schedule run upsert", result.error.code);
  return result.data;
}

export async function listPendingCompletedRuns(limit = 50): Promise<OxylabsScheduleRunRow[]> {
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, MAX_RUN_LIMIT) : 50;
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedule_runs")
    .select(RUN_COLUMNS)
    .eq("result_status", "done")
    .eq("processing_status", "pending")
    .order("created_at", { ascending: true })
    .limit(safeLimit);
  if (result.error) fail("Pending completed runs query", result.error.code);
  return result.data;
}

export async function markScheduleRunProcessing(input: {
  id: string;
  status: ScheduleProcessingStatus;
  summary?: Json;
  errorMessage?: string | null;
}): Promise<OxylabsScheduleRunRow> {
  const terminal = input.status === "completed" || input.status === "failed" || input.status === "skipped";
  const result = await getSupabaseServerClient()
    .from("oxylabs_schedule_runs")
    .update({
      processing_status: input.status,
      processed_at: terminal ? new Date().toISOString() : null,
      summary: input.summary ?? {},
      error_message: input.errorMessage?.slice(0, 1_000) ?? null,
    })
    .eq("id", input.id)
    .select(RUN_COLUMNS)
    .single();
  if (result.error) fail("Schedule run status update", result.error.code);
  return result.data;
}

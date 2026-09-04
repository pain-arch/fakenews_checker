# Fake or Real — Supabase Database and Data Access

## Goal

Complete the Supabase persistence foundation and server-only data access layer for Fake or Real. Supabase must become the typed source of truth for configured sources, validated append-only articles, article analyses, operational logs, Oxylabs schedule records, and schedule-run processing state. Connect the public homepage to stored analyzed articles while preserving the existing real-data news details page.

This task implements database schema and data access only. It does not scrape websites, call Oxylabs, create remote Oxylabs schedules, call an AI model, generate embeddings, configure Vercel Cron, or add admin UI.

## Skills read

- `.agents/skills/supabase/SKILL.md`

No other project skill is needed. Clerk authentication is already separate, and this task does not implement Oxylabs or AI SDK behavior.

## Current documentation checked

### Installed Next.js 16.3.1 documentation

- `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- `node_modules/next/dist/docs/01-app/02-guides/data-security.md`

Follow the installed App Router guidance: read the database directly from async Server Components through a dedicated data access layer, keep secrets and database clients in `server-only` modules, and return narrow presentation-safe objects instead of exposing unrestricted records to Client Components.

### Current Supabase documentation and changelog

- `https://supabase.com/changelog.md`
- `https://supabase.com/docs/guides/api/securing-your-api.md`

The current guidance distinguishes object grants from RLS and recommends explicitly limiting both. No relevant current breaking change prevents this implementation. Keep the repository’s pinned `@supabase/supabase-js` dependency and canonical environment names.

## Existing code inspected

- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `.env.example`
- `supabase/schema.sql`
- `lib/supabase/types.ts`
- `lib/supabase/server.ts`
- `lib/supabase/queries/articles.ts`
- `app/page.tsx`
- `app/news/[id]/page.tsx`
- `components/news-card.tsx`
- `components/top-news-grid.tsx`
- `prompts/news-details-page-real-data.md`
- `README.md`

The repository currently has pinned `@supabase/supabase-js@2.115.0`, a singleton server-only service-role client, hand-maintained database types, schema for `sources`, `articles`, and `article_analyses`, and a typed article-details query. The homepage deliberately renders an empty feed. The required `logs`, `oxylabs_schedules`, and `oxylabs_schedule_runs` tables and pipeline-oriented query modules do not exist. The Supabase CLI is not installed, while `.env.local` contains the required Supabase variable names.

## Decisions and assumptions

- Use the existing imperative tracked-schema workflow in `supabase/schema.sql`; there is no `supabase/schemas/`, `config.toml`, migrations directory, or installed Supabase CLI.
- Do not automatically mutate a remote Supabase project. Update tracked SQL, then provide exact Dashboard SQL Editor and verification steps. Existing remote data must never be dropped or truncated.
- Preserve the current canonical three-table column contracts and extend the schema with the three missing core tables.
- Treat Oxylabs schedule IDs, run IDs, and job IDs as `text`, never JavaScript numbers, because the product rules identify them as unsafe 64-bit integers.
- Keep all application database access behind the service-role server client. There is no Supabase Auth. Enable RLS on every public table, revoke `anon` and `authenticated`, and grant only required privileges to `service_role`.
- Do not add public read policies merely because the news pages are public. Public pages are Server Components and use narrow server-side DTOs.
- Keep articles append-only in scraping-facing helpers: expose insert and dedupe operations, but no replace-all, truncate, or scraping delete helper.
- Enforce URL uniqueness at the database layer for both `original_url` and non-null `canonical_url`. This makes canonical URL dedupe race-safe as well as application-checked.
- Enforce analysis consistency in SQL: percentages are each 0–100 and total 100; sentiment/framing labels are allowlisted; `bias_score` must agree with `(right_percentage - left_percentage) / 100` within a small floating-point tolerance.
- Model logs as structured, append-only events with a level, operation/event name, message, optional run/source/article references, JSON context, and timestamp. Never store credentials, raw article bodies, or full third-party payloads in log context.
- Model one current Oxylabs schedule row per source, with the exact remote ID as text, active state, last synchronization time, and timestamps.
- Model schedule runs as idempotently processable remote run/job records linked to the local schedule, with exact text IDs, result status, processing status, timestamps, a compact JSON summary, and a sanitized error message. Unique constraints must prevent the same remote job/result from being processed twice.
- Use explicit small query modules grouped by domain rather than a large generic repository abstraction.
- Keep URL-existence `.in()` requests at 15 values or fewer, as mandated by `AGENTS.md`.
- Implement pending-analysis detection from the actual `article_analyses` relationship, not `articles.analyzed_at` alone. A missing analysis row is pending. Embedding-backfill behavior is deferred until pgvector is introduced.
- Add a transactional database function for saving a validated analysis and marking `articles.analyzed_at` only after the analysis row succeeds. Make it `security invoker`, set an empty `search_path`, revoke default public execution, and grant execution only to `service_role`.
- Connect only the homepage’s existing `TopNewsGrid` to a latest-analyzed-articles DTO. Do not redesign the page or components.
- Do not add `embedding`, pgvector, related articles, seed news, Supabase Auth, browser clients, Route Handlers, scraping, scheduling calls, or AI calls.

## Files likely to change

- `supabase/schema.sql`
- `lib/supabase/types.ts`
- `lib/supabase/server.ts` only if a small safety or typing improvement is required
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/sources.ts` (new)
- `lib/supabase/queries/analyses.ts` (new)
- `lib/supabase/queries/logs.ts` (new)
- `lib/supabase/queries/oxylabs-schedules.ts` (new)
- `app/page.tsx`
- `README.md` or a focused Supabase setup document only if necessary for exact setup/testing instructions

Do not edit `AGENTS.md`, `.env.local`, Clerk files, visual styling, scraper modules, AI modules, API routes, or Vercel configuration.

## Database schema requirements

### Existing tables

Retain and harden:

- `sources`
- `articles`
- `article_analyses`

Keep their existing columns synchronized with TypeScript. Add only compatible constraints/indexes needed for the declared rules, including canonical URL uniqueness and derived bias-score consistency. Schema changes must be idempotent where practical and safe for existing rows; document any statement that may fail because existing data violates a new constraint.

### `logs`

Add a structured append-only operational log table containing:

- UUID primary key
- constrained level (`info`, `warn`, `error`)
- nonblank operation/event identifier
- nonblank human-readable message
- optional nonblank run identifier
- optional `source_id` and `article_id` foreign keys using deletion behavior that preserves operational history
- non-null JSONB context defaulting to an empty object
- created timestamp

Add indexes that support newest-first log reads, run lookup, and relevant foreign-key lookups. No update timestamp or update/delete DAL helper is needed for append-only logs.

### `oxylabs_schedules`

Add a schedule table containing:

- UUID primary key
- unique source foreign key
- exact unique Oxylabs schedule ID stored as text
- active state
- optional last-synced timestamp
- created/updated timestamps

Add nonblank-ID constraints and indexes needed by source, remote-ID, and active schedule lookups.

### `oxylabs_schedule_runs`

Add a processing-state table containing:

- UUID primary key
- local schedule foreign key
- exact Oxylabs run ID and job ID stored as text
- constrained remote result status suitable for observed scheduler states
- constrained local processing status such as pending, processing, completed, failed, or skipped
- optional started/completed/processed timestamps
- non-null JSONB summary defaulting to an empty object
- optional sanitized error message
- created/updated timestamps

Use a uniqueness rule that makes ingestion of the same remote schedule job idempotent. Add indexes for schedule history, unprocessed completed-result discovery, and newest-first reads.

### Shared database behavior

- Reuse the existing `public.set_updated_at()` trigger for mutable tables.
- Qualify all referenced objects because the trigger/function search path is empty.
- Add useful comments for tables and non-obvious ID/status columns.
- Enable RLS on all public tables.
- Revoke all table privileges from `anon` and `authenticated`.
- Explicitly grant only the required table privileges to `service_role`.
- Revoke function execution from `PUBLIC`, `anon`, and `authenticated`; grant only required function execution to `service_role`.
- Do not introduce permissive RLS policies.
- Do not use a `security definer` function.
- Keep SQL rerunnable where feasible without destructive resets.

## TypeScript database types

Update `lib/supabase/types.ts` to match the final SQL exactly:

- `Row`, `Insert`, `Update`, and relationship metadata for all six tables
- label/status string unions rather than unbounded strings where SQL uses allowed-value constraints
- JSON-compatible types for structured log context and run summaries
- typed `Functions` metadata for the transactional analysis-save RPC
- convenient exported row/insert/update aliases used by query modules

Avoid `any`. Do not claim these are generated types; they remain hand-maintained until a configured CLI workflow exists.

## Data access requirements

All query modules must import `server-only`, use `getSupabaseServerClient()`, select explicit columns, return narrow typed values, and log concise sanitized context on failure. Do not return raw Supabase errors or credentials.

### Sources

Provide helpers to:

- list all active sources in deterministic name order
- optionally resolve a requested list of source IDs or names against active database rows without inventing URLs
- load one active source when needed by later pipeline code

### Articles

Preserve `getArticleDetails(articleId)` and add helpers to:

- list the latest analyzed articles for the homepage, newest published first, with an explicit bounded limit and the exact card DTO fields only
- check existing original/canonical URLs in chunks of no more than 15 values per `.in()` query
- insert one or a bounded collection of already-validated articles without overwriting existing rows
- fetch pending-analysis articles based on missing `article_analyses` rows, using base-table/nested data plus JavaScript filtering where necessary; never filter a joined table with `.eq('foreignTable.column', value)`
- support selected article IDs and configurable batch limits without hardcoding a ten-article cap

Deduplicate inputs in memory and handle Postgres unique violations as duplicates rather than destructive updates. Keep validation/scraping business rules outside the DAL; the insert contract should accept only the already-validated required fields.

### Analyses

Provide a helper that accepts validated analysis data, computes `bias_score` in trusted server code, and invokes the transactional RPC so the analysis row and `analyzed_at` stay consistent. It must not accept a caller-supplied derived bias score. Do not add embedding support yet.

### Logs

Provide helpers to:

- append a structured log event
- list recent logs with a bounded limit and optional safe filters such as level, run ID, source ID, or article ID

The query layer must never log or persist secrets, raw article text, or unrestricted third-party responses.

### Oxylabs schedule records

Provide helpers to:

- list stored schedules
- find a schedule by source or exact remote text ID
- upsert schedule metadata by source without converting the remote ID to a number
- record/upsert remote run/job state idempotently
- list completed remote results still pending local processing
- mark local processing state with sanitized summary/error information

These helpers only persist state. They must not make network calls to Oxylabs.

## Homepage integration

Make `app/page.tsx` async and load a small bounded latest-analyzed feed through the article DAL. Map database data into the existing `NewsCardProps` contract without passing raw rows or sensitive/internal fields to components.

- Only articles with an actual analysis row appear.
- Order by `published_at` descending.
- Keep the existing empty state when no analyzed rows exist.
- Use the stored source name and analysis values exactly.
- Format dates on the server.
- Do not infer topics, mutate pipeline state, or analyze/scrape during render.
- Database/configuration errors should use the framework error path and concise server logs, not silently masquerade as an empty feed.

## Security requirements

- `SUPABASE_SERVICE_ROLE_KEY` remains server-only and is never prefixed with `NEXT_PUBLIC_`.
- No real credentials are written or echoed.
- Only data-access modules may create/use the elevated client.
- Every query module is protected by `server-only`.
- No browser Supabase client or Supabase Auth is added.
- RLS is enabled and direct `anon`/`authenticated` table access is revoked.
- Function execution is explicitly restricted.
- Stored article text is never logged by the DAL.
- Log context and schedule errors are concise and sanitized.
- Input identifiers, list sizes, and pagination/limits are validated or clamped before querying.
- Public UI receives narrow DTOs, not service clients, raw errors, or unrestricted rows.

## Acceptance criteria

- The tracked SQL defines all six required core tables with constraints, relationships, indexes, timestamps, RLS, and least-privilege grants.
- Oxylabs numeric identifiers remain exact strings from storage through TypeScript query results.
- SQL and `Database` types agree for every table and RPC.
- Active sources can be loaded without hardcoded source URLs.
- URL existence checks never send more than 15 URLs in one `.in()` filter.
- Article insert helpers are append-only and duplicate-safe.
- Pending analysis is determined by absence of `article_analyses`, not `analyzed_at` alone.
- Saving analysis derives the bias score and transactionally updates `analyzed_at` only after valid analysis persistence.
- Operational logs and scheduler processing state have typed, bounded, server-only access helpers.
- The homepage renders the latest stored analyzed articles through the existing cards and preserves its empty state when none exist.
- The existing `/news/[id]` real-data page continues to work.
- No pgvector, embeddings, scraper, Oxylabs API client, AI model call, cron, seed content, or unrelated UI is introduced.
- No `any`, public credential exposure, permissive RLS policy, destructive reset, or joined-table `.eq()` filter is added.

## Checks to run

From the repository root:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`

If a configured remote Supabase connection or SQL execution tool is unavailable, clearly report that applying and querying the remote schema remains a manual external verification step. Do not claim database verification passed merely because TypeScript/build checks pass.

## Exact manual test steps expected after implementation

1. Back up the Supabase project or confirm the target is a development project.
2. Open Supabase Dashboard → SQL Editor, review the completed `supabase/schema.sql`, and apply it. If tables already exist, reconcile additive changes without dropping or truncating data. Resolve any reported pre-existing row that violates a new constraint before retrying that specific constraint.
3. In Table Editor, confirm all six tables exist: `sources`, `articles`, `article_analyses`, `logs`, `oxylabs_schedules`, and `oxylabs_schedule_runs`.
4. In the SQL Editor, verify RLS is enabled, `anon`/`authenticated` have no table privileges, and the transactional analysis-save function is not executable by `PUBLIC`.
5. Confirm `.env.local` has valid `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` values. Do not put the service key in a `NEXT_PUBLIC_*` variable.
6. Insert or retain at least one active source, one valid article, and one matching analysis row. Use clearly marked local test data only if the project has no real pipeline data.
7. Run `npm run dev` and watch the terminal for sanitized database errors.
8. Open `http://localhost:3000/`; verify the analyzed article appears with its stored title, source, date, sentiment, framing percentages, and confidence.
9. Open its `/news/<uuid>` link and verify the existing details page still matches the stored article and analysis.
10. Add an article without an `article_analyses` row (even if `analyzed_at` is non-null) and verify the DAL’s pending-analysis query returns it while the homepage excludes it.
11. Exercise the URL-existence helper with more than 15 mixed original/canonical URLs and verify it returns stored matches without an oversized `.in()` request.
12. Save a validated analysis through the DAL helper and verify the analysis row and `articles.analyzed_at` are both committed; submit an invalid payload and verify neither change is committed.
13. Insert and read a log event; verify its structured context contains no secrets or raw article body.
14. Store a schedule/run/job ID longer than JavaScript’s safe integer range and verify the exact digits round-trip unchanged as text.
15. Record the same remote run/job twice and verify idempotency prevents duplicate processing rows.


# Fake or Real — Supabase Development Seed

## Goal

Create `supabase/seed.sql` with safe, deterministic development data that exercises the existing homepage and news-details data access against the schema in `supabase/schema.sql`.

## Skills read

- `.agents/skills/supabase/SKILL.md`

## Existing code inspected

- `AGENTS.md`
- `supabase/schema.sql`
- `lib/supabase/types.ts`
- `lib/supabase/queries/articles.ts`
- `lib/supabase/queries/analyses.ts`
- `lib/supabase/queries/logs.ts`
- `lib/supabase/queries/oxylabs-schedules.ts`
- `app/page.tsx`
- `app/news/[id]/page.tsx`
- `.env.example`

The Supabase changelog was also checked. No current breaking change affects ordinary PostgreSQL seed inserts.

## Decisions and assumptions

- Create development fixtures only; do not present seed stories as real reporting.
- Use reserved, stable UUIDs and `.example` URLs so rerunning the seed is deterministic and cannot collide accidentally with scraped production URLs.
- Seed three active fictional sources and several fictional articles covering positive, neutral, and negative sentiment plus left, center, right, mixed, and unclear framing examples.
- Include at least one valid article without an analysis row so the pending-analysis query and details pending state can be tested.
- Include small representative log, schedule, and schedule-run rows, with large Oxylabs-like IDs stored as text to exercise precision safety.
- Make the file rerunnable with targeted `insert ... on conflict ... do update` statements scoped only to the stable seed IDs/keys.
- Do not truncate tables, delete existing data, reset sequences, disable RLS, change grants, or modify the schema.
- Do not use `save_article_analysis` from the seed because its `analyzed_at = now()` behavior would make timestamps nondeterministic; insert internally consistent analysis rows and explicit timestamps directly.
- Use remote placeholder image URLs that render reliably in the existing Next.js image component. No copyrighted article text or real-person claims should be included.

## Files likely to change

- `supabase/seed.sql` (new)

No application, schema, environment, authentication, or configuration file should change.

## Implementation requirements

- Start with a prominent comment stating that `supabase/schema.sql` must be applied first and that the file is development-only.
- Use one transaction so partial seed data is rolled back on failure.
- Insert data in foreign-key order: sources, articles, analyses, logs, schedules, schedule runs.
- Keep all required schema fields populated and all check constraints valid.
- Keep `bias_score` exactly equal to `(right_percentage - left_percentage) / 100`.
- Keep framing percentages within 0–100 and totaling exactly 100.
- Use believable but explicitly fictional headlines, summaries, framing notes, loaded terms, and disclaimers.
- Use multiline plain article text suitable for the existing paragraph renderer.
- Make analyzed articles have matching analysis rows and non-null `analyzed_at` values.
- Make the pending article have `analyzed_at = null` and no analysis row.
- Make every conflict target rely on an existing unique or primary-key constraint.
- Finish with compact read-only verification queries that return seed row counts and the seeded article IDs/titles/statuses.

## Security requirements

- Include no API keys, credentials, personal data, copied news content, or production identifiers.
- Do not grant access, change RLS, use `security definer`, or bypass existing security controls.
- Do not delete, truncate, or overwrite rows outside the stable seed fixture keys.
- Mark log context and schedule summaries as synthetic development data.

## Acceptance criteria

- `supabase/seed.sql` exists and is valid for the current tracked schema.
- The file is safe to rerun without creating duplicates.
- Existing non-seed rows remain untouched.
- The homepage has multiple analyzed cards to render after seeding.
- A seeded `/news/<uuid>` route exercises the complete analysis UI.
- Another seeded article exercises the pending-analysis UI and pending DAL query.
- Log and scheduler tables contain representative typed fixtures.
- Large remote IDs round-trip as exact text.
- No schema or application code is changed.

## Checks to run

1. `git diff --check -- supabase/seed.sql`
2. Review every insert column against `supabase/schema.sql`.
3. Verify all seed UUID, URL, percentage, score, label, status, JSON, and foreign-key values are internally consistent.
4. Run `npm run typecheck` and `npm run lint` to ensure the repository remains clean.
5. If a SQL execution connection is available, apply the schema and seed to a development database and run the included verification queries. Otherwise report database execution as a manual external step.

## Exact manual test steps expected after implementation

1. Open Supabase Dashboard → SQL Editor.
2. Apply `supabase/schema.sql` first.
3. Open a new SQL query, paste `supabase/seed.sql`, and run it.
4. Confirm the verification result shows the expected seeded sources, articles, analyses, logs, schedules, and schedule runs.
5. Rerun `supabase/seed.sql` and confirm counts do not increase.
6. Run `npm run dev` and watch the terminal for database errors.
7. Open `http://localhost:3000/` and verify multiple fictional analyzed stories appear.
8. Open the seeded article IDs listed by the verification query and verify both complete-analysis and pending-analysis states.


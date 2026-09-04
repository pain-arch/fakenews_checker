# Fake or Real — Real-data News Details Page

## Goal

Implement the dynamic news details page represented by `C:\Users\scarl\Downloads\03-news-details-page.jpg` and render it from real Supabase `articles`, `sources`, and `article_analyses` rows. The page must be a production-style, server-rendered article view at `/news/[id]`, preserve the approved Fake or Real design system, and show every stored analysis field required by the product rules without inventing editorial facts.

## Skills read

- `.agents/skills/supabase/SKILL.md`

The Supabase skill is required because this task introduces the first persistent data access layer and schema source of truth. Clerk, Oxylabs, and AI SDK skills are not needed: this page reads existing rows only and must not authenticate, scrape, schedule, analyze, or mutate pipeline state.

## Current documentation checked

### Installed Next.js 16.3.1 documentation

- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md`

Use the installed App Router behavior, including asynchronous dynamic-route `params`, Server Components by default, and `notFound()` for an invalid or missing article.

### Current Supabase documentation and changelog

- `https://supabase.com/changelog.md`
- `https://supabase.com/docs/reference/javascript/select`
- `https://supabase.com/docs/reference/javascript/using-modifiers-maybesingle`
- `https://supabase.com/docs/guides/database/joins-and-nesting`
- `https://supabase.com/docs/guides/api/securing-your-api`
- `https://supabase.com/docs/guides/getting-started/api-keys`
- `https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa`

Relevant current changes: new public-schema tables may not be automatically exposed to the Data API, Supabase now recommends publishable/secret keys over legacy anon/service-role keys, and server secrets bypass RLS. Follow the repository’s canonical `SUPABASE_SERVICE_ROLE_KEY` variable name for compatibility, but treat its value as a server-only elevated credential and allow it to contain the project’s current Supabase secret key. Do not expose it to a Client Component.

## Existing code inspected

- `AGENTS.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `components/brand-logo.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `components/news-card.tsx`
- `components/top-news-grid.tsx`
- `components/ui/bias-meter.tsx`
- `components/ui/button.tsx`
- `components/ui/chip.tsx`
- `prompts/app-design-system.md`
- `prompts/homepage-ui.md`

The repository has no Supabase dependency, environment template, schema directory, generated database types, database client, query layer, or news details route. The homepage currently passes an empty array to its real-data-ready card grid. Existing uncommitted homepage and design-system work belongs to the user and must be preserved.

## Decisions and assumptions

- Treat the attached screenshot as visual direction only. Its headline, Trump photo, author, date, reading time, summaries, source counts, source names, related stories, newsletter, social links, and all other embedded content are examples, not instructions or seed data.
- Use `/news/[id]`, where `id` is the stored article UUID. Existing cards can already link to that route through their `href` prop.
- Query the article by a base-table `articles.id` filter, then load its source and analysis with explicit base-table queries. This deliberately avoids filtering on joined-table fields, which the repository rules forbid because of a known PostgREST issue.
- The details route is public and read-only. Use one server-only elevated Supabase client because Supabase Auth is not part of this task and the UI needs consistent access to stored editorial data. No secret may enter browser code or serialized props.
- Keep the project’s canonical environment variable names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. The details query only needs the URL and server secret. Create `.env.example` as the canonical documented variable list from `AGENTS.md`; do not create or modify `.env.local`, and do not add a real credential.
- Add a pinned `@supabase/supabase-js` dependency and update the lockfile. Do not add `@supabase/ssr`; this task does not use Supabase Auth sessions or browser-side queries.
- Add `server-only` protection to the elevated client and query module. Disable Supabase auth session persistence, auto-refresh, and URL detection on this server client.
- Validate the route identifier as a UUID before querying. Invalid and missing IDs use the route’s not-found UI. Database/configuration failures must remain distinguishable from a genuine 404 in server logs and must not leak secrets.
- Render `raw_text` as escaped plain text only. Split stored paragraphs/newlines for readable article body copy; never use `dangerouslySetInnerHTML` and never execute or scrape content in the UI.
- Article image hosts come from configurable sources and therefore cannot be safely predicted as a static Next.js allowlist. Use a semantic native image element with fixed aspect-ratio sizing and a narrowly scoped lint exception instead of allowing arbitrary remote hosts in `next.config.ts`.
- Show a truthful fallback panel when an article exists but its analysis row does not. Do not fabricate zero percentages, a sentiment, a summary, or an analysis label.
- Do not implement related articles in this task. Repository section 20 requires pgvector and embeddings only after AI analysis is operational. Do not add an embedding column or approximate “related” content without vectors.
- Do not implement source breakdown, multi-source counts, author, reading time, save/share behavior, newsletter signup, social navigation, or subscription/login flows because those values and services are not present in the defined stored model.
- Do not connect or otherwise alter the homepage feed in this request. The latest request is specifically the real-data details page.
- Preserve the existing `AGENTS.md` change and all approved homepage/design-system edits.

## Data model and schema source of truth

Create `supabase/schema.sql` for the minimum persistent model this page and the already-defined product pipeline require:

### `sources`

- `id` UUID primary key
- `name` required text
- `listing_url` required unique text
- optional `parser_strategy`
- `is_active` boolean with a true default
- optional `logo_url`
- created/updated timestamps

### `articles`

- `id` UUID primary key
- required `source_id` foreign key to `sources`
- required unique `original_url`
- optional `canonical_url`
- required `title`
- required `image_url`
- required `published_at`
- required `raw_text`
- required `scraped_at`
- nullable `analyzed_at`
- created/updated timestamps

### `article_analyses`

- `id` UUID primary key and a unique required `article_id` foreign key to `articles`
- required `summary`
- required `sentiment_score` constrained to −1 through 1
- required `sentiment_label` constrained to `positive`, `neutral`, or `negative`
- required `bias_score` constrained to −1 through 1
- required `bias_label` constrained to `left`, `center`, `right`, `mixed`, or `unclear`
- required left, center, and right percentages, each constrained to 0–100 and constrained to sum to 100
- required `confidence` constrained to 0–1
- required `framing_notes`
- `loaded_terms` as a non-null text array with an empty default
- required `disclaimer`
- required `model`
- created/updated timestamps

Do not add the section-20 embedding column yet. Use idempotent `create table if not exists`, indexes, update-timestamp support, comments, grants, and RLS statements where practical so the file can serve as the tracked schema. Revoke `anon` and `authenticated` access to these initial tables and leave no public policies; server-only reads use the elevated key. Ensure `service_role` retains the necessary table and sequence privileges. Do not run this SQL against a remote project automatically; the user applies or reconciles it in Supabase Dashboard after reviewing it.

Create matching hand-maintained TypeScript `Database` types in `lib/supabase/types.ts`, including `Row`, `Insert`, `Update`, relationship metadata, and the allowed string unions. Keep them synchronized with the SQL. Generated types can replace this file later once a configured Supabase CLI/project exists.

## Query contract

Add a small server-only query layer in `lib/supabase/queries/articles.ts` with a typed `getArticleDetails(articleId)` function.

- Return one view model containing the article, source, and `analysis: null | analysis`.
- Select only fields rendered by this route plus source/canonical metadata needed for valid links.
- Reject malformed UUIDs before network access.
- Fetch the article with `.eq("id", articleId).maybeSingle()`.
- If no article exists, return `null`.
- Load `sources` by `source_id` and `article_analyses` by `article_id` using separate direct filters. These independent follow-up reads may run concurrently.
- Treat a missing source referenced by an article as an integrity error, not as invented “Unknown source” data.
- Treat a missing analysis as a supported pending state.
- Throw concise, contextual errors for configuration/query failures. Do not include credentials or full database responses in user-visible markup.
- Do not use cookies, a browser Supabase client, a Route Handler, or a client fetch for this read-only server-rendered page.

## Page implementation

Add the dynamic route `app/news/[id]/page.tsx`, a scoped CSS module, and a route-level not-found page. Keep the page as a Server Component.

### Main article column

- Reuse `SiteHeader` and `SiteFooter` so the details view belongs to the same visual system as the homepage.
- Show source name and published date as the factual eyebrow. Do not infer category or geography.
- Render the stored title as the single H1.
- Show the canonical/original source link as an explicit “Read original” action with a safe external-link treatment when available.
- Render the stored image with a stable approximately 16:9 hero region, object-cover behavior, useful alt text derived from the title, and no layout shift.
- Show an “Analysis at a glance” distribution card immediately after the hero, using the reusable `BiasMeter`, only when analysis exists.
- Render `raw_text` as readable, escaped paragraphs with comfortable width, line height, and vertical rhythm.

### Analysis sidebar

Desktop uses a narrower right column with stacked bordered panels. The sidebar may be sticky only where it does not overlap the header/footer.

When analysis exists, render all stored analysis values:

- an explicit “AI-estimated analysis” label
- overall framing label and left/center/right percentages
- neutral AI summary
- sentiment label and numeric score
- confidence percentage
- framing notes
- loaded terms, as accessible chips/list items, with an honest empty state when the stored array is empty
- disclaimer
- model name as small metadata

The language must not imply that framing is objective truth. Do not rename `summary` to the article’s authored content. Keep the stored article body and AI analysis visually distinct.

When analysis is missing, replace all analysis cards with one calm pending panel stating that the article is stored but its AI analysis is not available yet. The article body remains readable.

### Not-found and failure behavior

- Invalid UUID or absent article: call `notFound()` and render a designed route-level 404 with a link back to the homepage.
- Missing configuration or Supabase query failure: throw for the framework error path and log concise context server-side; never misreport infrastructure failure as “article not found.”

## Visual interpretation

The attached reference is a spacious desktop editorial layout with an approximately 2:1 content/sidebar relationship. The page begins directly below the shared header, keeps the headline and hero visually dominant, and contains restrained white analysis cards with gray-green borders on the existing off-white surface.

- Container: reuse the existing 1280px token and 24px desktop gutters.
- Main grid: roughly `minmax(0, 2fr) minmax(280px, 1fr)` with a 32px gap.
- Page top/bottom spacing: 40–64px on desktop, 24–40px on mobile.
- H1: fluid between the design-system H2/H1 scales and approximately 44px at wide desktop, with tight line height and natural wrapping.
- Hero: large, rounded 8px, unobtrusive border/background fallback.
- Panels: white surface, 1px border, 8px radius, small shadow at most, 20–24px padding.
- Article body: approximately 16–18px copy, 1.65–1.75 line height, and a readable measure.
- Bias colors: retain existing terracotta left, gray-green center, and forest right. Do not use red/green alone to communicate meaning; retain labels and numeric text.
- Tablet: preserve two columns while there is enough width, reducing sidebar minimum and gaps.
- Mobile below approximately 800px: stack article and analysis, place the analysis after the headline/hero and before or after body in a coherent reading order, use full-width panels, and prevent horizontal overflow.
- Respect keyboard focus, semantic headings, contrast, reduced motion, and screen-reader descriptions already established by the design system.

Pixel accuracy means matching the reference’s proportions, hierarchy, density, bordered panels, hero dominance, and responsive stacking—not copying its fake example data or unsupported controls.

## Files likely to change

- `package.json`
- `package-lock.json`
- `.env.example` (new)
- `supabase/schema.sql` (new)
- `lib/supabase/types.ts` (new)
- `lib/supabase/server.ts` (new)
- `lib/supabase/queries/articles.ts` (new)
- `app/news/[id]/page.tsx` (new)
- `app/news/[id]/page.module.css` (new)
- `app/news/[id]/not-found.tsx` (new)
- optionally a small details-only presentational component under `components/` if it materially improves readability
- optionally `components/site-header.tsx` only to make its active navigation state valid on both routes without changing the approved look
- optionally `app/globals.css` only for a small reusable analysis token/style that cannot remain route-scoped

Do not edit `AGENTS.md`. Do not modify homepage data loading, scraping, AI analysis, Clerk, cron, or scheduler code.

## Security requirements

- Keep the Supabase elevated key server-only and unprefixed by `NEXT_PUBLIC_`.
- Import `server-only` in every module that can access the elevated credential.
- Never pass a Supabase client, secret, environment object, or raw error payload to a Client Component.
- Never commit real environment values.
- Render stored article text as text, never HTML.
- Sanitize external-link behavior with `target="_blank"` plus `rel="noreferrer noopener"` when opening canonical/original URLs.
- Do not expose write operations, pipeline mutations, or an API endpoint.
- Keep RLS enabled and public roles revoked in the tracked initial schema. The elevated server client is the only page read path.
- Do not log raw article bodies, analyses, or credentials.

## Acceptance criteria

- `/news/<real-article-uuid>` renders the matching stored article and source from Supabase.
- A stored analysis renders its summary, sentiment label and score, AI-estimated framing label, left/center/right percentages, confidence, framing notes, loaded terms, disclaimer, and model.
- An article without an analysis renders its real article content plus a truthful pending-analysis state.
- No sample text or image from the reference is hardcoded or inserted into storage.
- Invalid and unknown UUIDs produce the designed 404.
- Article content and all database access remain server-rendered/server-only; no secret reaches client output.
- The desktop page closely matches the reference’s two-column editorial proportions and stacked analysis cards.
- The page is usable without overflow at tablet and mobile widths.
- Existing homepage/design-system behavior remains intact.
- TypeScript has no `any` added for the data model or query result.
- The tracked SQL and TypeScript database types agree.
- No pgvector/related-article implementation is introduced prematurely.

## Checks to run

From the repository root:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`

Run a local visual check at desktop and mobile viewport sizes. If Supabase credentials are not available in this workspace, report the runtime verification as blocked by missing external configuration rather than claiming the database query passed. The static checks and build must still be run.

## Exact manual test steps after implementation

1. In Supabase Dashboard → SQL Editor, review and apply `supabase/schema.sql`, or reconcile it with existing tables if the remote schema already contains production rows. Do not drop or truncate existing data.
2. Create `.env.local` from `.env.example` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` to the server-only Supabase secret/service-role credential
   - the public anon value only if another existing feature needs it
3. Confirm there is an `articles` row with a valid `source_id`, required image/date/body fields, and note its UUID. To exercise the full analysis UI, confirm the same UUID has one `article_analyses` row.
4. Run `npm run dev` and watch the terminal for concise server-side query errors.
5. Open `http://localhost:3000/news/<article-uuid>`.
6. Verify title, source, published date, original link, image, body, and every analysis field match the stored rows exactly.
7. Temporarily test an article that has no `article_analyses` row and verify the pending panel appears without invented analysis values.
8. Open `http://localhost:3000/news/not-a-uuid` and a valid but unknown UUID such as `00000000-0000-4000-8000-000000000000`; verify both show the designed not-found page.
9. Test at approximately 1440px, 900px, 768px, and 390px widths. Confirm the desktop two-column layout, mobile stacking, readable body, visible labels, working keyboard focus, and no horizontal overflow.
10. View page source/build output as needed and confirm `SUPABASE_SERVICE_ROLE_KEY` is never serialized to the browser.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  listing_url text not null unique,
  parser_strategy text,
  is_active boolean not null default true,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sources_name_not_blank check (length(btrim(name)) > 0),
  constraint sources_listing_url_not_blank check (length(btrim(listing_url)) > 0)
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete restrict,
  original_url text not null unique,
  canonical_url text,
  title text not null,
  image_url text not null,
  published_at timestamptz not null,
  raw_text text not null,
  scraped_at timestamptz not null default now(),
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_original_url_not_blank check (length(btrim(original_url)) > 0),
  constraint articles_title_not_blank check (length(btrim(title)) > 0),
  constraint articles_image_url_not_blank check (length(btrim(image_url)) > 0),
  constraint articles_raw_text_not_blank check (length(btrim(raw_text)) > 0)
);

create table if not exists public.article_analyses (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null unique references public.articles(id) on delete cascade,
  summary text not null,
  sentiment_score double precision not null,
  sentiment_label text not null,
  bias_score double precision not null,
  bias_label text not null,
  left_percentage double precision not null,
  center_percentage double precision not null,
  right_percentage double precision not null,
  confidence double precision not null,
  framing_notes text not null,
  loaded_terms text[] not null default '{}',
  disclaimer text not null,
  model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_analyses_summary_not_blank check (length(btrim(summary)) > 0),
  constraint article_analyses_sentiment_score_range check (sentiment_score between -1 and 1),
  constraint article_analyses_sentiment_label_allowed check (
    sentiment_label in ('positive', 'neutral', 'negative')
  ),
  constraint article_analyses_bias_score_range check (bias_score between -1 and 1),
  constraint article_analyses_bias_score_derived check (
    abs(bias_score - ((right_percentage - left_percentage) / 100.0)) < 0.000001
  ),
  constraint article_analyses_bias_label_allowed check (
    bias_label in ('left', 'center', 'right', 'mixed', 'unclear')
  ),
  constraint article_analyses_left_percentage_range check (left_percentage between 0 and 100),
  constraint article_analyses_center_percentage_range check (center_percentage between 0 and 100),
  constraint article_analyses_right_percentage_range check (right_percentage between 0 and 100),
  constraint article_analyses_percentages_sum check (
    abs((left_percentage + center_percentage + right_percentage) - 100) < 0.001
  ),
  constraint article_analyses_confidence_range check (confidence between 0 and 1),
  constraint article_analyses_framing_notes_not_blank check (length(btrim(framing_notes)) > 0),
  constraint article_analyses_disclaimer_not_blank check (length(btrim(disclaimer)) > 0),
  constraint article_analyses_model_not_blank check (length(btrim(model)) > 0)
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  event text not null,
  message text not null,
  run_id text,
  source_id uuid references public.sources(id) on delete set null,
  article_id uuid references public.articles(id) on delete set null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint logs_level_allowed check (level in ('info', 'warn', 'error')),
  constraint logs_event_not_blank check (length(btrim(event)) > 0),
  constraint logs_message_not_blank check (length(btrim(message)) > 0),
  constraint logs_run_id_not_blank check (run_id is null or length(btrim(run_id)) > 0),
  constraint logs_context_is_object check (jsonb_typeof(context) = 'object')
);

create table if not exists public.oxylabs_schedules (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null unique references public.sources(id) on delete cascade,
  oxylabs_schedule_id text not null unique,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oxylabs_schedules_remote_id_not_blank check (
    length(btrim(oxylabs_schedule_id)) > 0
  )
);

create table if not exists public.oxylabs_schedule_runs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.oxylabs_schedules(id) on delete cascade,
  oxylabs_run_id text not null,
  oxylabs_job_id text not null,
  result_status text not null,
  processing_status text not null default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  processed_at timestamptz,
  summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint oxylabs_schedule_runs_run_id_not_blank check (
    length(btrim(oxylabs_run_id)) > 0
  ),
  constraint oxylabs_schedule_runs_job_id_not_blank check (
    length(btrim(oxylabs_job_id)) > 0
  ),
  constraint oxylabs_schedule_runs_result_status_allowed check (
    result_status in ('pending', 'done', 'faulted')
  ),
  constraint oxylabs_schedule_runs_processing_status_allowed check (
    processing_status in ('pending', 'processing', 'completed', 'failed', 'skipped')
  ),
  constraint oxylabs_schedule_runs_summary_is_object check (jsonb_typeof(summary) = 'object'),
  constraint oxylabs_schedule_runs_job_unique unique (schedule_id, oxylabs_job_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'article_analyses_bias_score_derived'
      and conrelid = 'public.article_analyses'::regclass
  ) then
    alter table public.article_analyses
      add constraint article_analyses_bias_score_derived check (
        abs(bias_score - ((right_percentage - left_percentage) / 100.0)) < 0.000001
      );
  end if;
end;
$$;

create index if not exists articles_source_id_idx on public.articles(source_id);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_analyzed_at_idx on public.articles(analyzed_at);
create index if not exists article_analyses_article_id_idx on public.article_analyses(article_id);
create unique index if not exists articles_canonical_url_unique_idx
  on public.articles(canonical_url)
  where canonical_url is not null;
create index if not exists logs_created_at_idx on public.logs(created_at desc);
create index if not exists logs_run_id_idx on public.logs(run_id) where run_id is not null;
create index if not exists logs_source_id_idx on public.logs(source_id) where source_id is not null;
create index if not exists logs_article_id_idx on public.logs(article_id) where article_id is not null;
create index if not exists oxylabs_schedules_active_idx
  on public.oxylabs_schedules(is_active, source_id);
create index if not exists oxylabs_schedule_runs_schedule_created_idx
  on public.oxylabs_schedule_runs(schedule_id, created_at desc);
create index if not exists oxylabs_schedule_runs_processing_idx
  on public.oxylabs_schedule_runs(result_status, processing_status, created_at)
  where result_status = 'done' and processing_status = 'pending';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

drop trigger if exists article_analyses_set_updated_at on public.article_analyses;
create trigger article_analyses_set_updated_at
before update on public.article_analyses
for each row execute function public.set_updated_at();

drop trigger if exists oxylabs_schedules_set_updated_at on public.oxylabs_schedules;
create trigger oxylabs_schedules_set_updated_at
before update on public.oxylabs_schedules
for each row execute function public.set_updated_at();

drop trigger if exists oxylabs_schedule_runs_set_updated_at on public.oxylabs_schedule_runs;
create trigger oxylabs_schedule_runs_set_updated_at
before update on public.oxylabs_schedule_runs
for each row execute function public.set_updated_at();

create or replace function public.save_article_analysis(
  p_article_id uuid,
  p_summary text,
  p_sentiment_score double precision,
  p_sentiment_label text,
  p_bias_score double precision,
  p_bias_label text,
  p_left_percentage double precision,
  p_center_percentage double precision,
  p_right_percentage double precision,
  p_confidence double precision,
  p_framing_notes text,
  p_loaded_terms text[],
  p_disclaimer text,
  p_model text
)
returns public.article_analyses
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_analysis public.article_analyses;
begin
  insert into public.article_analyses (
    article_id,
    summary,
    sentiment_score,
    sentiment_label,
    bias_score,
    bias_label,
    left_percentage,
    center_percentage,
    right_percentage,
    confidence,
    framing_notes,
    loaded_terms,
    disclaimer,
    model
  ) values (
    p_article_id,
    p_summary,
    p_sentiment_score,
    p_sentiment_label,
    p_bias_score,
    p_bias_label,
    p_left_percentage,
    p_center_percentage,
    p_right_percentage,
    p_confidence,
    p_framing_notes,
    p_loaded_terms,
    p_disclaimer,
    p_model
  )
  on conflict (article_id) do update set
    summary = excluded.summary,
    sentiment_score = excluded.sentiment_score,
    sentiment_label = excluded.sentiment_label,
    bias_score = excluded.bias_score,
    bias_label = excluded.bias_label,
    left_percentage = excluded.left_percentage,
    center_percentage = excluded.center_percentage,
    right_percentage = excluded.right_percentage,
    confidence = excluded.confidence,
    framing_notes = excluded.framing_notes,
    loaded_terms = excluded.loaded_terms,
    disclaimer = excluded.disclaimer,
    model = excluded.model
  returning * into saved_analysis;

  update public.articles
  set analyzed_at = now()
  where id = p_article_id;

  return saved_analysis;
end;
$$;

comment on table public.sources is 'Configured news source homepages used by the scraping pipeline.';
comment on table public.articles is 'Validated, append-only news articles collected by the scraping pipeline.';
comment on table public.article_analyses is 'Validated AI analysis for one stored article.';
comment on table public.logs is 'Append-only structured events emitted by server-side pipeline work.';
comment on table public.oxylabs_schedules is 'Local state for one Oxylabs homepage schedule per configured source.';
comment on table public.oxylabs_schedule_runs is 'Idempotent local processing state for Oxylabs schedule jobs.';
comment on column public.article_analyses.bias_score is '(right_percentage - left_percentage) / 100.';
comment on column public.oxylabs_schedules.oxylabs_schedule_id is 'Exact Oxylabs 64-bit identifier stored as text to prevent JavaScript precision loss.';
comment on column public.oxylabs_schedule_runs.oxylabs_run_id is 'Exact Oxylabs 64-bit identifier stored as text.';
comment on column public.oxylabs_schedule_runs.oxylabs_job_id is 'Exact Oxylabs 64-bit identifier stored as text.';

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.article_analyses enable row level security;
alter table public.logs enable row level security;
alter table public.oxylabs_schedules enable row level security;
alter table public.oxylabs_schedule_runs enable row level security;

revoke all on table public.sources from anon, authenticated;
revoke all on table public.articles from anon, authenticated;
revoke all on table public.article_analyses from anon, authenticated;
revoke all on table public.logs from anon, authenticated;
revoke all on table public.oxylabs_schedules from anon, authenticated;
revoke all on table public.oxylabs_schedule_runs from anon, authenticated;
revoke all on table public.sources from service_role;
revoke all on table public.articles from service_role;
revoke all on table public.article_analyses from service_role;
revoke all on table public.logs from service_role;
revoke all on table public.oxylabs_schedules from service_role;
revoke all on table public.oxylabs_schedule_runs from service_role;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.save_article_analysis(
  uuid, text, double precision, text, double precision, text,
  double precision, double precision, double precision, double precision,
  text, text[], text, text
) from public, anon, authenticated;

grant select, insert, update on table public.sources to service_role;
grant select, insert, update on table public.articles to service_role;
grant select, insert, update on table public.article_analyses to service_role;
grant insert, select on table public.logs to service_role;
grant select, insert, update on table public.oxylabs_schedules to service_role;
grant select, insert, update on table public.oxylabs_schedule_runs to service_role;
grant execute on function public.set_updated_at() to service_role;
grant execute on function public.save_article_analysis(
  uuid, text, double precision, text, double precision, text,
  double precision, double precision, double precision, double precision,
  text, text[], text, text
) to service_role;

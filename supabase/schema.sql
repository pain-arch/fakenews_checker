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

create index if not exists articles_source_id_idx on public.articles(source_id);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_analyzed_at_idx on public.articles(analyzed_at);
create index if not exists article_analyses_article_id_idx on public.article_analyses(article_id);

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

comment on table public.sources is 'Configured news source homepages used by the scraping pipeline.';
comment on table public.articles is 'Validated, append-only news articles collected by the scraping pipeline.';
comment on table public.article_analyses is 'Validated AI analysis for one stored article.';
comment on column public.article_analyses.bias_score is '(right_percentage - left_percentage) / 100.';

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.article_analyses enable row level security;

revoke all on table public.sources from anon, authenticated;
revoke all on table public.articles from anon, authenticated;
revoke all on table public.article_analyses from anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

grant select, insert, update, delete on table public.sources to service_role;
grant select, insert, update, delete on table public.articles to service_role;
grant select, insert, update, delete on table public.article_analyses to service_role;
grant execute on function public.set_updated_at() to service_role;

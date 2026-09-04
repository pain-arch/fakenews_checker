import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ArticleAnalysisRow,
  ArticleInsert,
  ArticleRow,
  BiasLabel,
  SentimentLabel,
  SourceRow,
} from "@/lib/supabase/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const URL_QUERY_CHUNK_SIZE = 15;
const MAX_INSERT_BATCH_SIZE = 100;
const MAX_FEED_SIZE = 50;
const MAX_ANALYSIS_BATCH_SIZE = 100;
const PENDING_SCAN_PAGE_SIZE = 100;

const ARTICLE_COLUMNS =
  "id, source_id, original_url, canonical_url, title, image_url, published_at, raw_text, scraped_at, analyzed_at, created_at, updated_at";
const SOURCE_COLUMNS =
  "id, name, listing_url, parser_strategy, is_active, logo_url, created_at, updated_at";
const ANALYSIS_COLUMNS =
  "id, article_id, summary, sentiment_score, sentiment_label, bias_score, bias_label, left_percentage, center_percentage, right_percentage, confidence, framing_notes, loaded_terms, disclaimer, model, created_at, updated_at";

export type ArticleDetails = {
  article: ArticleRow;
  source: SourceRow;
  analysis: ArticleAnalysisRow | null;
};

export type HomeArticleCard = {
  title: string;
  href: string;
  imageUrl: string;
  imageAlt: string;
  sourceName: string;
  publishedDateTime: string;
  publishedLabel: string;
  sentimentLabel: SentimentLabel;
  framingLabel: BiasLabel;
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  confidence: number;
};

export type ExistingArticleUrls = {
  originalUrls: Set<string>;
  canonicalUrls: Set<string>;
};

export type InsertArticlesResult = {
  inserted: ArticleRow[];
  duplicates: number;
};

function reportQueryFailure(operation: string, context: Record<string, string | number | undefined>, code?: string) {
  console.error(`[supabase:articles] ${operation} failed.`, { ...context, code: code ?? "unknown" });
}

function boundedInteger(value: number, fallback: number, maximum: number): number {
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

function chunks<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function formatPublishedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function isArticleId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export async function getArticleDetails(articleId: string): Promise<ArticleDetails | null> {
  if (!isArticleId(articleId)) return null;

  const supabase = getSupabaseServerClient();
  const articleResult = await supabase.from("articles").select(ARTICLE_COLUMNS).eq("id", articleId).maybeSingle();

  if (articleResult.error) {
    reportQueryFailure("Article query", { articleId }, articleResult.error.code);
    throw new Error("Unable to load the requested article.");
  }
  if (!articleResult.data) return null;

  const article = articleResult.data;
  const [sourceResult, analysisResult] = await Promise.all([
    supabase.from("sources").select(SOURCE_COLUMNS).eq("id", article.source_id).maybeSingle(),
    supabase.from("article_analyses").select(ANALYSIS_COLUMNS).eq("article_id", article.id).maybeSingle(),
  ]);

  if (sourceResult.error) {
    reportQueryFailure("Source query", { articleId }, sourceResult.error.code);
    throw new Error("Unable to load the article source.");
  }
  if (!sourceResult.data) {
    reportQueryFailure("Source integrity check", { articleId });
    throw new Error("The article references a source that does not exist.");
  }
  if (analysisResult.error) {
    reportQueryFailure("Analysis query", { articleId }, analysisResult.error.code);
    throw new Error("Unable to load the article analysis.");
  }

  return { article, source: sourceResult.data, analysis: analysisResult.data };
}

export async function listLatestAnalyzedArticles(limit = 12): Promise<HomeArticleCard[]> {
  const safeLimit = boundedInteger(limit, 12, MAX_FEED_SIZE);
  const result = await getSupabaseServerClient()
    .from("articles")
    .select(`id, title, image_url, published_at, sources!inner(name), article_analyses!inner(sentiment_label, bias_label, left_percentage, center_percentage, right_percentage, confidence)`)
    .order("published_at", { ascending: false })
    .limit(safeLimit);

  if (result.error) {
    reportQueryFailure("Homepage feed query", { limit: safeLimit }, result.error.code);
    throw new Error("Unable to load the latest analyzed articles.");
  }

  return result.data.map((row) => ({
    title: row.title,
    href: `/news/${row.id}`,
    imageUrl: row.image_url,
    imageAlt: row.title,
    sourceName: row.sources.name,
    publishedDateTime: row.published_at,
    publishedLabel: formatPublishedDate(row.published_at),
    sentimentLabel: row.article_analyses.sentiment_label,
    framingLabel: row.article_analyses.bias_label,
    leftPercentage: row.article_analyses.left_percentage,
    centerPercentage: row.article_analyses.center_percentage,
    rightPercentage: row.article_analyses.right_percentage,
    confidence: row.article_analyses.confidence,
  }));
}

export async function findExistingArticleUrls(urls: readonly string[]): Promise<ExistingArticleUrls> {
  const uniqueUrls = [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
  const originalUrls = new Set<string>();
  const canonicalUrls = new Set<string>();
  const supabase = getSupabaseServerClient();

  for (const urlChunk of chunks(uniqueUrls, URL_QUERY_CHUNK_SIZE)) {
    const [originalResult, canonicalResult] = await Promise.all([
      supabase.from("articles").select("original_url").in("original_url", urlChunk),
      supabase.from("articles").select("canonical_url").in("canonical_url", urlChunk),
    ]);
    if (originalResult.error || canonicalResult.error) {
      const error = originalResult.error ?? canonicalResult.error;
      reportQueryFailure("URL existence query", { chunkSize: urlChunk.length }, error?.code);
      throw new Error("Unable to check existing article URLs.");
    }
    for (const row of originalResult.data) originalUrls.add(row.original_url);
    for (const row of canonicalResult.data) if (row.canonical_url) canonicalUrls.add(row.canonical_url);
  }

  return { originalUrls, canonicalUrls };
}

export async function insertValidatedArticles(inputs: readonly ArticleInsert[]): Promise<InsertArticlesResult> {
  const uniqueInputs = [...new Map(inputs.map((input) => [input.original_url, input])).values()]
    .slice(0, MAX_INSERT_BATCH_SIZE);
  const inserted: ArticleRow[] = [];
  let duplicates = Math.max(0, inputs.length - uniqueInputs.length);
  const supabase = getSupabaseServerClient();

  for (const input of uniqueInputs) {
    const result = await supabase.from("articles").insert(input).select(ARTICLE_COLUMNS).single();
    if (result.error?.code === "23505") {
      duplicates += 1;
      continue;
    }
    if (result.error) {
      reportQueryFailure("Article insert", { sourceId: input.source_id }, result.error.code);
      throw new Error("Unable to insert a validated article.");
    }
    inserted.push(result.data);
  }

  return { inserted, duplicates };
}

export async function listPendingAnalysisArticles(options: {
  limit?: number;
  articleIds?: readonly string[];
} = {}): Promise<ArticleRow[]> {
  const safeLimit = boundedInteger(options.limit ?? MAX_ANALYSIS_BATCH_SIZE, MAX_ANALYSIS_BATCH_SIZE, MAX_ANALYSIS_BATCH_SIZE);
  const selectedIds = [...new Set((options.articleIds ?? []).filter(isArticleId))]
    .slice(0, MAX_ANALYSIS_BATCH_SIZE);
  if (options.articleIds && selectedIds.length === 0) return [];

  const pending: ArticleRow[] = [];
  let offset = 0;
  const supabase = getSupabaseServerClient();

  while (pending.length < safeLimit) {
    let query = supabase
      .from("articles")
      .select(`${ARTICLE_COLUMNS}, article_analyses(id)`)
      .order("created_at", { ascending: true })
      .range(offset, offset + PENDING_SCAN_PAGE_SIZE - 1);
    if (selectedIds.length > 0) query = query.in("id", selectedIds);

    const result = await query;
    if (result.error) {
      reportQueryFailure("Pending analysis query", { limit: safeLimit }, result.error.code);
      throw new Error("Unable to load pending analysis articles.");
    }

    for (const row of result.data) {
      const { article_analyses, ...article } = row;
      if (!article_analyses) {
        pending.push(article);
        if (pending.length === safeLimit) break;
      }
    }
    if (result.data.length < PENDING_SCAN_PAGE_SIZE || selectedIds.length > 0) break;
    offset += PENDING_SCAN_PAGE_SIZE;
  }

  return pending;
}

import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ArticleAnalysisRow, ArticleRow, SourceRow } from "@/lib/supabase/types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function reportQueryFailure(operation: string, articleId: string, code?: string) {
  console.error(`[article-details] ${operation} failed.`, {
    articleId,
    code: code ?? "unknown",
  });
}

export function isArticleId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export async function getArticleDetails(articleId: string): Promise<ArticleDetails | null> {
  if (!isArticleId(articleId)) {
    return null;
  }

  const supabase = getSupabaseServerClient();
  const articleResult = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("id", articleId)
    .maybeSingle();

  if (articleResult.error) {
    reportQueryFailure("Article query", articleId, articleResult.error.code);
    throw new Error("Unable to load the requested article.");
  }

  if (!articleResult.data) {
    return null;
  }

  const article = articleResult.data;
  const [sourceResult, analysisResult] = await Promise.all([
    supabase.from("sources").select(SOURCE_COLUMNS).eq("id", article.source_id).maybeSingle(),
    supabase
      .from("article_analyses")
      .select(ANALYSIS_COLUMNS)
      .eq("article_id", article.id)
      .maybeSingle(),
  ]);

  if (sourceResult.error) {
    reportQueryFailure("Source query", articleId, sourceResult.error.code);
    throw new Error("Unable to load the article source.");
  }

  if (!sourceResult.data) {
    reportQueryFailure("Source integrity check", articleId);
    throw new Error("The article references a source that does not exist.");
  }

  if (analysisResult.error) {
    reportQueryFailure("Analysis query", articleId, analysisResult.error.code);
    throw new Error("Unable to load the article analysis.");
  }

  return {
    article,
    source: sourceResult.data,
    analysis: analysisResult.data,
  };
}

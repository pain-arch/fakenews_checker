import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ArticleAnalysisRow, BiasLabel, SentimentLabel } from "@/lib/supabase/types";

export type ValidatedAnalysisInput = {
  articleId: string;
  summary: string;
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  biasLabel: BiasLabel;
  leftPercentage: number;
  centerPercentage: number;
  rightPercentage: number;
  confidence: number;
  framingNotes: string;
  loadedTerms: string[];
  disclaimer: string;
  model: string;
};

export async function saveValidatedAnalysis(input: ValidatedAnalysisInput): Promise<ArticleAnalysisRow> {
  const biasScore = (input.rightPercentage - input.leftPercentage) / 100;
  const result = await getSupabaseServerClient().rpc("save_article_analysis", {
    p_article_id: input.articleId,
    p_summary: input.summary,
    p_sentiment_score: input.sentimentScore,
    p_sentiment_label: input.sentimentLabel,
    p_bias_score: biasScore,
    p_bias_label: input.biasLabel,
    p_left_percentage: input.leftPercentage,
    p_center_percentage: input.centerPercentage,
    p_right_percentage: input.rightPercentage,
    p_confidence: input.confidence,
    p_framing_notes: input.framingNotes,
    p_loaded_terms: input.loadedTerms,
    p_disclaimer: input.disclaimer,
    p_model: input.model,
  });

  if (result.error) {
    console.error("[supabase:analyses] Analysis save failed.", {
      articleId: input.articleId,
      code: result.error.code,
    });
    throw new Error("Unable to save the validated article analysis.");
  }
  return result.data;
}

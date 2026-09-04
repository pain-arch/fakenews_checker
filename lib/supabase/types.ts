export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SentimentLabel = "positive" | "neutral" | "negative";
export type BiasLabel = "left" | "center" | "right" | "mixed" | "unclear";
export type LogLevel = "info" | "warn" | "error";
export type OxylabsResultStatus = "pending" | "done" | "faulted";
export type ScheduleProcessingStatus = "pending" | "processing" | "completed" | "failed" | "skipped";

type SourceTable = {
  Row: { id: string; name: string; listing_url: string; parser_strategy: string | null; is_active: boolean; logo_url: string | null; created_at: string; updated_at: string };
  Insert: { id?: string; name: string; listing_url: string; parser_strategy?: string | null; is_active?: boolean; logo_url?: string | null; created_at?: string; updated_at?: string };
  Update: { id?: string; name?: string; listing_url?: string; parser_strategy?: string | null; is_active?: boolean; logo_url?: string | null; created_at?: string; updated_at?: string };
  Relationships: [];
};

type ArticleTable = {
  Row: { id: string; source_id: string; original_url: string; canonical_url: string | null; title: string; image_url: string; published_at: string; raw_text: string; scraped_at: string; analyzed_at: string | null; created_at: string; updated_at: string };
  Insert: { id?: string; source_id: string; original_url: string; canonical_url?: string | null; title: string; image_url: string; published_at: string; raw_text: string; scraped_at?: string; analyzed_at?: string | null; created_at?: string; updated_at?: string };
  Update: { id?: string; source_id?: string; original_url?: string; canonical_url?: string | null; title?: string; image_url?: string; published_at?: string; raw_text?: string; scraped_at?: string; analyzed_at?: string | null; created_at?: string; updated_at?: string };
  Relationships: [{ foreignKeyName: "articles_source_id_fkey"; columns: ["source_id"]; isOneToOne: false; referencedRelation: "sources"; referencedColumns: ["id"] }];
};

type ArticleAnalysisTable = {
  Row: { id: string; article_id: string; summary: string; sentiment_score: number; sentiment_label: SentimentLabel; bias_score: number; bias_label: BiasLabel; left_percentage: number; center_percentage: number; right_percentage: number; confidence: number; framing_notes: string; loaded_terms: string[]; disclaimer: string; model: string; created_at: string; updated_at: string };
  Insert: { id?: string; article_id: string; summary: string; sentiment_score: number; sentiment_label: SentimentLabel; bias_score: number; bias_label: BiasLabel; left_percentage: number; center_percentage: number; right_percentage: number; confidence: number; framing_notes: string; loaded_terms?: string[]; disclaimer: string; model: string; created_at?: string; updated_at?: string };
  Update: { id?: string; article_id?: string; summary?: string; sentiment_score?: number; sentiment_label?: SentimentLabel; bias_score?: number; bias_label?: BiasLabel; left_percentage?: number; center_percentage?: number; right_percentage?: number; confidence?: number; framing_notes?: string; loaded_terms?: string[]; disclaimer?: string; model?: string; created_at?: string; updated_at?: string };
  Relationships: [{ foreignKeyName: "article_analyses_article_id_fkey"; columns: ["article_id"]; isOneToOne: true; referencedRelation: "articles"; referencedColumns: ["id"] }];
};

type LogTable = {
  Row: { id: string; level: LogLevel; event: string; message: string; run_id: string | null; source_id: string | null; article_id: string | null; context: Json; created_at: string };
  Insert: { id?: string; level: LogLevel; event: string; message: string; run_id?: string | null; source_id?: string | null; article_id?: string | null; context?: Json; created_at?: string };
  Update: { id?: string; level?: LogLevel; event?: string; message?: string; run_id?: string | null; source_id?: string | null; article_id?: string | null; context?: Json; created_at?: string };
  Relationships: [
    { foreignKeyName: "logs_source_id_fkey"; columns: ["source_id"]; isOneToOne: false; referencedRelation: "sources"; referencedColumns: ["id"] },
    { foreignKeyName: "logs_article_id_fkey"; columns: ["article_id"]; isOneToOne: false; referencedRelation: "articles"; referencedColumns: ["id"] },
  ];
};

type OxylabsScheduleTable = {
  Row: { id: string; source_id: string; oxylabs_schedule_id: string; is_active: boolean; last_synced_at: string | null; created_at: string; updated_at: string };
  Insert: { id?: string; source_id: string; oxylabs_schedule_id: string; is_active?: boolean; last_synced_at?: string | null; created_at?: string; updated_at?: string };
  Update: { id?: string; source_id?: string; oxylabs_schedule_id?: string; is_active?: boolean; last_synced_at?: string | null; created_at?: string; updated_at?: string };
  Relationships: [{ foreignKeyName: "oxylabs_schedules_source_id_fkey"; columns: ["source_id"]; isOneToOne: true; referencedRelation: "sources"; referencedColumns: ["id"] }];
};

type OxylabsScheduleRunTable = {
  Row: { id: string; schedule_id: string; oxylabs_run_id: string; oxylabs_job_id: string; result_status: OxylabsResultStatus; processing_status: ScheduleProcessingStatus; started_at: string | null; completed_at: string | null; processed_at: string | null; summary: Json; error_message: string | null; created_at: string; updated_at: string };
  Insert: { id?: string; schedule_id: string; oxylabs_run_id: string; oxylabs_job_id: string; result_status: OxylabsResultStatus; processing_status?: ScheduleProcessingStatus; started_at?: string | null; completed_at?: string | null; processed_at?: string | null; summary?: Json; error_message?: string | null; created_at?: string; updated_at?: string };
  Update: { id?: string; schedule_id?: string; oxylabs_run_id?: string; oxylabs_job_id?: string; result_status?: OxylabsResultStatus; processing_status?: ScheduleProcessingStatus; started_at?: string | null; completed_at?: string | null; processed_at?: string | null; summary?: Json; error_message?: string | null; created_at?: string; updated_at?: string };
  Relationships: [{ foreignKeyName: "oxylabs_schedule_runs_schedule_id_fkey"; columns: ["schedule_id"]; isOneToOne: false; referencedRelation: "oxylabs_schedules"; referencedColumns: ["id"] }];
};

export type Database = {
  public: {
    Tables: {
      sources: SourceTable;
      articles: ArticleTable;
      article_analyses: ArticleAnalysisTable;
      logs: LogTable;
      oxylabs_schedules: OxylabsScheduleTable;
      oxylabs_schedule_runs: OxylabsScheduleRunTable;
    };
    Views: { [_ in never]: never };
    Functions: {
      save_article_analysis: {
        Args: {
          p_article_id: string; p_summary: string; p_sentiment_score: number; p_sentiment_label: string;
          p_bias_score: number; p_bias_label: string; p_left_percentage: number; p_center_percentage: number;
          p_right_percentage: number; p_confidence: number; p_framing_notes: string; p_loaded_terms: string[];
          p_disclaimer: string; p_model: string;
        };
        Returns: ArticleAnalysisTable["Row"];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type SourceRow = SourceTable["Row"];
export type SourceInsert = SourceTable["Insert"];
export type ArticleRow = ArticleTable["Row"];
export type ArticleInsert = ArticleTable["Insert"];
export type ArticleAnalysisRow = ArticleAnalysisTable["Row"];
export type LogRow = LogTable["Row"];
export type LogInsert = LogTable["Insert"];
export type OxylabsScheduleRow = OxylabsScheduleTable["Row"];
export type OxylabsScheduleInsert = OxylabsScheduleTable["Insert"];
export type OxylabsScheduleRunRow = OxylabsScheduleRunTable["Row"];
export type OxylabsScheduleRunInsert = OxylabsScheduleRunTable["Insert"];

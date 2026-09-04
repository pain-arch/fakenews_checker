export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SentimentLabel = "positive" | "neutral" | "negative";
export type BiasLabel = "left" | "center" | "right" | "mixed" | "unclear";

export type Database = {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          listing_url: string;
          parser_strategy: string | null;
          is_active: boolean;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          listing_url: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          listing_url?: string;
          parser_strategy?: string | null;
          is_active?: boolean;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          original_url: string;
          canonical_url: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at: string;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          original_url: string;
          canonical_url?: string | null;
          title: string;
          image_url: string;
          published_at: string;
          raw_text: string;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          original_url?: string;
          canonical_url?: string | null;
          title?: string;
          image_url?: string;
          published_at?: string;
          raw_text?: string;
          scraped_at?: string;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
        ];
      };
      article_analyses: {
        Row: {
          id: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: SentimentLabel;
          bias_score: number;
          bias_label: BiasLabel;
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          confidence: number;
          framing_notes: string;
          loaded_terms: string[];
          disclaimer: string;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          summary: string;
          sentiment_score: number;
          sentiment_label: SentimentLabel;
          bias_score: number;
          bias_label: BiasLabel;
          left_percentage: number;
          center_percentage: number;
          right_percentage: number;
          confidence: number;
          framing_notes: string;
          loaded_terms?: string[];
          disclaimer: string;
          model: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          summary?: string;
          sentiment_score?: number;
          sentiment_label?: SentimentLabel;
          bias_score?: number;
          bias_label?: BiasLabel;
          left_percentage?: number;
          center_percentage?: number;
          right_percentage?: number;
          confidence?: number;
          framing_notes?: string;
          loaded_terms?: string[];
          disclaimer?: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_analyses_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: true;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleAnalysisRow = Database["public"]["Tables"]["article_analyses"]["Row"];

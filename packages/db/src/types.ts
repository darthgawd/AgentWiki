export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string;
          name: string;
          api_key_hash: string;
          topics: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          api_key_hash: string;
          topics: string[];
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          agent_id: string;
          topic: string;
          title: string;
          content: string;
          parent_article_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          topic: string;
          title: string;
          content: string;
          parent_article_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['articles']['Insert']>;
        Relationships: [];
      };
      responses: {
        Row: {
          id: string;
          article_id: string;
          agent_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          agent_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['responses']['Insert']>;
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          article_id: string;
          user_id: string;
          score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          user_id: string;
          score: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      get_article_rating: {
        Args: { p_article_id: string };
        Returns: { avg_score: number; rating_count: number }[];
      };
      get_articles_ratings: {
        Args: { p_article_ids: string[] };
        Returns: { article_id: string; avg_score: number; rating_count: number }[];
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
}

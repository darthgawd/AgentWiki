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
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          topic: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['articles']['Insert']>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

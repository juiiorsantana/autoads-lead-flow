export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anuncios: {
        Row: {
          clics_whatsapp: number
          created_at: string
          descricao: string | null
          detalhes: Json | null
          id: string
          imagens: string[]
          localizacao: string | null
          orcamento: number | null
          preco: number
          slug: string
          status: string | null
          titulo: string
          updated_at: string
          user_id: string
          video_do_anuncio: string | null
          video_url: string | null
          visualizacoes: number
        }
        Insert: {
          clics_whatsapp?: number
          created_at?: string
          descricao?: string | null
          detalhes?: Json | null
          id?: string
          imagens: string[]
          localizacao?: string | null
          orcamento?: number | null
          preco: number
          slug: string
          status?: string | null
          titulo: string
          updated_at?: string
          user_id: string
          video_do_anuncio?: string | null
          video_url?: string | null
          visualizacoes?: number
        }
        Update: {
          clics_whatsapp?: number
          created_at?: string
          descricao?: string | null
          detalhes?: Json | null
          id?: string
          imagens?: string[]
          localizacao?: string | null
          orcamento?: number | null
          preco?: number
          slug?: string
          status?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
          video_do_anuncio?: string | null
          video_url?: string | null
          visualizacoes?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      visualizacoes: {
        Row: {
          anuncio_id: string
          created_at: string
          id: string
          viewer_agent: string | null
          viewer_ip: string | null
        }
        Insert: {
          anuncio_id: string
          created_at?: string
          id?: string
          viewer_agent?: string | null
          viewer_ip?: string | null
        }
        Update: {
          anuncio_id?: string
          created_at?: string
          id?: string
          viewer_agent?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visualizacoes_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_cliques: {
        Row: {
          anuncio_id: string
          clicker_agent: string | null
          clicker_ip: string | null
          created_at: string
          id: string
        }
        Insert: {
          anuncio_id: string
          clicker_agent?: string | null
          clicker_ip?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          anuncio_id?: string
          clicker_agent?: string | null
          clicker_ip?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_cliques_anuncio_id_fkey"
            columns: ["anuncio_id"]
            isOneToOne: false
            referencedRelation: "anuncios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_slug: {
        Args: { title: string }
        Returns: string
      }
      register_view: {
        Args: { anuncio_slug: string; viewer_ip: string; viewer_agent: string }
        Returns: undefined
      }
      register_whatsapp_click: {
        Args: {
          anuncio_slug: string
          clicker_ip: string
          clicker_agent: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

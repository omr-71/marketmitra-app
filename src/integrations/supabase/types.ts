export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          detail: Json
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          detail?: Json
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          detail?: Json
          id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          device: string | null
          event: string
          id: string
          label: string | null
          lang: string | null
          page: string | null
          props: Json
          session_id: string | null
        }
        Insert: {
          created_at?: string
          device?: string | null
          event: string
          id?: string
          label?: string | null
          lang?: string | null
          page?: string | null
          props?: Json
          session_id?: string | null
        }
        Update: {
          created_at?: string
          device?: string | null
          event?: string
          id?: string
          label?: string | null
          lang?: string | null
          page?: string | null
          props?: Json
          session_id?: string | null
        }
        Relationships: []
      }
      api_fetch_logs: {
        Row: {
          commodity: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          latest_data_date: string | null
          ok: boolean
          provider: string
          record_count: number
          state: string | null
          status_code: number | null
        }
        Insert: {
          commodity?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          latest_data_date?: string | null
          ok: boolean
          provider: string
          record_count?: number
          state?: string | null
          status_code?: number | null
        }
        Update: {
          commodity?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          latest_data_date?: string | null
          ok?: boolean
          provider?: string
          record_count?: number
          state?: string | null
          status_code?: number | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          label: string
          maintenance_message: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          label: string
          maintenance_message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          label?: string
          maintenance_message?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      link_cluster_members: {
        Row: {
          cluster_id: string
          created_at: string
          estimated_hours: number | null
          farmer_id: string
          id: string
          request_id: string
        }
        Insert: {
          cluster_id: string
          created_at?: string
          estimated_hours?: number | null
          farmer_id: string
          id?: string
          request_id: string
        }
        Update: {
          cluster_id?: string
          created_at?: string
          estimated_hours?: number | null
          farmer_id?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_cluster_members_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "link_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_cluster_members_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "link_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clusters: {
        Row: {
          created_at: string
          district: string | null
          id: string
          listing_id: string | null
          provider_id: string | null
          resource_type: string
          state: string | null
          status: string
          updated_at: string
          window_date: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          listing_id?: string | null
          provider_id?: string | null
          resource_type: string
          state?: string | null
          status?: string
          updated_at?: string
          window_date: string
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          listing_id?: string | null
          provider_id?: string | null
          resource_type?: string
          state?: string | null
          status?: string
          updated_at?: string
          window_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_clusters_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "link_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      link_listings: {
        Row: {
          available_from: string
          available_to: string
          category: string
          condition: string | null
          created_at: string
          description: string | null
          district: string | null
          id: string
          last_confirmed_at: string
          latitude: number | null
          longitude: number | null
          name: string
          negotiable: boolean
          owner_id: string
          photos: string[]
          price: number | null
          pricing_model: string
          quantity: number | null
          resource_type: string
          service_area: string | null
          state: string | null
          status: string
          terms: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          available_from: string
          available_to: string
          category: string
          condition?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          last_confirmed_at?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          negotiable?: boolean
          owner_id: string
          photos?: string[]
          price?: number | null
          pricing_model: string
          quantity?: number | null
          resource_type: string
          service_area?: string | null
          state?: string | null
          status?: string
          terms?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          available_from?: string
          available_to?: string
          category?: string
          condition?: string | null
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          last_confirmed_at?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          negotiable?: boolean
          owner_id?: string
          photos?: string[]
          price?: number | null
          pricing_model?: string
          quantity?: number | null
          resource_type?: string
          service_area?: string | null
          state?: string | null
          status?: string
          terms?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      link_matches: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          provider_id: string
          reason: string | null
          request_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          provider_id: string
          reason?: string | null
          request_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          provider_id?: string
          reason?: string | null
          request_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "link_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_matches_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "link_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      link_requests: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          budget_mode: string
          budget_unit: string | null
          category: string
          created_at: string
          district: string | null
          id: string
          latitude: number | null
          longitude: number | null
          needed_date: string
          note: string | null
          quantity: number | null
          requester_id: string
          resource_type: string
          state: string | null
          status: string
          time_from: string | null
          time_to: string | null
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          budget_mode?: string
          budget_unit?: string | null
          category: string
          created_at?: string
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          needed_date: string
          note?: string | null
          quantity?: number | null
          requester_id: string
          resource_type: string
          state?: string | null
          status?: string
          time_from?: string | null
          time_to?: string | null
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          budget_mode?: string
          budget_unit?: string | null
          category?: string
          created_at?: string
          district?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          needed_date?: string
          note?: string | null
          quantity?: number | null
          requester_id?: string
          resource_type?: string
          state?: string | null
          status?: string
          time_from?: string | null
          time_to?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          arrival_date: string
          commodity: string
          created_at: string
          district: string
          fetched_at: string
          id: string
          market: string
          max_price: number
          min_price: number
          modal_price: number
          state: string
          variety: string | null
        }
        Insert: {
          arrival_date: string
          commodity: string
          created_at?: string
          district: string
          fetched_at?: string
          id?: string
          market: string
          max_price: number
          min_price: number
          modal_price: number
          state: string
          variety?: string | null
        }
        Update: {
          arrival_date?: string
          commodity?: string
          created_at?: string
          district?: string
          fetched_at?: string
          id?: string
          market?: string
          max_price?: number
          min_price?: number
          modal_price?: number
          state?: string
          variety?: string | null
        }
        Relationships: []
      }
      notification_devices: {
        Row: {
          app_version: string | null
          auth: string | null
          created_at: string
          crops: string[]
          device_id: string
          disabled: boolean
          district: string | null
          endpoint: string
          id: string
          lang: string
          last_seen_at: string
          latitude: number | null
          longitude: number | null
          p256dh: string | null
          prefs: Json
          state: string | null
        }
        Insert: {
          app_version?: string | null
          auth?: string | null
          created_at?: string
          crops?: string[]
          device_id: string
          disabled?: boolean
          district?: string | null
          endpoint: string
          id?: string
          lang?: string
          last_seen_at?: string
          latitude?: number | null
          longitude?: number | null
          p256dh?: string | null
          prefs?: Json
          state?: string | null
        }
        Update: {
          app_version?: string | null
          auth?: string | null
          created_at?: string
          crops?: string[]
          device_id?: string
          disabled?: boolean
          district?: string | null
          endpoint?: string
          id?: string
          lang?: string
          last_seen_at?: string
          latitude?: number | null
          longitude?: number | null
          p256dh?: string | null
          prefs?: Json
          state?: string | null
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          created_at: string
          dedupe_key: string
          device_id: string
          id: string
        }
        Insert: {
          created_at?: string
          dedupe_key: string
          device_id: string
          id?: string
        }
        Update: {
          created_at?: string
          dedupe_key?: string
          device_id?: string
          id?: string
        }
        Relationships: []
      }
      notification_outbox: {
        Row: {
          body: string
          category: string
          created_at: string
          delivered_at: string | null
          device_id: string
          id: string
          priority: string
          tag: string | null
          title: string
          url: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          delivered_at?: string | null
          device_id: string
          id?: string
          priority?: string
          tag?: string | null
          title: string
          url?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          delivered_at?: string | null
          device_id?: string
          id?: string
          priority?: string
          tag?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          full_name: string
          id: string
          language: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          saved_crops: string[]
          state: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          full_name: string
          id: string
          language?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          saved_crops?: string[]
          state?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          language?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          saved_crops?: string[]
          state?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_usage: {
        Row: {
          characters: number
          device_id: string
          id: string
          updated_at: string
          usage_date: string
          used: number
        }
        Insert: {
          characters?: number
          device_id: string
          id?: string
          updated_at?: string
          usage_date?: string
          used?: number
        }
        Update: {
          characters?: number
          device_id?: string
          id?: string
          updated_at?: string
          usage_date?: string
          used?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      link_provider_contact: {
        Args: { _match_id: string }
        Returns: {
          full_name: string
          phone: string
          phone_verified: boolean
          phone_verified_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

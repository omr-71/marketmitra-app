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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
      application_error_logs: {
        Row: {
          created_at: string
          error_type: string
          id: string
          message: string
          provider: string | null
          request_id: string | null
          resolved_at: string | null
          service: string
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_type: string
          id?: string
          message: string
          provider?: string | null
          request_id?: string | null
          resolved_at?: string | null
          service: string
          severity: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_type?: string
          id?: string
          message?: string
          provider?: string | null
          request_id?: string | null
          resolved_at?: string | null
          service?: string
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          context: Json
          created_at: string
          id: string
          lang: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          lang?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          lang?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          diagnosis_id: string | null
          id: string
          metadata: Json
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          diagnosis_id?: string | null
          id?: string
          metadata?: Json
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          diagnosis_id?: string | null
          id?: string
          metadata?: Json
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "crop_diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_diagnoses: {
        Row: {
          advice: string | null
          causes: string[]
          condition: string | null
          conditions_favouring: string[]
          confidence: number | null
          created_at: string
          crop: string | null
          crop_hint: string | null
          id: string
          image_issues: string[]
          image_path: string | null
          lang: string
          monitoring: string[]
          prevention: string[]
          provider: string | null
          request_id: string | null
          severity: string | null
          spray_recommendations: Json
          symptoms: string[]
          uncertainty_note: string | null
          updated_at: string
          usable: boolean
          user_id: string
          what_it_is: string | null
          what_to_do_now: string[]
          why_it_happens: string | null
        }
        Insert: {
          advice?: string | null
          causes?: string[]
          condition?: string | null
          conditions_favouring?: string[]
          confidence?: number | null
          created_at?: string
          crop?: string | null
          crop_hint?: string | null
          id?: string
          image_issues?: string[]
          image_path?: string | null
          lang?: string
          monitoring?: string[]
          prevention?: string[]
          provider?: string | null
          request_id?: string | null
          severity?: string | null
          spray_recommendations?: Json
          symptoms?: string[]
          uncertainty_note?: string | null
          updated_at?: string
          usable?: boolean
          user_id: string
          what_it_is?: string | null
          what_to_do_now?: string[]
          why_it_happens?: string | null
        }
        Update: {
          advice?: string | null
          causes?: string[]
          condition?: string | null
          conditions_favouring?: string[]
          confidence?: number | null
          created_at?: string
          crop?: string | null
          crop_hint?: string | null
          id?: string
          image_issues?: string[]
          image_path?: string | null
          lang?: string
          monitoring?: string[]
          prevention?: string[]
          provider?: string | null
          request_id?: string | null
          severity?: string | null
          spray_recommendations?: Json
          symptoms?: string[]
          uncertainty_note?: string | null
          updated_at?: string
          usable?: boolean
          user_id?: string
          what_it_is?: string | null
          what_to_do_now?: string[]
          why_it_happens?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          label: string
          maintenance_message: string | null
          reason: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          label: string
          maintenance_message?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          label?: string
          maintenance_message?: string | null
          reason?: string | null
          status?: string
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
      notice_reads: {
        Row: {
          id: string
          notice_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notice_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notice_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_reads_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "system_notices"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_attempts: {
        Row: {
          created_at: string
          device_id: string | null
          error_code: string | null
          id: string
          notification_id: string
          provider: string
          provider_message_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          error_code?: string | null
          id?: string
          notification_id: string
          provider?: string
          provider_message_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          error_code?: string | null
          id?: string
          notification_id?: string
          provider?: string
          provider_message_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_attempts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "notification_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_delivery_attempts_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_history"
            referencedColumns: ["id"]
          },
        ]
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
          fcm_token: string | null
          id: string
          lang: string
          last_seen_at: string
          latitude: number | null
          longitude: number | null
          p256dh: string | null
          prefs: Json
          provider: string
          state: string | null
          user_id: string | null
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
          fcm_token?: string | null
          id?: string
          lang?: string
          last_seen_at?: string
          latitude?: number | null
          longitude?: number | null
          p256dh?: string | null
          prefs?: Json
          provider?: string
          state?: string | null
          user_id?: string | null
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
          fcm_token?: string | null
          id?: string
          lang?: string
          last_seen_at?: string
          latitude?: number | null
          longitude?: number | null
          p256dh?: string | null
          prefs?: Json
          provider?: string
          state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          body: string
          category: string
          created_at: string
          data: Json
          dedupe_key: string | null
          id: string
          is_read: boolean
          title: string
          url: string
          user_id: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          data?: Json
          dedupe_key?: string | null
          id?: string
          is_read?: boolean
          title: string
          url?: string
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          data?: Json
          dedupe_key?: string | null
          id?: string
          is_read?: boolean
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          app_updates: boolean
          crop_alerts_enabled: boolean
          daily_summary_enabled: boolean
          enabled: boolean
          government_schemes: boolean
          market_updates: boolean
          price_threshold_percent: number
          preferred_district: string | null
          preferred_market: string | null
          preferred_state: string | null
          quiet_from: string
          quiet_hours_enabled: boolean
          quiet_to: string
          selected_crops: string[]
          sound: string
          summary_time: string
          updated_at: string
          user_id: string
          weather_alerts: boolean
          weather_intelligence_enabled: boolean
        }
        Insert: {
          app_updates?: boolean
          crop_alerts_enabled?: boolean
          daily_summary_enabled?: boolean
          enabled?: boolean
          government_schemes?: boolean
          market_updates?: boolean
          price_threshold_percent?: number
          preferred_district?: string | null
          preferred_market?: string | null
          preferred_state?: string | null
          quiet_from?: string
          quiet_hours_enabled?: boolean
          quiet_to?: string
          selected_crops?: string[]
          sound?: string
          summary_time?: string
          updated_at?: string
          user_id: string
          weather_alerts?: boolean
          weather_intelligence_enabled?: boolean
        }
        Update: {
          app_updates?: boolean
          crop_alerts_enabled?: boolean
          daily_summary_enabled?: boolean
          enabled?: boolean
          government_schemes?: boolean
          market_updates?: boolean
          price_threshold_percent?: number
          preferred_district?: string | null
          preferred_market?: string | null
          preferred_state?: string | null
          quiet_from?: string
          quiet_hours_enabled?: boolean
          quiet_to?: string
          selected_crops?: string[]
          sound?: string
          summary_time?: string
          updated_at?: string
          user_id?: string
          weather_alerts?: boolean
          weather_intelligence_enabled?: boolean
        }
        Relationships: []
      }
      notification_intelligence_events: {
        Row: {
          created_at: string
          event_key: string
          event_type: string
          id: string
          observation: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_key: string
          event_type: string
          id?: string
          observation?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_key?: string
          event_type?: string
          id?: string
          observation?: Json
          user_id?: string
        }
        Relationships: []
      }
      notification_intelligence_runs: {
        Row: {
          alerts_generated: number
          completed_at: string | null
          details: Json
          error: string | null
          failed_deliveries: number
          id: string
          job_type: string
          notifications_accepted: number
          provider_freshness: Json
          started_at: string
          users_evaluated: number
        }
        Insert: {
          alerts_generated?: number
          completed_at?: string | null
          details?: Json
          error?: string | null
          failed_deliveries?: number
          id?: string
          job_type: string
          notifications_accepted?: number
          provider_freshness?: Json
          started_at?: string
          users_evaluated?: number
        }
        Update: {
          alerts_generated?: number
          completed_at?: string | null
          details?: Json
          error?: string | null
          failed_deliveries?: number
          id?: string
          job_type?: string
          notifications_accepted?: number
          provider_freshness?: Json
          started_at?: string
          users_evaluated?: number
        }
        Relationships: []
      }
      phone_verification_codes: {
        Row: {
          attempts: number
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          user_id?: string
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
          voice_id: string | null
          voice_lang: string | null
          voice_provider: string | null
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
          voice_id?: string | null
          voice_lang?: string | null
          voice_provider?: string | null
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
          voice_id?: string | null
          voice_lang?: string | null
          voice_provider?: string | null
        }
        Relationships: []
      }
      system_notices: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          enabled: boolean
          ends_at: string | null
          id: string
          message: string
          severity: string
          starts_at: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          ends_at?: string | null
          id?: string
          message: string
          severity: string
          starts_at?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          enabled?: boolean
          ends_at?: string | null
          id?: string
          message?: string
          severity?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          category: string
          created_at: string
          custom_category: string | null
          feedback_type: string
          id: string
          message: string
          admin_notes: string | null
          page_context: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          custom_category?: string | null
          feedback_type?: string
          id?: string
          message: string
          admin_notes?: string | null
          page_context?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          custom_category?: string | null
          feedback_type?: string
          id?: string
          message?: string
          admin_notes?: string | null
          page_context?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acknowledge_system_notice: {
        Args: { _notice_id: string }
        Returns: boolean
      }
      admin_list_users: {
        Args: {
          _ascending?: boolean
          _page?: number
          _page_size?: number
          _role?: string
          _search?: string
          _sort?: string
        }
        Returns: {
          conversation_count: number
          created_at: string
          diagnosis_count: number
          district: string
          email: string
          full_name: string
          last_sign_in_at: string
          profile_complete: boolean
          role: string
          state: string
          total_count: number
          user_id: string
        }[]
      }
      admin_list_user_feedback: {
        Args: {
          _category?: string
          _feedback_type?: string
          _page?: number
          _page_size?: number
          _search?: string
          _status?: string
        }
        Returns: {
          admin_notes: string | null
          category: string
          created_at: string
          custom_category: string | null
          feedback_type: string
          id: string
          message: string
          page_context: string | null
          status: string
          subject: string
          total_count: number
          user_email: string | null
          user_full_name: string
          user_id: string | null
          user_location: string | null
        }[]
      }
      admin_update_user_feedback: {
        Args: {
          _admin_id: string;
          _admin_notes?: string | null;
          _feedback_id: string;
          _operation: string;
          _status?: string | null;
        };
        Returns: undefined;
      };
      admin_user_metrics: {
        Args: never
        Returns: {
          active_today: number
          active_week: number
          conversations_today: number
          conversations_total: number
          diagnoses_today: number
          diagnoses_total: number
          messages_today: number
          messages_total: number
          new_today: number
          new_week: number
          registered: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_native_fcm_device: {
        Args: { p_fcm_token: string }
        Returns: string
      }
      link_can_create_match: {
        Args: { _listing_id: string; _provider_id: string; _request_id: string }
        Returns: boolean
      }
      link_cluster_opportunities: {
        Args: { _district?: string; _state?: string }
        Returns: {
          district: string
          farmer_count: number
          resource_type: string
          state: string
          window_date: string
        }[]
      }
      link_is_verified_provider: {
        Args: { _user_id: string }
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
      link_verified_provider_profiles: {
        Args: { _user_ids: string[] }
        Returns: {
          full_name: string
          id: string
          phone_verified: boolean
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const

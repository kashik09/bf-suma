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
      admin_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          must_reset_password: boolean
          name: string
          password_hash: string | null
          password_version: number
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          must_reset_password?: boolean
          name: string
          password_hash?: string | null
          password_version?: number
          role?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          must_reset_password?: boolean
          name?: string
          password_hash?: string | null
          password_version?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          fingerprint: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          fingerprint: string
          request_count?: number
          updated_at?: string
          window_start: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          fingerprint?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          channel_targets: string[]
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          internal_tags: string[]
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          status: string
          submission_notes: string | null
          submitted_by_email: string | null
          submitted_by_name: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          channel_targets?: string[]
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          internal_tags?: string[]
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          status?: string
          submission_notes?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          channel_targets?: string[]
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          internal_tags?: string[]
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          status?: string
          submission_notes?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
          whatsapp_opt_in: boolean
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
          whatsapp_opt_in?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          whatsapp_opt_in?: boolean
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          context: string | null
          created_at: string
          email: string
          id: string
          source: string
          status: string
          updated_at: string
          welcome_email_sent_at: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: string
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: string
          updated_at?: string
          welcome_email_sent_at?: string | null
        }
        Relationships: []
      }
      order_events: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          order_id: string | null
          payload: Json | null
          status: string | null
          type: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          status?: string | null
          type?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          payload?: Json | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      order_idempotency_keys: {
        Row: {
          created_at: string
          expires_at: string
          idempotency_key: string
          last_error: string | null
          order_id: string | null
          request_hash: string
          response_payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          idempotency_key: string
          last_error?: string | null
          order_id?: string | null
          request_hash: string
          response_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          idempotency_key?: string
          last_error?: string | null
          order_id?: string | null
          request_hash?: string
          response_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_idempotency_keys_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          currency: string
          id: string
          line_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          line_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string
          product_name_snapshot?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notification_outbox: {
        Row: {
          attempt_count: number
          available_at: string
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          order_id: string
          payload: Json
          status: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          available_at?: string
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          order_id: string
          payload: Json
          status?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          available_at?: string
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          order_id?: string
          payload?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notification_outbox_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_request_replays: {
        Row: {
          created_at: string
          expires_at: string
          idempotency_key: string
          last_error: string | null
          order_id: string | null
          request_hash: string
          response_payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          idempotency_key: string
          last_error?: string | null
          order_id?: string | null
          request_hash: string
          response_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          idempotency_key?: string
          last_error?: string | null
          order_id?: string | null
          request_hash?: string
          response_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_request_replays_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_id: string
          delivery_address: string
          delivery_fee: number
          id: string
          idempotency_key: string | null
          notes: string | null
          order_number: string
          payment_status: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id: string
          delivery_address: string
          delivery_fee: number
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          order_number: string
          payment_status?: string
          status?: string
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string
          delivery_address?: string
          delivery_fee?: number
          id?: string
          idempotency_key?: string | null
          notes?: string | null
          order_number?: string
          payment_status?: string
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          admin_notes: string | null
          comment: string
          created_at: string
          id: string
          is_verified_purchase: boolean
          product_id: string
          rating: number
          reviewer_email: string
          reviewer_name: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          comment: string
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          product_id: string
          rating: number
          reviewer_email: string
          reviewer_name: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          comment?: string
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          product_id?: string
          rating?: number
          reviewer_email?: string
          reviewer_name?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          compare_at_price: number | null
          created_at: string
          currency: string
          description: string | null
          id: string
          name: string
          price: number
          sku: string
          slug: string
          status: string
          stock_qty: number
          updated_at: string
        }
        Insert: {
          category_id: string
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name: string
          price: number
          sku: string
          slug: string
          status?: string
          stock_qty?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          sku?: string
          slug?: string
          status?: string
          stock_qty?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          product_slug: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          product_slug: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          product_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      debug_order_intake: { Args: never; Returns: string }
      process_order_intake_atomic: {
        Args: {
          p_currency: string
          p_customer_id: string
          p_delivery_address: string
          p_delivery_fee: number
          p_idempotency_key: string
          p_items: Json
          p_notes: string
          p_request_hash: string
          p_subtotal: number
          p_total: number
        }
        Returns: {
          field_errors: Json
          message: string
          response_payload: Json
          result_code: string
        }[]
      }
      process_order_intake_atomic_v2: {
        Args: {
          p_currency: string
          p_customer_id: string
          p_delivery_address: string
          p_delivery_fee: number
          p_idempotency_key: string
          p_items: Json
          p_notes: string
          p_request_hash: string
          p_subtotal: number
          p_total: number
        }
        Returns: {
          field_errors: Json
          message: string
          response_payload: Json
          result_code: string
        }[]
      }
      test_decrement_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: {
          decremented_by: number
          new_stock_qty: number
          previous_stock_qty: number
          product_id: string
        }[]
      }
      test_insert_idem_key: { Args: never; Returns: undefined }
      test_order_rpc_debug: { Args: never; Returns: string }
      update_order_status_with_history: {
        Args: {
          p_changed_by?: string
          p_expected_status: string
          p_new_status: string
          p_note?: string
          p_order_id: string
        }
        Returns: {
          created_at: string
          currency: string
          customer_id: string
          delivery_address: string
          delivery_fee: number
          id: string
          notes: string
          order_number: string
          payment_status: string
          status: string
          subtotal: number
          total: number
          updated_at: string
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

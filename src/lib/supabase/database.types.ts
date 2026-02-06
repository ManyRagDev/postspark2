export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          plan: 'FREE' | 'LITE' | 'PRO' | 'AGENCY' | 'DEV';
          sparks: number;
          sparks_refill_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          plan?: 'FREE' | 'LITE' | 'PRO' | 'AGENCY' | 'DEV';
          sparks?: number;
          sparks_refill_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          plan?: 'FREE' | 'LITE' | 'PRO' | 'AGENCY' | 'DEV';
          sparks?: number;
          sparks_refill_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      spark_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'DEBIT' | 'CREDIT' | 'REFUND' | 'REFILL';
          amount: number;
          description: string;
          generation_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'DEBIT' | 'CREDIT' | 'REFUND' | 'REFILL';
          amount: number;
          description: string;
          generation_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'DEBIT' | 'CREDIT' | 'REFUND' | 'REFILL';
          amount?: number;
          description?: string;
          generation_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      generation_sessions: {
        Row: {
          id: string;
          user_id: string;
          prompt_hash: string;
          prompt_text: string;
          original_sparks_used: number;
          generation_type: 'STATIC_POST' | 'POLLINATIONS' | 'NANO_BANANA' | 'CAROUSEL';
          has_used_regen_basic: boolean;
          has_used_regen_pollinations: boolean;
          idempotency_key: string;
          status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
          created_at: string;
          expires_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_hash: string;
          prompt_text: string;
          original_sparks_used: number;
          generation_type: 'STATIC_POST' | 'POLLINATIONS' | 'NANO_BANANA' | 'CAROUSEL';
          has_used_regen_basic?: boolean;
          has_used_regen_pollinations?: boolean;
          idempotency_key: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
          created_at?: string;
          expires_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_hash?: string;
          prompt_text?: string;
          original_sparks_used?: number;
          generation_type?: 'STATIC_POST' | 'POLLINATIONS' | 'NANO_BANANA' | 'CAROUSEL';
          has_used_regen_basic?: boolean;
          has_used_regen_pollinations?: boolean;
          idempotency_key?: string;
          status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
          created_at?: string;
          expires_at?: string;
          completed_at?: string | null;
        };
      };
      rate_limits: {
        Row: {
          id: string;
          user_id: string | null;
          ip_address: string | null;
          action: string;
          count: number;
          window_start: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          ip_address?: string | null;
          action: string;
          count?: number;
          window_start?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          ip_address?: string | null;
          action?: string;
          count?: number;
          window_start?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      debit_sparks: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_generation_id?: string;
          p_metadata?: Json;
        };
        Returns: boolean;
      };
      credit_sparks: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_description: string;
          p_generation_id?: string;
          p_metadata?: Json;
        };
        Returns: void;
      };
      use_regeneration: {
        Args: {
          p_generation_id: string;
          p_user_id: string;
          p_regen_type: string;
        };
        Returns: {
          success: boolean;
          already_used: boolean;
          cost: number;
        };
      };
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      refill_monthly_sparks: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

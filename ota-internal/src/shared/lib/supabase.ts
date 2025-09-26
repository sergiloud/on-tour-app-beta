// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (will be generated later with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: 'artist' | 'agency' | 'label' | 'venue';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'artist' | 'agency' | 'label' | 'venue';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'artist' | 'agency' | 'label' | 'venue';
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          role: 'artist' | 'manager' | 'crew' | 'booking_agent';
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          role: 'artist' | 'manager' | 'crew' | 'booking_agent';
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          role?: 'artist' | 'manager' | 'crew' | 'booking_agent';
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shows: {
        Row: {
          id: string;
          organization_id: string;
          venue_id: string | null;
          title: string;
          date: string;
          status: 'tentative' | 'confirmed' | 'cancelled' | 'overdue' | 'pending';
          guarantee_amount: number;
          guarantee_currency: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          venue_id?: string | null;
          title: string;
          date: string;
          status: 'tentative' | 'confirmed' | 'cancelled' | 'overdue' | 'pending';
          guarantee_amount: number;
          guarantee_currency: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          venue_id?: string | null;
          title?: string;
          date?: string;
          status?: 'tentative' | 'confirmed' | 'cancelled' | 'overdue' | 'pending';
          guarantee_amount?: number;
          guarantee_currency?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      venues: {
        Row: {
          id: string;
          name: string;
          city: string;
          country: string;
          capacity: number | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          country: string;
          capacity?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          country?: string;
          capacity?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

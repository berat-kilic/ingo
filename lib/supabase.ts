import { createClient } from '@supabase/supabase-js';

// Configuration provided by user
const SUPABASE_URL = `https://dkdehxcrpdfshtqmpiaq.supabase.co`;
const SUPABASE_ANON_KEY = "sb_publishable_zDSMAg-F6f51qWWYWbE93g_TtSI5olA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    // Connection stability settings
    heartbeatIntervalMs: 5000, // Send heartbeats more frequently (default is 30s)
    timeout: 20000, 
  },
});

export const isSupabaseConfigured = true;

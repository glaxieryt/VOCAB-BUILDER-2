import { createClient } from '@supabase/supabase-js';

// Strict Environment Variable Check to ensure we connect to the real database
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('MISSING SUPABASE KEYS: Check Vercel Environment Variables. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseKey);
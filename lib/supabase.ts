import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent runtime crashes
// @ts-ignore
const env = (typeof import.meta !== 'undefined') ? import.meta.env : null;

// @ts-ignore
const supabaseUrl = (env && env.VITE_SUPABASE_URL) || '';
// @ts-ignore
const supabaseKey = (env && env.VITE_SUPABASE_ANON_KEY) || '';

// Check if we are using real credentials or placeholders
export const isSupabaseConfigured = supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co';

if (!isSupabaseConfigured) {
  console.warn("Supabase credentials missing! App running in Mock Mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use a real DB.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);
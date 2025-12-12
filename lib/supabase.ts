import { createClient } from '@supabase/supabase-js';

// Robust retrieval of environment variables
// We use static access to allow Vite's build-time replacement to work correctly.
// Dynamic access (e.g. env[key]) prevents Vite from injecting the values in production.
const getSupabaseConfig = () => {
  let url = '';
  let key = '';

  // 1. Try Vite static replacement (Standard)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      url = import.meta.env.VITE_SUPABASE_URL || '';
      // @ts-ignore
      key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    }
  } catch (e) {
    // Ignore access errors
  }

  // 2. Fallback to process.env (Vercel System Env / Node)
  if (!url || !key) {
    try {
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        if (!url) url = process.env.VITE_SUPABASE_URL || '';
        // @ts-ignore
        if (!key) key = process.env.VITE_SUPABASE_ANON_KEY || '';
      }
    } catch (e) {
      // Ignore
    }
  }

  return { url, key };
};

const { url, key } = getSupabaseConfig();

// Sanitize - remove accidental quotes/whitespace
const supabaseUrl = url ? url.replace(/['"\s]/g, '') : '';
const supabaseKey = key ? key.replace(/['"\s]/g, '') : '';

// Validation
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase Config Missing. URL found:", !!supabaseUrl, "Key found:", !!supabaseKey);
  throw new Error('CRITICAL: Supabase keys are missing. Please check Vercel Environment Variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).');
}

if (!supabaseUrl.startsWith('https://')) {
  throw new Error(`CRITICAL: Invalid VITE_SUPABASE_URL. It must start with 'https://'. Current value: ${supabaseUrl}`);
}

export const isSupabaseConfigured = true;

// Create client with explicit configuration for stability
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
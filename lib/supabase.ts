import { createClient } from '@supabase/supabase-js';

// Default credentials from environment (Fallbacks)
const DEFAULT_URL = "https://fgpgewiuqsiprdgrrxbw.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncGdld2l1cXNpcHJkZ3JyeGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjI1NjYsImV4cCI6MjA4MDU5ODU2Nn0.7i90vf72tEUMtSz06h7kyh7MXK6FhtA75Zv0bcr_U2g";

let envUrl = DEFAULT_URL;
let envKey = DEFAULT_KEY;

// 1. Try import.meta.env (Safe Access)
try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    if (import.meta.env.VITE_SUPABASE_URL) envUrl = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
} catch (e) {
  // Ignore
}

// 2. Try process.env (Safe Access)
if (envUrl === DEFAULT_URL) {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      if (process.env.VITE_SUPABASE_URL) envUrl = process.env.VITE_SUPABASE_URL;
      // @ts-ignore
      if (process.env.VITE_SUPABASE_ANON_KEY) envKey = process.env.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {
    // Ignore
  }
}

let supabaseUrl = envUrl ? envUrl.trim() : '';
const supabaseKey = envKey ? envKey.trim() : '';

// Ensure URL has protocol
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}`;
}

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseKey && 
  supabaseUrl !== 'https://placeholder.supabase.co';

// Warn only if strictly necessary (likely won't happen with defaults)
if (!isSupabaseConfigured) {
  console.warn("Supabase credentials missing! App will fail to load data.");
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co', 
  isSupabaseConfigured ? supabaseKey : 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
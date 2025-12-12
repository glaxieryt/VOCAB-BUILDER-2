import { createClient } from '@supabase/supabase-js';

// NOTE: These environment variables would be set in a real deployment
// For this demo, we are using the Mock Store in src/store/useStore.ts 
// to simulate backend behavior without a live database connection.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
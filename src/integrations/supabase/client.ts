
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://caearekcobbcrwutseqf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZWFyZWtjb2JiY3J3dXRzZXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTY5OTEsImV4cCI6MjA1OTk3Mjk5MX0.5JqhUo6q8XuqAHcfiOv7VZVtW945epuFjh4z02Xf9pQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
  global: {
    headers: { 'x-application-name': 'autoads' },
  },
  realtime: {
    timeout: 30000, // 30 seconds
  },
});

// Helper function to check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return false;
  }
};

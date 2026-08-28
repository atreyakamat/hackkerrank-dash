import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bjejovuayqtxqhevvvuu.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZWpvdnVheXF0eHFoZXZ2dnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTU3NzksImV4cCI6MjEwMzQ3MTc3OX0.GHrrVt66EtLQgQDD8qjGw4SWlOsGqRuVNrVE1_287Xw';

let client = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('[SUPABASE] Failed to create browser client:', e.message);
  }
}

export const supabase = client;

export function isBrowserSupabaseAvailable() {
  return Boolean(client);
}

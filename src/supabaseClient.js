import { createClient } from "@supabase/supabase-js";

// We trim to prevent "Invalid API Key" errors caused by accidental spaces in deployment dashboards
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
  throw new Error("Missing Supabase environment variables. Please set them in your deployment dashboard.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

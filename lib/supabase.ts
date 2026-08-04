import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://sosfbgtcquphgdnzulvk.supabase.co";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_F_6xoAaLgsO1YPT8hkq4Pg_Jw-6iL6S";

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabasePublishableKey);
}

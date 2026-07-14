import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sosfbgtcquphgdnzulvk.supabase.co";

const supabasePublishableKey =
  "sb_publishable_F_6xoAaLgsO1YPT8hkq4Pg_Jw-6iL6S";

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabasePublishableKey);
}

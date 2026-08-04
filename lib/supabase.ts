import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase-config";

let browserClient: ReturnType<typeof createClient> | undefined;

export function getSupabaseClient() {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();
    browserClient = createClient(url, publishableKey);
  }

  return browserClient;
}

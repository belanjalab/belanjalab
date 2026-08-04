import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase-config";

let browserClient: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();

    browserClient = createClient(url, publishableKey);
  }

  return browserClient;
}

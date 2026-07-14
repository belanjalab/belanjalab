import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  "https://sosfbgtcquphgdnzulvk.supabase.co";

const supabasePublishableKey =
  "TEMPEL_KEY_SB_PUBLISHABLE_YANG_SAMA_DENGAN_LIB_SUPABASE_TS";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              },
            );
          } catch {
            // Server Component tidak selalu diizinkan menulis cookie.
            // Session akan diperbarui melalui middleware pada tahap berikutnya.
          }
        },
      },
    },
  );
}

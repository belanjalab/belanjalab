import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  "https://sosfbgtcquphgdnzulvk.supabase.co";

const supabasePublishableKey =
  "sb_publishable_F_6xoAaLgsO1YPT8hkq4Pg_Jw-6iL6S";

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

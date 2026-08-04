const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function requireEnvironmentVariable(
  value: string | undefined,
  name: string,
): string {
  if (!value) {
    throw new Error(
      `${name} belum dikonfigurasi. Tambahkan variabel tersebut di Cloudflare Workers & Pages.`,
    );
  }

  return value;
}

export function getSupabaseConfig() {
  return {
    url: requireEnvironmentVariable(
      supabaseUrl,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    publishableKey: requireEnvironmentVariable(
      supabasePublishableKey,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
  };
}

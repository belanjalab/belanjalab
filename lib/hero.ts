import { sanitizePublicUrl } from "@/lib/site-config";
import { getSupabaseClient } from "@/lib/supabase";

export type HeroFeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
};

export type ActiveHero = {
  id: string;
  title: string;
  subtitle: string | null;
  primary_button_text: string | null;
  primary_button_url: string | null;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  hero_image_url: string | null;
  featured_product_id: string | null;
  is_active: boolean;
  sort_order: number;
  featured_product: HeroFeaturedProduct | null;
};

export async function getActiveHero(): Promise<ActiveHero | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("hero_sections")
    .select(`
      id,
      title,
      subtitle,
      primary_button_text,
      primary_button_url,
      secondary_button_text,
      secondary_button_url,
      hero_image_url,
      featured_product_id,
      is_active,
      sort_order,
      featured_product:products(
        id,
        name,
        slug,
        short_description
      )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil hero aktif:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  const hero = data as unknown as ActiveHero;

  return {
    ...hero,
    primary_button_url: sanitizePublicUrl(hero.primary_button_url),
    secondary_button_url: sanitizePublicUrl(hero.secondary_button_url),
    hero_image_url: sanitizePublicUrl(hero.hero_image_url, {
      allowHash: false,
    }),
  };
}

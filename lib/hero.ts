import { supabase } from "@/lib/supabase";

export async function getActiveHero() {
  const { data, error } = await supabase
    .from("hero_sections")
    .select(`
      *,
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

  if (error) throw error;

  return data;
}

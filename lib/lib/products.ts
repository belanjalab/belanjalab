import { supabase } from "./supabase";

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      image_url,
      short_description,
      product_scores (
        overall_score
      ),
      product_prices (
        price
      )
    `)
    .eq("status", "published")
    .limit(6);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

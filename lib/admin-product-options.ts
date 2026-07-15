import { createSupabaseServerClient } from "./supabase-server";

export type AdminSelectOption = {
  id: string;
  name: string;
};

export type AdminProductFormOptions = {
  categories: AdminSelectOption[];
  brands: AdminSelectOption[];
  marketplaces: AdminSelectOption[];
};

export async function getAdminProductFormOptions(): Promise<AdminProductFormOptions> {
  const supabase = await createSupabaseServerClient();

  const [
    { data: categories, error: categoriesError },
    { data: brands, error: brandsError },
    { data: marketplaces, error: marketplacesError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("brands")
      .select("id, name")
      .order("name", { ascending: true }),
    supabase
      .from("marketplaces")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  if (categoriesError) {
    console.error(
      "Gagal mengambil kategori admin:",
      categoriesError.message,
    );
  }

  if (brandsError) {
    console.error(
      "Gagal mengambil merek admin:",
      brandsError.message,
    );
  }

  if (marketplacesError) {
    console.error(
      "Gagal mengambil marketplace admin:",
      marketplacesError.message,
    );
  }

  return {
    categories: (categories ?? []) as AdminSelectOption[],
    brands: (brands ?? []) as AdminSelectOption[],
    marketplaces: (marketplaces ?? []) as AdminSelectOption[],
  };
}

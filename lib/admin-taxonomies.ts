import { createSupabaseServerClient } from "./supabase-server";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminBrand = {
  id: string;
  name: string;
  slug: string;
};

function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, "id-ID", {
      sensitivity: "base",
    }),
  );
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil kategori admin:", error.message);
    return [];
  }

  return sortByName((data ?? []) as AdminCategory[]);
}

export async function getAdminBrands(): Promise<AdminBrand[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil merek admin:", error.message);
    return [];
  }

  return sortByName((data ?? []) as AdminBrand[]);
}

export async function getAdminTaxonomies() {
  const [categories, brands] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
  ]);

  return {
    categories,
    brands,
  };
}

import { getSupabaseClient } from "./supabase";

type CategoryRow = {
  id: string;
  name: string;
};

export type CategoryIconKey =
  | "gadget"
  | "elektronik"
  | "rumah"
  | "gaming"
  | "beauty"
  | "fashion"
  | "otomotif"
  | "olahraga"
  | "kesehatan"
  | "dapur"
  | "default";

export type HomepageCategory = {
  id: string;
  name: string;
  icon: CategoryIconKey;
};

const categoryIcons: Record<string, CategoryIconKey> = {
  gadget: "gadget",
  elektronik: "elektronik",
  rumah: "rumah",
  gaming: "gaming",
  beauty: "beauty",
  fashion: "fashion",
  otomotif: "otomotif",
  olahraga: "olahraga",
  kesehatan: "kesehatan",
  dapur: "dapur",
};

function getCategoryIcon(name: string): CategoryIconKey {
  return categoryIcons[name.trim().toLowerCase()] ?? "default";
}

export async function getHomepageCategories(): Promise<HomepageCategory[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true })
    .limit(5);

  if (error) {
    console.error("Gagal mengambil kategori Homepage:", error.message);
    return [];
  }

  return ((data ?? []) as CategoryRow[]).map((category) => ({
    id: category.id,
    name: category.name,
    icon: getCategoryIcon(category.name),
  }));
}

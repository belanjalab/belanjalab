import { getSupabaseClient } from "./supabase";

type CategoryRow = {
  id: string;
  name: string;
};

export type HomepageCategory = {
  id: string;
  name: string;
  icon: string;
};

const categoryIcons: Record<string, string> = {
  gadget: "📱",
  elektronik: "💻",
  rumah: "🏠",
  gaming: "🎮",
  beauty: "🧴",
  fashion: "👕",
  otomotif: "🚗",
  olahraga: "🏃",
  kesehatan: "🩺",
  dapur: "🍳",
};

function getCategoryIcon(name: string) {
  return categoryIcons[name.trim().toLowerCase()] ?? "🛍️";
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

import { createSupabaseServerClient } from "./supabase-server";

type AdminSpecificationRow = {
  id: string;
  spec_key: string;
  label: string;
  value_text: string;
  sort_order: number | null;
};

export type AdminProductSpecification = {
  id: string;
  key: string;
  label: string;
  value: string;
  sortOrder: number;
};

export async function getAdminProductSpecifications(
  productId: string,
): Promise<AdminProductSpecification[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("product_specifications")
    .select(`
      id,
      spec_key,
      label,
      value_text,
      sort_order
    `)
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    console.error(
      "Gagal mengambil spesifikasi produk admin:",
      error.message,
    );
    return [];
  }

  const rows = (data ?? []) as AdminSpecificationRow[];

  return rows.map((item) => ({
    id: item.id,
    key: item.spec_key,
    label: item.label,
    value: item.value_text,
    sortOrder: item.sort_order ?? 0,
  }));
}

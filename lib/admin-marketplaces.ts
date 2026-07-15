import { createSupabaseServerClient } from "./supabase-server";

export type AdminMarketplace = {
  id: string;
  name: string;
};

export async function getAdminMarketplaces(): Promise<
  AdminMarketplace[]
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("marketplaces")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error(
      "Gagal mengambil daftar marketplace admin:",
      error.message,
    );

    return [];
  }

  return (data ?? []).map((marketplace) => ({
    id: marketplace.id,
    name: marketplace.name,
  }));
}

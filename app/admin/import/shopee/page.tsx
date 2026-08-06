import Link from "next/link";
import { redirect } from "next/navigation";

import AffiliateLinkImportClient from "@/components/admin/affiliate-link-import-client";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !adminRecord) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        error?.message ?? "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }
}

export default async function ShopeeImportPage() {
  await requireAdmin();
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-amber-600">BelanjaLab Admin</p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Ambil Link Gambar Shopee
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Tempel link pendek atau link produk Shopee untuk mengambil URL
              gambar utama. Hasil dapat disalin atau diekspor ke CSV.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/admin/products/import"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Import CSV
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        <AffiliateLinkImportClient />
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAdminProductForEdit } from "@/lib/admin-product-edit";

export const dynamic = "force-dynamic";

type DeleteProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

async function deleteProduct(formData: FormData) {
  "use server";

  const productId = String(formData.get("product_id") ?? "");
  const confirmation = String(
    formData.get("confirmation") ?? "",
  ).trim();

  if (!productId) {
    redirect("/admin");
  }

  if (confirmation !== "HAPUS") {
    redirect(
      `/admin/products/${productId}/delete?error=${encodeURIComponent(
        'Ketik "HAPUS" untuk mengonfirmasi.',
      )}`,
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRecord) {
    redirect(
      `/admin/login?error=${encodeURIComponent(
        "Akun ini tidak memiliki akses admin.",
      )}`,
    );
  }

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("id", productId)
    .maybeSingle();

  if (!product) {
    redirect("/admin");
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Gagal menghapus produk:", error);

    redirect(
      `/admin/products/${productId}/delete?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(
    `/admin?deleted=${encodeURIComponent(product.name)}`,
  );
}

export default async function DeleteProductPage({
  params,
  searchParams,
}: DeleteProductPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const product = await getAdminProductForEdit(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-900">
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">
        <Link href="/admin" className="inline-flex items-center gap-3">
          <img
            src="/images/logo-belanjalab.png"
            alt="BelanjaLab"
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="text-lg font-black">
              Belanja<span className="text-orange-500">Lab</span>
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Admin
            </p>
          </div>
        </Link>

        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-500">
            Tindakan Permanen
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Hapus produk?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Produk <strong>{product.name}</strong> beserta skor, harga,
            spesifikasi, dan riwayat harga terkait akan dihapus permanen.
          </p>
        </div>

        {query.error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {query.error}
          </div>
        )}

        <form action={deleteProduct} className="mt-6 space-y-4">
          <input
            type="hidden"
            name="product_id"
            value={product.id}
          />

          <div>
            <label
              htmlFor="confirmation"
              className="text-sm font-bold text-slate-700"
            >
              Ketik HAPUS untuk mengonfirmasi
            </label>

            <input
              id="confirmation"
              name="confirmation"
              required
              autoComplete="off"
              placeholder="HAPUS"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-red-700"
          >
            Hapus Produk Permanen
          </button>
        </form>

        <Link
          href={`/admin/products/${product.id}/edit`}
          className="mt-4 block rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-600 hover:bg-slate-50"
        >
          Batal
        </Link>
      </section>
    </main>
  );
}

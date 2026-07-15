import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type AdminProductPreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type CategoryRelation = {
  name: string;
};

type BrandRelation = {
  name: string;
};

type ScoreRelation = {
  performance?: number | string | null;
  design?: number | string | null;
  features?: number | string | null;
  value?: number | string | null;
  ease_of_use?: number | string | null;
  overall_score?: number | string | null;
};

type MarketplaceRelation = {
  name: string;
};

type PriceRelation = {
  id: string;
  price: number | string | null;
  original_price?: number | string | null;
  shipping_cost?: number | string | null;
  affiliate_url?: string | null;
  is_available?: boolean | null;
  marketplaces?: MarketplaceRelation | MarketplaceRelation[] | null;
};

type AdminPreviewProduct = {
  id: string;
  name: string;
  slug: string;
  status: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  categories?: CategoryRelation | CategoryRelation[] | null;
  brands?: BrandRelation | BrandRelation[] | null;
  product_scores?: ScoreRelation | ScoreRelation[] | null;
  product_prices?: PriceRelation[] | null;
};

function getSingleRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? relation[0] ?? null : relation;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getScoreLabel(score: number) {
  if (score >= 9) return "Istimewa";
  if (score >= 8) return "Sangat Baik";
  if (score >= 7) return "Baik";
  if (score >= 6) return "Cukup";
  return "Perlu Dipertimbangkan";
}

export default async function AdminProductPreviewPage({
  params,
}: AdminProductPreviewPageProps) {
  const { id } = await params;
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

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      status,
      short_description,
      description,
      image_url,
      categories (
        name
      ),
      brands (
        name
      ),
      product_scores (
        performance,
        design,
        features,
        value,
        ease_of_use,
        overall_score
      ),
      product_prices (
        id,
        price,
        original_price,
        shipping_cost,
        affiliate_url,
        is_available,
        marketplaces (
          name
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil preview produk admin:", error.message);
  }

  if (!data) {
    notFound();
  }

  const product = data as unknown as AdminPreviewProduct;
  const category =
    getSingleRelation(product.categories)?.name ?? "Produk";
  const brand =
    getSingleRelation(product.brands)?.name ?? "Tanpa merek";
  const score = getSingleRelation(product.product_scores);

  const overallScore = Number(score?.overall_score ?? 0);
  const performanceScore = Number(score?.performance ?? 0);
  const designScore = Number(score?.design ?? 0);
  const featuresScore = Number(score?.features ?? 0);
  const valueScore = Number(score?.value ?? 0);
  const easeOfUseScore = Number(score?.ease_of_use ?? 0);

  const availablePrices = (product.product_prices ?? [])
    .filter((item) => item.is_available !== false)
    .map((item) => ({
      ...item,
      numericPrice: Number(item.price),
      marketplace:
        getSingleRelation(item.marketplaces)?.name ?? "Marketplace",
    }))
    .filter((item) => Number.isFinite(item.numericPrice))
    .sort((a, b) => a.numericPrice - b.numericPrice);

  const lowestPrice =
    availablePrices.length > 0 ? availablePrices[0].numericPrice : null;

  const scoreItems = [
    ["Performa", performanceScore],
    ["Desain", designScore],
    ["Fitur", featuresScore],
    ["Value", valueScore],
    ["Kemudahan", easeOfUseScore],
  ] as const;

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">
      <div className="sticky top-0 z-[60] border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
              Preview Admin
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Produk ini berstatus <strong>{product.status}</strong>. Halaman
              ini hanya dapat dibuka oleh admin.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              Edit Produk
            </Link>

            <Link
              href="/admin"
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3 md:px-6 md:py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="/images/logo-belanjalab.png"
              alt="BelanjaLab"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />

            <span className="text-base font-black md:text-xl">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </Link>

          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold capitalize text-slate-600 md:text-xs">
            {product.status}
          </span>
        </div>
      </header>

      <section className="border-b border-slate-100 px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden text-[10px] text-slate-400 md:text-xs">
          <Link href="/admin" className="shrink-0 hover:text-orange-500">
            Admin
          </Link>
          <span>/</span>
          <span className="shrink-0">{category}</span>
          <span>/</span>
          <span className="truncate font-semibold text-slate-600">
            {product.name}
          </span>
        </div>
      </section>

      <section className="px-4 py-7 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-slate-100 p-8 md:p-14">
              <img
                src={
                  product.image_url ??
                  "/images/products/logitech-g102.png"
                }
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-600 md:text-xs">
                {category}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 md:text-xs">
                {brand}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
              {product.short_description ??
                "Ringkasan produk belum tersedia."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Harga mulai
                </p>
                <p className="mt-2 text-xl font-black text-orange-500 md:text-2xl">
                  {lowestPrice !== null
                    ? formatRupiah(lowestPrice)
                    : "Belum tersedia"}
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                  BelanjaLab Score
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <p className="text-2xl font-black text-green-600 md:text-3xl">
                    {overallScore > 0
                      ? overallScore.toFixed(1)
                      : "—"}
                  </p>

                  {overallScore > 0 && (
                    <span className="pb-1 text-xs font-bold text-green-700">
                      /10
                    </span>
                  )}
                </div>

                {overallScore > 0 && (
                  <p className="mt-1 text-[10px] font-bold text-green-700">
                    {getScoreLabel(overallScore)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#harga-marketplace"
                className="flex-1 rounded-xl bg-orange-500 px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-orange-600"
              >
                Lihat Harga
              </a>

              {product.status === "published" && (
                <Link
                  href={`/product/${product.slug}`}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-bold text-slate-700 hover:border-orange-300 hover:text-orange-500"
                >
                  Buka Halaman Publik
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-8 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Tentang Produk
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              Ringkasan BelanjaLab
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600 md:text-base md:leading-8">
                {product.description ??
                  product.short_description ??
                  "Deskripsi lengkap produk belum tersedia."}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              Penilaian
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              Rincian Skor
            </h2>

            <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              {scoreItems.map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {value > 0 ? `${value.toFixed(1)}/10` : "—"}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{
                        width: `${Math.min(Math.max(value * 10, 0), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="harga-marketplace"
        className="scroll-mt-24 px-4 py-8 md:px-6 md:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Marketplace
          </p>

          <h2 className="mt-2 text-2xl font-black md:text-3xl">
            Daftar Harga
          </h2>

          {availablePrices.length > 0 ? (
            <div className="mt-6 space-y-3">
              {availablePrices.map((offer) => (
                <div
                  key={offer.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-black">{offer.marketplace}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {Number(offer.shipping_cost ?? 0) > 0
                        ? `Ongkir ${formatRupiah(Number(offer.shipping_cost))}`
                        : "Cek detail pengiriman di marketplace"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="text-lg font-black text-orange-500">
                      {formatRupiah(offer.numericPrice)}
                    </p>

                    {offer.affiliate_url && (
                      <a
                        href={offer.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Buka Toko
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                Harga marketplace belum tersedia.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

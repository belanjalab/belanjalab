import type { FeaturedProduct } from "@/lib/products";
import {
  ArrowRightIcon,
  CheckIcon,
  CompareIcon,
  RefreshIcon,
  ScoreIcon,
  StoreIcon,
} from "@/components/home/home-icons";

type QuickComparisonProps = {
  products: [FeaturedProduct, FeaturedProduct];
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function QuickComparison({ products }: QuickComparisonProps) {
  const [firstProduct, secondProduct] = products;
  const compareHref = `/compare?products=${encodeURIComponent(
    firstProduct.slug,
  )},${encodeURIComponent(secondProduct.slug)}`;

  const scoreDifference =
    firstProduct.scoreValue !== null && secondProduct.scoreValue !== null
      ? firstProduct.scoreValue - secondProduct.scoreValue
      : null;
  const scoreWinner =
    scoreDifference === null || Math.abs(scoreDifference) < 0.05
      ? null
      : scoreDifference > 0
        ? firstProduct
        : secondProduct;

  const priceDifference =
    firstProduct.priceValue !== null && secondProduct.priceValue !== null
      ? firstProduct.priceValue - secondProduct.priceValue
      : null;
  const priceWinner =
    priceDifference === null || priceDifference === 0
      ? null
      : priceDifference < 0
        ? firstProduct
        : secondProduct;
  const absolutePriceDifference =
    priceDifference === null ? null : Math.abs(priceDifference);

  const comparisonRows = [
    {
      label: "BelanjaLab Score",
      icon: ScoreIcon,
      firstValue: firstProduct.score,
      secondValue: secondProduct.score,
      firstWins: scoreWinner?.id === firstProduct.id,
      secondWins: scoreWinner?.id === secondProduct.id,
    },
    {
      label: "Harga mulai",
      icon: StoreIcon,
      firstValue: firstProduct.price,
      secondValue: secondProduct.price,
      firstWins: priceWinner?.id === firstProduct.id,
      secondWins: priceWinner?.id === secondProduct.id,
    },
    {
      label: "Kekuatan utama",
      icon: CheckIcon,
      firstValue: firstProduct.topStrength
        ? `${firstProduct.topStrength.label} ${firstProduct.topStrength.value.toFixed(1)}/10`
        : "Belum tersedia",
      secondValue: secondProduct.topStrength
        ? `${secondProduct.topStrength.label} ${secondProduct.topStrength.value.toFixed(1)}/10`
        : "Belum tersedia",
      firstWins: false,
      secondWins: false,
    },
    {
      label: "Pembaruan harga",
      icon: RefreshIcon,
      firstValue: firstProduct.priceFreshness,
      secondValue: secondProduct.priceFreshness,
      firstWins: false,
      secondWins: false,
    },
  ];

  return (
    <div className="quick-compare-surface overflow-hidden rounded-3xl border border-slate-200 p-5 sm:p-7 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
            Bandingkan cepat
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-2xl lg:text-3xl">
            Beda pentingnya terlihat dalam sekali lihat.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Mulai dari skor, harga, kekuatan utama, hingga kapan datanya terakhir diperbarui.
          </p>
        </div>

        <a
          href={compareHref}
          className="inline-flex min-h-11 w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-extrabold text-white transition-colors hover:bg-orange-800 active:bg-orange-900"
        >
          Buka perbandingan <ArrowRightIcon />
        </a>
      </div>

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2.5 sm:gap-4">
        {[firstProduct, secondProduct].map((product, index) => (
          <div key={product.id} className="contents">
            {index === 1 && (
              <div className="flex items-center justify-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-xs font-extrabold text-white shadow-lg shadow-slate-950/15 sm:h-12 sm:w-12 sm:text-sm">
                  VS
                </span>
              </div>
            )}

            <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
              <div className="flex h-24 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 sm:h-36">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain p-3 sm:p-5"
                />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {product.brand ?? product.category}
              </p>
              <h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-5 tracking-[-0.01em] text-slate-950 sm:text-base sm:leading-6">
                {product.name}
              </h3>
            </article>
          </div>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {comparisonRows.map(
          ({
            label,
            icon: Icon,
            firstValue,
            secondValue,
            firstWins,
            secondWins,
          }) => (
            <div
              key={label}
              className="border-b border-slate-200 p-4 last:border-b-0 sm:p-5"
            >
              <p className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-sm sm:normal-case sm:tracking-normal">
                <Icon className="h-4 w-4" />
                {label}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-5">
                <div
                  className={`relative rounded-xl px-3 py-3 text-center text-xs font-bold leading-5 sm:px-4 sm:text-sm ${
                    firstWins
                      ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  {firstWins && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {firstValue}
                </div>
                <div
                  className={`relative rounded-xl px-3 py-3 text-center text-xs font-bold leading-5 sm:px-4 sm:text-sm ${
                    secondWins
                      ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  {secondWins && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white">
                      <CheckIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {secondValue}
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
            Ringkasan skor
          </p>
          <p className="mt-1.5 text-sm font-bold leading-6 text-emerald-950">
            {scoreWinner
              ? `${scoreWinner.name} memiliki skor keseluruhan lebih tinggi.`
              : scoreDifference === null
                ? "Skor kedua produk belum cukup lengkap untuk menentukan keunggulan."
                : "Skor keseluruhan kedua produk berimbang."}
          </p>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-800">
            Ringkasan harga
          </p>
          <p className="mt-1.5 text-sm font-bold leading-6 text-orange-950">
            {priceWinner && absolutePriceDifference !== null
              ? `${priceWinner.name} lebih rendah sekitar ${formatRupiah(absolutePriceDifference)}.`
              : priceDifference === null
                ? "Harga salah satu produk belum tersedia untuk dibandingkan."
                : "Harga mulai kedua produk saat ini sama."}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Ringkasan ini memakai data produk dan harga yang tersedia saat halaman diperbarui.
        </p>
        <a
          href={compareHref}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-extrabold text-slate-700 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800"
        >
          <CompareIcon className="h-[18px] w-[18px]" />
          Bandingkan detail
        </a>
      </div>
    </div>
  );
}

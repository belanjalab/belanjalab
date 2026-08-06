import {
  CheckIcon,
  RefreshIcon,
  ScoreIcon,
  ShieldCheckIcon,
  StoreIcon,
} from "@/components/home/home-icons";

const scoreDimensions = [
  "Performa",
  "Desain",
  "Fitur",
  "Value",
  "Kemudahan",
];

const scoreScale = [
  { range: "8,5–10", label: "Sangat baik" },
  { range: "7,5–8,4", label: "Baik" },
  { range: "6,5–7,4", label: "Cukup baik" },
  { range: "< 6,5", label: "Perlu dipertimbangkan" },
];

export default function ScoreMethodology() {
  return (
    <div className="methodology-surface overflow-hidden rounded-3xl border border-slate-200 p-5 sm:p-7 lg:p-10">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
        <div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
            Cara kami menyajikan data
          </p>
          <h2 className="brand-text-balance mt-1 text-2xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Angka yang bisa dibaca, bukan sekadar dipercaya.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            BelanjaLab Score membantu menyaring pilihan. Harga dilengkapi sumber dan waktu pengecekan agar kamu tahu seberapa baru data yang sedang dilihat.
          </p>
          <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold leading-6 text-amber-950">
            Skor tinggi belum tentu paling cocok untuk semua orang. Gunakan skor sebagai titik awal, lalu baca detail analisis dan bandingkan sesuai kebutuhanmu.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100">
                <ScoreIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-800">
                  BelanjaLab Score
                </p>
                <h3 className="mt-0.5 text-base font-extrabold text-slate-950">
                  Lima aspek utama
                </h3>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {scoreDimensions.map((dimension) => (
                <span
                  key={dimension}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700"
                >
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-700" />
                  {dimension}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-200 pt-4">
              {scoreScale.map((item) => (
                <div
                  key={item.range}
                  className="flex items-center justify-between gap-4 text-xs"
                >
                  <span className="font-extrabold text-slate-950">
                    {item.range}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-100">
                <RefreshIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
                  Transparansi harga
                </p>
                <h3 className="mt-0.5 text-base font-extrabold text-slate-950">
                  Tahu asal dan waktunya
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <StoreIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    Harga mulai
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Menggunakan harga terendah yang tersedia dan masih berstatus aktif.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <RefreshIcon className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    Timestamp pembaruan
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Menampilkan waktu pengecekan terbaru dari data harga yang tersedia.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
              Harga dan ketersediaan dapat berubah di marketplace. Periksa kembali total akhir sebelum melakukan transaksi.
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}

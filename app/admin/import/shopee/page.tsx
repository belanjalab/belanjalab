import Link from "next/link";

export default function ShopeeImportPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Shopee Affiliate Import
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Upload CSV Shopee Affiliate, preview data, lalu lanjutkan ke proses scan.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border-2 border-dashed border-orange-300 bg-white p-10 text-center">
          <div className="mx-auto max-w-xl">
            <div className="text-5xl">📄</div>

            <h2 className="mt-4 text-2xl font-black text-slate-900">
              Upload CSV Shopee Affiliate
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Pilih file CSV hasil export Shopee Affiliate. Pada tahap ini sistem
              hanya membaca file dan menampilkan preview, belum mengubah database.
            </p>

            <input
              type="file"
              accept=".csv"
              className="mt-8 block w-full rounded-xl border border-slate-200 p-3 text-sm"
            />

            <button
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-bold text-white"
            >
              Scan Produk (Coming Soon)
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-black text-slate-900">
            Preview
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Setelah file dipilih akan ditampilkan jumlah produk, nama produk,
            harga, link produk, dan link affiliate sebelum proses scan AI.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Nama Produk</th>
                  <th className="px-4 py-3 text-left">Harga</th>
                  <th className="px-4 py-3 text-left">Affiliate</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-6 text-slate-400" colSpan={4}>
                    Belum ada file yang dipilih.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

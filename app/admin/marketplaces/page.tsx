import Link from "next/link";

import { getAdminMarketplaces } from "@/lib/admin-marketplaces";

export const dynamic = "force-dynamic";

export default async function AdminMarketplacesPage() {
  const marketplaces = await getAdminMarketplaces();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-orange-600">
              BelanjaLab Admin
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Marketplace
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Kelola marketplace yang tersedia untuk harga produk.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Kembali ke Dashboard
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Daftar Marketplace
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {marketplaces.length} marketplace tersedia
              </p>
            </div>
          </div>

          {marketplaces.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-bold text-slate-700">
                Belum ada marketplace
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Form tambah marketplace akan disambungkan pada langkah berikutnya.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {marketplaces.map((marketplace, index) => (
                <div
                  key={marketplace.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-600">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">
                      {marketplace.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      ID: {marketplace.id}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

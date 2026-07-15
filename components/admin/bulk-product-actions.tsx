"use client";

import { useState } from "react";

type BulkProductItem = {
  id: string;
  name: string;
  status: string;
};

type BulkProductActionsProps = {
  products: BulkProductItem[];
  categories: string[];
  brands: string[];
  marketplaces?: string[];
};

export default function BulkProductActions({
  products,
  categories,
  brands,
  marketplaces = [],
}: BulkProductActionsProps) {
  const productIds = products.map((product) => product.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [marketplace, setMarketplace] = useState("");

  const allSelected =
    productIds.length > 0 && selectedIds.length === productIds.length;

  function toggleAll() {
    setSelectedIds(allSelected ? [] : productIds);
  }

  function toggleProduct(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  function confirmBulkDelete(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    if (selectedIds.length === 0) {
      event.preventDefault();
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus ${selectedIds.length} produk terpilih? Tindakan ini permanen dan gambar produk di Storage juga akan dihapus.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={products.length === 0}
            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
          />
          Pilih semua produk di halaman ini
        </label>

        <p className="text-xs font-semibold text-slate-500">
          {selectedIds.length} produk dipilih
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="submit"
          name="bulk_action"
          value="published"
          disabled={!hasSelection}
          className="rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Publish Terpilih
        </button>

        <button
          type="submit"
          name="bulk_action"
          value="draft"
          disabled={!hasSelection}
          className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Jadikan Draft
        </button>

        <button
          type="submit"
          name="bulk_action"
          value="delete"
          disabled={!hasSelection}
          onClick={confirmBulkDelete}
          className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Hapus Terpilih
        </button>

        <button
          type="button"
          onClick={() => setSelectedIds([])}
          disabled={!hasSelection}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Batalkan Pilihan
        </button>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 xl:grid-cols-3">
        <div className="grid gap-2">
          <select
            name="category_name"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="">Pilih kategori</option>
            {categories.map((categoryName) => (
              <option key={categoryName} value={categoryName}>
                {categoryName}
              </option>
            ))}
          </select>

          <button
            type="submit"
            name="bulk_action"
            value="assign_category"
            disabled={!hasSelection || !category}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Terapkan Kategori
          </button>
        </div>

        <div className="grid gap-2">
          <select
            name="brand_name"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="">Pilih merek</option>
            {brands.map((brandName) => (
              <option key={brandName} value={brandName}>
                {brandName}
              </option>
            ))}
          </select>

          <button
            type="submit"
            name="bulk_action"
            value="assign_brand"
            disabled={!hasSelection || !brand}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Terapkan Merek
          </button>
        </div>

        <div className="grid gap-2">
          <select
            name="marketplace_name"
            value={marketplace}
            onChange={(event) => setMarketplace(event.target.value)}
            className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="">Pilih marketplace</option>
            {marketplaces.map((marketplaceName) => (
              <option key={marketplaceName} value={marketplaceName}>
                {marketplaceName}
              </option>
            ))}
          </select>

          <button
            type="submit"
            name="bulk_action"
            value="assign_marketplace"
            disabled={!hasSelection || !marketplace}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Terapkan Marketplace
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {products.map((product) => {
          const selected = selectedIds.includes(product.id);

          return (
            <label
              key={product.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                selected
                  ? "border-orange-300 bg-orange-50"
                  : "border-slate-100 bg-slate-50 hover:border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleProduct(product.id)}
                className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-700">
                  {product.name}
                </span>
                <span className="mt-0.5 block text-[10px] capitalize text-slate-400">
                  {product.status}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {selectedIds.map((productId) => (
        <input
          key={productId}
          type="hidden"
          name="product_ids"
          value={productId}
        />
      ))}
    </div>
  );
}

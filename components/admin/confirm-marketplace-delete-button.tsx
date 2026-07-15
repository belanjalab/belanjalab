"use client";

type ConfirmMarketplaceDeleteButtonProps = {
  marketplaceName: string;
};

export default function ConfirmMarketplaceDeleteButton({
  marketplaceName,
}: ConfirmMarketplaceDeleteButtonProps) {
  function confirmDelete(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus marketplace "${marketplaceName}"? Marketplace hanya akan dihapus jika belum dipakai oleh data harga produk.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={confirmDelete}
      className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
    >
      Hapus
    </button>
  );
}

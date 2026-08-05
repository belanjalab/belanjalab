import Link from "next/link";
import type { SiteFooter as SiteFooterData } from "@/lib/footer";

type SiteFooterProps = {
  footer?: SiteFooterData;
};

const fallbackDescription =
  "Membantu masyarakat Indonesia memilih produk dengan lebih cerdas.";

export default function SiteFooter({ footer }: SiteFooterProps) {
  const companyLinks = [
    { label: "Kontak", href: footer?.contactUrl },
    { label: "Karier", href: footer?.careersUrl },
  ].filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  );
  const legalLinks = [
    { label: "Kebijakan Privasi", href: footer?.privacyUrl },
    { label: "Syarat Penggunaan", href: footer?.termsUrl },
    { label: "Disclaimer", href: footer?.disclaimerUrl },
  ].filter(
    (link): link is { label: string; href: string } => Boolean(link.href),
  );

  return (
    <footer
      id="tentang"
      className="scroll-mt-24 bg-slate-950 px-4 py-10 pb-[calc(7rem+env(safe-area-inset-bottom))] text-white md:px-5 md:py-12 md:pb-12"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4 md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            aria-label="BelanjaLab, kembali ke beranda"
            className="inline-flex min-h-11 items-center gap-3 rounded-xl"
          >
            <img
              src="/images/logo-belanjalab.png"
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-xl font-extrabold tracking-[-0.035em]">
              Belanja<span className="text-orange-500">Lab</span>
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            {footer?.companyDescription ?? fallbackDescription}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-white">Produk</h2>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            {[
              ["Rekomendasi", "/#produk"],
              ["Perbandingan", "/compare"],
              ["Metodologi", "/#metodologi"],
              ["Kategori", "/#kategori"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-white">Perusahaan</h2>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            <Link
              href="/#tentang"
              className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
            >
              Tentang Kami
            </Link>
            {companyLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h2 className="text-sm font-extrabold text-white">Legal</h2>
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            {legalLinks.length > 0 ? (
              legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex min-h-11 items-center rounded-md transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))
            ) : (
              <p className="py-2 leading-6">Informasi legal segera tersedia.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6">
        <p className="max-w-4xl text-xs leading-5 text-slate-400">
          Harga, stok, dan promo dapat berubah sewaktu-waktu. Sebagian tautan marketplace merupakan tautan afiliasi; komisi yang diterima tidak mengubah harga untuk pengguna maupun penilaian produk.
        </p>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          © {new Date().getFullYear()} BelanjaLab. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}

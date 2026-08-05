import Link from "next/link";
import {
  ArticleIcon,
  CategoryIcon,
  CompareIcon,
  InfoIcon,
  MenuIcon,
  ScoreIcon,
  SearchIcon,
} from "@/components/home/home-icons";

type PublicSection = "home" | "search" | "compare" | "articles";

type SiteHeaderProps = {
  active?: PublicSection;
};

const desktopNavigation = [
  { label: "Kategori", href: "/#kategori", key: "home" as const },
  { label: "Perbandingan", href: "/compare", key: "compare" as const },
  { label: "Metodologi", href: "/#metodologi", key: "home" as const },
  { label: "Artikel", href: "/articles", key: "articles" as const },
];

const drawerNavigation = [
  { label: "Kategori", href: "/#kategori", icon: CategoryIcon },
  { label: "Perbandingan", href: "/compare", icon: CompareIcon },
  { label: "Metodologi", href: "/#metodologi", icon: ScoreIcon },
  { label: "Artikel", href: "/articles", icon: ArticleIcon },
  { label: "Tentang Kami", href: "/#tentang", icon: InfoIcon },
];

export default function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <>
      <a
        href="#konten-utama"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center px-3 py-2 sm:px-4 md:px-5 md:py-2.5">
          <details className="group relative mr-1 lg:hidden">
            <summary className="mobile-menu-summary flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100">
              <MenuIcon />
              <span className="sr-only">Buka menu utama</span>
            </summary>

            <nav
              aria-label="Menu utama"
              className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/10"
            >
              {drawerNavigation.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </Link>
              ))}
            </nav>
          </details>

          <Link
            href="/"
            aria-label="BelanjaLab, kembali ke beranda"
            className="flex min-h-11 items-center gap-2 rounded-xl"
          >
            <img
              src="/images/logo-belanjalab.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded-full object-cover md:h-10 md:w-10"
            />
            <span className="text-base font-extrabold tracking-[-0.035em] text-slate-950 md:text-xl">
              Belanja<span className="text-orange-700">Lab</span>
            </span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="ml-7 hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex xl:ml-10"
          >
            {desktopNavigation.map((item) => {
              const isActive = active === item.key && item.key !== "home";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-xl px-3 transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-800"
                      : "hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/search"
            aria-label="Buka pencarian produk"
            aria-current={active === "search" ? "page" : undefined}
            className={`ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors md:hidden ${
              active === "search"
                ? "bg-orange-50 text-orange-800"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <SearchIcon />
          </Link>

          <Link
            href="/search"
            className={`ml-auto hidden min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold shadow-sm transition md:inline-flex ${
              active === "search"
                ? "bg-orange-700 text-white hover:bg-orange-800"
                : "bg-slate-950 text-white hover:bg-slate-800"
            }`}
          >
            <SearchIcon className="h-[18px] w-[18px]" />
            Cari produk
          </Link>
        </div>
      </header>
    </>
  );
}

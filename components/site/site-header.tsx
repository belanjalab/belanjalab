"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArticleIcon,
  CategoryIcon,
  CloseIcon,
  CompareIcon,
  HomeIcon,
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
  { label: "Bandingkan", href: "/compare", key: "compare" as const },
  { label: "Artikel", href: "/articles", key: "articles" as const },
];

const drawerNavigation = [
  { label: "Beranda", href: "/", icon: HomeIcon },
  { label: "Jelajahi kategori", href: "/#kategori", icon: CategoryIcon },
  { label: "Cari produk", href: "/search", icon: SearchIcon },
  { label: "Perbandingan", href: "/compare", icon: CompareIcon },
  { label: "Metodologi skor", href: "/#metodologi", icon: ScoreIcon },
  { label: "Artikel", href: "/articles", icon: ArticleIcon },
  { label: "Tentang BelanjaLab", href: "/#tentang", icon: InfoIcon },
];

function BrandMark({ onDark = false }: { onDark?: boolean }) {
  return (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 md:h-9 md:w-9">
        <img
          src="/images/logo-belanjalab.png"
          alt=""
          aria-hidden="true"
          width={36}
          height={36}
          className="h-8 w-8 rounded-full object-cover md:h-9 md:w-9"
        />
      </span>
      <span
        className={`text-lg tracking-[-0.035em] md:text-xl ${
          onDark ? "text-white" : "text-slate-950"
        }`}
      >
        <span className="font-semibold">Belanja</span>
        <span className="ml-0.5 font-semibold text-amber-600">Lab</span>
      </span>
    </>
  );
}

export default function SiteHeader({ active }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback((returnFocus = false) => {
    setIsMenuOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleMenuKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const drawer = document.getElementById("mobile-navigation");
      const focusableElements = drawer?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleMenuKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleMenuKeydown);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <>
      <a
        href="#konten-utama"
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-2 px-3 sm:px-4 md:gap-4 md:px-5 lg:min-h-[72px]">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Buka menu utama"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <MenuIcon />
          </button>

          <Link
            href="/"
            aria-label="BelanjaLab, kembali ke beranda"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg"
          >
            <BrandMark />
          </Link>

          <form
            action="/search"
            method="get"
            role="search"
            className="ml-3 hidden h-11 min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 p-1 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 md:flex lg:ml-6"
          >
            <label htmlFor="header-search" className="sr-only">
              Cari produk, merek, atau kategori
            </label>
            <SearchIcon className="ml-3 h-[18px] w-[18px] shrink-0 text-slate-400" />
            <input
              id="header-search"
              type="search"
              name="q"
              minLength={2}
              maxLength={80}
              placeholder="Cari produk, merek, atau kategori..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Cari
            </button>
          </form>

          <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-1 lg:flex">
            {desktopNavigation.map((item) => {
              const isActive = active === item.key && item.key !== "home";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-amber-50 text-amber-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <span
            aria-hidden="true"
            className="ml-auto block h-11 w-11 shrink-0 md:hidden"
          />
        </div>

        <div className="px-3 pb-3 md:hidden">
          <form
            action="/search"
            method="get"
            role="search"
            className="mx-auto flex h-10 max-w-7xl items-center rounded-lg border border-slate-200 bg-slate-50 p-1"
          >
            <label htmlFor="mobile-header-search" className="sr-only">
              Cari produk, merek, atau kategori
            </label>
            <SearchIcon className="ml-2.5 h-[17px] w-[17px] shrink-0 text-slate-400" />
            <input
              id="mobile-header-search"
              type="search"
              name="q"
              minLength={2}
              maxLength={80}
              placeholder="Cari produk atau merek..."
              className="min-w-0 flex-1 bg-transparent px-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Cari"
              className="flex h-8 w-10 items-center justify-center rounded-md bg-slate-900 text-white"
            >
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu utama"
            onClick={() => closeMenu(true)}
            className="absolute inset-0 h-full w-full bg-slate-950/45 backdrop-blur-[2px]"
          />

          <aside
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menu utama"
            className="mobile-drawer-enter relative flex h-full w-[min(86vw,22rem)] flex-col border-r border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/20"
          >
            <div className="-mx-4 -mt-4 flex min-h-16 items-center justify-between gap-3 bg-slate-950 px-4">
              <Link
                href="/"
                onClick={() => closeMenu()}
                className="flex min-h-11 items-center gap-2 rounded-lg"
              >
                <BrandMark onDark />
              </Link>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closeMenu(true)}
                aria-label="Tutup menu utama"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Navigasi
            </p>
            <nav aria-label="Menu utama mobile" className="mt-2 space-y-1">
              {drawerNavigation.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => closeMenu()}
                  className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">
                BelanjaLab Score
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Bukan sekadar daftar produk. Lihat alasan penilaian dan perbandingan sebelum memilih.
              </p>
              <Link
                href="/compare"
                onClick={() => closeMenu()}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <CompareIcon className="h-[18px] w-[18px]" /> Bandingkan produk
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

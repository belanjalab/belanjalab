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
  { label: "Perbandingan", href: "/compare", key: "compare" as const },
  { label: "Metodologi", href: "/#metodologi", key: "home" as const },
  { label: "Artikel", href: "/articles", key: "articles" as const },
];

const drawerNavigation = [
  { label: "Beranda", href: "/", icon: HomeIcon },
  { label: "Jelajahi kategori", href: "/#kategori", icon: CategoryIcon },
  { label: "Perbandingan", href: "/compare", icon: CompareIcon },
  { label: "Metodologi skor", href: "/#metodologi", icon: ScoreIcon },
  { label: "Artikel", href: "/articles", icon: ArticleIcon },
  { label: "Tentang BelanjaLab", href: "/#tentang", icon: InfoIcon },
];

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
        className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center px-3 sm:px-4 md:px-5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Buka menu utama"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            className="mr-1 flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <MenuIcon />
          </button>

          <Link
            href="/"
            aria-label="BelanjaLab, kembali ke beranda"
            className="flex min-h-11 items-center gap-2 rounded-xl"
          >
            <img
              src="/images/logo-belanjalab.png"
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
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
            <div className="flex min-h-12 items-center justify-between gap-3">
              <Link
                href="/"
                onClick={() => closeMenu()}
                className="flex min-h-11 items-center gap-2 rounded-xl"
              >
                <img
                  src="/images/logo-belanjalab.png"
                  alt=""
                  aria-hidden="true"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <span className="text-lg font-extrabold tracking-[-0.035em] text-slate-950">
                  Belanja<span className="text-orange-700">Lab</span>
                </span>
              </Link>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => closeMenu(true)}
                aria-label="Tutup menu utama"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-6 px-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Navigasi
            </p>
            <nav aria-label="Menu utama mobile" className="mt-2 space-y-1">
              {drawerNavigation.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => closeMenu()}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-orange-800">
                Mulai dari pencarian
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                Temukan produk, cek skor, lalu bandingkan pilihan sebelum membeli.
              </p>
              <Link
                href="/search"
                onClick={() => closeMenu()}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white hover:bg-orange-800"
              >
                <SearchIcon className="h-[18px] w-[18px]" /> Cari produk
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

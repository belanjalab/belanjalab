import Link from "next/link";
import {
  ArticleIcon,
  CategoryIcon,
  CompareIcon,
  HomeIcon,
  SearchIcon,
} from "@/components/home/home-icons";

type PublicSection =
  | "home"
  | "categories"
  | "search"
  | "compare"
  | "articles";

type MobileBottomNavProps = {
  active?: PublicSection;
};

const navigation = [
  { label: "Beranda", href: "/", key: "home" as const, icon: HomeIcon },
  {
    label: "Kategori",
    href: "/kategori",
    key: "categories" as const,
    icon: CategoryIcon,
  },
  { label: "Cari", href: "/search", key: "search" as const, icon: SearchIcon },
  {
    label: "Bandingkan",
    href: "/compare",
    key: "compare" as const,
    icon: CompareIcon,
  },
  {
    label: "Artikel",
    href: "/articles",
    key: "articles" as const,
    icon: ArticleIcon,
  },
];

export default function MobileBottomNav({ active }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Navigasi utama mobile"
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white px-1 pt-1 shadow-[0_-3px_12px_rgba(15,23,42,0.06)] md:hidden"
    >
      {navigation.map(({ label, href, key, icon: Icon }) => {
        const isActive = active === key;

        return (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-0.5 text-[10px] font-medium transition-colors sm:text-xs ${
              isActive
                ? "text-amber-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <span
              className={`flex h-7 w-9 items-center justify-center rounded-full transition-colors ${
                isActive ? "bg-amber-50" : "bg-transparent"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

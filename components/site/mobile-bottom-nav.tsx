import Link from "next/link";
import {
  ArticleIcon,
  CategoryIcon,
  CompareIcon,
  HomeIcon,
  SearchIcon,
} from "@/components/home/home-icons";

type PublicSection = "home" | "search" | "compare" | "articles";

type MobileBottomNavProps = {
  active?: PublicSection;
};

const navigation = [
  { label: "Beranda", href: "/", key: "home" as const, icon: HomeIcon },
  {
    label: "Kategori",
    href: "/#kategori",
    key: "home" as const,
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
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden"
    >
      {navigation.map(({ label, href, key, icon: Icon }, index) => {
        const isActive = active === key && !(index === 1 && active === "home");

        return (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-semibold transition-colors ${
              isActive
                ? "text-orange-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

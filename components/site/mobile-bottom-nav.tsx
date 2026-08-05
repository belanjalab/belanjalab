import Link from "next/link";
import {
  ArticleIcon,
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
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pt-1 shadow-[0_-3px_12px_rgba(15,23,42,0.06)] md:hidden"
    >
      {navigation.map(({ label, href, key, icon: Icon }) => {
        const isActive = active === key;

        return (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-medium transition-colors ${
              isActive
                ? "text-[#ee4d2d]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <span
              className={`flex h-7 w-10 items-center justify-center rounded-full transition-colors ${
                isActive ? "bg-orange-50" : "bg-transparent"
              }`}
            >
              <Icon className="h-[19px] w-[19px]" />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

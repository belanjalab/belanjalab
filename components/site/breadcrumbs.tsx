import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-white px-4 py-3 md:px-5">
      <ol className="mx-auto flex max-w-7xl items-center gap-2 overflow-hidden text-xs font-semibold text-slate-500">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-slate-300">/</span>}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-9 shrink-0 items-center rounded-md hover:text-orange-800">
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex min-h-9 items-center truncate font-bold text-slate-700" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

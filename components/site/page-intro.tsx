import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
};

export default function PageIntro({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: PageIntroProps) {
  return (
    <section className={`px-4 md:px-5 ${compact ? "py-5 md:py-7" : "py-7 md:py-10"}`}>
      <div className="page-intro-surface mx-auto max-w-7xl overflow-hidden rounded-2xl border border-slate-200 border-t-[3px] border-t-amber-500 px-5 py-6 shadow-sm sm:px-7 md:px-9 md:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">
          {eyebrow}
        </p>
        <h1 className="brand-text-balance mt-2 max-w-4xl text-2xl font-bold leading-[1.16] tracking-[-0.03em] text-slate-950 sm:text-3xl md:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            {description}
          </div>
        )}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}

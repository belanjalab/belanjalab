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
    <section className={`px-4 md:px-5 ${compact ? "py-6 md:py-9" : "py-8 md:py-12"}`}>
      <div className="page-intro-surface mx-auto max-w-7xl overflow-hidden rounded-3xl border border-slate-200 px-5 py-7 sm:px-8 md:rounded-[2rem] md:px-10 md:py-11">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
          {eyebrow}
        </p>
        <h1 className="brand-text-balance mt-2 max-w-4xl text-3xl font-extrabold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <div className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {description}
          </div>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

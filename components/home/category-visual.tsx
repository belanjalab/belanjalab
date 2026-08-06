import type { CategoryIconKey } from "@/lib/categories";

type CategoryVisualProps = {
  icon: CategoryIconKey;
  className?: string;
};

const commonSvgProps = {
  "aria-hidden": true,
  viewBox: "0 0 64 64",
  fill: "none",
} as const;

export default function CategoryVisual({
  icon,
  className = "h-12 w-12",
}: CategoryVisualProps) {
  switch (icon) {
    case "gadget":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="gadget-body" x1="18" y1="9" x2="48" y2="56">
              <stop stopColor="#334155" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="gadget-screen" x1="20" y1="13" x2="45" y2="49">
              <stop stopColor="#38BDF8" />
              <stop offset="0.48" stopColor="#6366F1" />
              <stop offset="1" stopColor="#A855F7" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="15" ry="3.5" fill="#0F172A" opacity="0.12" />
          <g className="category-visual-object">
            <rect x="17" y="6" width="30" height="50" rx="8" fill="url(#gadget-body)" />
            <rect x="20" y="10" width="24" height="41" rx="5.5" fill="url(#gadget-screen)" />
            <path d="M22 40c7-11 14-5 21-18v27H22V40Z" fill="#FDE68A" opacity="0.68" />
            <rect x="27" y="8" width="10" height="2" rx="1" fill="#94A3B8" />
            <circle cx="32" cy="53.5" r="1.2" fill="#CBD5E1" />
            <path d="M22 14c4-2 8-2.5 12-2" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
          </g>
          <path className="category-visual-spark" d="m51 12 1.3 3.2 3.2 1.3-3.2 1.3L51 21l-1.3-3.2-3.2-1.3 3.2-1.3L51 12Z" fill="#F59E0B" />
        </svg>
      );

    case "elektronik":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="laptop-screen" x1="16" y1="13" x2="47" y2="42">
              <stop stopColor="#22D3EE" />
              <stop offset="0.55" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="laptop-base" x1="12" y1="43" x2="52" y2="55">
              <stop stopColor="#CBD5E1" />
              <stop offset="1" stopColor="#64748B" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="55" rx="21" ry="3.5" fill="#0F172A" opacity="0.12" />
          <g className="category-visual-object">
            <rect x="13" y="10" width="38" height="32" rx="4" fill="#334155" />
            <rect x="16" y="13" width="32" height="25" rx="2.5" fill="url(#laptop-screen)" />
            <path d="M18 33c9-10 18-5 28-16v19H18v-3Z" fill="#A7F3D0" opacity="0.55" />
            <path d="M9 43h46l-5 10H14L9 43Z" fill="url(#laptop-base)" />
            <path d="M25 46h14l2 3H23l2-3Z" fill="#E2E8F0" />
            <path d="M19 16h11" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.58" />
          </g>
          <circle className="category-visual-spark" cx="51" cy="11" r="3" fill="#FBBF24" />
        </svg>
      );

    case "gaming":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="gamepad-body" x1="10" y1="20" x2="54" y2="49">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="52" rx="21" ry="4" fill="#0F172A" opacity="0.12" />
          <g className="category-visual-object">
            <path d="M19 18h26c7 0 12 7 10 14l-4 13c-1.5 5-8 6-11 2l-5-6h-6l-5 6c-3 4-9.5 3-11-2L9 32c-2-7 3-14 10-14Z" fill="url(#gamepad-body)" />
            <path d="M18 20c6-2 22-2 28 0" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.34" />
            <path d="M21 27v10M16 32h10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="42" cy="28" r="3" fill="#FDE047" />
            <circle cx="48" cy="34" r="3" fill="#FB7185" />
            <circle cx="38" cy="36" r="2.5" fill="#34D399" />
          </g>
          <path className="category-visual-spark" d="m51 12 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="#F59E0B" />
        </svg>
      );

    case "beauty":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="beauty-bottle" x1="20" y1="21" x2="45" y2="55">
              <stop stopColor="#FDA4AF" />
              <stop offset="1" stopColor="#F472B6" />
            </linearGradient>
            <linearGradient id="beauty-cap" x1="23" y1="8" x2="41" y2="22">
              <stop stopColor="#FDE68A" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="15" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <rect x="23" y="7" width="18" height="10" rx="3" fill="url(#beauty-cap)" />
            <path d="M25 16h14v7c5 3 8 8 8 15v11c0 5-4 8-9 8H26c-5 0-9-3-9-8V38c0-7 3-12 8-15v-7Z" fill="url(#beauty-bottle)" />
            <rect x="21" y="32" width="22" height="14" rx="7" fill="white" opacity="0.88" />
            <path d="M28 39c2-4 6-4 8 0-2 4-6 4-8 0Z" fill="#EC4899" />
            <path d="M22 27c4-3 7-4 11-4" stroke="white" strokeWidth="2.3" strokeLinecap="round" opacity="0.65" />
          </g>
          <circle className="category-visual-spark" cx="50" cy="15" r="3" fill="#FBBF24" />
        </svg>
      );

    case "rumah":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="house-wall" x1="16" y1="28" x2="48" y2="55">
              <stop stopColor="#FEF3C7" />
              <stop offset="1" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="house-roof" x1="11" y1="14" x2="53" y2="37">
              <stop stopColor="#FB923C" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="55" rx="21" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <path d="M15 29 32 14l17 15v24H15V29Z" fill="url(#house-wall)" />
            <path d="m9 30 23-20 23 20-5 5-18-16-18 16-5-5Z" fill="url(#house-roof)" />
            <rect x="27" y="37" width="10" height="16" rx="2" fill="#92400E" />
            <rect x="17" y="33" width="8" height="8" rx="2" fill="#38BDF8" />
            <rect x="39" y="33" width="8" height="8" rx="2" fill="#38BDF8" />
            <path d="M18 30c6-5 10-8 14-11" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.38" />
          </g>
          <path className="category-visual-spark" d="m51 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="#FACC15" />
        </svg>
      );

    case "fashion":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="shirt-fill" x1="12" y1="15" x2="50" y2="54">
              <stop stopColor="#C084FC" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="55" rx="18" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <path d="M22 13c2.5 5 17.5 5 20 0l12 7-6 12-6-3v25H22V29l-6 3-6-12 12-7Z" fill="url(#shirt-fill)" />
            <path d="M22 13c3 9 17 9 20 0" stroke="#F3E8FF" strokeWidth="3" />
            <path d="M25 25c6-2 12-2 18 0" stroke="white" strokeWidth="2.4" strokeLinecap="round" opacity="0.48" />
            <path d="M26 35h12" stroke="#FDE68A" strokeWidth="3" strokeLinecap="round" />
          </g>
          <circle className="category-visual-spark" cx="51" cy="15" r="3" fill="#FBBF24" />
        </svg>
      );

    case "otomotif":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="car-fill" x1="9" y1="23" x2="55" y2="48">
              <stop stopColor="#FB7185" />
              <stop offset="1" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="52" rx="23" ry="4" fill="#0F172A" opacity="0.12" />
          <g className="category-visual-object">
            <path d="M14 30 21 18h22l8 12c4 1 6 4 6 8v8H7v-8c0-4 3-7 7-8Z" fill="url(#car-fill)" />
            <path d="m23 21-5 9h28l-6-9H23Z" fill="#BAE6FD" />
            <path d="M26 22h6v8H21l5-8ZM34 22h5l5 8H34v-8Z" fill="#E0F2FE" opacity="0.7" />
            <rect x="10" y="34" width="9" height="4" rx="2" fill="#FEF3C7" />
            <rect x="45" y="34" width="9" height="4" rx="2" fill="#FEF3C7" />
            <circle cx="17" cy="46" r="6" fill="#1E293B" />
            <circle cx="47" cy="46" r="6" fill="#1E293B" />
            <circle cx="17" cy="46" r="2.5" fill="#CBD5E1" />
            <circle cx="47" cy="46" r="2.5" fill="#CBD5E1" />
          </g>
          <path className="category-visual-spark" d="m52 13 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="#FBBF24" />
        </svg>
      );

    case "olahraga":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="sport-ball" x1="14" y1="12" x2="52" y2="52">
              <stop stopColor="#34D399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="55" rx="17" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <circle cx="32" cy="32" r="22" fill="url(#sport-ball)" />
            <path d="m32 18 8 6-3 10H27l-3-10 8-6Z" fill="#F8FAFC" />
            <path d="M32 10v8M12 25l12-1M52 25l-12-1M18 49l9-15M46 49l-9-15" stroke="#ECFDF5" strokeWidth="3" strokeLinecap="round" />
            <path d="M17 17c6-5 12-7 18-7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </g>
          <circle className="category-visual-spark" cx="52" cy="13" r="3" fill="#FBBF24" />
        </svg>
      );

    case "kesehatan":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="health-case" x1="12" y1="19" x2="52" y2="54">
              <stop stopColor="#FB7185" />
              <stop offset="1" stopColor="#E11D48" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="55" rx="20" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <path d="M24 14h16a5 5 0 0 1 5 5v4h5a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V29a6 6 0 0 1 6-6h5v-4a5 5 0 0 1 5-5Z" fill="url(#health-case)" />
            <path d="M25 23v-3h14v3" stroke="#FFE4E6" strokeWidth="4" strokeLinecap="round" />
            <rect x="24" y="30" width="16" height="17" rx="4" fill="white" />
            <path d="M32 34v9M27.5 38.5h9" stroke="#E11D48" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M13 28c8-3 15-4 22-3" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.38" />
          </g>
          <circle className="category-visual-spark" cx="52" cy="14" r="3" fill="#FBBF24" />
        </svg>
      );

    case "dapur":
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="pan-fill" x1="10" y1="26" x2="48" y2="52">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <ellipse cx="30" cy="54" rx="20" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <path d="M9 28h38v8c0 11-8 19-19 19S9 47 9 36v-8Z" fill="url(#pan-fill)" />
            <path d="M8 27h40" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
            <path d="M47 31h10c3 0 3 5 0 5H48" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
            <path d="M16 34c4-2 9-3 14-3" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            <path d="M20 22c-2-4 3-5 1-9M31 22c-2-4 3-5 1-9M41 22c-2-4 3-5 1-9" stroke="#FB923C" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <path className="category-visual-spark" d="m52 13 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" fill="#FACC15" />
        </svg>
      );

    default:
      return (
        <svg {...commonSvgProps} className={`category-visual ${className}`}>
          <defs>
            <linearGradient id="bag-fill" x1="14" y1="18" x2="51" y2="56">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <ellipse cx="32" cy="56" rx="18" ry="3.5" fill="#0F172A" opacity="0.11" />
          <g className="category-visual-object">
            <path d="M14 22h36l-3 34H17l-3-34Z" fill="url(#bag-fill)" />
            <path d="M23 24v-6a9 9 0 0 1 18 0v6" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
            <path d="M21 29c7-3 14-3 22-1" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
            <circle cx="25" cy="33" r="2" fill="#92400E" />
            <circle cx="39" cy="33" r="2" fill="#92400E" />
          </g>
          <circle className="category-visual-spark" cx="51" cy="14" r="3" fill="#FDE047" />
        </svg>
      );
  }
}

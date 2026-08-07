# BelanjaLab Category SEO Type Fix

Replace:
- lib/categories.ts

Fix:
- Restores exported `CategoryIconKey` for compatibility with `components/home/category-visual.tsx`.
- Does not change category data, SEO landing pages, or Supabase queries.

Commit:
fix(seo): restore category icon type compatibility

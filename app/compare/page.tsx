import { getCompareProducts } from "@/lib/products";
import CompareClient from "./compare-client";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const products = await getCompareProducts();

  return <CompareClient products={products} />;
}

export type ShopeeCsvRow = {
  name: string;
  price: string;
  affiliateUrl: string;
  productUrl: string;
};

export type ShopeeScanStatus =
  | "ready_to_scan"
  | "scanning"
  | "success"
  | "failed";

export type ShopeeScanResult = {
  name: string;
  price: string;
  affiliateUrl: string;
  productUrl: string;
  title: string | null;
  image: string | null;
  brand: string | null;
  category: string | null;
  description: string | null;
  status: ShopeeScanStatus;
  error?: string;
};

export type ShopeeScanRequest = {
  items: ShopeeCsvRow[];
};

export type ShopeeScanResponse = {
  success: boolean;
  total: number;
  results: ShopeeScanResult[];
  error?: string;
};

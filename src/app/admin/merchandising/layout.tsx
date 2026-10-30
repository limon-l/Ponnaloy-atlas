import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Merchandising",
  description: "Curate the storefront featured edit and inspect demo campaign performance.",
  robots: { index: false, follow: false },
};

export default function AdminMerchandisingLayout({ children }: { children: ReactNode }) {
  return children;
}

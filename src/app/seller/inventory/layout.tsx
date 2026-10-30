import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Seller-scoped inventory, low-stock alerts and inline stock updates in the Ponnaloy Atlas demo.",
  robots: { index: false, follow: false },
};

export default function SellerInventoryLayout({ children }: { children: ReactNode }) {
  return children;
}

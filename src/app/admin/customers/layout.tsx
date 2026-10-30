import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Customers",
  description: "Search, filter and inspect marketplace customer records in the Ponnaloy Atlas demo.",
  robots: { index: false, follow: false },
};

export default function AdminCustomersLayout({ children }: { children: ReactNode }) {
  return children;
}

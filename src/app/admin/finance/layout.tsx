import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Finance",
  description: "Payment state, return decisions and marketplace commission in the Ponnaloy Atlas demo.",
  robots: { index: false, follow: false },
};

export default function AdminFinanceLayout({ children }: { children: ReactNode }) {
  return children;
}

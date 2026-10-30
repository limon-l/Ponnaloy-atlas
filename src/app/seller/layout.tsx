import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";

export const metadata: Metadata = {
  title: "Seller workspace",
  description: "Seller-scoped orders, inventory, analytics and payouts in the Ponnaloy Atlas demo.",
  robots: { index: false, follow: false },
};

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell workspace="seller">{children}</WorkspaceShell>;
}

import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";

export const metadata: Metadata = {
  title: "Admin command centre",
  description: "Marketplace moderation, sellers, returns, analytics and audit in the Ponnaloy Atlas demo.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell workspace="admin">{children}</WorkspaceShell>;
}

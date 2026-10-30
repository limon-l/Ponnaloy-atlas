import type { Metadata } from "next";
import { sellers } from "@/lib/seed";
import { SellerView } from "./seller-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seller = sellers.find((item) => item.slug === slug);
  if (!seller) return { title: "Seller" };
  return { title: seller.name, description: seller.description };
}

export default async function SellerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SellerView slug={slug} />;
}

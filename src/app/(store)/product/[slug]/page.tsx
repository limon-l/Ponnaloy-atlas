import type { Metadata } from "next";
import { products } from "@/lib/seed";
import { ProductView } from "./product-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: `${product.subtitle} — ${product.description.slice(0, 140)}`,
    openGraph: {
      title: `${product.name} · Ponnaloy Atlas`,
      description: product.subtitle,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductView slug={slug} />;
}

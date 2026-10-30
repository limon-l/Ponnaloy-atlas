import type { Metadata } from "next";
import { collections } from "@/lib/seed";
import { CollectionView } from "./collection-view";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = collections.find((item) => item.slug === slug);
  if (!collection) return { title: "Collection" };
  return { title: collection.name, description: collection.description };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CollectionView slug={slug} />;
}

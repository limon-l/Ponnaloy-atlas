"use client";

import { useMemo } from "react";
import { applyProductEdits } from "@/lib/catalog";
import { products as seedProducts, sellers as seedSellers } from "@/lib/seed";
import { useAtlasState } from "@/lib/store";
import type { Product, Seller } from "@/lib/types";

export function useCatalog(): Product[] {
  const state = useAtlasState();
  return useMemo(
    () => applyProductEdits([...state.createdProducts, ...seedProducts], state.productEdits),
    [state.createdProducts, state.productEdits]
  );
}

export function useSellers(): Seller[] {
  const state = useAtlasState();
  return useMemo(
    () =>
      seedSellers.map((seller) => ({ ...seller, ...(state.sellerEdits[seller.id] ?? {}) })),
    [state.sellerEdits]
  );
}

export function useSessionOrders() {
  const state = useAtlasState();
  return state.orders;
}

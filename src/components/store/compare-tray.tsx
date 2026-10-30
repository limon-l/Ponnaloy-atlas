"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, X } from "lucide-react";
import { ProductArt } from "@/components/product-art";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/lib/hooks";
import { clearCompare, setCompare, useAtlasState } from "@/lib/store";
import { COMPARE_LIMIT } from "@/lib/store";

export function CompareTray() {
  const pathname = usePathname();
  const state = useAtlasState();
  const products = useCatalog();
  const selected = state.compare
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  if (selected.length === 0 || pathname.startsWith("/compare")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5">
      <div
        role="region"
        aria-label="Comparison tray"
        className="pointer-events-auto mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-line bg-surface-raised/95 p-2.5 pl-3 shadow-lift backdrop-blur-xl sm:gap-4 sm:p-3 sm:pl-4"
      >
        <div className="hidden shrink-0 sm:block">
          <p className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.12em] text-ink">
            <Scale className="size-3.5 text-teal" aria-hidden="true" />
            Compare
          </p>
          <p className="mt-0.5 text-[0.625rem] text-ink-faint">
            {selected.length} of {COMPARE_LIMIT}
          </p>
        </div>

        <ul className="flex min-w-0 flex-1 items-center gap-1.5">
          {selected.map((product) => (
            <li key={product.id} className="group relative size-11 shrink-0 overflow-hidden rounded-md border border-line sm:size-12">
              <ProductArt art={product.art} palette={product.palette} />
              <button
                type="button"
                onClick={() => setCompare(state.compare.filter((id) => id !== product.id))}
                className="focus-ring absolute inset-0 grid place-items-center bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                aria-label={`Remove ${product.name} from comparison`}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
          {Array.from({ length: COMPARE_LIMIT - selected.length }).map((_, index) => (
            <li
              key={`placeholder-${index}`}
              className="hidden size-11 shrink-0 rounded-md border border-dashed border-line sm:block sm:size-12"
              aria-hidden="true"
            />
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={clearCompare}
            className="focus-ring hidden rounded px-2 py-1 text-2xs text-ink-faint transition-colors hover:text-ink sm:block"
          >
            Clear
          </button>
          <Button asChild size="sm">
            <Link href="/compare">
              Compare
              <span className="tabular ml-0.5 rounded-full bg-white/20 px-1.5 text-[0.625rem]">{selected.length}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="atlas-container flex min-h-dvh flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-copper">404 · Off the map</p>
      <h1 className="mt-4 max-w-xl font-display text-display-sm text-ink">
        This object is not in the <span className="display-accent text-teal">catalogue.</span>
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        The page may have moved, the product may have been archived, or the link was never part of the demo. The
        storefront, catalogue and workspaces are still here.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to the storefront
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">
            <Search className="size-4" aria-hidden="true" /> Browse all objects
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/journey">
            <Compass className="size-4" aria-hidden="true" /> Connected journey
          </Link>
        </Button>
      </div>
      <p className="mt-8 text-2xs text-ink-faint">
        Looking for a seller or admin surface? <Link href="/admin" className="text-teal hover:underline">Open the command centre</Link>.
      </p>
    </main>
  );
}

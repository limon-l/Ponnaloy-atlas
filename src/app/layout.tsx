import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  // The metric-adjusted fallback is wider than Fraunces at display sizes and
  // wraps the hero headline onto an extra line, causing a 0.116 CLS on first
  // load. The unadjusted serif fallback keeps the same line count (Times
  // wraps at 2 lines like Fraunces), so the swap no longer moves the layout.
  adjustFontFallback: false,
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ponnaloy-atlas.example.com"),
  title: {
    default: "Ponnaloy Atlas — Objects for a considered life",
    template: "%s · Ponnaloy Atlas",
  },
  description:
    "A multi-vendor commerce and marketplace operating system: editorial storefront, product exploration studio, seller and admin command centres.",
  keywords: ["commerce", "marketplace", "editorial storefront", "design system", "Ponnaloy Atlas"],
  authors: [{ name: "Ponnaloy Atlas" }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Ponnaloy Atlas",
    title: "Ponnaloy Atlas — Objects for a considered life",
    description:
      "Editorial commerce, a comparison studio, and role-aware marketplace operations in one connected frontend.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1413" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans`}>
        <Providers>
          <a
            href="#main"
            className="sr-only z-[200] rounded-md bg-ink px-4 py-3 text-sm font-medium text-canvas focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to main content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}

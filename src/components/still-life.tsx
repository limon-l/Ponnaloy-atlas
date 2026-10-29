import type { Palette } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Editorial still-life artwork used for campaigns and collection mastheads.
 * Composed from primitives so it stays crisp at any size and costs no image
 * request. Palette is semantic (per collection), not random.
 */
export function StillLifeArt({
  palette,
  variant = 1,
  className,
}: {
  palette: Palette;
  variant?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const { bg, object, secondary, accent } = palette;
  const uid = `still-${variant}-${bg.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 800 900"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bg} />
          <stop offset="100%" stopColor={secondary} stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${uid}-light`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-blur`}>
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width="800" height="900" fill={`url(#${uid}-wall)`} />
      <rect width="800" height="900" fill={object} opacity="0.04" />

      {/* Architectural arch / window */}
      <path d="M90 700V330c0-138 112-250 250-250h120c138 0 250 112 250 250v370Z" fill={bg} opacity="0.55" />
      <path d="M90 700V330c0-138 112-250 250-250h120c138 0 250 112 250 250v370Z" fill="none" stroke={secondary} strokeWidth="2" opacity="0.25" />
      <path d="M140 700V340c0-110 90-200 200-200h120c110 0 200 90 200 200v360Z" fill={`url(#${uid}-light)`} />
      <path d="M400 140v560" stroke={secondary} strokeWidth="2" opacity="0.18" />
      <path d="M140 430h520" stroke={secondary} strokeWidth="2" opacity="0.18" />

      {/* Sun wash on the wall */}
      <ellipse cx="590" cy="300" rx="190" ry="210" fill={accent} opacity="0.24" filter={`url(#${uid}-blur)`} />

      {/* Floor */}
      <rect y="700" width="800" height="200" fill={secondary} opacity="0.13" />
      <path d="M0 700h800" stroke={secondary} strokeWidth="3" opacity="0.2" />

      {variant === 1 && <VariantQuiet object={object} secondary={secondary} accent={accent} />}
      {variant === 2 && <VariantMaterials object={object} secondary={secondary} accent={accent} />}
      {variant === 3 && <VariantDesk object={object} secondary={secondary} accent={accent} />}
      {variant === 4 && <VariantRitual object={object} secondary={secondary} accent={accent} />}
    </svg>
  );
}

function VariantQuiet({ object, secondary, accent }: { object: string; secondary: string; accent: string }) {
  return (
    <>
      <ellipse cx="410" cy="772" rx="240" ry="26" fill={secondary} opacity="0.2" />
      {/* console */}
      <path d="M210 640h380v14H210Z" fill={object} />
      <path d="M236 654v112M564 654v112" stroke={object} strokeWidth="10" />
      {/* lamp */}
      <path d="M300 640V520" stroke={object} strokeWidth="8" />
      <path d="M252 520h96l-18-86h-60Z" fill={object} />
      <path d="M262 512h76l-12-66h-52Z" fill={accent} opacity="0.35" />
      <ellipse cx="300" cy="640" rx="38" ry="7" fill={secondary} opacity="0.3" />
      {/* vase + stems */}
      <path d="M470 638c-18-26-12-48-2-64 8-12 12-24 10-40h44c-2 16 2 28 10 40 10 16 16 38-2 64Z" fill={object} opacity="0.9" />
      <path d="M500 534c4-46 26-78 58-96" stroke={accent} strokeWidth="3" fill="none" />
      <path d="M510 498c-24-10-38-28-42-50 24 2 44 14 54 36M530 470c8-24 26-38 48-42-2 24-14 42-36 50" fill={secondary} opacity="0.6" />
      {/* chair silhouette */}
      <path d="M600 770V620c0-22 18-40 40-40h20c22 0 40 18 40 40v150" fill="none" stroke={object} strokeWidth="12" strokeLinecap="round" />
      <path d="M586 690h128v18H586Z" fill={accent} opacity="0.7" />
      {/* candle */}
      <rect x="402" y="596" width="26" height="44" rx="4" fill={accent} />
      <path d="M415 592c-8-10 2-16 2-24 8 8 8 16-2 24" fill={accent} />
    </>
  );
}

function VariantMaterials({ object, secondary, accent }: { object: string; secondary: string; accent: string }) {
  return (
    <>
      <ellipse cx="400" cy="780" rx="260" ry="28" fill={secondary} opacity="0.2" />
      {/* chair */}
      <path d="M270 700V520c0-26 20-46 46-46h118c26 0 46 20 46 46v180" fill={object} />
      <path d="M286 620h178c16 0 28 12 28 28v52H258v-52c0-16 12-28 28-28Z" fill={accent} opacity="0.7" />
      <path d="M286 700v80M340 700v64M454 700v64M508 700v80" stroke={secondary} strokeWidth="12" strokeLinecap="round" />
      {/* tote */}
      <path d="M540 640h110l12 128H528Z" fill={secondary} opacity="0.85" />
      <path d="M560 640c0-28 14-44 36-44s36 16 36 44" fill="none" stroke={accent} strokeWidth="8" />
      {/* watch on plinth */}
      <rect x="120" y="690" width="92" height="86" rx="6" fill={secondary} opacity="0.3" />
      <circle cx="166" cy="716" r="24" fill={accent} opacity="0.85" />
      <circle cx="166" cy="716" r="16" fill={object} opacity="0.4" />
      <path d="M166 716v-10M166 716l7 4" stroke={secondary} strokeWidth="2" />
      {/* throw draped */}
      <path d="M580 690h118v46H580Z" fill={accent} opacity="0.5" />
      <path d="M592 736v18M612 736v18M632 736v18M652 736v18M672 736v18" stroke={secondary} strokeWidth="3" opacity="0.5" />
    </>
  );
}

function VariantDesk({ object, secondary, accent }: { object: string; secondary: string; accent: string }) {
  return (
    <>
      <ellipse cx="400" cy="790" rx="280" ry="24" fill={secondary} opacity="0.18" />
      {/* desk */}
      <path d="M120 640h560v18H120Z" fill={object} />
      <path d="M150 658v130M650 658v130" stroke={object} strokeWidth="12" />
      {/* journal */}
      <path d="M220 620l128-14v44l-128 14Z" fill={accent} opacity="0.75" />
      <path d="M348 606l86 14v44l-86-14Z" fill={object} opacity="0.75" />
      <path d="M348 606v44" stroke={secondary} strokeWidth="4" opacity="0.35" />
      {/* pen */}
      <path d="M380 560l96 38" stroke={object} strokeWidth="10" strokeLinecap="round" />
      <path d="M476 598l18 7-10 19-18-7Z" fill={accent} />
      {/* lamp */}
      <path d="M580 640V500" stroke={object} strokeWidth="8" />
      <path d="M522 500h116l-20-52h-76Z" fill={object} />
      <ellipse cx="580" cy="640" rx="34" ry="7" fill={secondary} opacity="0.3" />
      {/* tray + mug */}
      <rect x="470" y="620" width="84" height="20" rx="4" fill={secondary} opacity="0.45" />
      <path d="M496 620v-28h32v28" fill={accent} opacity="0.85" />
      <path d="M528 598h10c6 0 10 4 10 10s-4 10-10 10h-10" fill="none" stroke={accent} strokeWidth="4" />
    </>
  );
}

function VariantRitual({ object, secondary, accent }: { object: string; secondary: string; accent: string }) {
  return (
    <>
      <ellipse cx="400" cy="790" rx="250" ry="24" fill={secondary} opacity="0.18" />
      {/* low table */}
      <path d="M190 680h420v16H190Z" fill={object} />
      <path d="M230 696v100M570 696v100" stroke={object} strokeWidth="10" />
      {/* pendant */}
      <path d="M430 120v270" stroke={secondary} strokeWidth="3" />
      <circle cx="430" cy="430" r="84" fill={object} opacity="0.9" />
      <circle cx="430" cy="430" r="84" fill={accent} opacity="0.2" />
      <ellipse cx="430" cy="530" rx="90" ry="14" fill={accent} opacity="0.16" />
      {/* coffee set */}
      <path d="M236 610h120l-30 58h-60Z" fill={object} opacity="0.9" />
      <path d="M262 668h68l16 12h-100Z" fill={secondary} opacity="0.5" />
      <path d="M270 596c0-10 10-18 24-18s24 8 24 18" fill="none" stroke={secondary} strokeWidth="3" opacity="0.4" />
      <rect x="380" y="620" width="70" height="60" rx="6" fill={secondary} opacity="0.55" />
      <rect x="390" y="632" width="50" height="18" rx="3" fill={accent} opacity="0.7" />
      {/* candle + bottle */}
      <rect x="500" y="580" width="32" height="60" rx="5" fill={accent} opacity="0.8" />
      <path d="M516 576c-10-12 2-20 2-30 10 10 10 20-2 30" fill={accent} />
      <rect x="560" y="548" width="44" height="92" rx="6" fill={object} opacity="0.8" />
      <rect x="570" y="524" width="24" height="26" rx="3" fill={secondary} />
      {/* salts */}
      <rect x="140" y="622" width="44" height="58" rx="8" fill={secondary} opacity="0.4" />
      <rect x="134" y="612" width="56" height="14" rx="5" fill={object} opacity="0.65" />
    </>
  );
}

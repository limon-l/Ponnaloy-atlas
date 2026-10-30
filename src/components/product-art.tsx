import type { ArtKey, Palette } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductArtProps {
  art: ArtKey;
  palette: Palette;
  className?: string;
  title?: string;
}

/**
 * Original vector product art. Local SVGs keep LCP fast, avoid layout shift,
 * and give the catalogue one consistent editorial art direction.
 */
export function ProductArt({ art, palette, className, title }: ProductArtProps) {
  const { bg, object, secondary, accent } = palette;

  return (
    <svg
      viewBox="0 0 400 400"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="400" fill={bg} />
      <circle cx="200" cy="176" r="150" fill={object} opacity="0.06" />
      <ellipse cx="205" cy="326" rx="118" ry="16" fill={secondary} opacity="0.14" />
      <g>{renderArt(art, object, secondary, accent)}</g>
    </svg>
  );
}

function renderArt(art: ArtKey, object: string, secondary: string, accent: string) {
  switch (art) {
    case "headphones":
      return (
        <>
          <path d="M108 208v-26c0-52 41-94 92-94s92 42 92 94v26" fill="none" stroke={object} strokeWidth="17" strokeLinecap="round" />
          <path d="M108 198v-18c0-48 41-86 92-86s92 38 92 86v18" fill="none" stroke={secondary} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
          <rect x="90" y="196" width="48" height="88" rx="20" fill={object} />
          <rect x="262" y="196" width="48" height="88" rx="20" fill={object} />
          <rect x="98" y="210" width="32" height="60" rx="15" fill={secondary} opacity="0.85" />
          <rect x="270" y="210" width="32" height="60" rx="15" fill={secondary} opacity="0.85" />
          <rect x="92" y="214" width="44" height="52" rx="18" fill={accent} opacity="0.35" />
          <rect x="264" y="214" width="44" height="52" rx="18" fill={accent} opacity="0.35" />
          <path d="M114 196v-12M286 196v-12" stroke={accent} strokeWidth="5" strokeLinecap="round" />
          <rect x="132" y="238" width="14" height="4" rx="2" fill={bgSafe(object)} />
        </>
      );
    case "speaker":
      return (
        <>
          <rect x="126" y="118" width="148" height="196" rx="62" fill={object} />
          <rect x="140" y="132" width="120" height="168" rx="52" fill={secondary} opacity="0.28" />
          <path d="M150 168h100M150 190h100M150 212h100M150 234h100M150 256h100" stroke={secondary} strokeWidth="4" strokeLinecap="round" opacity="0.32" />
          <path d="M160 150c22-18 58-18 80 0" stroke={bgSafe(object)} strokeWidth="5" fill="none" opacity="0.5" />
          <rect x="178" y="96" width="44" height="28" rx="12" fill={object} />
          <rect x="186" y="103" width="28" height="6" rx="3" fill={accent} opacity="0.7" />
          <circle cx="200" cy="292" r="5" fill={accent} />
          <circle cx="286" cy="148" r="10" fill={accent} opacity="0.8" />
        </>
      );
    case "earbuds":
      return (
        <>
          <rect x="94" y="196" width="212" height="108" rx="46" fill={object} />
          <rect x="112" y="214" width="176" height="72" rx="34" fill={secondary} opacity="0.18" />
          <path d="M172 166c-16 0-28 13-28 29 0 14 9 26 23 29v18c0 9 7 16 16 16s16-7 16-16v-44c0-18-12-32-27-32Z" fill={object} />
          <circle cx="181" cy="196" r="18" fill={secondary} opacity="0.28" />
          <path d="M228 166c16 0 28 13 28 29 0 14-9 26-23 29v18c0 9-7 16-16 16s-16-7-16-16v-44c0-18 12-32 27-32Z" fill={object} />
          <circle cx="219" cy="196" r="18" fill={secondary} opacity="0.28" />
          <circle cx="200" cy="252" r="4" fill={accent} />
          <path d="M126 240h14" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        </>
      );
    case "monitor":
      return (
        <>
          <rect x="72" y="128" width="112" height="182" rx="10" fill={object} />
          <rect x="216" y="128" width="112" height="182" rx="10" fill={object} />
          <circle cx="128" cy="204" r="34" fill={secondary} opacity="0.9" />
          <circle cx="128" cy="204" r="14" fill={object} />
          <circle cx="272" cy="204" r="34" fill={secondary} opacity="0.9" />
          <circle cx="272" cy="204" r="14" fill={object} />
          <circle cx="128" cy="266" r="14" fill={secondary} opacity="0.65" />
          <circle cx="272" cy="266" r="14" fill={secondary} opacity="0.65" />
          <rect x="88" y="300" width="80" height="6" rx="3" fill={accent} opacity="0.7" />
          <rect x="232" y="300" width="80" height="6" rx="3" fill={accent} opacity="0.7" />
          <rect x="96" y="144" width="64" height="4" rx="2" fill={bgSafe(object)} opacity="0.4" />
          <rect x="240" y="144" width="64" height="4" rx="2" fill={bgSafe(object)} opacity="0.4" />
        </>
      );
    case "lamp":
      return (
        <>
          <ellipse cx="200" cy="312" rx="72" ry="16" fill={secondary} />
          <rect x="190" y="188" width="20" height="124" rx="8" fill={object} />
          <path d="M126 188h148l-22-74h-104l-22 74Z" fill={object} />
          <path d="M142 178h116l-14-48h-88l-14 48Z" fill={accent} opacity="0.35" />
          <ellipse cx="200" cy="188" rx="74" ry="12" fill={secondary} opacity="0.2" />
          <ellipse cx="200" cy="306" rx="52" ry="9" fill={accent} opacity="0.45" />
          <path d="M178 106h44" stroke={secondary} strokeWidth="6" strokeLinecap="round" />
          <circle cx="200" cy="276" r="4" fill={accent} />
        </>
      );
    case "floorlamp":
      return (
        <>
          <ellipse cx="214" cy="318" rx="70" ry="14" fill={secondary} />
          <path d="M126 120c0 0-12 168 60 184" fill="none" stroke={object} strokeWidth="9" strokeLinecap="round" />
          <path d="M112 108h74l-18 54h-38l-18-54Z" fill={object} />
          <path d="M122 116h54l-12 36h-30l-12-36Z" fill={accent} opacity="0.3" />
          <rect x="244" y="294" width="54" height="14" rx="7" fill={object} />
          <path d="M248 294V214" stroke={object} strokeWidth="7" strokeLinecap="round" />
          <circle cx="248" cy="226" r="16" fill={accent} opacity="0.35" />
          <circle cx="248" cy="226" r="5" fill={accent} />
        </>
      );
    case "candle":
      return (
        <>
          {[0, 1, 2].map((index) => {
            const x = 108 + index * 66;
            const height = 108 + index * 18;
            return (
              <g key={index}>
                <rect x={x} y={300 - height} width="48" height={height} rx="8" fill={index === 1 ? accent : object} opacity={index === 1 ? 0.82 : 1} />
                <ellipse cx={x + 24} cy={300 - height} rx="24" ry="7" fill={secondary} opacity="0.25" />
                <path d={`M${x + 24} ${300 - height - 8}c-8-10 2-18 2-26 8 8 10 16 2 26`} fill={accent} />
                <path d={`M${x + 24} ${300 - height - 6}v-10`} stroke={secondary} strokeWidth="2" />
              </g>
            );
          })}
          <rect x="88" y="300" width="236" height="12" rx="6" fill={secondary} opacity="0.24" />
        </>
      );
    case "pendant":
      return (
        <>
          <path d="M200 36v108" stroke={secondary} strokeWidth="4" />
          <rect x="186" y="36" width="28" height="7" rx="3" fill={object} />
          <circle cx="200" cy="214" r="86" fill={object} />
          <circle cx="200" cy="214" r="86" fill={accent} opacity="0.18" />
          <circle cx="200" cy="214" r="86" fill="none" stroke={secondary} strokeWidth="3" opacity="0.3" />
          <path d="M160 168c14-18 40-26 62-18" fill="none" stroke={bgSafe(object)} strokeWidth="7" strokeLinecap="round" opacity="0.65" />
          <ellipse cx="200" cy="306" rx="86" ry="14" fill={accent} opacity="0.22" />
          <circle cx="200" cy="144" r="10" fill={secondary} opacity="0.4" />
        </>
      );
    case "vase":
      return (
        <>
          <path d="M156 300c-24-34-18-62-2-84 12-16 18-30 14-52h64c-4 22 2 36 14 52 16 22 22 50-2 84Z" fill={object} />
          <path d="M168 292c-14-26-10-48 4-66 10-14 14-26 12-42h32c-2 16 2 28 12 42 14 18 18 40 4 66Z" fill={accent} opacity="0.24" />
          <ellipse cx="200" cy="164" rx="32" ry="8" fill={secondary} opacity="0.45" />
          <path d="M200 164c10-24 30-36 54-38-4 26-20 44-48 48" fill={secondary} opacity="0.55" />
          <path d="M196 166c-10-18-24-26-42-28 2 20 14 34 36 38" fill={secondary} opacity="0.35" />
          <ellipse cx="200" cy="306" rx="48" ry="9" fill={secondary} opacity="0.2" />
        </>
      );
    case "throw":
      return (
        <>
          <path d="M92 268h216l-22 44H114Z" fill={object} />
          <path d="M112 210h186l-10 64H122Z" fill={accent} opacity="0.55" />
          <path d="M130 154h160l-8 62H138Z" fill={object} opacity="0.9" />
          <path d="M130 154h160M138 216h144M122 274h176" stroke={secondary} strokeWidth="2" opacity="0.4" />
          <path d="M120 268v22M140 268v22M160 268v22M180 268v22M200 268v22M220 268v22M240 268v22M260 268v22M280 268v22" stroke={secondary} strokeWidth="3" opacity="0.55" />
          <path d="M150 174h120M146 190h124" stroke={secondary} strokeWidth="2" opacity="0.25" />
        </>
      );
    case "chair":
      return (
        <>
          <path d="M124 150c0-14 11-24 24-24h104c13 0 24 10 24 24v58H124v-58Z" fill={object} />
          <path d="M132 204h136c10 0 18 8 18 18v22H114v-22c0-10 8-18 18-18Z" fill={accent} opacity="0.75" />
          <path d="M126 244v70M146 244v58M254 244v58M274 244v70" stroke={secondary} strokeWidth="9" strokeLinecap="round" />
          <path d="M116 150v94M284 150v94" stroke={secondary} strokeWidth="9" strokeLinecap="round" />
          <path d="M124 166h152" stroke={secondary} strokeWidth="3" opacity="0.3" />
          <ellipse cx="200" cy="318" rx="94" ry="10" fill={secondary} opacity="0.16" />
        </>
      );
    case "dinnerware":
      return (
        <>
          <ellipse cx="200" cy="288" rx="112" ry="30" fill={object} />
          <ellipse cx="200" cy="282" rx="98" ry="24" fill={accent} opacity="0.4" />
          <ellipse cx="200" cy="240" rx="86" ry="24" fill={object} />
          <ellipse cx="200" cy="235" rx="72" ry="18" fill={bgSafe(object)} opacity="0.55" />
          <path d="M134 176c0 16 30 28 66 28s66-12 66-28" fill={object} />
          <ellipse cx="200" cy="176" rx="66" ry="20" fill={accent} opacity="0.35" />
          <ellipse cx="200" cy="174" rx="52" ry="14" fill={secondary} opacity="0.2" />
          <path d="M134 176v-40c0-11 30-20 66-20s66 9 66 20v40" fill={object} opacity="0.9" />
          <ellipse cx="200" cy="136" rx="66" ry="19" fill={secondary} opacity="0.25" />
        </>
      );
    case "journal":
      return (
        <>
          <rect x="118" y="100" width="176" height="216" rx="8" fill={object} />
          <rect x="134" y="100" width="160" height="216" rx="6" fill={accent} opacity="0.35" />
          <rect x="134" y="112" width="8" height="192" fill={secondary} opacity="0.45" />
          <rect x="150" y="146" width="112" height="6" rx="3" fill={secondary} opacity="0.5" />
          <rect x="150" y="166" width="72" height="4" rx="2" fill={secondary} opacity="0.3" />
          <rect x="258" y="100" width="12" height="216" fill={secondary} opacity="0.25" />
          <path d="M294 150v70" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <circle cx="294" cy="228" r="5" fill={accent} />
          <rect x="166" y="236" width="80" height="2" fill={secondary} opacity="0.2" />
        </>
      );
    case "pen":
      return (
        <>
          <g transform="rotate(-38 200 200)">
            <rect x="184" y="86" width="32" height="176" rx="14" fill={object} />
            <rect x="190" y="94" width="8" height="154" rx="4" fill={accent} opacity="0.4" />
            <path d="M184 262h32l-16 46Z" fill={secondary} />
            <path d="M194 288h12l-6 20Z" fill={accent} />
            <rect x="181" y="70" width="38" height="22" rx="8" fill={secondary} />
            <rect x="186" y="74" width="28" height="5" rx="2" fill={object} opacity="0.6" />
            <rect x="178" y="212" width="44" height="4" rx="2" fill={secondary} opacity="0.4" />
          </g>
        </>
      );
    case "tray":
      return (
        <>
          <path d="M82 206l118-46 118 46-118 52Z" fill={object} opacity="0.55" />
          <path d="M82 206v40l118 52 118-52v-40" fill={object} />
          <path d="M82 206l118 52 118-52" stroke={secondary} strokeWidth="3" opacity="0.35" />
          <path d="M100 214v22l100 44 100-44v-22" fill={accent} opacity="0.22" />
          <rect x="168" y="164" width="64" height="36" rx="4" fill={secondary} opacity="0.45" transform="rotate(-8 200 182)" />
          <circle cx="246" cy="188" r="12" fill={accent} opacity="0.7" />
          <rect x="140" y="196" width="34" height="6" rx="3" fill={secondary} opacity="0.35" />
        </>
      );
    case "planner":
      return (
        <>
          <path d="M94 128l106-14v180l-106 14Z" fill={object} />
          <path d="M200 114l106 14v180l-106-14Z" fill={accent} opacity="0.55" />
          <path d="M200 114v180" stroke={secondary} strokeWidth="4" opacity="0.35" />
          <path d="M112 150l72-10M112 174l72-10M112 198l72-10M112 222l72-10M112 246l72-10" stroke={bgSafe(object)} strokeWidth="2" opacity="0.45" />
          <path d="M220 150l68 9M220 174l68 9M220 198l68 9" stroke={secondary} strokeWidth="2" opacity="0.3" />
          <rect x="226" y="226" width="54" height="36" rx="3" fill={bgSafe(object)} opacity="0.5" />
          <path d="M286 128v40" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "tote":
      return (
        <>
          <path d="M120 158h160l16 150H104Z" fill={object} />
          <path d="M136 158c0-38 18-62 64-62s64 24 64 62" fill="none" stroke={secondary} strokeWidth="12" strokeLinecap="round" />
          <path d="M120 190h160" stroke={secondary} strokeWidth="2" opacity="0.35" />
          <rect x="158" y="208" width="84" height="58" rx="4" fill={accent} opacity="0.35" />
          <path d="M172 220v34M228 220v34" stroke={secondary} strokeWidth="2" opacity="0.4" />
          <path d="M104 292h192" stroke={secondary} strokeWidth="4" opacity="0.3" />
          <circle cx="200" cy="258" r="6" fill={secondary} opacity="0.6" />
        </>
      );
    case "watch":
      return (
        <>
          <path d="M170 84h60l-8 86h-44Z" fill={secondary} />
          <path d="M170 330h60l-8-86h-44Z" fill={secondary} />
          <circle cx="200" cy="210" r="74" fill={object} />
          <circle cx="200" cy="210" r="62" fill={bgSafe(object)} opacity="0.92" />
          <circle cx="200" cy="210" r="62" fill="none" stroke={secondary} strokeWidth="3" opacity="0.35" />
          <path d="M200 162v10M248 210h-10M200 258v-10M152 210h10" stroke={secondary} strokeWidth="3" strokeLinecap="round" />
          <path d="M200 210V172M200 210l28 16" stroke={accent} strokeWidth="4" strokeLinecap="round" />
          <circle cx="200" cy="210" r="4" fill={accent} />
          <rect x="272" y="204" width="10" height="12" rx="3" fill={object} />
          <path d="M176 330h48" stroke={accent} strokeWidth="3" opacity="0.5" />
        </>
      );
    case "fragrance":
      return (
        <>
          <rect x="146" y="150" width="108" height="158" rx="12" fill={object} />
          <rect x="160" y="164" width="80" height="130" rx="8" fill={accent} opacity="0.28" />
          <rect x="180" y="102" width="40" height="52" rx="4" fill={secondary} />
          <rect x="174" y="94" width="52" height="14" rx="5" fill={object} />
          <rect x="170" y="212" width="60" height="42" rx="2" fill={bgSafe(object)} opacity="0.85" />
          <path d="M178 222h44M178 232h32M178 242h38" stroke={secondary} strokeWidth="2" opacity="0.55" />
          <ellipse cx="200" cy="310" rx="54" ry="8" fill={secondary} opacity="0.18" />
        </>
      );
    case "diffuser":
      return (
        <>
          <path d="M146 306c-16 0-28-12-28-28v-84c0-18 14-32 32-32h100c18 0 32 14 32 32v84c0 16-12 28-28 28Z" fill={object} />
          <path d="M130 202c22-14 118-14 140 0v18c-22-12-118-12-140 0Z" fill={accent} opacity="0.3" />
          <ellipse cx="200" cy="306" rx="54" ry="8" fill={secondary} opacity="0.2" />
          <path d="M200 152c-16-18 4-30 0-48M170 138c-12-14 2-22 0-34M230 140c-10-12 2-20 0-30" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.65" fill="none" />
          <circle cx="200" cy="252" r="22" fill={accent} opacity="0.35" />
          <circle cx="200" cy="252" r="8" fill={secondary} opacity="0.35" />
        </>
      );
    case "salts":
      return (
        <>
          <rect x="136" y="170" width="128" height="134" rx="16" fill={object} />
          <rect x="148" y="184" width="104" height="106" rx="10" fill={accent} opacity="0.28" />
          <rect x="128" y="142" width="144" height="32" rx="10" fill={secondary} />
          <rect x="156" y="214" width="88" height="52" rx="3" fill={bgSafe(object)} opacity="0.88" />
          <path d="M166 228h68M166 240h46M166 252h58" stroke={secondary} strokeWidth="2" opacity="0.55" />
          <circle cx="192" cy="276" r="3" fill={secondary} opacity="0.4" />
          <circle cx="208" cy="276" r="3" fill={secondary} opacity="0.4" />
        </>
      );
    case "coffee":
      return (
        <>
          <path d="M132 168h136l-38 78h-60Z" fill={object} />
          <path d="M150 180h100l-26 54h-48Z" fill={accent} opacity="0.3" />
          <path d="M166 246h68l22 56H144Z" fill={object} opacity="0.75" />
          <ellipse cx="200" cy="302" rx="52" ry="8" fill={secondary} opacity="0.25" />
          <path d="M162 150c0-14 12-24 28-24s28 10 28 24" fill="none" stroke={secondary} strokeWidth="4" opacity="0.4" />
          <rect x="264" y="200" width="56" height="70" rx="8" fill={secondary} opacity="0.65" />
          <rect x="274" y="214" width="36" height="20" rx="3" fill={accent} opacity="0.7" />
          <path d="M274 250h36M274 258h24" stroke={bgSafe(object)} strokeWidth="3" opacity="0.6" />
        </>
      );
    default:
      return <circle cx="200" cy="200" r="90" fill={object} />;
  }
}

/** Returns a light/dark contrast partner for details drawn on the object colour. */
function bgSafe(color: string): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1B211E" : "#F6F1E7";
}

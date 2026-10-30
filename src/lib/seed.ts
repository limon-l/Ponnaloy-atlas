import type {
  AtlasState,
  AuditEntry,
  Campaign,
  Category,
  Collection,
  Customer,
  Notification,
  Order,
  OrderStatus,
  Palette,
  Product,
  ProductSpec,
  ProductVariant,
  Seller,
} from "@/lib/types";

/** Fixed demo clock keeps seeded dashboards, tests and screenshots stable. */
export const DEMO_NOW = "2026-10-29T09:00:00.000Z";

const daysAgo = (days: number, hour = 10) => {
  const date = new Date(DEMO_NOW);
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
};

const daysAhead = (days: number) => {
  const date = new Date(DEMO_NOW);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

const palettes = {
  sand: { bg: "#E8DFD2", object: "#B4633E", secondary: "#2F4B45", accent: "#D9A86C" },
  moss: { bg: "#DEE2D5", object: "#3C5B4C", secondary: "#1D2E28", accent: "#C08A5E" },
  bone: { bg: "#EFE9DD", object: "#C9B79C", secondary: "#4A4A44", accent: "#9B5B3E" },
  slate: { bg: "#DDE1E2", object: "#50636A", secondary: "#26333A", accent: "#C67A52" },
  clay: { bg: "#EADFD6", object: "#B76A4C", secondary: "#51362B", accent: "#E4C39A" },
  ink: { bg: "#D9DDDA", object: "#202A27", secondary: "#5E6B65", accent: "#B7845F" },
  brass: { bg: "#EAE1CE", object: "#A88444", secondary: "#3C3428", accent: "#D9B978" },
  rust: { bg: "#E9D8CB", object: "#A65337", secondary: "#4A2B21", accent: "#E0B38C" },
  oat: { bg: "#EDE6D8", object: "#CDBE9F", secondary: "#6C6250", accent: "#A36A45" },
  charcoal: { bg: "#DDDCD8", object: "#2A2C2A", secondary: "#7C7D76", accent: "#C08A5E" },
  porcelain: { bg: "#ECE9E1", object: "#F7F4EC", secondary: "#9BA39B", accent: "#B85F41" },
  olive: { bg: "#E1E2D3", object: "#69704C", secondary: "#2F3326", accent: "#C79258" },
} satisfies Record<string, Palette>;

export const sellers: Seller[] = [
  {
    id: "sel-kestrel",
    slug: "kestrel-audio",
    name: "Kestrel Audio",
    tagline: "Listen closer.",
    description:
      "A small acoustics studio in Copenhagen building quiet, durable listening equipment. Every product is tuned by hand and supported for a decade.",
    location: "Copenhagen, DK",
    rating: 4.8,
    reviewCount: 412,
    commissionRate: 0.12,
    status: "APPROVED",
    joinedAt: "2023-03-14T00:00:00.000Z",
    palette: palettes.slate,
    supportEmail: "care@kestrel.audio",
    fulfilmentSlaHours: 24,
  },
  {
    id: "sel-lumen",
    slug: "maison-lumen",
    name: "Maison Lumen",
    tagline: "Light, held still.",
    description:
      "Sculptural lighting made in small batches from linen, opal glass and hand-spun metal. Designed in Lyon, assembled in Portugal.",
    location: "Lyon, FR",
    rating: 4.7,
    reviewCount: 289,
    commissionRate: 0.14,
    status: "APPROVED",
    joinedAt: "2023-08-02T00:00:00.000Z",
    palette: palettes.brass,
    supportEmail: "studio@maisonlumen.fr",
    fulfilmentSlaHours: 48,
  },
  {
    id: "sel-northwind",
    slug: "northwind-atelier",
    name: "Northwind Atelier",
    tagline: "Objects for the long table.",
    description:
      "Furniture and tableware from FSC oak, stoneware and undyed wool. Made with two family workshops in Jutland.",
    location: "Aarhus, DK",
    rating: 4.9,
    reviewCount: 531,
    commissionRate: 0.11,
    status: "APPROVED",
    joinedAt: "2022-11-19T00:00:00.000Z",
    palette: palettes.sand,
    supportEmail: "hello@northwind.atelier",
    fulfilmentSlaHours: 72,
  },
  {
    id: "sel-fieldnotes",
    slug: "field-notes-supply",
    name: "Field Notes Supply",
    tagline: "Tools for thinking.",
    description:
      "Paper goods and writing instruments produced with a 90-year-old bindery in Osaka and a small brass workshop in Sheffield.",
    location: "London, UK",
    rating: 4.6,
    reviewCount: 358,
    commissionRate: 0.15,
    status: "APPROVED",
    joinedAt: "2024-01-21T00:00:00.000Z",
    palette: palettes.olive,
    supportEmail: "desk@fieldnotes.supply",
    fulfilmentSlaHours: 24,
  },
  {
    id: "sel-meridian",
    slug: "meridian-goods",
    name: "Meridian Goods",
    tagline: "Carry less, better.",
    description:
      "Leather and mechanical timepieces assembled in small runs. Full-grain hides, brass hardware, repairable movements.",
    location: "Florence, IT",
    rating: 4.8,
    reviewCount: 197,
    commissionRate: 0.13,
    status: "APPROVED",
    joinedAt: "2024-05-09T00:00:00.000Z",
    palette: palettes.rust,
    supportEmail: "service@meridian.goods",
    fulfilmentSlaHours: 48,
  },
  {
    id: "sel-still",
    slug: "still-house",
    name: "Still House",
    tagline: "A slower evening.",
    description:
      "Fragrance, ceramics and bathing rituals built around cedar, smoke and mineral notes. Blended in small batches in Kyoto.",
    location: "Kyoto, JP",
    rating: 4.7,
    reviewCount: 244,
    commissionRate: 0.16,
    status: "APPROVED",
    joinedAt: "2024-09-30T00:00:00.000Z",
    palette: palettes.ink,
    supportEmail: "care@still.house",
    fulfilmentSlaHours: 48,
  },
  {
    id: "sel-verve",
    slug: "verve-objects",
    name: "Verve Objects",
    tagline: "New, considered.",
    description:
      "An applicant studio focused on recycled aluminium desk objects. Application under review; no products are live.",
    location: "Lisbon, PT",
    rating: 0,
    reviewCount: 0,
    commissionRate: 0.15,
    status: "PENDING",
    joinedAt: daysAgo(6),
    palette: palettes.olive,
    supportEmail: "studio@verve.objects",
    fulfilmentSlaHours: 48,
  },
];

export const categories: Category[] = [
  {
    slug: "audio",
    name: "Audio",
    description: "Quietly engineered listening equipment for rooms of every size.",
    art: "headphones",
    palette: palettes.slate,
  },
  {
    slug: "lighting",
    name: "Lighting",
    description: "Sculptural light in linen, opal glass and hand-spun metal.",
    art: "lamp",
    palette: palettes.brass,
  },
  {
    slug: "home",
    name: "Home",
    description: "Furniture and tableware made to outlast the season.",
    art: "chair",
    palette: palettes.sand,
  },
  {
    slug: "stationery",
    name: "Stationery",
    description: "Paper, ink and desk tools for deliberate work.",
    art: "journal",
    palette: palettes.olive,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Leather and mechanical objects that age with use.",
    art: "tote",
    palette: palettes.rust,
  },
  {
    slug: "wellness",
    name: "Wellness",
    description: "Cedar, smoke and mineral rituals for the end of the day.",
    art: "fragrance",
    palette: palettes.ink,
  },
];

function variant(
  id: string,
  option: string,
  stock: number,
  swatch: string,
  label = "Finish",
  priceDelta = 0
): ProductVariant {
  return { id, label, option, stock, swatch, priceDelta };
}

function spec(label: string, value: string, group: ProductSpec["group"]): ProductSpec {
  return { label, value, group };
}

type ProductInput = Omit<
  Product,
  "id" | "slug" | "moderation" | "rating" | "reviewCount" | "createdAt" | "specs" | "variants" | "tags"
> & {
  id: string;
  slug: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  tags?: string[];
  moderation?: Product["moderation"];
  specs: Array<[string, string, ProductSpec["group"]]>;
  variants: ProductVariant[];
};

function makeProduct(input: ProductInput): Product {
  return {
    ...input,
    rating: input.rating ?? 4.6,
    reviewCount: input.reviewCount ?? 42,
    createdAt: input.createdAt ?? daysAgo(90),
    tags: input.tags ?? [],
    moderation: input.moderation ?? "APPROVED",
    specs: input.specs.map(([label, value, group]) => spec(label, value, group)),
  };
}

export const products: Product[] = [
  makeProduct({
    id: "p-aria",
    slug: "aria-over-ear-headphones",
    name: "Aria Over-Ear",
    subtitle: "Closed-back headphones with adaptive silence",
    description:
      "A calm, room-filling listen in a folding aluminium frame. Aria pairs 40 mm bio-cellulose drivers with adaptive noise control that reads the room rather than fighting it.",
    story:
      "We tuned Aria against a single reference: a small wood-panelled listening room in Copenhagen. The result is a warm low end, an unhurried midrange, and noise control that removes the train without removing the detail.",
    price: 38900,
    compareAtPrice: 44900,
    category: "audio",
    sellerId: "sel-kestrel",
    brand: "Kestrel",
    art: "headphones",
    palette: palettes.slate,
    rating: 4.8,
    reviewCount: 214,
    stock: 4,
    variantLabel: "Finish",
    variants: [
      variant("v-aria-graphite", "Graphite", 2, "#2C3234"),
      variant("v-aria-sand", "Sand", 1, "#C9B79C"),
      variant("v-aria-moss", "Moss", 1, "#4A5C4B"),
    ],
    specs: [
      ["Driver", "40 mm bio-cellulose", "Performance"],
      ["Battery", "38 hours (ANC on)", "Performance"],
      ["Weight", "268 g", "Dimensions"],
      ["Noise control", "Adaptive, −32 dB", "Performance"],
      ["Connectivity", "Bluetooth 5.3 · USB-C · 3.5 mm", "Performance"],
      ["Frame", "Recycled aluminium", "Materials"],
      ["Cushions", "Recycled leather", "Materials"],
      ["Care", "Replaceable pads; wipe with dry cloth", "Care"],
    ],
    highlights: ["Adaptive noise control", "38-hour battery", "Replaceable pads", "Folds flat"],
    materials: "Recycled aluminium, bio-cellulose, recycled leather",
    care: "Wipe with a dry microfibre cloth. Replacement pads available for ten years.",
    featured: true,
    trending: true,
    newArrival: false,
    bestseller: true,
    tags: ["noise cancelling", "travel", "wireless"],
  }),
  makeProduct({
    id: "p-nomad",
    slug: "nomad-field-speaker",
    name: "Nomad Field Speaker",
    subtitle: "Portable 360° sound, weather-sealed",
    description:
      "A palm-sized speaker with a surprising amount of room. Nomad throws sound in every direction and shrugs off rain, sand and a full day outdoors.",
    story:
      "Built for the kitchen counter and the campsite table. The anodised shell is sealed to IPX6 and the battery holds twelve hours at a normal listening level.",
    price: 17900,
    category: "audio",
    sellerId: "sel-kestrel",
    brand: "Kestrel",
    art: "speaker",
    palette: palettes.moss,
    rating: 4.5,
    reviewCount: 132,
    stock: 22,
    variantLabel: "Finish",
    variants: [
      variant("v-nomad-slate", "Slate", 14, "#50636A"),
      variant("v-nomad-clay", "Clay", 8, "#B76A4C"),
    ],
    specs: [
      ["Output", "20 W", "Performance"],
      ["Battery", "12 hours", "Performance"],
      ["Ingress", "IPX6", "Performance"],
      ["Weight", "0.9 kg", "Dimensions"],
      ["Dimensions", "18 × 9 × 9 cm", "Dimensions"],
      ["Shell", "Anodised aluminium", "Materials"],
      ["Care", "Rinse and air-dry after salt water", "Care"],
    ],
    highlights: ["360° driver array", "IPX6", "USB-C charging", "Pair two for stereo"],
    materials: "Anodised aluminium, silicone, woven polyester",
    care: "Rinse with fresh water and air-dry. Do not submerge.",
    featured: false,
    trending: true,
    newArrival: false,
    bestseller: false,
    tags: ["portable", "outdoor", "bluetooth"],
  }),
  makeProduct({
    id: "p-cadence",
    slug: "cadence-earbuds",
    name: "Cadence Earbuds",
    subtitle: "Small, quiet, all-day",
    description:
      "Cadence is a featherweight earbud with a natural transparency mode and a case that disappears in a pocket. Tuned for voices and long walks.",
    story:
      "Most earbuds shout. Cadence is voiced for podcasts, calls and acoustic music, with a gentle roll-off that keeps fatigue away after the third hour.",
    price: 14900,
    compareAtPrice: 17900,
    category: "audio",
    sellerId: "sel-kestrel",
    brand: "Kestrel",
    art: "earbuds",
    palette: palettes.bone,
    rating: 4.4,
    reviewCount: 186,
    stock: 36,
    variantLabel: "Finish",
    variants: [
      variant("v-cadence-ivory", "Ivory", 20, "#EFE9DD"),
      variant("v-cadence-black", "Black", 16, "#242725"),
    ],
    specs: [
      ["Battery", "8 h + 24 h case", "Performance"],
      ["Noise control", "Hybrid ANC", "Performance"],
      ["Ingress", "IPX5", "Performance"],
      ["Weight", "5.2 g per bud", "Dimensions"],
      ["Connectivity", "Bluetooth 5.3", "Performance"],
      ["Care", "Clean mesh with a soft brush", "Care"],
    ],
    highlights: ["Hybrid ANC", "Transparency mode", "Wireless charging", "Four tip sizes"],
    materials: "Recycled polycarbonate, silicone",
    care: "Clean the acoustic mesh monthly with a dry soft brush.",
    featured: true,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["earbuds", "commute", "calls"],
  }),
  makeProduct({
    id: "p-monitor",
    slug: "kestrel-studio-monitor",
    name: "Kestrel Studio Monitor",
    subtitle: "Near-field monitor, sold as a pair",
    description:
      "A compact two-way monitor for small rooms and honest mixes. Front-ported, room-tunable, and quiet enough for a shared flat.",
    story:
      "Designed with a composer who works at night. The cabinet is braced birch ply, the amplifier is Class D, and the treble trim has three positions rather than a dozen.",
    price: 52900,
    category: "audio",
    sellerId: "sel-kestrel",
    brand: "Kestrel",
    art: "monitor",
    palette: palettes.charcoal,
    rating: 4.7,
    reviewCount: 64,
    stock: 9,
    variantLabel: "Configuration",
    variants: [
      variant("v-monitor-pair", "Pair · Graphite", 6, "#2A2C2A", "Configuration"),
      variant("v-monitor-single", "Single · Graphite", 3, "#2A2C2A", "Configuration", -24000),
    ],
    specs: [
      ["Woofer", "5 in. woven fibre", "Performance"],
      ["Amplifier", "60 W Class D", "Performance"],
      ["Response", "45 Hz – 22 kHz", "Performance"],
      ["Inputs", "XLR · TRS", "Performance"],
      ["Dimensions", "30 × 19 × 23 cm", "Dimensions"],
      ["Cabinet", "Braced birch ply", "Materials"],
      ["Care", "Dust with a dry cloth; keep away from direct sun", "Care"],
    ],
    highlights: ["Front-ported", "Three-position treble trim", "Balanced inputs", "Sold as a pair"],
    materials: "Birch ply, woven fibre, aluminium",
    care: "Dust with a dry cloth. Do not place near a heat source.",
    featured: false,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["studio", "monitor", "wired"],
  }),
  makeProduct({
    id: "p-halo",
    slug: "halo-table-lamp",
    name: "Halo Table Lamp",
    subtitle: "Linen shade, dimmable warm light",
    description:
      "A generous pool of warm light under a hand-sewn linen shade. Halo is built around a dimmable LED module and a weighted ceramic base.",
    story:
      "The shade is cut and sewn in Portugal; the base is thrown in a small studio outside Porto. Every lamp is assembled, tested and packed by the same two people.",
    price: 24000,
    category: "lighting",
    sellerId: "sel-lumen",
    brand: "Lumen",
    art: "lamp",
    palette: palettes.brass,
    rating: 4.7,
    reviewCount: 98,
    stock: 0,
    variantLabel: "Finish",
    variants: [
      variant("v-halo-bone", "Bone", 0, "#EFE9DD"),
      variant("v-halo-terracotta", "Terracotta", 0, "#B76A4C"),
      variant("v-halo-ink", "Ink", 0, "#202A27"),
    ],
    specs: [
      ["Height", "42 cm", "Dimensions"],
      ["Shade", "28 cm linen drum", "Dimensions"],
      ["Light", "9 W LED · 2700 K", "Performance"],
      ["Dimming", "Stepless touch dimmer", "Performance"],
      ["Base", "Hand-thrown ceramic", "Materials"],
      ["Cable", "2 m braided", "Materials"],
      ["Care", "Dust shade with a soft brush", "Care"],
    ],
    highlights: ["Hand-sewn linen", "Stepless dimming", "Warm 2700 K", "Replaceable module"],
    materials: "Linen, ceramic, brass",
    care: "Dust the shade with a soft brush. Wipe the base with a damp cloth.",
    featured: true,
    trending: true,
    newArrival: false,
    bestseller: true,
    tags: ["lamp", "warm light", "bedside"],
  }),
  makeProduct({
    id: "p-arc",
    slug: "arc-floor-light",
    name: "Arc Floor Light",
    subtitle: "A long reach of light over a reading chair",
    description:
      "A slender brass arc that puts light exactly where a book is. The counterweighted base means no clamp, no drilling, and no wobble.",
    story:
      "Arc began as a drawing for a reading chair that had no side table. The arm is hand-bent, the base is filled with cast iron, and the whole thing breaks down into three pieces for moving.",
    price: 56000,
    category: "lighting",
    sellerId: "sel-lumen",
    brand: "Lumen",
    art: "floorlamp",
    palette: palettes.brass,
    rating: 4.8,
    reviewCount: 54,
    stock: 6,
    variantLabel: "Finish",
    variants: [
      variant("v-arc-brass", "Brass", 4, "#A88444"),
      variant("v-arc-black", "Black", 2, "#242725"),
    ],
    specs: [
      ["Height", "165 cm", "Dimensions"],
      ["Reach", "82 cm", "Dimensions"],
      ["Light", "9 W LED · 2700 K", "Performance"],
      ["Dimming", "Foot dimmer", "Performance"],
      ["Arm", "Hand-bent brass", "Materials"],
      ["Base", "Cast iron, powder-coated", "Materials"],
      ["Care", "Brass will patina; polish if desired", "Care"],
    ],
    highlights: ["Counterweighted base", "Foot dimmer", "Three-piece assembly", "Warm 2700 K"],
    materials: "Brass, cast iron, linen",
    care: "Leave brass to patina or polish with a soft cloth.",
    featured: true,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["floor lamp", "reading", "brass"],
  }),
  makeProduct({
    id: "p-ember",
    slug: "ember-candle-set",
    name: "Ember Candle Set",
    subtitle: "Cedar, smoke, and a little resin",
    description:
      "Three hand-poured candles for the end of the day. A mineral soy wax base carries cedarwood, birch smoke and a trace of labdanum.",
    story:
      "Blended with a perfumer in Grasse and poured in small batches in Kyoto. The vessels are pressed glass and made to be reused for brushes or stems.",
    price: 6800,
    category: "lighting",
    sellerId: "sel-lumen",
    brand: "Lumen",
    art: "candle",
    palette: palettes.rust,
    rating: 4.6,
    reviewCount: 221,
    stock: 48,
    variantLabel: "Set",
    variants: [
      variant("v-ember-three", "Set of 3", 32, "#A65337", "Set"),
      variant("v-ember-single", "Single", 16, "#A65337", "Set", -4600),
    ],
    specs: [
      ["Burn time", "32 hours each", "Performance"],
      ["Wax", "Mineral soy blend", "Materials"],
      ["Wick", "Cotton, lead-free", "Materials"],
      ["Notes", "Cedar · birch smoke · labdanum", "Performance"],
      ["Vessel", "Pressed glass, 180 ml", "Dimensions"],
      ["Care", "Trim wick to 5 mm before each burn", "Care"],
    ],
    highlights: ["Hand-poured", "32-hour burn", "Reusable vessel", "Cotton wick"],
    materials: "Mineral soy wax, cotton, glass",
    care: "Trim the wick to 5 mm. Burn for no more than four hours at a time.",
    featured: false,
    trending: true,
    newArrival: false,
    bestseller: true,
    tags: ["candle", "cedar", "gift"],
  }),
  makeProduct({
    id: "p-pendant",
    slug: "lumen-pendant",
    name: "Lumen Pendant",
    subtitle: "Opal glass, a soft globe of light",
    description:
      "A hand-blown opal glass globe that softens a room without flattening it. Available in two sizes with a three-metre braided cord.",
    story:
      "The glass is blown in a family workshop in Poznań. Each globe carries small variations in thickness, which is exactly the point.",
    price: 32000,
    category: "lighting",
    sellerId: "sel-lumen",
    brand: "Lumen",
    art: "pendant",
    palette: palettes.porcelain,
    rating: 4.5,
    reviewCount: 77,
    stock: 14,
    variantLabel: "Size",
    variants: [
      variant("v-pendant-30", "30 cm", 9, "#F7F4EC", "Size"),
      variant("v-pendant-40", "40 cm", 5, "#F7F4EC", "Size", 8000),
    ],
    specs: [
      ["Diameter", "30 or 40 cm", "Dimensions"],
      ["Cord", "3 m braided", "Dimensions"],
      ["Socket", "E27, max 12 W LED", "Performance"],
      ["Glass", "Hand-blown opal", "Materials"],
      ["Canopy", "Powder-coated steel", "Materials"],
      ["Care", "Wipe with a damp cloth when cool", "Care"],
    ],
    highlights: ["Hand-blown glass", "Two sizes", "3 m cord", "Dimmable with compatible bulb"],
    materials: "Opal glass, steel, textile cord",
    care: "Switch off and let cool before cleaning.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["pendant", "dining", "glass"],
  }),
  makeProduct({
    id: "p-terra",
    slug: "terra-vessel",
    name: "Terra Vessel",
    subtitle: "Wheel-thrown stoneware, unglazed outside",
    description:
      "A wide, low vessel with a raw clay exterior and a food-safe interior glaze. Useful for fruit, stems, or nothing at all.",
    story:
      "Thrown by a two-person studio in Jutland from local clay. The outside is left unglazed so it darkens slowly with handling.",
    price: 12800,
    category: "home",
    sellerId: "sel-northwind",
    brand: "Northwind",
    art: "vase",
    palette: palettes.sand,
    rating: 4.7,
    reviewCount: 63,
    stock: 17,
    variantLabel: "Size",
    variants: [
      variant("v-terra-low", "Low · 18 cm", 10, "#C9B79C", "Size"),
      variant("v-terra-tall", "Tall · 28 cm", 7, "#C9B79C", "Size", 3200),
    ],
    specs: [
      ["Height", "18 or 28 cm", "Dimensions"],
      ["Diameter", "24 cm", "Dimensions"],
      ["Material", "Local stoneware", "Materials"],
      ["Finish", "Unglazed exterior, food-safe glaze", "Materials"],
      ["Care", "Hand wash; do not microwave", "Care"],
    ],
    highlights: ["Wheel-thrown", "Food-safe interior", "Local clay", "Each piece unique"],
    materials: "Stoneware",
    care: "Hand wash with warm water. Avoid sudden temperature changes.",
    featured: true,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["ceramic", "vase", "handmade"],
  }),
  makeProduct({
    id: "p-throw",
    slug: "woven-wool-throw",
    name: "Woven Wool Throw",
    subtitle: "Undyed merino, woven in Jutland",
    description:
      "A weighty, soft throw in undyed merino with a hand-knotted fringe. Warm without bulk, and generous enough for two.",
    story:
      "Woven on a 60-year-old loom at a family mill. The undyed yarn comes from a single flock, so the colour shifts gently across the weave.",
    price: 21000,
    compareAtPrice: 24000,
    category: "home",
    sellerId: "sel-northwind",
    brand: "Northwind",
    art: "throw",
    palette: palettes.oat,
    rating: 4.9,
    reviewCount: 141,
    stock: 21,
    variantLabel: "Colour",
    variants: [
      variant("v-throw-oat", "Oat", 12, "#CDBE9F"),
      variant("v-throw-rust", "Rust", 9, "#A65337"),
    ],
    specs: [
      ["Size", "130 × 180 cm", "Dimensions"],
      ["Weight", "900 g", "Dimensions"],
      ["Fibre", "100% undyed merino", "Materials"],
      ["Weave", "Twill, hand-knotted fringe", "Materials"],
      ["Care", "Cold hand wash or dry clean", "Care"],
    ],
    highlights: ["Undyed merino", "Hand-knotted fringe", "Single-flock yarn", "Woven in Jutland"],
    materials: "100% merino wool",
    care: "Cold hand wash with wool detergent. Dry flat.",
    featured: true,
    trending: true,
    newArrival: false,
    bestseller: true,
    tags: ["throw", "wool", "winter"],
  }),
  makeProduct({
    id: "p-sable",
    slug: "sable-lounge-chair",
    name: "Sable Lounge Chair",
    subtitle: "Low oak frame, wool seat",
    description:
      "A low, generous lounge chair with an oiled oak frame and a seat upholstered in undyed wool. Built to be reupholstered rather than replaced.",
    story:
      "Developed with a cabinetmaker in Aarhus over eighteen months. The joinery is exposed, the cushions are removable, and the frame is guaranteed for twenty years.",
    price: 124000,
    category: "home",
    sellerId: "sel-northwind",
    brand: "Northwind",
    art: "chair",
    palette: palettes.oat,
    rating: 4.9,
    reviewCount: 38,
    stock: 3,
    variantLabel: "Frame",
    variants: [
      variant("v-sable-oak", "Oiled oak", 2, "#B08A5A"),
      variant("v-sable-black", "Blackened oak", 1, "#2A2C2A"),
    ],
    specs: [
      ["Dimensions", "74 × 81 × 78 cm", "Dimensions"],
      ["Seat height", "38 cm", "Dimensions"],
      ["Frame", "FSC-certified oak", "Materials"],
      ["Upholstery", "Undyed wool, removable", "Materials"],
      ["Joinery", "Exposed mortise and tenon", "Materials"],
      ["Care", "Oil frame annually; dry-clean covers", "Care"],
    ],
    highlights: ["FSC oak", "Removable covers", "20-year frame guarantee", "Made to order"],
    materials: "FSC oak, wool, linen",
    care: "Oil the frame once a year. Covers are removable and dry-cleanable.",
    featured: true,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["chair", "furniture", "oak"],
  }),
  makeProduct({
    id: "p-dinnerware",
    slug: "stoneware-dinner-set",
    name: "Stoneware Dinner Set",
    subtitle: "Twelve pieces, four place settings",
    description:
      "A everyday dinner service in speckled stoneware. Four dinner plates, four side plates and four bowls, glazed in a soft eggshell.",
    story:
      "Made to be stacked, washed and used daily. The glaze is formulated to hide cutlery marks and the pieces are sized to fit a standard dishwasher.",
    price: 18500,
    category: "home",
    sellerId: "sel-northwind",
    brand: "Northwind",
    art: "dinnerware",
    palette: palettes.porcelain,
    rating: 4.6,
    reviewCount: 87,
    stock: 12,
    variantLabel: "Glaze",
    variants: [
      variant("v-dinner-eggshell", "Eggshell", 7, "#F7F4EC"),
      variant("v-dinner-olive", "Olive", 5, "#69704C"),
    ],
    specs: [
      ["Pieces", "12 (4 × 3)", "Dimensions"],
      ["Plate", "27 cm dinner, 21 cm side", "Dimensions"],
      ["Bowl", "16 cm, 700 ml", "Dimensions"],
      ["Material", "Speckled stoneware", "Materials"],
      ["Care", "Dishwasher and microwave safe", "Care"],
    ],
    highlights: ["Dishwasher safe", "Microwave safe", "Stackable", "Four settings"],
    materials: "Stoneware, food-safe glaze",
    care: "Dishwasher and microwave safe. Avoid thermal shock.",
    featured: false,
    trending: false,
    newArrival: false,
    bestseller: true,
    tags: ["dinnerware", "table", "ceramic"],
  }),
  makeProduct({
    id: "p-journal",
    slug: "atlas-clothbound-journal",
    name: "Atlas Clothbound Journal",
    subtitle: "192 pages of warm white 100 gsm paper",
    description:
      "A lie-flat journal with a cloth spine, smyth-sewn binding and paper that takes fountain ink without feathering. Dot or plain.",
    story:
      "Bound by a 90-year-old bindery in Osaka. The cover cloth is woven in small runs, so each batch has a slightly different grain.",
    price: 4200,
    category: "stationery",
    sellerId: "sel-fieldnotes",
    brand: "Field Notes",
    art: "journal",
    palette: palettes.olive,
    rating: 4.8,
    reviewCount: 312,
    stock: 64,
    variantLabel: "Format",
    variants: [
      variant("v-journal-a5-dot", "A5 · Dot", 28, "#69704C", "Format"),
      variant("v-journal-a5-plain", "A5 · Plain", 20, "#69704C", "Format"),
      variant("v-journal-a4-dot", "A4 · Dot", 16, "#69704C", "Format", 1400),
    ],
    specs: [
      ["Pages", "192", "Dimensions"],
      ["Paper", "100 gsm, warm white", "Materials"],
      ["Binding", "Smyth-sewn, lie-flat", "Materials"],
      ["Cover", "Woven cloth over board", "Materials"],
      ["Size", "A5 (14.8 × 21 cm)", "Dimensions"],
      ["Care", "Keep dry; store flat", "Care"],
    ],
    highlights: ["Lie-flat binding", "Fountain-pen friendly", "192 pages", "Two rulings"],
    materials: "Cotton cloth, 100 gsm paper, board",
    care: "Keep dry and store flat.",
    featured: false,
    trending: true,
    newArrival: false,
    bestseller: true,
    tags: ["journal", "paper", "desk"],
  }),
  makeProduct({
    id: "p-pen",
    slug: "meridian-fountain-pen",
    name: "Meridian Fountain Pen",
    subtitle: "Machined brass, steel nib",
    description:
      "A weighty, well-balanced fountain pen with a smooth steel nib and a converter. The brass body develops a warm patina with use.",
    story:
      "Turned in a small Sheffield workshop. The section is sized for long writing sessions and the cap posts securely without throwing off the balance.",
    price: 15600,
    category: "stationery",
    sellerId: "sel-fieldnotes",
    brand: "Field Notes",
    art: "pen",
    palette: palettes.brass,
    rating: 4.7,
    reviewCount: 96,
    stock: 19,
    variantLabel: "Nib",
    variants: [
      variant("v-pen-fine", "Fine", 11, "#A88444", "Nib"),
      variant("v-pen-medium", "Medium", 8, "#A88444", "Nib"),
    ],
    specs: [
      ["Nib", "Stainless steel", "Materials"],
      ["Body", "Machined brass", "Materials"],
      ["Length", "13.8 cm capped", "Dimensions"],
      ["Weight", "38 g", "Dimensions"],
      ["Filling", "Converter or cartridge", "Performance"],
      ["Care", "Flush with cool water monthly", "Care"],
    ],
    highlights: ["Machined brass", "Converter included", "Posts securely", "Two nib widths"],
    materials: "Brass, stainless steel",
    care: "Flush with cool water monthly. Dry before storing.",
    featured: false,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["pen", "fountain", "writing"],
  }),
  makeProduct({
    id: "p-tray",
    slug: "oak-desk-tray",
    name: "Oak Desk Tray",
    subtitle: "Solid oak, felt-lined",
    description:
      "A shallow tray for the things that accumulate on a desk. Milled from a single piece of oak and lined with pressed wool felt.",
    story:
      "Cut from offcuts from the Sable chair production, so no extra trees are felled for it. The felt is the same undyed wool used in the throw.",
    price: 8800,
    category: "stationery",
    sellerId: "sel-fieldnotes",
    brand: "Field Notes",
    art: "tray",
    palette: palettes.oat,
    rating: 4.5,
    reviewCount: 71,
    stock: 27,
    variantLabel: "Size",
    variants: [
      variant("v-tray-small", "Small · 22 cm", 15, "#B08A5A", "Size"),
      variant("v-tray-large", "Large · 32 cm", 12, "#B08A5A", "Size", 2600),
    ],
    specs: [
      ["Size", "22 or 32 cm wide", "Dimensions"],
      ["Depth", "4 cm", "Dimensions"],
      ["Material", "Solid oak offcuts", "Materials"],
      ["Lining", "Pressed wool felt", "Materials"],
      ["Care", "Wipe with a dry cloth", "Care"],
    ],
    highlights: ["Single-piece oak", "Wool felt lining", "Made from offcuts", "Two sizes"],
    materials: "Oak, wool felt",
    care: "Wipe with a dry cloth. Do not soak.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["desk", "oak", "tray"],
  }),
  makeProduct({
    id: "p-planner",
    slug: "field-weekly-planner",
    name: "Field Weekly Planner",
    subtitle: "52 undated weeks, lay-flat",
    description:
      "An undated weekly planner with room for a schedule, a short list and a single note. Starts whenever you do.",
    story:
      "Designed after a year of testing with architects and cooks. The left page holds the week; the right page is deliberately blank.",
    price: 3400,
    category: "stationery",
    sellerId: "sel-fieldnotes",
    brand: "Field Notes",
    art: "planner",
    palette: palettes.olive,
    rating: 4.4,
    reviewCount: 154,
    stock: 73,
    variantLabel: "Format",
    variants: [
      variant("v-planner-a5", "A5", 40, "#69704C", "Format"),
      variant("v-planner-b5", "B5", 33, "#69704C", "Format", 900),
    ],
    specs: [
      ["Weeks", "52, undated", "Dimensions"],
      ["Pages", "128", "Dimensions"],
      ["Paper", "120 gsm", "Materials"],
      ["Binding", "Lay-flat, sewn", "Materials"],
      ["Care", "Keep dry", "Care"],
    ],
    highlights: ["Undated", "52 weeks", "Lay-flat", "Weekly + notes"],
    materials: "Paper, board, cloth",
    care: "Keep dry.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["planner", "desk", "paper"],
  }),
  makeProduct({
    id: "p-tote",
    slug: "voyager-leather-tote",
    name: "Voyager Leather Tote",
    subtitle: "Full-grain leather, 16 litres",
    description:
      "A structured tote with a padded laptop sleeve, a zip pocket and handles that soften with use. Made from a single hide.",
    story:
      "Cut and stitched in Florence by a workshop that has made bags for three generations. The leather is vegetable-tanned and left untreated.",
    price: 29500,
    category: "accessories",
    sellerId: "sel-meridian",
    brand: "Meridian",
    art: "tote",
    palette: palettes.rust,
    rating: 4.7,
    reviewCount: 88,
    stock: 8,
    variantLabel: "Colour",
    variants: [
      variant("v-tote-chestnut", "Chestnut", 5, "#A65337"),
      variant("v-tote-black", "Black", 3, "#2A2C2A"),
    ],
    specs: [
      ["Capacity", "16 litres", "Dimensions"],
      ["Dimensions", "38 × 32 × 14 cm", "Dimensions"],
      ["Laptop", "Fits 16 in.", "Dimensions"],
      ["Leather", "Vegetable-tanned full grain", "Materials"],
      ["Hardware", "Solid brass", "Materials"],
      ["Care", "Condition twice a year", "Care"],
    ],
    highlights: ["Full-grain leather", "Padded laptop sleeve", "Solid brass hardware", "Made in Florence"],
    materials: "Vegetable-tanned leather, brass, cotton lining",
    care: "Condition twice a year with a neutral leather balm.",
    featured: true,
    trending: true,
    newArrival: false,
    bestseller: true,
    tags: ["bag", "leather", "work"],
  }),
  makeProduct({
    id: "p-watch",
    slug: "meridian-field-watch",
    name: "Meridian Field Watch",
    subtitle: "36 mm, hand-wound, sapphire",
    description:
      "A small mechanical field watch with a legible dial, a hand-wound movement and a sapphire crystal. Comes on a leather strap.",
    story:
      "Assembled in Florence around a Swiss hand-wound movement. The dial is matte black with printed numerals, and the case is brushed steel.",
    price: 42000,
    category: "accessories",
    sellerId: "sel-meridian",
    brand: "Meridian",
    art: "watch",
    palette: palettes.charcoal,
    rating: 4.8,
    reviewCount: 46,
    stock: 5,
    variantLabel: "Strap",
    variants: [
      variant("v-watch-leather", "Chestnut leather", 3, "#A65337", "Strap"),
      variant("v-watch-canvas", "Olive canvas", 2, "#69704C", "Strap"),
    ],
    specs: [
      ["Case", "36 mm brushed steel", "Dimensions"],
      ["Movement", "Swiss hand-wound", "Performance"],
      ["Power reserve", "42 hours", "Performance"],
      ["Crystal", "Sapphire", "Materials"],
      ["Water resistance", "100 m", "Performance"],
      ["Care", "Service every five years", "Care"],
    ],
    highlights: ["Hand-wound", "Sapphire crystal", "36 mm case", "100 m water resistance"],
    materials: "Brushed steel, sapphire, leather",
    care: "Service every five years. Avoid magnetic fields.",
    featured: false,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["watch", "mechanical", "field"],
  }),
  makeProduct({
    id: "p-cedar",
    slug: "cedar-smoke-eau-de-parfum",
    name: "Cedar & Smoke",
    subtitle: "Eau de parfum, 50 ml",
    description:
      "A dry, resinous fragrance built on cedarwood, birch smoke and a mineral base. Close to the skin, long on the collar.",
    story:
      "Blended in Kyoto with a perfumer who works mostly in incense. The opening is sharp and green; an hour later it settles into warm wood and salt.",
    price: 14500,
    category: "wellness",
    sellerId: "sel-still",
    brand: "Still House",
    art: "fragrance",
    palette: palettes.ink,
    rating: 4.6,
    reviewCount: 118,
    stock: 31,
    variantLabel: "Size",
    variants: [
      variant("v-cedar-50", "50 ml", 22, "#202A27", "Size"),
      variant("v-cedar-100", "100 ml", 9, "#202A27", "Size", 7000),
    ],
    specs: [
      ["Volume", "50 or 100 ml", "Dimensions"],
      ["Concentration", "Eau de parfum, 18%", "Performance"],
      ["Notes", "Cedar · birch smoke · mineral amber", "Performance"],
      ["Base", "Alcohol denat., fragrance", "Materials"],
      ["Care", "Store away from light and heat", "Care"],
    ],
    highlights: ["18% concentration", "Blended in Kyoto", "Cedar and smoke", "Refillable bottle"],
    materials: "Fragrance, alcohol, glass",
    care: "Store upright, away from direct sunlight.",
    featured: true,
    trending: true,
    newArrival: false,
    bestseller: false,
    tags: ["fragrance", "cedar", "unisex"],
  }),
  makeProduct({
    id: "p-diffuser",
    slug: "still-ceramic-diffuser",
    name: "Still Ceramic Diffuser",
    subtitle: "Ultrasonic, 8-hour run",
    description:
      "A quiet ultrasonic diffuser in matte ceramic. No lights, no beeps, and a mist that stops automatically when the water runs out.",
    story:
      "We removed the LED ring that most diffusers have and kept the mechanism. The ceramic shell is slip-cast and glazed by hand.",
    price: 9600,
    category: "wellness",
    sellerId: "sel-still",
    brand: "Still House",
    art: "diffuser",
    palette: palettes.bone,
    rating: 4.4,
    reviewCount: 59,
    stock: 24,
    variantLabel: "Glaze",
    variants: [
      variant("v-diffuser-chalk", "Chalk", 14, "#EFE9DD"),
      variant("v-diffuser-slate", "Slate", 10, "#50636A"),
    ],
    specs: [
      ["Run time", "8 hours", "Performance"],
      ["Tank", "200 ml", "Dimensions"],
      ["Noise", "< 24 dB", "Performance"],
      ["Shell", "Slip-cast ceramic", "Materials"],
      ["Care", "Rinse tank weekly", "Care"],
    ],
    highlights: ["Light-free", "8-hour run", "Auto shut-off", "Hand-glazed"],
    materials: "Ceramic, BPA-free plastic",
    care: "Rinse the tank weekly and dry before storing.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["diffuser", "ceramic", "home"],
  }),
  makeProduct({
    id: "p-salts",
    slug: "grounding-bath-salts",
    name: "Grounding Bath Salts",
    subtitle: "Mineral soak with cedar and vetiver",
    description:
      "A coarse mineral soak with magnesium, cedar and vetiver. Enough for eight long baths.",
    story:
      "Made with solar-evaporated sea salt and a small amount of fractionated coconut oil so the minerals stay on the skin rather than the tub.",
    price: 3800,
    category: "wellness",
    sellerId: "sel-still",
    brand: "Still House",
    art: "salts",
    palette: palettes.ink,
    rating: 4.3,
    reviewCount: 74,
    stock: 54,
    variantLabel: "Size",
    variants: [
      variant("v-salts-500", "500 g", 34, "#202A27", "Size"),
      variant("v-salts-1000", "1 kg", 20, "#202A27", "Size", 2200),
    ],
    specs: [
      ["Weight", "500 g or 1 kg", "Dimensions"],
      ["Minerals", "Magnesium, potassium", "Performance"],
      ["Scent", "Cedar · vetiver", "Performance"],
      ["Base", "Solar-evaporated sea salt", "Materials"],
      ["Care", "Keep sealed and dry", "Care"],
    ],
    highlights: ["Solar-evaporated salt", "Cedar and vetiver", "Eight baths", "Plastic-free refill"],
    materials: "Sea salt, magnesium, essential oils",
    care: "Keep sealed in a dry place.",
    featured: false,
    trending: false,
    newArrival: false,
    bestseller: false,
    tags: ["bath", "mineral", "ritual"],
  }),
  makeProduct({
    id: "p-coffee",
    slug: "ritual-pour-over-set",
    name: "Ritual Pour-Over Set",
    subtitle: "Ceramic dripper, carafe, scale",
    description:
      "A complete pour-over kit: a glazed ceramic dripper, a 600 ml glass carafe and a small waterproof scale with a built-in timer.",
    story:
      "Assembled for people who want one good cup rather than a coffee hobby. The dripper is sized for 20 g of coffee and the carafe pours cleanly.",
    price: 12000,
    category: "wellness",
    sellerId: "sel-still",
    brand: "Still House",
    art: "coffee",
    palette: palettes.porcelain,
    rating: 4.5,
    reviewCount: 92,
    stock: 16,
    variantLabel: "Size",
    variants: [
      variant("v-coffee-2", "2-cup", 10, "#F7F4EC", "Size"),
      variant("v-coffee-4", "4-cup", 6, "#F7F4EC", "Size", 2400),
    ],
    specs: [
      ["Capacity", "600 ml", "Dimensions"],
      ["Dripper", "Glazed ceramic", "Materials"],
      ["Carafe", "Borosilicate glass", "Materials"],
      ["Scale", "0.1 g · timer", "Performance"],
      ["Care", "Dishwasher safe except scale", "Care"],
    ],
    highlights: ["Complete kit", "Built-in timer", "Borosilicate carafe", "Two sizes"],
    materials: "Ceramic, borosilicate glass, steel",
    care: "Dishwasher safe except the scale; wipe the scale clean.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["coffee", "ritual", "kitchen"],
  }),
  makeProduct({
    id: "p-linea",
    slug: "linea-desk-lamp",
    name: "Linea Desk Lamp",
    subtitle: "Recycled aluminium task light",
    description:
      "A slim task light with a warm, glare-free beam and a weighted base. Submitted for marketplace review.",
    story:
      "The first product from Verve Objects, made from post-industrial aluminium. Awaiting moderation before it can be sold.",
    price: 19000,
    category: "lighting",
    sellerId: "sel-verve",
    brand: "Verve",
    art: "lamp",
    palette: palettes.moss,
    rating: 0,
    reviewCount: 0,
    stock: 30,
    variantLabel: "Finish",
    variants: [variant("v-linea-sage", "Sage", 30, "#69704C")],
    specs: [
      ["Height", "38 cm", "Dimensions"],
      ["Light", "8 W LED · 3000 K", "Performance"],
      ["Material", "Recycled aluminium", "Materials"],
      ["Care", "Wipe with a dry cloth", "Care"],
    ],
    highlights: ["Recycled aluminium", "Glare-free diffuser", "Weighted base"],
    materials: "Recycled aluminium",
    care: "Wipe with a dry cloth.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["lamp", "desk"],
    moderation: "PENDING",
    createdAt: daysAgo(3),
  }),
  makeProduct({
    id: "p-weekender",
    slug: "canyon-weekender",
    name: "Canyon Weekender",
    subtitle: "Waxed canvas, 38 litres",
    description:
      "A soft-sided weekender in waxed canvas with leather reinforcements and a separate shoe compartment.",
    story:
      "A new shape from Meridian, still in moderation. Designed for a two-night trip with one bag.",
    price: 34000,
    category: "accessories",
    sellerId: "sel-meridian",
    brand: "Meridian",
    art: "tote",
    palette: palettes.olive,
    rating: 0,
    reviewCount: 0,
    stock: 18,
    variantLabel: "Colour",
    variants: [variant("v-weekender-olive", "Olive", 18, "#69704C")],
    specs: [
      ["Capacity", "38 litres", "Dimensions"],
      ["Fabric", "Waxed canvas", "Materials"],
      ["Care", "Re-wax annually", "Care"],
    ],
    highlights: ["Waxed canvas", "Shoe compartment", "Leather base"],
    materials: "Waxed canvas, leather",
    care: "Re-wax annually.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["travel", "bag"],
    moderation: "PENDING",
    createdAt: daysAgo(2),
  }),
  makeProduct({
    id: "p-mugs",
    slug: "terra-mug-set",
    name: "Terra Mug Set",
    subtitle: "Four speckled stoneware mugs",
    description:
      "Four generous mugs in the same speckled clay as the Terra vessel. Awaiting review.",
    story:
      "A companion to the Terra vessel, submitted for moderation. Each mug holds 320 ml.",
    price: 6400,
    category: "home",
    sellerId: "sel-northwind",
    brand: "Northwind",
    art: "dinnerware",
    palette: palettes.sand,
    rating: 0,
    reviewCount: 0,
    stock: 40,
    variantLabel: "Glaze",
    variants: [variant("v-mugs-eggshell", "Eggshell", 40, "#F7F4EC")],
    specs: [
      ["Capacity", "320 ml", "Dimensions"],
      ["Pieces", "4", "Dimensions"],
      ["Material", "Speckled stoneware", "Materials"],
      ["Care", "Dishwasher safe", "Care"],
    ],
    highlights: ["Set of four", "Dishwasher safe", "Hand-glazed"],
    materials: "Stoneware",
    care: "Dishwasher safe.",
    featured: false,
    trending: false,
    newArrival: true,
    bestseller: false,
    tags: ["mug", "ceramic"],
    moderation: "PENDING",
    createdAt: daysAgo(1),
  }),
];

export const collections: Collection[] = [
  {
    slug: "the-quiet-hours",
    name: "The Quiet Hours",
    kicker: "Collection 01 · Evening",
    description: "Warm light, wool and cedar for the part of the day that belongs to you.",
    story:
      "A room becomes a different room after eight. This collection gathers the objects we reach for when the work is done: a dimmable lamp, a heavy throw, a candle that smells like a forest cooling down.",
    productIds: ["p-halo", "p-ember", "p-throw", "p-cedar", "p-salts", "p-diffuser"],
    palette: palettes.rust,
  },
  {
    slug: "made-to-last",
    name: "Made to Last",
    kicker: "Collection 02 · Materials",
    description: "Six objects with repairable parts, replaceable covers and long guarantees.",
    story:
      "The most sustainable object is the one you keep. These pieces are chosen for joinery, repairability and the way they age: oiled oak, vegetable-tanned leather, brushed steel.",
    productIds: ["p-sable", "p-tote", "p-watch", "p-dinnerware", "p-terra"],
    palette: palettes.oat,
  },
  {
    slug: "desk-edition",
    name: "Desk Edition",
    kicker: "Collection 03 · Work",
    description: "Paper, ink and quiet audio for a desk that invites concentration.",
    story:
      "A desk is a set of decisions. We favour a single notebook, a pen that works, a tray for the small things, and headphones that remove the room without removing the music.",
    productIds: ["p-journal", "p-pen", "p-tray", "p-planner", "p-cadence"],
    palette: palettes.olive,
  },
  {
    slug: "evening-ritual",
    name: "Evening Ritual",
    kicker: "Collection 04 · Slow",
    description: "A pendant, a pour-over and a little smoke. The last hour, unhurried.",
    story:
      "A sequence rather than a set: lower the light, grind the coffee, put the phone in another room. These are the objects that make the sequence easier to keep.",
    productIds: ["p-pendant", "p-arc", "p-coffee", "p-cedar", "p-ember"],
    palette: palettes.brass,
  },
];

export const customers: Customer[] = [
  {
    id: "c-1",
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    joinedAt: "2024-02-12T00:00:00.000Z",
    location: "London, UK",
    status: "ACTIVE",
    segment: "VIP",
    orders: 9,
    spend: 184200,
  },
  {
    id: "c-2",
    name: "Jonas Lind",
    email: "jonas.lind@example.com",
    joinedAt: "2024-06-03T00:00:00.000Z",
    location: "Stockholm, SE",
    status: "ACTIVE",
    segment: "Returning",
    orders: 5,
    spend: 76300,
  },
  {
    id: "c-3",
    name: "Mei Tan",
    email: "mei.tan@example.com",
    joinedAt: "2025-01-18T00:00:00.000Z",
    location: "Singapore, SG",
    status: "ACTIVE",
    segment: "VIP",
    orders: 7,
    spend: 221500,
  },
  {
    id: "c-4",
    name: "Sofia Reyes",
    email: "sofia.reyes@example.com",
    joinedAt: "2025-03-27T00:00:00.000Z",
    location: "Madrid, ES",
    status: "ACTIVE",
    segment: "Returning",
    orders: 4,
    spend: 92800,
  },
  {
    id: "c-5",
    name: "Elias Brandt",
    email: "elias.brandt@example.com",
    joinedAt: "2025-07-09T00:00:00.000Z",
    location: "Berlin, DE",
    status: "ACTIVE",
    segment: "New",
    orders: 2,
    spend: 18300,
  },
  {
    id: "c-6",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    joinedAt: "2025-09-14T00:00:00.000Z",
    location: "Bengaluru, IN",
    status: "ACTIVE",
    segment: "Returning",
    orders: 3,
    spend: 64700,
  },
  {
    id: "c-7",
    name: "Lucas Moreau",
    email: "lucas.moreau@example.com",
    joinedAt: "2025-11-02T00:00:00.000Z",
    location: "Paris, FR",
    status: "AT_RISK",
    segment: "New",
    orders: 1,
    spend: 14900,
  },
  {
    id: "c-8",
    name: "Noor Haddad",
    email: "noor.haddad@example.com",
    joinedAt: "2026-01-08T00:00:00.000Z",
    location: "Dubai, AE",
    status: "ACTIVE",
    segment: "VIP",
    orders: 6,
    spend: 156800,
  },
  {
    id: "c-9",
    name: "Tomás Silva",
    email: "tomas.silva@example.com",
    joinedAt: "2026-04-19T00:00:00.000Z",
    location: "Lisbon, PT",
    status: "BLOCKED",
    segment: "New",
    orders: 0,
    spend: 0,
  },
];

function line(productId: string, variantId: string | undefined, quantity: number) {
  const product = products.find((item) => item.id === productId);
  if (!product) throw new Error(`Unknown product ${productId}`);
  const variant = product.variants.find((item) => item.id === variantId);
  return {
    productId,
    ...(variantId ? { variantId } : {}),
    quantity,
    unitPrice: product.price + (variant?.priceDelta ?? 0),
  };
}

function timelineFor(status: OrderStatus, placedAt: string, seller: boolean): Order["timeline"] {
  const base: Array<Omit<Order["timeline"][number], "at">> = [
    { status: "PENDING", note: "Order placed. Simulated payment authorised.", actor: "CUSTOMER" },
    { status: "CONFIRMED", note: "Payment captured in demo ledger.", actor: "SYSTEM" },
    { status: "PROCESSING", note: "Seller accepted the order and began fulfilment.", actor: "SELLER" },
    { status: "SHIPPED", note: "Handed to the carrier.", actor: "SELLER" },
    { status: "OUT_FOR_DELIVERY", note: "Out for delivery.", actor: "SYSTEM" },
    { status: "DELIVERED", note: "Delivered and signed for.", actor: "SYSTEM" },
  ];
  const order: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const index = order.indexOf(status);
  const events = base.slice(0, Math.max(1, index + 1)).map((event, i) => ({
    ...event,
    at: new Date(new Date(placedAt).getTime() + i * (seller ? 5 : 8) * 60 * 60 * 1000).toISOString(),
  }));
  if (["CANCELLED", "RETURNED", "REFUNDED"].includes(status)) {
    events.push({
      status,
      note:
        status === "CANCELLED"
          ? "Order cancelled before dispatch. Demo payment voided."
          : status === "RETURNED"
            ? "Return received and inspected."
            : "Refund issued to the original demo payment method.",
      actor: "ADMIN",
      at: new Date(new Date(placedAt).getTime() + 48 * 60 * 60 * 1000).toISOString(),
    });
  }
  return events;
}

function order(input: {
  number: string;
  customerId: string;
  placedDaysAgo: number;
  status: OrderStatus;
  paymentStatus: Order["paymentStatus"];
  paymentMethod?: Order["paymentMethod"];
  lines: Order["lines"];
  shipping?: number;
  discount?: number;
  shipment?: Order["shipment"];
  returnRequest?: Order["returnRequest"];
  notes?: string;
}): Order {
  const customer = customers.find((item) => item.id === input.customerId);
  if (!customer) throw new Error(`Unknown customer ${input.customerId}`);
  const subtotal = input.lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = input.shipping ?? (subtotal >= 15000 ? 0 : 1200);
  const tax = Math.round((subtotal - (input.discount ?? 0)) * 0.08);
  const placedAt = daysAgo(input.placedDaysAgo, 9 + (input.placedDaysAgo % 8));
  const sellerIds = Array.from(
    new Set(
      input.lines
        .map((item) => products.find((product) => product.id === item.productId)?.sellerId)
        .filter((value): value is string => Boolean(value))
    )
  );
  return {
    id: `ord-${input.number}`,
    number: input.number,
    customerId: customer.id,
    customerName: customer.name,
    email: customer.email,
    placedAt,
    status: input.status,
    paymentStatus: input.paymentStatus,
    paymentMethod: input.paymentMethod ?? "CARD",
    lines: input.lines,
    subtotal,
    shipping,
    tax,
    discount: input.discount ?? 0,
    total: subtotal + shipping + tax - (input.discount ?? 0),
    sellerIds,
    shippingAddress: `${customer.location} · 14 Alder Lane`,
    timeline: timelineFor(input.status, placedAt, sellerIds.length > 0),
    ...(input.shipment ? { shipment: input.shipment } : {}),
    ...(input.returnRequest ? { returnRequest: input.returnRequest } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    source: "seed",
  };
}

const explicitOrders: Order[] = [
  order({
    number: "ATL-1042",
    customerId: "c-1",
    placedDaysAgo: 24,
    status: "DELIVERED",
    paymentStatus: "PAID",
    lines: [line("p-aria", "v-aria-graphite", 1), line("p-halo", "v-halo-bone", 1)],
    shipment: {
      carrier: "DHL Express",
      trackingNumber: "DHL-7821-4410",
      status: "DELIVERED",
      estimatedDelivery: daysAgo(21),
    },
  }),
  order({
    number: "ATL-1043",
    customerId: "c-2",
    placedDaysAgo: 18,
    status: "PROCESSING",
    paymentStatus: "PAID",
    lines: [line("p-journal", "v-journal-a5-dot", 2), line("p-pen", "v-pen-fine", 1), line("p-tray", "v-tray-small", 1)],
  }),
  order({
    number: "ATL-1044",
    customerId: "c-3",
    placedDaysAgo: 15,
    status: "PENDING",
    paymentStatus: "AUTHORIZED",
    lines: [line("p-sable", "v-sable-oak", 1), line("p-throw", "v-throw-oat", 1)],
  }),
  order({
    number: "ATL-1045",
    customerId: "c-4",
    placedDaysAgo: 12,
    status: "SHIPPED",
    paymentStatus: "PAID",
    lines: [line("p-tote", "v-tote-chestnut", 1), line("p-watch", "v-watch-canvas", 1)],
    shipment: {
      carrier: "FedEx",
      trackingNumber: "FX-3391-8820",
      status: "IN_TRANSIT",
      estimatedDelivery: daysAhead(2),
    },
  }),
  order({
    number: "ATL-1046",
    customerId: "c-5",
    placedDaysAgo: 10,
    status: "DELIVERED",
    paymentStatus: "PAID",
    lines: [line("p-cedar", "v-cedar-50", 1), line("p-salts", "v-salts-500", 2)],
    shipment: {
      carrier: "DHL Express",
      trackingNumber: "DHL-4188-9021",
      status: "DELIVERED",
      estimatedDelivery: daysAgo(7),
    },
  }),
  order({
    number: "ATL-1047",
    customerId: "c-6",
    placedDaysAgo: 7,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    lines: [line("p-pendant", "v-pendant-30", 1)],
  }),
  order({
    number: "ATL-1048",
    customerId: "c-7",
    placedDaysAgo: 6,
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    lines: [line("p-cadence", "v-cadence-ivory", 1)],
    notes: "Customer cancelled within the 24-hour window.",
  }),
  order({
    number: "ATL-1049",
    customerId: "c-8",
    placedDaysAgo: 4,
    status: "OUT_FOR_DELIVERY",
    paymentStatus: "PAID",
    lines: [line("p-throw", "v-throw-rust", 1), line("p-ember", "v-ember-three", 1)],
    shipment: {
      carrier: "Aramex",
      trackingNumber: "ARX-7712-2390",
      status: "OUT_FOR_DELIVERY",
      estimatedDelivery: daysAhead(0),
    },
  }),
  order({
    number: "ATL-1050",
    customerId: "c-1",
    placedDaysAgo: 3,
    status: "REFUNDED",
    paymentStatus: "REFUNDED",
    lines: [line("p-nomad", "v-nomad-slate", 1)],
    returnRequest: {
      id: "ret-1050",
      reason: "Colour did not match the room.",
      requestedAt: daysAgo(2),
      status: "REFUNDED",
    },
  }),
  order({
    number: "ATL-1051",
    customerId: "c-2",
    placedDaysAgo: 2,
    status: "PROCESSING",
    paymentStatus: "PAID",
    lines: [line("p-coffee", "v-coffee-2", 1), line("p-journal", "v-journal-a4-dot", 1)],
  }),
  order({
    number: "ATL-1052",
    customerId: "c-3",
    placedDaysAgo: 1,
    status: "PENDING",
    paymentStatus: "PENDING",
    paymentMethod: "BANK_TRANSFER",
    lines: [line("p-dinnerware", "v-dinner-eggshell", 1)],
  }),
  order({
    number: "ATL-1053",
    customerId: "c-4",
    placedDaysAgo: 1,
    status: "CONFIRMED",
    paymentStatus: "PAID",
    lines: [line("p-journal", "v-journal-a5-plain", 1), line("p-cadence", "v-cadence-black", 1)],
  }),
];

/** Deterministic historical orders keep dashboard charts realistic without hiding demo provenance. */
function mulberry32(seed: number) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateHistoricalOrders(count: number): Order[] {
  const random = mulberry32(20261029);
  const statuses: OrderStatus[] = [
    "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED",
    "SHIPPED", "SHIPPED", "PROCESSING", "PROCESSING",
    "CONFIRMED", "PENDING", "CANCELLED", "RETURNED", "REFUNDED",
  ];
  const sellable = products.filter((product) => product.moderation === "APPROVED");

  return Array.from({ length: count }, (_, index) => {
    const customer = customers[Math.floor(random() * customers.length)] ?? customers[0]!;
    const first = sellable[Math.floor(random() * sellable.length)] ?? sellable[0]!;
    const second = sellable[Math.floor(random() * sellable.length)] ?? first;
    const firstVariant = first.variants[Math.floor(random() * first.variants.length)]?.id;
    const secondVariant = second.variants[Math.floor(random() * second.variants.length)]?.id;
    const status = statuses[Math.floor(random() * statuses.length)] ?? "DELIVERED";
    const days = 1 + Math.floor(random() * 28);
    const paymentStatus =
      status === "CANCELLED" || status === "REFUNDED"
        ? "REFUNDED"
        : status === "PENDING"
          ? "AUTHORIZED"
          : "PAID";
    const delivered = status === "DELIVERED";
    return order({
      number: `ATL-${1060 + index}`,
      customerId: customer.id,
      placedDaysAgo: days,
      status,
      paymentStatus,
      lines: [
        line(first.id, firstVariant, 1 + Math.floor(random() * 2)),
        ...(random() > 0.55 ? [line(second.id, secondVariant, 1)] : []),
      ],
      ...(delivered || status === "SHIPPED"
        ? {
            shipment: {
              carrier: ["DHL Express", "FedEx", "Aramex"][Math.floor(random() * 3)] ?? "DHL Express",
              trackingNumber: `ATL-${Math.floor(random() * 900000 + 100000)}`,
              status: delivered ? ("DELIVERED" as const) : ("IN_TRANSIT" as const),
              estimatedDelivery: delivered ? daysAgo(Math.max(0, days - 2)) : daysAhead(2),
            },
          }
        : {}),
    });
  });
}

export const orders: Order[] = [...explicitOrders, ...generateHistoricalOrders(48)];

export const campaigns: Campaign[] = [
  {
    id: "cmp-1",
    title: "The Quiet Hours — homepage hero",
    placement: "HOMEPAGE_HERO",
    status: "LIVE",
    startsAt: daysAgo(6),
    endsAt: daysAhead(18),
    impressions: 48210,
    clicks: 3894,
  },
  {
    id: "cmp-2",
    title: "Made to Last — collection banner",
    placement: "COLLECTION_BANNER",
    status: "LIVE",
    startsAt: daysAgo(12),
    endsAt: daysAhead(9),
    impressions: 21340,
    clicks: 1721,
  },
  {
    id: "cmp-3",
    title: "Free delivery over $150",
    placement: "PROMO_STRIP",
    status: "LIVE",
    startsAt: daysAgo(30),
    endsAt: daysAhead(30),
    impressions: 128900,
    clicks: 2140,
  },
  {
    id: "cmp-4",
    title: "Desk Edition — November",
    placement: "COLLECTION_BANNER",
    status: "SCHEDULED",
    startsAt: daysAhead(3),
    endsAt: daysAhead(33),
    impressions: 0,
    clicks: 0,
  },
];

export const auditLog: AuditEntry[] = [
  {
    id: "aud-1",
    at: daysAgo(0, 8),
    actor: "Nadia Farouk (Admin)",
    action: "Approved product",
    target: "Terra Vessel · Northwind Atelier",
    severity: "INFO",
  },
  {
    id: "aud-2",
    at: daysAgo(1, 16),
    actor: "System",
    action: "Flagged seller application",
    target: "Verve Objects — missing tax identifier",
    severity: "WARNING",
  },
  {
    id: "aud-3",
    at: daysAgo(2, 11),
    actor: "Nadia Farouk (Admin)",
    action: "Issued refund",
    target: "ATL-1050 · $179.00",
    severity: "INFO",
  },
  {
    id: "aud-4",
    at: daysAgo(3, 9),
    actor: "Super Admin",
    action: "Changed commission rate",
    target: "Still House · 16% → 15%",
    severity: "CRITICAL",
  },
  {
    id: "aud-5",
    at: daysAgo(4, 14),
    actor: "Kestrel Audio (Seller)",
    action: "Updated inventory",
    target: "Aria Over-Ear · 4 units",
    severity: "INFO",
  },
  {
    id: "aud-6",
    at: daysAgo(5, 10),
    actor: "System",
    action: "Payment retry failed",
    target: "ATL-1052 · bank transfer pending",
    severity: "WARNING",
  },
];

export const seedNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Order ATL-1042 is delivered",
    body: "Your Aria Over-Ear and Halo Table Lamp were delivered. Tell us how they settled in.",
    at: daysAgo(0, 8),
    read: false,
    href: "/orders/ord-ATL-1042",
    audience: "CUSTOMER",
  },
  {
    id: "notif-2",
    title: "Low stock on Aria Over-Ear",
    body: "Only 4 units remain across Graphite, Sand and Moss.",
    at: daysAgo(0, 7),
    read: false,
    href: "/seller/products",
    audience: "SELLER",
  },
  {
    id: "notif-3",
    title: "Three products awaiting moderation",
    body: "Linea Desk Lamp, Canyon Weekender and Terra Mug Set are in the queue.",
    at: daysAgo(0, 9),
    read: false,
    href: "/admin/moderation",
    audience: "ADMIN",
  },
];

export const initialAtlasState: AtlasState = {
  version: 3,
  hydrated: false,
  role: "CUSTOMER",
  sellerId: "sel-kestrel",
  cart: [],
  wishlist: ["p-throw", "p-journal"],
  orders,
  productEdits: {},
  sellerEdits: {},
  createdProducts: [],
  coupon: null,
  notifications: seedNotifications,
  recentlyViewed: [],
  compare: [],
  audit: auditLog,
  settings: {
    lowStockThreshold: 6,
    allowReturns: true,
    requireListingReview: true,
  },
};

export const seedRepository = {
  products,
  sellers,
  categories,
  collections,
  orders,
  customers,
  campaigns,
  auditLog,
} as const;

export function sellerById(id: string): Seller | undefined {
  return sellers.find((seller) => seller.id === id);
}

export function categoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

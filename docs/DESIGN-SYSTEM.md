# ATLAS Design System

**Editorial Precision × Digital Luxury × Enterprise Clarity**

Atlas is one system with two registers: an editorial storefront with a serif voice and generous negative space, and an operations layer with compact, tabular clarity. Both use the same semantic tokens, focus treatment, radius scale and motion language.

The living reference is `/lab`. It renders the same primitives used in commerce and operations, including states and guidance.

---

## 1. Art direction

- **Editorial, not promotional.** Headlines are typeset as magazine spreads, with italic accents and hairline rules rather than gradients and badges everywhere.
- **Digital luxury.** Warm ivory paper, deep teal ink, restrained copper; shadows are whisper-soft and used only for floating surfaces.
- **Enterprise clarity.** Workspace screens switch to denser grids, smaller type and explicit status colour. Data is legible before it is decorative.
- **Original artwork.** Product art and campaign still lifes are local SVG compositions (`src/components/product-art.tsx`, `still-life.tsx`). No stock photography, no copied marketplace branding, no image requests on the storefront.
- **Purposeful motion.** Entrances clarify hierarchy; hover states confirm interactivity; nothing scroll-jacks or blocks a task.

---

## 2. Colour system

All colour is semantic. Components never hardcode hex values; they use Tailwind aliases backed by CSS variables in `src/app/globals.css`.

| Token | Light role | Dark role |
| --- | --- | --- |
| `--canvas` | warm ivory page foundation | near-black green canvas |
| `--surface` | section wash | raised dark surface |
| `--surface-raised` | cards, panels, drawers | highest dark surface |
| `--ink` | primary text | primary light text |
| `--ink-soft` | body copy | secondary light text |
| `--ink-faint` | metadata, labels | muted metadata |
| `--line` / `--line-strong` | hairlines, control borders | dark hairlines |
| `--teal` / `--teal-deep` / `--teal-soft` | signature action, footer, quiet emphasis | lighter teal for dark surfaces |
| `--copper` / `--copper-soft` / `--copper-bright` | editorial accent, promotion | warm accent for dark surfaces |
| `--success` `--warning` `--danger` `--info` | status | status |

### Contrast evidence (computed from token definitions)

| Pair | Ratio | AA normal text (4.5:1) |
| --- | --- | --- |
| ink on canvas | 15.11 | Pass |
| ink on surface | 15.72 | Pass |
| ink-soft on canvas | 7.04 | Pass |
| ink-faint on canvas | 4.73 | Pass |
| ink-faint on surface | 4.93 | Pass |
| teal on canvas | 7.57 | Pass |
| copper on canvas | 5.16 | Pass |
| warning on canvas | 5.24 | Pass |
| danger on canvas | 5.54 | Pass |
| success on canvas | 5.63 | Pass |
| info on canvas | 5.33 | Pass |
| white on teal | 8.17 | Pass |
| white on copper | 5.57 | Pass |
| white on danger | 5.99 | Pass |

Ratios are calculated from the HSL token values, not sampled from screenshots. Two tokens were darkened during development (`--ink-faint`, `--copper`, `--warning`) rather than weakening the axe rule. Automated scans cover the tested routes; they do not prove conformance for every state.

### Theme behaviour

`next-themes` sets a `class` on `<html>`; the dark palette is a token override, not a filter or a second stylesheet. The theme toggle is available in the storefront and workspace shells.

---

## 3. Typography

| Family | Role | Source |
| --- | --- | --- |
| **Fraunces** | display, editorial headings, product names | `next/font/google`, variable axes SOFT/WONK/opsz |
| **Manrope** | UI, body, dashboards | `next/font/google`, variable |
| **IBM Plex Mono** | labels, prices, metadata, code | `next/font/google`, 400/500 |

```text
display-lg   clamp(3.5rem, 1rem + 9vw, 9rem)     line-height 0.88   tracking −0.045em
display-md   clamp(3rem, 1.4rem + 6.4vw, 6.5rem) line-height 0.92   tracking −0.04em
display-sm   clamp(2.5rem, 1.5rem + 4vw, 4.5rem) line-height 0.98   tracking −0.035em
display-xs   clamp(2rem, 1.4rem + 2.6vw, 3rem)   line-height 1.02   tracking −0.03em
2xs          0.6875rem / 1rem                    tracking 0.04em
```

Fluid headings use `clamp()` rather than breakpoint jumps. `text-wrap: balance` is applied to headings and `pretty` to paragraphs. The display fallback is intentionally **not** metric-adjusted: the adjusted fallback changed the hero line count at large sizes and produced a measured 0.116 CLS. The unadjusted serif fallback wraps identically; this is documented in `src/app/layout.tsx`.

---

## 4. Space, shape and elevation

- Container: centred, max 1480 px, padding 1.25 → 2.5 rem across breakpoints.
- Spacing follows a 4 px base with named steps (`4.5`, `18`, `22`, `26`, `30`, `34`) for editorial rhythm.
- Radius scale: `xs 3`, `sm 6`, `md 10`, `lg 16`, `xl 24`, `2xl 32` px. Cards use `lg`, controls `md`, pills `full`.
- Elevation is restrained: `shadow-whisper` for floating labels, `shadow-lift` for campaign art and drawers. No glow effects.
- Hairline grid backgrounds are decorative, low-opacity and `aria-hidden`.

---

## 5. Component library

Primitives live in `src/components/ui/` and are demonstrated in `/lab`:

| Group | Components |
| --- | --- |
| Actions | `Button` (solid, outline, ghost, copper, destructive; `sm`/`md`/`lg`; `asChild`), icon buttons, links |
| Status | `Badge` (teal, copper, solid, outline, success, warning, danger) |
| Form | `Input`, `Select`, `Checkbox`, `Switch`, `RadioGroup`-style option cards, field descriptions and inline errors |
| Overlays | `Dialog` (focus trap, ESC, restore), `Popover`, `Tooltip`, `Toast` (live region) |
| Disclosure | `Tabs`, `Accordion`, mobile filter drawer, cart drawer, search dialog |
| Data | `Panel`, `PageHeader`, `Metric`, `DataTable` patterns, `EmptyState`, `Skeleton` |
| Commerce | `ProductCard`, `ProductGrid`, `ProductArt`, `Rating`, `OrderStatus`, `CompareTray` |
| Charts | `TrendChart`, `BarList`, `StatusDonut`, `Sparkline` — SVG/CSS, no runtime dependency |

### State contract

Every interactive primitive defines default, hover, focus-visible, active, disabled and (where relevant) selected/error states. Focus uses a 2 px teal outline with 3 px offset on `:focus-visible`. Touch targets are at least 40–44 px for primary controls.

---

## 6. Page hierarchy

**Storefront**

1. Announcement/demo strip → header → page content → footer → newsletter.
2. Editorial hero → standards strip → category entry points → featured edit → story → new arrivals → studio spotlight → newsletter.
3. Product detail: gallery/art → purchase panel (variant, quantity, add, wishlist/compare) → delivery/returns → specs and story → related objects.

**Workspace**

1. Workspace shell: brand, workspace switcher, role state, command entry, account, notifications.
2. Sidebar navigation (collapsible on mobile) → page header with scope note → KPI row → charts → tables/queues.
3. Destructive or policy actions require confirmation or explicit state, never a bare icon.

---

## 7. Responsive behaviour

- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1480`.
- Mobile navigation is a drawer with a labelled `nav`; desktop uses a mega menu with keyboard support.
- Catalogue filters become a drawer below `lg`; the active filter count remains visible.
- Tables scroll horizontally with sticky first column semantics where needed; card summaries replace dense columns on small screens.
- Checkout uses a single column with a sticky summary only at `lg+`; purchase actions remain reachable without hover.
- Tested widths during development: 320, 360, 390, 768, 1024, 1440. The mobile shell test asserts no horizontal overflow at 360 px.
- Safe-area padding is applied to fixed/drawer surfaces; text zoom and long labels are handled with wrapping rather than truncation for essential content.

---

## 8. Motion system

Motion tokens in `globals.css`:

```text
instant    90ms    feedback only (press, toggle)
fast       160ms   hover, focus, small fades
base       260ms   menus, drawers, tab changes
slow       520ms   larger surface transitions
narrative  820ms   editorial entrances
ease-atlas        cubic-bezier(0.22, 1, 0.36, 1)
ease-entrance     cubic-bezier(0.16, 1, 0.3, 1)
ease-exit         cubic-bezier(0.4, 0, 1, 1)
```

### Three profiles

| Profile | Behaviour |
| --- | --- |
| **Full** | Entrance choreography, stagger, hover lift, shared transitions. |
| **Reduced** | Shortens CSS transitions to 120 ms; Framer Motion `reducedMotion="always"` removes travel while preserving opacity feedback. Automatically selected when the OS requests reduced motion and no explicit choice exists. |
| **Minimal** | CSS animations/transitions disabled; Framer Motion reduced. For explicit user choice or constrained environments. |

The profile is persisted under `ponnaloy.atlas.motion` and exposed on `<html data-motion>`. The `/lab` page can switch profiles and replay the same entrance specimen. Device power is **not** inferred from screen width.

### Motion categories in use

- Micro: button press, wishlist fill, cart count, toast, validation, switch/checkbox.
- Component: mega menu, search dialog, quick view, drawer, tabs, accordion, filter results.
- Narrative: hero reveal, staggered grids, editorial image masks, quote sections.
- Data: chart draw-in, number transitions, order status progression.

No scroll hijacking, no forced intro, no infinite ambient animation, no 3D/WebGL requirement.

---

## 9. Accessibility behaviour

- Skip link is the first focusable element.
- Landmarks: `header`, `nav` (labelled), `main#main`, `footer`; one `h1` per page.
- Dialogs/drawers use Radix focus management; ESC closes; focus returns to the trigger.
- Search dialog is keyboard-first (`⌘K` / `Ctrl+K`), with combobox/listbox semantics and an accessible result count.
- Charts expose a text summary and a data table fallback; colour is never the only status signal.
- Toasts announce through a polite live region; destructive actions are confirmed, not hover-revealed.
- Motion profiles and `prefers-reduced-motion` are both honoured.
- Axe scans (14 states) gate on serious/critical WCAG A/AA violations; manual keyboard and screen-reader checks are documented in `docs/TESTING.md`.

---

## 10. Technical dependencies

| Dependency | Why it exists | What was deliberately not added |
| --- | --- | --- |
| Tailwind + CSS variables | token-driven styling without a runtime CSS-in-JS cost | no styled-components/emotion |
| Radix primitives | proven focus/ARIA behaviour for overlays and disclosures | no second component framework |
| Framer Motion | declarative choreography and `MotionConfig` reduced-motion control | no GSAP, no scroll library |
| `next-themes` | class-based theme with no flash | no bespoke theme context |
| Zod + RHF | shared validation models and accessible field errors | no form framework beyond this |
| lucide-react | consistent, tree-shaken icons | no icon font |
| Vitest / Playwright / axe | domain, journey and accessibility gates | no visual-regression service |

The design system is intentionally small: primitives are composed rather than multiplied. New components must reuse tokens and demonstrate their states in `/lab`.

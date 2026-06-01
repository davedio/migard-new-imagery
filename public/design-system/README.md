# Midgard — Design System

> **Built to scale. Rooted in Cardano.**
> A Cardano-native Layer 2 optimistic rollup from **Anastasia Labs**. Applications get a faster execution layer while Cardano stays the root of trust; the path settles back to Cardano L1. Fees are paid in ADA.

This is the brand + UI design system for **Midgard**, derived directly from the product codebase. Use it to generate well-branded interfaces, mocks, slides, and production designs that look and feel native to Midgard.

---

## What Midgard is

Midgard is a **Cardano-native optimistic rollup** — a Layer 2 that moves application activity into a higher-throughput environment while anchoring the trust path back to Cardano L1. It is positioned deliberately *against* the "go somewhere else to scale" narrative: more capacity without leaving Cardano's security assumptions, wallets, tooling, or ecosystem alignment.

The product's core mental model is a **six-layer trust path**:

```
01 Activity  →  02 Batch  →  03 Proof  →  04 Challenge  →  05 Settlement  →  06 Cardano L1
```

Activity happens fast on L2; transactions are batched; state transitions are committed as proofs; disputed activity can be contested through challenge mechanics; settlement returns to the base layer; Cardano stays in the trust loop.

The brand is themed on **Norse world-mythology** — *Midgard* (the realm of the middle), *Yggdrasil* (the world-tree), roots, monoliths, "Rootwork." The aesthetic is described in the code as **"Dark Ancient Tech / Trust Architecture"**: a green-black mythic atmosphere, glowing living-tree imagery, gold proof-light, and a precise monospace technical voice layered over it.

The current product status is **pre-alpha testnet** with **simulated data** (a deterministic mock fills the same `NetworkSnapshot` contract that a Blockfrost/Koios adapter will fill at launch). The UI is honest about this everywhere — status chips read "Simulated data," "Pre-Alpha Testnet," "connects to live data at launch."

### Products / surfaces represented

1. **Marketing + gateway website** (`midgard-gateway`) — the only product surface in the source. A multi-page Next.js site:
   - `/` — cinematic **splash / flash-entry** ("Enter Midgard") over the world-tree image, with the **Syne cursor-spotlight wordmark**.
   - `/home` — the **Gateway**: a scroll homepage with a fixed 2D/3D world-tree stage behind it, a **"Start here" explore grid** (four audience paths), a closing CTA, and a floating motion toggle.
   - Content pages: `/how-it-works` (the six-step **protocol lifecycle**), `/security`, `/testnet` (live network status widget), `/faq`, `/about`, `/docs`, `/get-started`, `/official-links`.
   - Redirects: `/users`, `/builders`, `/partners`, `/build`, `/participate` now fold into **`/get-started`** (e.g. `/users` → `/get-started#users`).

There is no separate app / dashboard product beyond the marketing gateway. Live network status (the deterministic `NetworkSnapshot` mock) surfaces inline on `/testnet`.

---

## Sources

This system was reverse-engineered from the product repository. If you have access, explore it to build higher-fidelity designs:

- **GitHub:** [`davedio/midgard-gateway`](https://github.com/davedio/midgard-gateway) *(private)* — Next.js 16 + React 19 + Tailwind v4. Key files:
  - `src/app/globals.css` — the full token + component CSS (the source of truth, ported here).
  - `src/app/layout.tsx` — fonts (**Syne** display + Poppins fallback / Inter body / JetBrains Mono via `next/font/google`).
  - `src/components/Gateway.tsx` — the scroll homepage hero + explore grid + closing CTA.
  - `src/components/site/ui.tsx` + `SiteNav.tsx` + `SiteFooter.tsx` — page primitives & chrome (nav: Home · How It Works · Security · Testnet · FAQ · About · Docs, with a **Get Started** CTA; footer credits Anastasia Labs with GitHub/X/Discord glyphs).
  - `src/lib/network.ts` — the `NetworkSnapshot` data contract + deterministic mock.
  - `src/app/(site)/*/page.tsx` — page copy (the source of the content-fundamentals examples below).

> The reader is encouraged to explore the repository directly for anything this system does not cover — especially the Three.js / R3F world-tree scenes (`src/components/scene/*`) which are out of scope here.

---

## CONTENT FUNDAMENTALS

How Midgard writes. The voice is **calm, exacting, and slightly mythic** — a security-minded engineer who refuses hype but isn't cold.

**Tone & stance**
- **Trust before action.** The recurring thesis: speed is worthless if the path can't be checked. Copy repeatedly subordinates throughput to verifiability. *"Speed only matters if the path can be checked."*
- **Anti-hype, pro-inspection.** It actively rejects marketing theater. *"Trust architecture, not throughput theater."* / *"Bring the proof with you."* / *"do not build from a headline."*
- **Honest about maturity.** Never overclaims. Simulated data, pre-alpha, and "claim-dependent" caveats are stated plainly, not hidden.
- **Mythic restraint.** The Norse framing (Midgard, Yggdrasil world-tree, roots, monoliths) is evocative but never campy — it's a backdrop, not a costume.

**Casing & grammar**
- Headlines and body use **sentence case** with periods, often as short declarative fragments: *"One system. Three ways in."* / *"Less migration pain. More Cardano leverage."*
- **Eyebrows / kickers, chips, metrics, and CTAs are mono** — UPPERCASE for eyebrows (e.g. `SCALABILITY | SPEED | SECURITY`, `START HERE`), Title/sentence case for chips and buttons (`Get Started`, `Pre-alpha testnet`).
- Numbers are grouped (`4,291,860`), hashes are truncated (`0x4291a…f7c2`), statuses are SHOUTED in mono (`GENERATED`, `OPEN`, `SETTLED`).

**Person & address**
- Speaks to **"you"** (the builder / user): *"Your users should not have to leave the ecosystem."*
- Refers to the product as **"Midgard"** (third person), not "we." Cardano is named as a respected anchor, never a rival.

**Signature phrases / lexicon**
- "Scale Cardano without making it *less Cardano*." · "Rooted in Cardano." · "Cardano as the root of trust." · "Scale Cardano. Keep the proof." · "Cardano-native" · "trust path" · "the path can be checked" · "settles back to Cardano L1" · "Fees are paid in ADA."
- Lexicon: *Activity, Batch, Proof, Challenge, Settlement, L1/L2, optimistic rollup, eUTXO, challenge window, proof object, anchor, throughput.*

**Vibe & devices**
- Frequent **short bulleted truth-lists** ("More capacity. ADA fees. L1 settlement.").
- One green-highlighted word per heading for emphasis (e.g. *Math*, *less Cardano*).
- A safety register on user-facing pages: *"Start calm. Stay official."* / never-ask-for-seed-phrase callouts.
- **No emoji. Ever.** No exclamatory hype. Restraint is the brand.

---

## VISUAL FOUNDATIONS

**Overall** — "Dark Ancient Tech." Everything sits on a green-black void with a living world-tree behind it. The mood is nocturnal, mythic, and precise: glowing organic imagery underneath a cold technical HUD.

**Color** — Background is **Deep Ink `#07120b`** (a green-black), deepening to **Obsidian `#050c08`** at the "roots." Surfaces are **Panel `#0c1610`**. The brand green **Midgard Green `#20be43`** (and brighter **`#3be863`** for live values) signals *valid / live / active*. **Gold `#cf9a2e`** (bright **`#e0a33c`**) signals *proof / settlement / accent* and draws hairlines. **Cardano Blue `#0033ad`** (lightened to `#7fa0f0`) marks anything referencing Cardano L1. Text runs a green-tinted gray ramp: `#eaf2ec → #b7c6bc → #7c8f84 → #51635a`. Only **1–2 accent hues per screen** — green and gold do almost all the work.

**Type** — Three families, each with a strict job:
- **Syne** (display, weights 500–700, tracking −0.01em) — all headings and the wordmark. Geometric and modern with a little character; **Poppins** stands behind it as a fallback face.
- **Inter** (body) — paragraphs, leads. Quiet and legible.
- **JetBrains Mono** — *the connective tissue*: eyebrows, chips, metrics, CTAs, nav links, hashes. This mono layer is what makes Midgard read as "technical instrument."
All load from Google Fonts (matching the codebase's `next/font/google`).

**Spacing & geometry** — Tight, architectural radii: **4px** (chips), **6px** (buttons), **8px** (panels). Max content width 1320px; fluid gutters `clamp(22px, 4.8vw, 80px)`. Sections breathe with large vertical padding (`clamp(54px, 9vh, 110px)`). Layouts are mostly single-column, left-aligned, ~760px copy measure; the homepage hero left-aligns over the world-tree stage.

**Backgrounds** — A fixed **ambient world layer** on every page: a warm **canopy glow** radial at the top, a green **root glow** radial at the bottom, and a radial green-black depth gradient between. Over everything sits a **fractal-noise grain** (`feTurbulence`, ~40% opacity, `mix-blend-mode: overlay`) — a subtle film over the whole UI. The splash/hero uses the **Yggdrasil world-tree photograph** (`hero-tree-green.png`) — a dark mythic landscape with a green-glowing tree and roots — darkened (`brightness ~0.45`) under a radial veil, with a slow 26s scale-drift.

**Imagery vibe** — Cool, dark, desaturated, *green-lit*. Mythic and organic (trees, roots, monoliths). Always heavily darkened and veiled so UI sits cleanly on top. No bright/airy/stock photography.

**Borders & lines** — Hairlines are mist at very low alpha (`rgba(215,226,216,0.09)` → `0.16` stronger). The signature **gold top-line** runs across every panel via a `::before` gradient (`transparent → gold-line → transparent`, 50% opacity). Eyebrows lead with a 22px gold tick. Dividers in tables/FAQs are the same mist hairline.

**Cards / panels** — `.panel`: fill `#0c1610` with a faint top sheen (`linear-gradient(180deg, rgba(215,226,216,0.025), transparent 40%)`), a 1px mist hairline, 8px radius, and the gold top-line. **No drop shadows on panels** — depth comes from glow and the ambient layer, not elevation shadows.

**Shadow / glow system** — Midgard uses **glow, not shadow**. The primary button glows green on hover (`inset 0 0 22px rgba(32,190,67,0.14), 0 8px 30px -12px green-glow`). Live dots carry a green box-shadow halo. Green-glow `rgba(32,190,67,0.35)` is the universal "energy" color. Drop shadows are essentially absent.

**Buttons**
- **Primary** — green gradient fill, green border, green-bright text, inset green sheen. Hover: brighter border + green glow + `translateY(-1px)` lift.
- **Ghost** — transparent, mist border, body text. Hover: **gold** border + gold text (no fill).
- **Text link** — mono, green-bright, underlined with 4px offset, trailing `→`.

**Chips** — small mono capsules with a leading dot. Variants encode network truth: `live` (pulsing green dot, 1.8s), `testnet`/`proof` (gold), `l1` (Cardano blue), `demo` (muted). Radius 4px.

**Motion** — One easing everywhere: **`cubic-bezier(0.22, 0.61, 0.36, 1)`** (a smooth decelerate). Patterns: **reveal-on-scroll** (fade up 22px, 0.7s, staggered by `delay`), **live-pulse** on status dots (opacity 1↔0.35, 1.8s), **splash-drift** (26s slow zoom on the hero), **splash-glow** (3.4s breathing glow on the enter button). Hover = `translateY(-1px)` + glow; there is no bounce, no spring. All of it respects `prefers-reduced-motion` (animations collapse to instant).

**Hover / press states** — Hover brightens borders and adds glow (primary → green, ghost/links → gold); buttons lift 1px. Links brighten color + show underline. No explicit shrink-on-press; focus shows a 2px green-bright outline at 3px offset.

**Transparency & blur** — Used sparingly and purposefully: the fixed nav and mobile menu use `backdrop-filter: blur(9–12px)` over a top-fading dark gradient; the floating HUD/motion toggle use `blur(6px)` over `rgba(7,18,11,0.6)`. Chips and panels use low-alpha fills so the ambient layer shows through faintly.

**Selection** — `::selection` is green at 28% with white text.

---

## ICONOGRAPHY

Midgard's source is **icon-light by design** — it leans on its monospace type, status dots, numerals, and the world-tree imagery rather than a UI icon set.

- **No icon font, no SVG icon library** is used for UI affordances. There is no Lucide/Heroicons/Feather dependency. The visual "icons" of the interface are: the **leading gold tick** on eyebrows, the **status dots** in chips, **layer numerals** (`01`–`06`), and arrow glyphs (`→`, `↓`) typed inline in mono.
- **One exception — social brand glyphs.** The site footer renders three recognizable channel marks (**GitHub, X, Discord**) as inline `<svg>` paths (no dependency). These are brand logos, not a UI icon set — use them only for those official channels.
- **Unicode-as-icon** is the pattern: arrows (`→ ↓`), the mobile menu burger (`☰`) and close (`✕`). These are deliberate — they match the typographic, instrument-like feel.
- **Brand marks** (in `assets/`, copied from the repo's `public/`):
  - `midgard-logo.png` — full lockup (tree-in-circle mark + "Midgard" wordmark). The wordmark is **light/white**, so the lockup only works on dark backgrounds. In the live splash the wordmark is set in **Syne** with a compact green cursor-spotlight effect.
  - `midgard-icon.png` — the **world-tree-in-circle** mark, a green vertical gradient. Works on light or dark. Use as favicon / avatar / compact mark.
  - `hero-tree-green.png` — the Yggdrasil hero photograph (also the favicon source `icon.png`).
- **Emoji: never.** Not in product, not in this system.

**Guidance for new work:** prefer the existing vocabulary — mono labels, status dots, numerals, and inline arrow glyphs. If you genuinely need line icons (e.g. a docs UI), introduce a **thin-stroke, geometric** set (e.g. **Lucide**, 1.5–2px stroke, from CDN) to match Syne's geometry, keep them `--text-dim` by default, and **flag the addition** — they are a substitution, not part of the source product.

---

## Index / manifest

Root files:
- **`README.md`** — this file: context, content & visual foundations, iconography.
- **`colors_and_type.css`** — design tokens: full color palette + semantic type roles (CSS custom properties). Load this first.
- **`midgard.css`** — component layer: buttons, chips, panels, cards, callouts, layer rows, metric rows, ambient background. Load after `colors_and_type.css`.
- **`SKILL.md`** — Agent Skill manifest (for use as a downloadable Claude skill).

Folders:
- **`assets/`** — brand marks & imagery: `midgard-logo.png`, `midgard-icon.png`, `hero-tree-green.png`.
- **`preview/`** — the Design System tab cards (type, color, spacing, component, brand specimens).
- **`ui_kits/website/`** — high-fidelity recreation of the Midgard marketing gateway: `index.html` (interactive multi-screen prototype) + JSX components, plus `experiments/` (the Syne cursor-spotlight wordmark).

> Fonts are **Google Fonts** (Syne, Inter, JetBrains Mono) loaded via CDN — no local font files are bundled. The link tag is at the top of `colors_and_type.css`.

### How to use
1. Link the two stylesheets and the Google Fonts tag (snippet at the top of `colors_and_type.css`).
2. Pull marks from `assets/`. Build on **Deep Ink** with the ambient `world-bg` + `world-grain` layers.
3. Compose with `.panel`, `.btn`, `.chip`, `.eyebrow`, `.card`, `.layer-row`. Reach into `ui_kits/website/` for full screen components.
4. Write copy in the Midgard voice: calm, exact, mono technical labels, no emoji, honest about status.

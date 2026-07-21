# Midgard Site Design Guide — "Painted Yggdrasil" theme

This document is the recipe for the site's look. It is written so that anyone
(including a future AI session with no memory of this project) can recreate,
extend, or re-skin the theme from scratch: the palette, the art style, the
exact image-generation prompts and settings, the asset pipeline, and the rules
for wiring art into pages without hurting readability.

Last updated: 2026-07-21 (dark brand-default and two-theme parity decision).

---

## 1. Design philosophy

- **The site is a calm, painted storybook about a world-tree.** Midgard's
  brand metaphor is Yggdrasil: execution happens in the canopy, verification
  in the trunk, settlement at the roots on Cardano. Every visual should feel
  like a page from the same hand-painted book.
- **Art carries mood; copy carries claims.** Images never contain text,
  diagrams, people, or UI. They set atmosphere behind real content.
- **Calm by default, one loud moment per page.** Most of every page is still.
  Each page gets at most one self-running animation.
- **Dark is the primary brand expression; light has equal finish.** When no
  theme is specified, design and implementation start in dark. Light remains
  a complete Midgard experience with the same hierarchy, polish, and care.
- **Honesty is a design feature.** Simulated data is labelled SIMULATED.
  Forward-looking performance, cost, and reward figures use one clear
  benchmark-status note per page or section; repeat copy states the figures
  directly. There is no token language anywhere except scam warnings on FAQ /
  Official Links.

## 2. Palette and type

Core custom properties (see `src/app/globals.css`; light theme overrides at
the `[data-theme="light"]` block, ~line 4180):

| Token | Dark value | Light value | Role |
|---|---|---|---|
| `--deep-ink` | `#07120b` | `#f1f4ec` | page background |
| `--panel` | `#0c1610` | `#f3f6ee` | card/panel fill |
| `--midgard-green` | `#20be43` | (same family, darkened) | brand green |
| `--green-bright` | `#3be863` | darker green | accents, sap light |
| `--gold` / `--gold-bright` | `#cf9a2e` / `#e0a33c` | `#8a6512` / `#7d5c10` | verification tone |
| `--cardano-blue` | `#0033ad` | — | reserved; cobalt accents use `#78b9ff` (dark) / `#2b6cb0` (light) |
| `--mist` | `#d7e2d8` | `#20301f` | soft neutral |
| `--text-hi` / `--text` / `--text-dim` | `#eaf2ec` / `#b7c6bc` / `#8fa39a` | inverted equivalents | type ramp |

**Scene color language (use everywhere, including art and data-viz):**
- **Green** = L2 execution / soft confirmation / life ("sap light")
- **Gold** = verification / challenge window / blocks sealing
- **Cobalt** = Cardano L1 settlement / finality

**Fonts** (`--font-*` in globals.css): Fraunces (display serif, headings),
Inter (body), Syne (wordmark only), JetBrains Mono (labels, overlines,
hashes, kickers — always uppercase with `letter-spacing: 0.14em` for
overlines). Body is 17px/1.55; leads are `clamp(17px, 1.55vw, 21px)`.

**Shapes:** radii are small (`--r` 6px, `--r-lg` 8px) except buttons —
hero buttons are full pills (`border-radius: 100px`) in a frosted rounded
dock. Cards over artwork are "frosted": `rgba(255,250,240,0.97)` in light
mode with a soft shadow.

## 3. The art style — "loose painterly oil"

The reference images for the whole style are, in order of authority:
1. `public/img/watercolor/forest-path.webp` (the FAQ background) — for
   landscape scenes
2. `public/img/watercolor/rune-stones.webp` (the tablets) — for
   object-in-mist scenes
3. `public/img/watercolor/terraces.webp` (the steps) — for how pale and
   atmospheric a plate is allowed to get

**Style rules (all mandatory):**
- Loose, hand-painted **impressionist oil** on canvas: soft visible
  brushstrokes, delicate paper grain. Never crisp digital rendering, never
  photoreal, never "fantasy illustration" tightness.
- **Heavy drifting pale mist** and generous airy negative space. Roughly
  40–60% of the frame should be soft wash a headline could sit on.
- **Muted low-saturation palette**: warm cream, soft peach, off-white, sage
  and olive green. Nothing vivid.
- **One quiet luminous mint-green accent** per image (sap light, beacon,
  shimmer) — soft and magical, never neon.
- **Subject sits to ONE side** (usually the right third); the other side
  dissolves into mist for text. State this explicitly in prompts.
- Distant or middle-distance subjects. **No busy close-ups that fill the
  frame** — that was the exact failure mode of the retired `roots-glow` and
  `canopy-light` treatments.
- **Never include:** text, words, letters, people, buildings, modern
  structures, UI — and **never a bridge** (the copy positions bridges as the
  thing Midgard avoids; use gates, arches, paths, stones instead).

## 4. Image generation recipe (Higgsfield)

Model: **`nano_banana_pro`** · resolution **2k** · cost ≈ 2 credits/image.

Always pass a **style reference** via `medias` (`role: "image"`):
- landscapes → upload/reuse `forest-path.webp`
- object-in-mist scenes → upload/reuse `rune-stones.webp`

Aspect ratios: **16:9** for page backdrops, **9:16** for the /learn journey
plate.

**Master prompt template** (fill the [SCENE] sentence; keep everything else
verbatim):

> Match the loose, hand-painted impressionist oil style of the reference
> image exactly: soft visible brushstrokes on canvas, delicate paper grain,
> heavy drifting pale mist, generous airy negative space, muted
> low-saturation palette of warm cream, soft peach, off-white, sage and
> olive green. [SCENE — subject, which side of frame it occupies, where the
> single soft mint-green light accent lives, which side stays open mist for
> headline text.] Calm, dreamy fine-art storybook mood. Wide 16:9 website
> background. No text, no words, no letters, no people, no buildings, no UI.

**The scenes currently in production** (regenerate any of them by reusing
its sentence):

| Asset | Page | Scene sentence (summary) | Ref |
|---|---|---|---|
| `journey-descent-hero` (1440×1661) | /learn journey plate | **Not generated from a prompt.** The actual home-hero painting (`tree-hero-portrait`, light + dark) outpainted to 9:16 (sky above, cliff continued below), then cropped full-width from just above the canopy to the bottom (2026-07-16: the journey tree must BE the hero tree; generated lookalikes were rejected). No painted sap-vein needed — the canvas orb draws its own light down the measured trunk. | hero itself |
| `journey-flow-tall` (9:16) | (superseded as /learn plate; home descent teaser still uses `trunk-flow-tall`) | One immense tree top-to-bottom: sunlit canopy at top, mossy bark descending, roots dissolving into cloud at bottom; a thin mint sap-light ribbon winds down the full trunk like a waterfall of light | forest-path |
| `sentinel-watch` | /participate | Two weathered sentinel standing stones on a mossy terraced hillside, right third, overlooking a valley of ridgelines fading into fog; faint mint beacon glow between them | rune-stones |
| `trunk-mist` | /glossary | Broad mossy trunk of one ancient tree at respectful distance, right side, half dissolved in rolling fog; one thin mint sap-vein traces up the bark | rune-stones |
| `stepping-stones` | (retired as a page backdrop — file kept, available) | Broad flat stepping stones crossing a calm shallow forest stream, lower right, far bank glowing warm; faint mint shimmer on the water | forest-path |
| `signal-cairn` | /status | Small stacked stone cairn on a mossy ridge at dawn, right third, a soft steady mint light at its top like a quiet signal lantern; hills fade into fog | rune-stones |
| `winding-road` | /roadmap | Pale footpath climbing terraced switchbacks from lower left toward a bright warm horizon upper right; low waypoint stones at the bends | forest-path |
| `forest-path` | /faq AND /developers | (original master — do not regenerate) | — |
| `terraces` | /users (vivid) | (original master — the "steps"; moved here when /economics folded into the audience pages, 2026-07-11) | — |
| `rune-stones` | /official-links | (original master — the "tablets") | — |

Retired: `stone-gateway` (arch on /developers — rejected 2026-07-11),
`roots-glow` and `canopy-light` as page backdrops (too busy/frame-filling;
files kept for the home descent teaser and legacy uses).

## 5. Asset pipeline

1. Download the generation PNG (2752×1536 for 16:9, 1536×2752 for 9:16).
2. Convert with sharp (already a devDependency) — cover-crop to the site's
   exact sizes and encode both formats:
   - wide backdrops: **2200×1228**, tall journey plate: **1440×2580**
   - `.webp` quality 82 and `.avif` quality 55
3. Drop both files in `public/img/watercolor/<name>.{webp,avif}`.
4. Until the dark pass exists for that image, copy the same two files to
   `public/dark/img/watercolor/` so dark mode never 404s.

Snippet (run from the repo root so sharp resolves):

```js
import sharp from "sharp";
const base = sharp("in.png").resize(2200, 1228, { fit: "cover" });
await base.clone().webp({ quality: 82 }).toFile("public/img/watercolor/name.webp");
await base.clone().avif({ quality: 55 }).toFile("public/img/watercolor/name.avif");
```

## 6. Wiring art into a page

Use `PageBackdrop` (`src/components/site/PageBackdrop.tsx`) as the first
child of `<main className="page-main">`:

```tsx
<PageBackdrop name="stepping-stones" variant="full" focus="60% 55%" />
```

- `name` — the watercolor filename (no extension). The component handles
  the light/dark path switch and the avif→webp fallback automatically.
- `variant` — `full` is the standard "artwork IS the page background"
  treatment (the FAQ look). `soft` / `bold` / `side` / `banner` exist for
  quieter placements.
- `focus` — CSS object-position. Use it to keep the subject visible at
  narrow widths: subject-on-right images want x ≥ 54%; push y down (55–75%)
  when the subject sits low (terraces, stepping stones).
- `vivid` — set this for **intrinsically pale plates** (terraces-class
  images). It lifts the image (`saturate(1.18) contrast(1.12)`) so the
  legibility scrim doesn't erase it. Never needed for normally-contrasted
  plates.

Current per-page settings live in each `src/app/(site)/*/page.tsx` (and
`DeveloperLanding.tsx`); the /learn journey plate is
`WATER_COLOR_JOURNEY_PLATE` in `HowItWorksExperience.tsx`. The home descent
teaser (`DescentPreviewLoop.tsx`) keeps `trunk-flow-tall` — do not swap it
when changing the /learn plate.

## 7. Legibility rules (the scrim system)

Backdrop washes live in `src/app/v2.css` (~line 4015, `.page-backdrop*`):
- One radial "pool" sits behind the hero copy (top-left) + one vertical
  cream fade toward the page bottom. **Never stack extra washes** — multiple
  overlapping gradients created visible seams in the past.
- Light mode gets a deeper pool (`rgba(255,250,240,0.52)` at the hero,
  2026-07-11 pass) because dark ink on pale paintings needs more help than
  light text on dark ones.
- If art still fights the copy, prefer **moving the subject** (`focus`) or
  regenerating with more mist on the text side over strengthening the scrim.
  The scrim protects words; it must not bury paintings — pale plates get
  `vivid` instead.
- Cards over artwork stay frosted at 97% opacity (light) — established in
  the contrast pass; don't lower it.

## 8. Motion rules

- Respect the site-wide motion contract: every loop/entrance is gated by
  `useMotionPref()` in JS and `html[data-motion]` in CSS. The manual toggle
  (bottom-right) overrides OS reduced-motion in both directions.
- Animations are **self-running, horizontal, and quiet** (collapsing slats,
  traveling packets, flowing loops). No vertical step-stacks with glowing
  orbs — explicitly rejected.
- Feeds/simulations are deterministic (no `Math.random` at render — see
  `SoftConfirmFeed.tsx` / `StateQueueViz.tsx` for the seeded-hash pattern),
  labelled SIMULATED, and freeze to a meaningful static frame when motion
  is off.

## 9. Copy rules that affect design work

- **Token silence:** the word "token" appears ONLY in the scam-warning
  contexts (FAQ token question, Official Links). Everywhere else: "fees are
  paid in ADA", "nothing new to hold". When sweeping, grep `src/` INCLUDING
  `src/lib/` (copy hubs live there).
- Forward-looking performance, cost, and reward figures use one clear benchmark-status note per page or section. Repeat copy states the figures directly without inline qualifiers.
- No IOG partnership claims, no wallet-brand prose on the home page
  (partners appear only as ecosystem logo bubbles).
- Never change copy during design passes — structure and motion only.

## 10. Theme brand policy

**Dark is Midgard's primary brand expression and the first-visit default.**
When a design, preview, or implementation does not specify a theme, start in
dark. A saved visitor preference remains authoritative, and the nav toggle
persists the visitor's choice.

**Light mode is an equal-quality brand presentation, not a fallback.** It must
retain the same content, hierarchy, spacing, interaction states, motion
quality, and visual richness as dark mode. Choosing dark as the default must
never be used to defer, simplify, or remove light-mode treatment.

A theme-aware feature is not complete until:

- dark and light both meet contrast and readability requirements;
- hover, focus, active, responsive, and reduced-motion states work in both;
- paired artwork keeps the same composition, crop, and subject placement;
- desktop and mobile have been visually checked in both themes.

Every new plate needs a **night version of the same composition** (pass the
light image as the composition reference):
- trees/stones stay natural and dark (silhouettes, warm bark in shadow) —
  the mint/emerald **sap-light becomes the dominant light source**, as thin
  crisp threads, never thick neon tubes
- deep indigo, near-black green-tinted skies; ground mist; sparse warm
  fireflies ONLY on the main tree images
- match each light image's crop exactly (resize to the same file's
  dimensions, `fit: "cover"`), drop into `public/dark/img/watercolor/`
  replacing the paired asset. No component changes should be needed.

## 11. Checklist: adding a themed page from scratch

1. Pick the scene metaphor from the page's job (protocol role → stones/
   sentinels; user action → paths/stones/streams; reference → carved runes).
2. Generate with the master template + correct style ref (§4). 2–3 tries;
   pick the one with the most usable negative space.
3. Convert + install (§5), including the matching dark assets.
4. Wire `PageBackdrop` with a sensible `focus`; add `vivid` only if pale (§6).
5. Screenshot at desktop width in dark and light modes; check every headline
   and DataRow against the art. Nudge `focus` before touching scrims (§7).
6. Keep the page's sections to the established shapes (PageHero → JumpChips
   → Section/Statement/DataRows/CardGrid) so it reads as the same book.

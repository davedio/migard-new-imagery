# Midgard Gateway — Visual & 3D Enhancement Audit

A full-site audit of opportunities to enhance design, overlay visuals, and 3D
graphics (React + Three.js / react-three-fiber + GLSL + `motion`) across the
Midgard Gateway website.

## How this audit was produced

- **Rendered every page.** All site routes were captured as real screenshots
  using headless Chromium with software WebGL (`--use-angle=swiftshader`), so
  the actual Three.js scenes render in the captures, not just the HTML. See
  [`screenshots/`](./screenshots).
- **Reference skills installed.** The
  [`CloudAI-X/threejs-skills`](https://github.com/CloudAI-X/threejs-skills)
  collection (10 skills: fundamentals, geometry, materials, lighting, textures,
  animation, loaders, shaders, postprocessing, interaction) was installed into
  `.claude/skills/` so every recommendation is grounded in accurate three.js
  APIs and patterns.
- **Five parallel agents** each took a cluster of pages, viewed the
  screenshots, read the source + the components each page renders, and wrote a
  structured report with concrete implementation specs.

## The central finding

The brand is **strong and consistent** — a dark "ancient-tech / trust
architecture" aesthetic built on a world-tree motif (green glowing canopy +
roots), gold "proof" accents, monospace overlines, and a solid token system in
`src/app/globals.css`.

But the experience **falls off a cliff below the fold**: 3D and visual richness
live almost entirely in hero sections, and every page then drops into a large
flat near-black void. Closing that gap — tastefully, performantly, and without
undermining the trust tone of a Cardano-rollup status surface — is the theme
that unifies every report below.

## Reports

| Report | Surfaces covered |
| --- | --- |
| [Design system & 3D architecture](./design-system-and-3d-architecture.md) | **Systemic / cross-cutting.** Shared ambient layer, unified postprocessing, HUD kit, motion source-of-truth, performance budget, reduced-motion strategy, code-duplication cleanup. **Read this first.** |
| [Entry & identity](./entry-and-identity.md) | Root splash `/`, access gate, home hero |
| [Explanatory](./explanatory.md) | How-it-works (protocol lifecycle), about |
| [Trust & status](./trust-and-status.md) | Security (gold-root proof tree), testnet (live/simulated stats) |
| [Activation & reference](./activation-and-reference.md) | Get-started, docs, faq, official-links |

## Recommended sequencing

Page-level work should sit on a perf- and a11y-safe foundation, so build in
phases:

### Phase 0 — Foundations (do before any page work)
Driven by the [architecture report](./design-system-and-3d-architecture.md):
- **One reduced-motion source of truth** — a `useReducedMotion` hook + a
  persisted `MotionContext` in `providers.tsx`, with the manual motion toggle
  moved into shared chrome so it governs every layer. (Today there are three
  divergent implementations and the live OS toggle is partly ignored.)
- **`sceneTokens.ts`** — consolidate the duplicated helpers (`useGlowTexture`
  ×3, `mulberry32` ×2, pointer-parallax `Rig` ×3, bark-texture loading ×2) and
  shared palette/lights/camera presets into one module.
- **`PostFX.tsx`** — a single postprocessing wrapper (bloom + vignette + grain +
  chromatic aberration) with a `quality` prop, replacing the three near-identical
  `<EffectComposer>` declarations.
- **In-view + `frameloop="demand"` hooks** so canvases stop rendering when
  static or offscreen.

### Phase 1 — Shared visual systems
- **CSS/SVG HUD kit** (corner brackets, scanlines, mono data-readouts,
  animated dividers) — the cheapest high-leverage win, **zero WebGL cost**, and
  the primary tool for filling below-fold content sections.
- **Hero-to-body gradient bridges** + per-section ambient radial glows so the
  existing `.world-bg` / fluid canvases bleed through content instead of being
  occluded by opaque section backgrounds.

### Phase 2 — The single ambient depth canvas
One persistent `<Canvas frameloop="demand">` behind the `(site)` layout
(instanced drifting motes + fbm fog, scroll-driven hue/parallax, tinted strictly
from tokens). **Not** per-section canvases — that would blow past the browser's
live-WebGL-context limit.

### Phase 3 — Page-level signature pieces
The highest-payoff per-page items, now safe to build on the foundation:
- **Scroll-driven 3D protocol-lifecycle diagram** (how-it-works) — the single
  biggest page-level opportunity.
- **Live-data-bound root/ring visuals + proof-verification flash** (security /
  testnet), with strict `SIMULATED` labelling.
- **Splash particle life + scroll-recede tree stage + parallax hero** (entry).
- **Simulated proof-flow 3D minimap** (testnet capstone).

## Quick wins (low effort, high ratio — mostly CSS / `motion`)

- Hero→body gradient bridge on every `PageHero` (kills the hardest visual seam).
- Per-section ambient radial glows so the WebGL/fluid layers bleed through.
- Cursor-spotlight on `ExploreGrid` / role / docs cards (reuse the existing
  `MidgardWordmark` `--mx/--my` mask technique).
- `NetworkStatusWidget` proof-state pulse + batch-queue fill bar + block-height
  odometer (live data made legible, no canvas).
- `RootworkShowcase` wired to real `useNetworkSnapshot` data (the `activity`
  prop is currently hardcoded to `0.5`).
- Extend `SecurityPageBackdrop` to `120vh` with a bottom fade.

## Guardrails (apply to everything)

- **Performance budget:** ≤1 always-on ambient canvas + ≤1 active showcase
  canvas; `frameloop="demand"`; pause/cull offscreen via IntersectionObserver;
  clamp DPR; instance repeated geometry; CSS-only fallback on mobile/low-power.
  See the 11-item checklist in the architecture report.
- **Accessibility:** every visual layer must honor a single `prefers-reduced-motion`
  source of truth and the manual toggle; render one frame then stop when motion
  is off.
- **Trust:** this is a status surface for a Cardano rollup. Keep readability-first
  on FAQ / official-links / docs. **Never** make simulated L2 activity look like
  verified live protocol data — simulated visuals must carry explicit
  `SIMULATED` / `DEMO` labelling.
- **Consistency:** recolor the cyan/blue sap in `WorldTreeScene` to the
  green/gold system (or formalize `--cardano-blue` as an intentional token)
  before flipping the hero to `"three"` mode.

---

*Reports are written as concrete implementation specs (impact/effort, exact
r3f/three/drei/postprocessing APIs, files to extend or create, and guardrails),
so they can be handed to any execution agent or implemented directly.*

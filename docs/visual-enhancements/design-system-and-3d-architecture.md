# Midgard Gateway — Design System & 3D Architecture Audit

Systemic (cross-cutting) audit to enable consistent, performant visual/overlay
enhancements across all pages. Grounded in the code as it stands today
(Next 16 / React 19 / r3f 9 / drei 10 / @react-three/postprocessing 3 /
three 0.184 / `motion` 12). Scope is architecture, not page-by-page polish.

---

## (a) Current-state assessment

### Token & CSS system — strong, single source of truth
`src/app/globals.css` is the design-system spine and it is genuinely good:

- A complete palette + semantic token set (`--midgard-green`, `--gold`,
  `--green-bright/dim/ghost/glow`, `--gold-*`, text ramp `--text-hi/text/dim/faint`,
  derived darks `--obsidian/basalt/panel`, `--panel-edge[-strong]`).
- Type roles (`--h1..--mono`), motion easing `--ease`, geometry radii, gutters.
- A small set of tokens re-exposed to Tailwind v4 via `@theme inline`.
- Reusable primitives already exist: `.panel` (with the gold top-hairline
  `::before`), `.chip` variants, `.btn`, `.eyebrow` (mono overline + gold dash),
  `.card`, `.section`, `.metric-row`, plus the `.lifecycle*` schematic kit.
- Server-component primitives in `src/components/site/ui.tsx`
  (`Section`, `Card`, `PageHero`, `CtaBand`, `Layers`, `Faq`, `Callout`,
  `LinksTable`) compose those classes so pages stay consistent.

**Two global ambient layers already ship in the root layout** (`layout.tsx`):
`.world-bg` (fixed radial canopy/root glows + ink gradient) and `.world-grain`
(fixed SVG fractal-noise overlay, `mix-blend-mode: overlay`, z-index 60). So a
site-wide grain/vignette concept *already exists* — it is just static and very
subtle. This is the natural hook for an upgraded ambient system.

### 3D / WebGL infrastructure — five independent renderers, heavy duplication

| Component | Tech | Where | Canvas |
|---|---|---|---|
| `scene/WorldTreeScene.tsx` | r3f + GLB + bark PBR + custom `onBeforeCompile` sap shader + Bloom | home hero (when `HERO_MODE="three"`) | own `<Canvas>` |
| `scene/StaticTreeHero.tsx` | **raw 2D canvas** sap particle engine over a PNG | home hero (active: `HERO_MODE="static"`) | own 2D canvas |
| `scene/FluidScene.tsx` | **raw WebGL** (hand-written GLSL fbm), no three | every child page bg | own GL canvas |
| `scene/MonolithScene.tsx` | r3f + RoundedBox + emissive rail + Bloom | How-It-Works showcase | own `<Canvas>` |
| `scene/RootworkScene.tsx` | r3f + TubeGeometry roots + bark PBR + Bloom | How-It-Works showcase | own `<Canvas>` |
| `SplineShowcase.tsx` | Spline runtime | spike/placeholder | iframe-ish runtime |

There is **no shared 3D layer**. Each scene re-implements the same things:

- **`useGlowTexture()` is copy-pasted verbatim** in WorldTreeScene, MonolithScene,
  and RootworkScene (identical 64px radial canvas gradient). Pure duplication.
- **`mulberry32` PRNG** duplicated in WorldTreeScene and RootworkScene.
- **`<EffectComposer><Bloom/>` is re-declared in all three r3f scenes** with
  near-identical params (intensity 0.85–0.9, threshold 0.5–0.55, smoothing 0.2–0.22,
  `mipmapBlur`, radius 0.7–0.72). No shared pipeline; no vignette / noise /
  chromatic-aberration anywhere despite the brand calling for them.
- **`Rig` (pointer-parallax + lerp)** re-implemented three times with the same
  `window pointermove` → `(x*2-1, -(y*2-1))` math and `1 - pow(k, dt)` damping.
- **Bark texture loading** (`oak_diff/nor_gl/rough/ao/disp_1k.webp`) is set up
  twice with different wrap/repeat/anisotropy handling (raw `useLoader` in
  WorldTreeScene vs `useTexture` + manual `.clone()` + dispose in RootworkScene).
- **Procedural value-noise bump** (`useStoneBump`/`useEarthBump`) duplicated with
  trivially different octaves.

### Performance posture — good instincts, no shared budget
The lazy patterns are already correct and worth standardizing on:

- All r3f/Spline scenes are `next/dynamic(..., { ssr: false })`.
- Showcases (`Monolith/Rootwork/SplineShowcase`) gate mount on an
  `IntersectionObserver` with `rootMargin: "300px 0px"`, and only render the
  scene once `inView`. Good.
- All `<Canvas>` use `dpr={[1,2]}` and `powerPreference: "high-performance"`.
- `useGLTF.preload` is used for the worldtree GLB.

**Gaps:**
- **No `frameloop="demand"` anywhere** — every canvas runs a continuous render
  loop even when nothing is animating (static fallback still spins the GPU).
- **No pause-when-offscreen.** Showcases mount once and never unmount/pause; the
  home hero canvas runs whether or not the hero is in view (it is `position:fixed`
  full-viewport behind the whole page, so it renders for the entire scroll).
- **No global cap on concurrent WebGL contexts.** If ambient depth is added
  per-section as separate canvases, pages will blow past the browser's ~8–16
  live-context limit and/or tank the framerate. This is the single biggest risk.
- `FluidScene` is a fragment shader running fullscreen fbm with 5 octaves at
  `dpr≤2` on *every child page* with **no IntersectionObserver and no demand
  loop** — it animates continuously behind the fold and behind the footer.
- DPR is clamped to 2 but never lowered on low-end/mobile; no
  `WebGLRenderer.info`-based downgrade.

### Accessibility — inconsistent, three different reduced-motion strategies
There is **no single source of truth** for motion preference:

1. CSS: `@media (prefers-reduced-motion: reduce)` in globals.css kills
   transitions/animations and forces `.reveal` visible. Good baseline.
2. `Gateway.tsx` reads `matchMedia` **once** in an effect and sets `motionOn`
   state — but **never subscribes to changes** (no `addEventListener`), so
   toggling the OS setting live does nothing on the home page.
3. Showcases use `useSyncExternalStore` + `matchMedia` *with* a change listener
   (the correct pattern) — but each re-implements `subscribeReducedMotion` /
   `getReducedMotionSnapshot` verbatim (3 copies).
4. `FluidScene` reads `matchMedia(...).matches` **once at mount** and, if reduced,
   simply renders a single static frame (good) — but does not subscribe either.

There is a **manual motion toggle** (`MotionToggle` in Gateway + `.motion-toggle`
CSS) — but it lives **only on the home page** and its state is local React state,
not shared with child pages, the FluidScene, or the reduced-motion media query.
So a user who toggles motion off on home gets full motion everywhere else.

`prefers-reduced-motion` honoring inside scenes is partial: WorldTreeScene's
`motionOn=false` still renders leaves/blocks (just no time advance), which is
correct; but bloom + continuous render loop still run.

### Consistency gaps between scenes
- **Color language drifts.** RootworkScene and MonolithScene faithfully use the
  globals palette (green `#20be43`, bright `#3be863`, gold `#b7791f/#e0a33c`).
  But **WorldTreeScene's sap and L1 blocks are CYAN/BLUE** (`#08183a`, `#2f9cff`,
  `#6fe0ff`, sap mix `vec3(0.08,0.5,1.0)`) — an electric-blue motif that exists
  nowhere else in the brand and contradicts the "green canopy / gold proof"
  system. The `StaticTreeHero` (the *active* hero) is correctly green/gold.
- **Camera/lighting language is close but ad-hoc.** Monolith and Rootwork share a
  fov-40, ~z9 camera + cool key / green underglow / gold rim 3-point rig (good,
  almost a shared "scene kit"). WorldTree uses fov-46 + a scripted scroll path.
  Fog colors differ per scene (`#04080c`, `#07110b`, `#070d0a`) where one token
  would do.
- **Background fill differs per page**: home = tree (fixed), security = blurred
  PNG backdrop (`SecurityPageBackdrop` + CSS), all other child pages = FluidScene.
  Below the first viewport, *all* of them fall to flat `--deep-ink`.

### The void (confirmed across screenshots)
home, about, get-started, how-it-works, security, testnet, faq, docs,
official-links, builders, users: every page is rich in the top ~700–900px (hero
+ tree/mist) and then **flat near-black to the footer**. FluidScene is fixed so
it technically covers the viewport, but it is dimmed so far (veil
`rgba(6,13,9,0.5→0.62)` + internal vignette to `0.45`) that below the fold it
reads as solid black. The fall-off is real and systemic.

---

## (b) Prioritized systemic opportunities

Each: **Impact** / **Effort**, technical approach, guardrails.

### 1. Shared, scroll-aware "ambient depth" layer — ONE persistent canvas
**Impact: very high. Effort: medium.**

**Decision: a single persistent, app-wide `<Canvas frameloop="demand">` mounted
in the root layout — NOT per-section canvases.** Rationale grounded in the code:

- The app already has a global fixed background convention (`.world-bg` +
  `.world-grain`) and the home hero already mounts a single fixed full-viewport
  stage (`.scene-stage`). Extending that to one shared ambient canvas fits the
  existing layering (`z-index: 0/1` background, `.content { z-index: 10 }`).
- Per-section canvases would multiply WebGL contexts and each pays full
  composer/bloom setup cost. A single canvas amortizes one renderer, one
  composer, one bloom pass, one DPR policy.
- Scroll-awareness is cheap on one canvas: feed `useScroll().scrollYProgress`
  (already used in Gateway) into uniforms / instanced offsets, so the field
  parallaxes and shifts hue as the user descends "canopy → trunk → roots".

**Approach:** new `src/components/scene/AmbientDepth.tsx` (client, dynamic,
`ssr:false`), rendered once in `src/app/(site)/layout.tsx` (replacing the
per-page `InteriorFluidBackground` branch) behind `.content`.

Contents, in order of value:
- **Instanced drifting motes / spores** — one `THREE.InstancedMesh` of a few
  hundred soft additive sprites (reuse the shared glow texture), seeded with a
  shared `mulberry32`, slow upward/downward drift, parallax by scroll. Instancing
  keeps it to a single draw call (skill: geometry/instancing, materials/additive).
- **Depth fog + a single large gradient plane** to give the void a sense of
  volume instead of flat black (`<fog>` + a shader plane reusing the FluidScene
  fbm, but as ONE layer not per page).
- **Optional parallax root/branch silhouettes** — a couple of instanced line/tube
  shapes far back, very dim, that drift with scroll to imply the world-tree
  continues behind the content.
- Tinted strictly from tokens: green canopy at top of scroll → gold proof accents
  mid → deep ink roots at bottom, driven by `scrollYProgress`.

**Guardrails:** `frameloop="demand"` and `invalidate()` on scroll/pointer +
a throttled idle tick (don't free-run); clamp DPR to `[1, 1.75]` for the ambient
layer (it's background, doesn't need 2); hard-disable on `motionOn=false`
(render one frame, stop); `pointer-events: none`; cap mote count by viewport
area + a mobile fallback that renders the CSS-only path (see #3 + #6).

### 2. Unified postprocessing pipeline
**Impact: high. Effort: low.**

Create `src/components/scene/PostFX.tsx` — one component wrapping
`<EffectComposer>` with the brand pipeline, consumed by every r3f scene:

- `Bloom` (the existing glow — standardize on intensity ~0.9, threshold ~0.5,
  `luminanceSmoothing` 0.2, `mipmapBlur`, radius 0.7).
- `Vignette` (`@react-three/postprocessing`) — subtle, darken edges to focus the
  glowing center; matches the brand's existing CSS vignettes.
- `Noise` (blend `OVERLAY`, tiny opacity ~0.025) — a *GPU* grain that matches the
  existing `.world-grain` SVG, so 3D and 2D layers share one grain identity.
- `ChromaticAberration` — barely-there offset (~0.0005) on bright edges for the
  "ancient-tech signal" feel. Skill: postprocessing (EffectPass ordering —
  bloom first, then grade, vignette/noise/CA last).

Props let scenes dial intensity (`bloom`, `vignette`, `grain`, `aberration`,
`enabled`). Replaces the three duplicated `<EffectComposer><Bloom/>` blocks.

**Guardrails:** expose a single `quality: "high" | "low"` prop — `low` drops CA +
noise and halves bloom kernel for mobile; respect `motionOn` (noise animation
off when reduced). Keep it a *thin* wrapper so a scene can still add scene-local
effects as children.

### 3. React/CSS HUD overlay kit — "advanced graphics" with zero WebGL cost
**Impact: high. Effort: low.**

The cheapest, highest-leverage win for the voids: a CSS/SVG overlay kit that
layers monospace data-readouts and schematic chrome over existing flat sections.
The brand already has the vocabulary (`.eyebrow`, `.metric-row`, `.lifecycle`
grid + SVG rail, mono font). Generalize it into
`src/components/site/hud/` primitives:

- `CornerBrackets` — absolutely-positioned `::before/::after` L-brackets in
  `--gold-line`/`--panel-edge-strong` framing any panel/section.
- `Scanlines` — repeating-linear-gradient overlay, `mix-blend-mode: overlay`,
  very low opacity (kin to `.world-grain`).
- `DataReadout` — mono key/value rows reusing `.metric-row` styling, optionally
  fed by `useNetworkSnapshot()` (live L1 block / batch queue / proof status —
  already wired in `NetworkStatusWidget`).
- `AnimatedDivider` — an SVG hairline with a travelling gold/green pulse
  (CSS `@keyframes`, gated by reduced-motion), echoing the `.panel::before`
  gold gradient and the lifecycle rail.
- `Ticker` / `Annotation` — `[01 / 05] STAGE_…` framing borrowed from
  `.lifecycle__stage-labels`.

These fill voids with *legible signal*, not just texture, and cost nothing on the
GPU. They are the primary tool for the below-fold sections of content pages.

**Guardrails:** pure CSS animations so the existing reduced-motion media query
disables them for free; everything `aria-hidden` except real data readouts;
keep all color/spacing on tokens.

### 4. Standardized motion system on `motion` + Reveal
**Impact: medium. Effort: low.**

Today there are **two `Reveal` implementations** — `site/Reveal.tsx`
(IntersectionObserver + CSS `.reveal`) and a second inline copy inside
`Gateway.tsx`. And `motion` is installed but only used in Gateway for
`useScroll`/`useMotionValueEvent`. Standardize:

- Delete the Gateway-local `Reveal`; use `site/Reveal.tsx` everywhere (it already
  handles the no-IO fallback and respects reduced-motion via CSS).
- Add a small `useScrollParallax(ref, range)` hook built on `motion`'s
  `useScroll({ target })` + `useTransform` for opt-in parallax on heroes/media,
  and a `motion`-based variant of Reveal for richer staggered entrances where
  CSS isn't enough.
- One shared `prefersReducedMotion` hook (see #6) gates all of it.

**Guardrails:** keep the CSS `.reveal` path as the SSR-safe default (no layout
shift, works before hydration); `motion` only for enhancement.

### 5. Performance budget + shared canvas governor
**Impact: critical (it's what makes everything else safe). Effort: medium.**

Introduce `src/components/scene/` infra:

- **`useInViewMount` / `useVisibilityFrameloop`** — shared hook extracting the
  duplicated IntersectionObserver-gate from the three showcases; additionally,
  when a scene scrolls *out* of view, set its r3f `frameloop` to `"never"`
  (pause) and back to `"demand"`/`"always"` when it returns. Use
  `useThree().setFrameloop` / `invalidate`.
- **Demand rendering by default.** Static fallbacks (`motionOn=false`) and idle
  scenes should not free-run. Showcases that are essentially static between events
  should be `frameloop="demand"` and `invalidate()` on the events that matter.
- **One canvas budget.** With the ambient layer as the single persistent canvas
  (#1), the rule becomes: **at most ONE always-on canvas (ambient) + at most ONE
  active showcase canvas at a time.** A tiny module-level registry can enforce
  "pause all other showcase canvases when one becomes active."
- **DPR clamping policy** centralized: ambient `[1,1.75]`, showcases `[1,2]`,
  mobile `[1,1.5]`.
- **Instancing** for any repeated geometry (motes #1, L1 blocks/root glows in
  WorldTreeScene already instance leaves — extend the pattern).
- **Mobile / low-power fallback:** `matchMedia("(max-width: 720px)")` or
  `navigator.hardwareConcurrency <= 4` → skip the ambient WebGL canvas entirely
  and render the CSS-only HUD/gradient version.

**Guardrails:** see the checklist in (e). The non-negotiable is the
concurrent-context cap.

### 6. Single reduced-motion strategy + global motion toggle
**Impact: high (a11y + perf). Effort: low.**

Create one source of truth and wire everything to it:

- `src/lib/useReducedMotion.ts` — `useSyncExternalStore` over the
  `(prefers-reduced-motion: reduce)` media query (the showcases' correct pattern,
  de-duplicated into one hook). Replaces the 3 inline copies and Gateway's
  one-shot read.
- A `MotionContext` (provider in `src/app/providers.tsx`) holding
  `motionEnabled = userToggle ?? !prefersReducedMotion`, persisted to
  `localStorage`. The existing `MotionToggle` moves out of Gateway into the
  shared `(site)` layout chrome (the `.motion-toggle` CSS is already global) and
  flips the context — so it governs the home hero, FluidScene/ambient, and every
  showcase uniformly.
- All scenes consume `motionEnabled` instead of their local `reduced`/`motionOn`.

**Guardrails:** default to OS preference; toggle only *overrides*. When motion is
off: render one static frame and stop the loop (don't just freeze time while the
GPU spins).

### 7. Consistency fixes (cheap, do alongside the above)
**Impact: medium. Effort: low.**

- **Recolor WorldTreeScene to the brand.** Move sap/L1 from cyan-blue to
  green/gold (or, if blue is an intentional "Cardano L1" cue — note `--cardano-blue`
  exists — make that a *named token* and apply it consistently, including in
  RootworkScene's bedrock). Right now it's an unowned divergence. (Lower urgency
  since `HERO_MODE="static"` is active, but fix before flipping to `"three"`.)
- **Tokenize scene constants.** Add `src/components/scene/sceneTokens.ts`
  exporting the palette `THREE.Color`s, one fog color, the shared 3-point light
  rig, the camera defaults, and `mulberry32` — imported by all scenes. Removes the
  per-scene magic numbers and the duplicated PRNG/lights.
- **Shared `useGlowTexture` / `useBrandTextures`** in that module (kills the
  3× copy-paste and the two divergent bark-loading paths).

---

## (c) Shared-component API sketches

### Ambient depth layer
```tsx
// src/components/scene/AmbientDepth.tsx  (client, dynamic ssr:false)
type AmbientDepthProps = {
  /** visual variant per route family; tints + density presets */
  variant?: "canopy" | "roots" | "mist" | "neutral";
  /** 0..1 overall liveliness; can bind to useNetworkSnapshot activity */
  activity?: number;
  /** master switch — wired to MotionContext (OS pref + user toggle) */
  motion?: boolean;
  /** mote count ceiling; auto-scaled down by viewport/mobile when omitted */
  density?: number;
  /** clamp; default [1, 1.75] for a background layer */
  dpr?: [number, number];
  /** force CSS-only fallback (mobile/low-power) */
  fallback?: "auto" | "css" | "webgl";
  /** parallax strength against scrollYProgress, 0..1 */
  parallax?: number;
};
// Internals: one <Canvas frameloop="demand">, instanced motes, fbm fog plane,
// scroll-driven hue/offset, <PostFX quality="low" grain vignette />.
```

### HUD overlay kit
```tsx
// src/components/site/hud/*
type HudFrameProps = {            // corner brackets + optional scanlines
  brackets?: boolean | ("tl"|"tr"|"bl"|"br")[];
  scanlines?: boolean;
  accent?: "green" | "gold";
  children: React.ReactNode;
};
type DataReadoutProps = {         // mono key/value, optional live feed
  rows: { k: string; v: React.ReactNode }[];
  live?: boolean;                 // pull from useNetworkSnapshot()
  align?: "left" | "right";
};
type AnimatedDividerProps = {
  accent?: "green" | "gold";
  pulse?: boolean;                // auto-off under reduced motion
  orientation?: "horizontal" | "vertical";
};
type AnnotationProps = { index?: number; total?: number; stage?: string };
```

### Postprocessing wrapper
```tsx
// src/components/scene/PostFX.tsx  (renders inside an r3f <Canvas>)
type PostFXProps = {
  enabled?: boolean;              // false -> render nothing (perf/a11y)
  quality?: "high" | "low";       // low: no CA/noise, lighter bloom (mobile)
  bloom?: number | false;         // intensity; default 0.9
  vignette?: number | false;      // darkness; default ~0.5
  grain?: number | false;         // noise opacity; default ~0.025
  aberration?: number | false;    // CA offset; default ~0.0005
  motion?: boolean;               // animate noise only when true
  children?: React.ReactNode;     // scene-local extra effects
};
```

### Supporting hooks
```ts
useReducedMotion(): boolean                         // single SSR-safe source
useMotion(): { enabled: boolean; toggle(): void }   // MotionContext
useInViewMount(ref, { rootMargin? }): boolean       // dedup showcase gate
useVisibilityFrameloop(ref): void                   // pause canvas offscreen
useScrollParallax(ref, [from,to]): MotionValue<number>
```

---

## (d) Phased rollout plan (build infra before page work)

**Phase 0 — Foundations (no visible change, unblocks everything).**
1. `src/lib/useReducedMotion.ts` + `MotionContext`/provider; move `MotionToggle`
   into `(site)` layout. Replace the 3 inline matchMedia copies + Gateway's
   one-shot read. (Opportunity #6)
2. `src/components/scene/sceneTokens.ts` — palette colors, fog color, light rig,
   camera presets, `mulberry32`, `useGlowTexture`, `useBrandTextures`.
   Refactor the three r3f scenes to import them. (Opportunity #7)
3. `useInViewMount` + `useVisibilityFrameloop`; refactor the three showcases to
   use them; add `frameloop="demand"` to static-ish scenes. (Opportunity #5)
4. Consolidate to one `Reveal` (delete Gateway's copy). (Opportunity #4)

**Phase 1 — Shared visual systems.**
5. `PostFX.tsx`; swap all `<EffectComposer><Bloom/>` blocks to it. (#2)
6. HUD kit (`site/hud/*`) — pure CSS/SVG, no 3D. Ship `CornerBrackets`,
   `DataReadout`, `AnimatedDivider`, `Scanlines`, `Annotation`. (#3)

**Phase 2 — Ambient depth.**
7. `AmbientDepth.tsx` (single persistent canvas) mounted once in `(site)` layout,
   replacing the per-route `InteriorFluidBackground` branching; keep
   `SecurityPageBackdrop` as a `variant`. Bind to `MotionContext` + scroll. (#1)
8. Retire/fold `FluidScene` into AmbientDepth's fog plane (one fbm, not per page).

**Phase 3 — Page-level enhancement (now safe + cheap).**
9. Per-page work composes HUD primitives + `AmbientDepth variant` + standardized
   parallax to fill the voids. Recolor WorldTreeScene before any flip to
   `HERO_MODE="three"`.

Do Phase 0–1 first: page authors then have HUD primitives and a perf-safe canvas
governor, so adding richness can't regress performance or a11y.

---

## (e) Performance budget checklist

- [ ] **≤ 1 always-on WebGL canvas** (the ambient layer) + **≤ 1 active showcase
      canvas** at any time. Enforce via a module-level canvas registry.
- [ ] Every r3f/Spline scene mounts via `next/dynamic({ ssr:false })`. (already true)
- [ ] Every scene mount is **IntersectionObserver-gated** via `useInViewMount`
      (`rootMargin ~300px`). (showcases already; ambient is the exception — it's
      the one persistent canvas.)
- [ ] Offscreen showcase canvases are **paused** (`frameloop:"never"` /
      `setFrameloop`) and resumed on re-entry. (new)
- [ ] **`frameloop="demand"`** for anything not continuously animating; call
      `invalidate()` on scroll/pointer/network events. (new — currently none)
- [ ] When `motionEnabled === false`: render exactly **one frame, then stop**.
      No free-running loop, no animated noise. (fix FluidScene + Gateway)
- [ ] **DPR clamps:** ambient `[1,1.75]`; showcases `[1,2]`; mobile `[1,1.5]`.
- [ ] **Instancing** for all repeated geometry (motes, leaves, blocks).
- [ ] **Mobile / low-power fallback** (`max-width:720px` or
      `hardwareConcurrency<=4`): skip ambient WebGL, render CSS HUD + gradient.
- [ ] **Single shared textures/materials** (`useGlowTexture`, bark set) — no
      per-scene re-creation; dispose on unmount.
- [ ] **One bloom/composer per canvas** (via `PostFX`); never stack composers.
- [ ] Watch `gl.info.render.calls` and live-context count in dev; budget the
      ambient layer to a single instanced draw call + 1 fog plane.
- [ ] Keep the SSR/first-paint path **CSS-only** (`.world-bg`, `.reveal`); WebGL
      is enhancement that arrives after hydration.
```

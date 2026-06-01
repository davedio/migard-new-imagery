# Entry & Identity — Visual Enhancement Opportunities

**Surfaces:** Root splash `/`, Access gate `/access`, Marketing home `/home`  
**Date:** 2026-06-01  
**Stack:** Next.js 16 App Router, React 19, r3f 9 / drei 10 / @react-three/postprocessing, three 0.184, motion 12, @splinetool/react-spline

---

## Quick Wins (implement first, lowest effort for highest visual return)

1. **Scroll-driven `scene-stage` opacity fade** — tie `StaticTreeHero` / `WorldTreeScene` canvas opacity to `scrollYProgress` via a `motion` transform so the tree fades gracefully as the user scrolls into `ExploreGrid`, rather than the tree abruptly sitting behind flat panels.
2. **Access page GLSL background** — replace the bare `#040a06` void behind the `/access` panel with a pure-CSS or thin-canvas full-screen animated shader (2D simplex fog + faint root-vein tracings) — no R3F needed, ~80 lines.
3. **`ExploreGrid` panel inner-glow on hover** — add a `motion` `useMotionValue` cursor-tracking radial gradient inside each `.panel` card (same technique as `MidgardWordmark`) so the green/gold glow follows the pointer across the card surface.
4. **`ClosingCTA` scroll-reveal scan-line** — a thin green horizontal line that sweeps across the section heading when it enters the viewport, using a CSS `@keyframes` or `motion` `animate` triggered by the existing `Reveal` IntersectionObserver.
5. **Splash page particle birth** — the splash currently has only the static PNG with a slow drift CSS animation. A small `<canvas>` leaf-tip birth layer (identical in approach to `StaticTreeHero`'s canopy birth loop but much sparser — ~30 orbs, no phase transitions) would immediately match the `/home` hero's vitality.

---

## Detailed Opportunities (priority order)

---

### 1. Splash Page: Sparse Sap-Particle Canvas Layer

**Impact: High | Effort: S**

**What & Where:** The root splash (`/`, `src/app/page.tsx`) shows the world-tree PNG behind a vignette veil, but the page is completely static — no particle life. Compared to `/home` (where `StaticTreeHero` runs the full canopy→trunk→root orb lifecycle), the splash entry feels flat and less inviting.

**Technical approach:**
- Add a `SplashParticles` client component that mounts a `<canvas>` with `position: absolute; inset: 0; z-index: 1` between `.splash__bg` and `.splash__veil`.
- Reuse the `buildTree`, `sampleLane`, `makeGlow`, and `makeVeinField` helpers already authored in `StaticTreeHero.tsx` — extract them into a shared `src/components/scene/sapEngine.ts` module so both consumers import from one place.
- Run only the canopy BIRTH phase (phase `0`): ~30–40 orbs born at leaf tips, grow, linger glowing, **do not** descend. No gather buckets, no trunk/root phases.
- Drive spawn rate by a ramp identical to the existing `runTime` ramp (first ~5s) so the screen populates gracefully rather than instantly.
- Stop the loop after ~120 visible orbs (static shimmer) when `prefers-reduced-motion` is set.

**File to extend/create:**
- Extract helpers → `src/components/scene/sapEngine.ts` (new)
- New component → `src/components/scene/SplashParticles.tsx` (new)
- Render in → `src/app/page.tsx` between `.splash__bg` and `.splash__veil`

**Guardrail:** Cap at 40 simultaneous orbs (vs. `MAX_PARTICLES = 400` in the full hero). On `prefers-reduced-motion` skip the `requestAnimationFrame` loop entirely; show 0 particles (the drift animation is already CSS-gated). Single canvas, no R3F overhead.

---

### 2. Home Hero → Below-the-Fold: Scroll-Driven Tree Fade + Depth Continue

**Impact: High | Effort: M**

**What & Where:** The `scene-stage` div is `position: fixed; inset: 0; z-index: 1` and shows behind all scroll content. As the user scrolls down through `ExploreGrid` and `ClosingCTA`, the hero tree remains fully visible and opaque through all flat dark sections. This is the core "large flat black voids" problem — the tree is already there, it just isn't being used as a storytelling canvas below the fold.

**Technical approach:**
- In `Gateway.tsx`, import `useScroll` + `useTransform` + `motion.div` from `motion/react` (already imported). Wrap `.scene-stage` as `<motion.div>` with:
  ```tsx
  const { scrollYProgress } = useScroll();
  const treeOpacity = useTransform(scrollYProgress, [0, 0.25, 0.55, 0.85], [1, 0.75, 0.35, 0.12]);
  const treeScale  = useTransform(scrollYProgress, [0, 0.85], [1, 0.95]);
  ```
  This creates a slow tree recede — at the `ExploreGrid` the tree is still ~75% visible (reading through translucent blurred cards), at the `ClosingCTA` it's a dim ghost presence.
- The existing `scrollYProgress` ref is already wired to `WorldTreeScene` for camera path; the new transform shares the same scroll source without re-subscribing.
- On the `ClosingCTA`, counter-fade: let the section's `Reveal` wrapper also fade in a `--canopy-glow` radial overlay behind the heading text (CSS only), so it feels like the tree re-emerges at the final CTA.

**File to extend:** `src/components/Gateway.tsx` — wrap `scene-stage` div and add `treeOpacity`/`treeScale` motion values.

**Guardrail:** `useTransform` is entirely declarative, no rAF cost. `prefers-reduced-motion`: conditionally hold opacity at `1` / scale at `1` (the tree is already correct at rest).

---

### 3. Access Page: Animated GLSL Background Fog

**Impact: High | Effort: S**

**What & Where:** `/access` is the password gate. The screenshot shows the panel on a near-featureless `#040a06` field — nothing connects it to the Midgard visual identity. This is a trust-critical page (it's the first thing new invited partners see) and it reads as an afterthought.

**Technical approach:**
- Add a `<canvas>` in `AccessPage` (RSC — must mark as a new client component wrapper, e.g. `AccessBackground.tsx`) rendered behind `.shell`.
- Shader: a 2D fullscreen fragment shader in raw WebGL (no R3F — page is server-rendered and simple):
  ```glsl
  // Domain-warped fbm fog tinted to --root-glow (#08 20 43 at 8% green)
  // with two faint vertical "root vein" lines converging at the bottom
  uniform float uTime;
  float fbm(vec2 p) { /* 4-octave value noise */ }
  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    float fog = fbm(uv * 2.4 + vec2(0.0, uTime * 0.06));
    // root vein: two sigmoid-shaped lines at x ≈ 0.44 and 0.56
    float vein = exp(-pow((uv.x - 0.44) * 18.0, 2.0)) + exp(-pow((uv.x - 0.56) * 18.0, 2.0));
    vec3 base = vec3(0.03, 0.08, 0.04);
    vec3 glow = vec3(0.08, 0.36, 0.14);
    gl_FragColor = vec4(mix(base, glow, fog * 0.28 + vein * 0.06), 1.0);
  }
  ```
- Canvas is `pointer-events: none; position: absolute; inset: 0; z-index: 0` inside `.shell` (which already has `z-index: 10` and `position: relative`).
- 1 draw call/frame, single pass, ~300×200 internal resolution is sufficient (upscaled by CSS).

**File to extend/create:**
- New → `src/components/AccessBackground.tsx` (client, raw WebGL canvas)
- Import in `src/app/access/page.tsx` (add `<AccessBackground />` as first child of `<main>`)
- Add `position: relative; overflow: hidden` to `.shell` in `page.module.css` (already has `position: relative`)

**Guardrail:** Single tiny canvas, requestAnimationFrame only while visible (`IntersectionObserver` pause). On `prefers-reduced-motion`, skip the animation loop; the static first-frame fog is still a valid visual improvement over bare black.

---

### 4. ExploreGrid Panels: Cursor-Tracked Inner-Glow (CSS + Motion)

**Impact: Med | Effort: S**

**What & Where:** `ExploreGrid` in `Gateway.tsx` renders four `.panel` cards. Currently the hover state is a simple `translateY(-2px)` lift (CSS). There's no depth or lighting personality. The `MidgardWordmark` already implements a beautiful cursor-spotlight technique (mask-image + opacity rAF loop) — the same pattern belongs on these cards.

**Technical approach:**
- Upgrade `ExploreGrid` cards from `<Link className="panel">` to use a `useRef` + `pointermove` handler that writes `--mx` / `--my` CSS variables per card.
- In globals.css add to `#explore .panel`:
  ```css
  --mx: -600px; --my: -600px; --glow: 0;
  background-image: radial-gradient(
    circle 200px at var(--mx) var(--my),
    rgba(32, 190, 67, 0.07),
    transparent 60%
  ), /* existing gradient */;
  ```
- The JS is < 20 lines per card; or lift into a shared `usePanelGlow()` hook.
- Can optionally use `motion` `useMotionValue` + `useSpring` for a softened follow.

**File to extend:** `src/components/Gateway.tsx` — `ExploreGrid` function; `src/app/globals.css` — `#explore .panel` selector.

**Guardrail:** CSS `radial-gradient` update via CSS variable — no canvas, no Three.js, pure layout-layer. Zero performance cost. `@media (pointer: coarse)` — skip the pointermove handler on touch devices.

---

### 5. WorldTreeScene: Scroll-Driven Bloom Intensity (Three-Mode)

**Impact: Med | Effort: S**

**What & Where:** When `HERO_MODE === "three"` (the R3F path in `WorldTreeScene.tsx`), the `EffectComposer` + `Bloom` post-processing pass runs at fixed `intensity={0.9}`. As the user scrolls down, the tree should breathe differently — a subtle bloom swell at the `ClosingCTA` would create a cinematic "return to the tree" moment.

**Technical approach:**
- In `SceneContents`, accept `progressRef` (already received) and feed scroll position into a bloom intensity uniform:
  ```tsx
  const bloomRef = useRef<BloomEffect>(null);
  useFrame(() => {
    if (!bloomRef.current) return;
    const p = progressRef.current ?? 0;
    // peak bloom at p≈0.85 (ClosingCTA), dim at p≈0.4 (ExploreGrid mid)
    const intensity = 0.9 + Math.sin(p * Math.PI) * 0.5;
    bloomRef.current.intensity = intensity;
  });
  ```
- Pass `ref={bloomRef}` to `<Bloom>` from `@react-three/postprocessing`.

**File to extend:** `src/components/scene/WorldTreeScene.tsx` — `SceneContents` component.

**Guardrail:** Single scalar write per frame, no new GPU passes. `motionOn` guard: skip writes when `motionOn === false`.

---

### 6. Splash Page: Wordmark Cursor-Glow Extension (Icon + Tagline)

**Impact: Med | Effort: S**

**What & Where:** `MidgardWordmark` provides a superb cursor-spotlight glow on the "Midgard" text. But on the splash, the icon (`/midgard-icon.png`) and the "Enter Midgard" button sit outside the glow radius and feel disconnected. The icon should pulse in sync with nearby cursor proximity; the CTA button should share the spotlight when hovered.

**Technical approach:**
- In `src/app/page.tsx`, wrap `.splash__lock` in a shared `PointerSpotlight` context that reads `--mx` / `--my` at the lock container level (same rAF approach as `MidgardWordmark`).
- The icon gets a CSS `filter: drop-shadow(0 0 var(--icon-glow) rgba(59,232,99,var(--o)))` driven by the same `--o` variable.
- The `splash__enter` button gains a `box-shadow` that peaks when `--o > 0.5` (pointer is near the wordmark cluster).
- Alternatively: extend `MidgardWordmark` to accept a `containerRef` prop so the spotlight radius can be measured from the whole lock group, not just the text span.

**File to extend:** `src/app/page.tsx` (add pointer listener + CSS var writes), `src/components/MidgardWordmark.tsx` (optional `containerRef` prop), `src/app/globals.css` (`.splash__lock` glow transitions).

**Guardrail:** Single `rAF` loop shared by the whole lock group (not per-element). `prefers-reduced-motion`: disable per existing `MidgardWordmark` pattern.

---

### 7. ClosingCTA: Subtle R3F "Root Arrival" Mini-Scene

**Impact: Med | Effort: M**

**What & Where:** `ClosingCTA` is a plain centered section with heading + paragraph + two buttons. The screenshot confirms it's a flat dark void. This is the page's emotional climax — "Scale Cardano. Keep the proof." — and deserves ambient visual weight.

**Technical approach:**
- Add a `<ClosingCTAScene>` component (R3F `Canvas`, `position: absolute; inset: 0; pointer-events: none; z-index: 0`).
- Scene contents: a single instanced `Points` object rendering ~200 root-tip glow particles (reusing the `rootTips` from `worldtree.points.json`), rendered in orthographic projection at very low depth, with a custom `ShaderMaterial`:
  ```glsl
  // fragment
  uniform float uTime;
  varying float vBrightness;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = exp(-d * 6.0) * vBrightness;
    vec3 col = mix(vec3(0.08,0.55,0.22), vec3(0.85,0.62,0.18), vBrightness * 0.4);
    gl_FragColor = vec4(col * glow, glow);
  }
  ```
- Particle positions drift upward by `uTime * 0.008` (very slow, sub-perceptual), looping with `fract()`.
- Drive `vBrightness` from scroll position via a uniform (`uProgress`): at page bottom the roots glow gold (settled state); mid-scroll they are dim green.

**File to create:** `src/components/scene/ClosingCTAScene.tsx`  
**File to extend:** `src/components/Gateway.tsx` — `ClosingCTA()` function

**Guardrail:** `dpr={[1,1]}` (fixed 1x), `frameloop="demand"` triggered only when section is in viewport via `IntersectionObserver` → `invalidate()`. On `prefers-reduced-motion`, `frameloop="never"`. Separate `Canvas` instance does not share the hero's postprocessing.

---

### 8. Access Page: Panel Entry Transition (Motion)

**Impact: Med | Effort: S**

**What & Where:** The access panel mounts with no animation — it just appears. The `/` splash CTA has a `splash-glow` keyframe; the panel deserves equivalent cinematic weight as the "gateway" to the preview.

**Technical approach:**
- Wrap `<section className={styles.panel}>` in `<motion.section>` from `motion/react`:
  ```tsx
  import { motion } from "motion/react";
  // ...
  <motion.section
    initial={{ opacity: 0, y: 18, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
    // ...
  >
  ```
- On `hasError`, add a `motion.animate` shake: `x: [0, -6, 6, -4, 4, 0]` over 0.4s.
- The existing `splash-glow` keyframe on `.splash__enter` is pure CSS and can be reused as a `box-shadow` animation on the submit button here too.
- Since `AccessPage` is an RSC, the motion wrapper lives in a thin `"use client"` wrapper component: `AccessPanel.tsx`.

**File to create:** `src/app/access/AccessPanel.tsx` (client, wraps `<section>`)  
**File to extend:** `src/app/access/page.tsx` — replace `<section>` with `<AccessPanel>`

**Guardrail:** Pure JS animation, no canvas. `prefers-reduced-motion`: `motion` respects the media query automatically when using `transition: { duration }` — or pass `duration: 0.001` conditionally. The error shake is a one-shot `animate()` call.

---

### 9. Home Hero: Depth-Layered `motion` Parallax on Copy

**Impact: Med | Effort: S**

**What & Where:** The hero copy (h1, lead, sublead, mechanism chips) scrolls at the same rate as the page. Separating them by depth using `motion` scroll-driven `y` transforms would create a genuine Z-axis illusion where the tree pulls away faster than the text.

**Technical approach:**
- In `Hero()` inside `Gateway.tsx`:
  ```tsx
  const { scrollYProgress } = useScroll();
  const titleY   = useTransform(scrollYProgress, [0, 0.4], [0, -28]);
  const leadY    = useTransform(scrollYProgress, [0, 0.4], [0, -18]);
  const chipsY   = useTransform(scrollYProgress, [0, 0.4], [0, -10]);
  ```
- Wrap `<h1>` → `<motion.h1 style={{ y: titleY }}>`, lead → `<motion.p>`, chips → `<motion.ol>`.
- The `--hero-fit` CSS scaling already uses `transform`-based font sizing via CSS variables; `motion` `y` is an additional `transform` layered on top via inline style.

**File to extend:** `src/components/Gateway.tsx` — `Hero()` function.

**Guardrail:** `useTransform` is passive / no rAF. On `prefers-reduced-motion`, keep all `y` values at `0` via `useReducedMotion()` from `motion/react`.

---

### 10. Scene-Stage: Scroll-Driven Camera Continuation to Roots for `StaticTreeHero`

**Impact: Med | Effort: M**

**What & Where:** The `WorldTreeScene` (R3F mode) already uses `progressRef` with four camera `STOPS` that travel canopy → L1 roots as the user scrolls. But `StaticTreeHero` (the active static mode) has no scroll-driven camera; the PNG sits pinned. A CSS-only parallax on the background position can approximate the downward camera feel for the static path.

**Technical approach:**
- In `StaticTreeHero.tsx`, accept a `progressRef` prop (already wired in `Gateway.tsx` — pass it through).
- In the rAF loop, read `progressRef.current` and write `backgroundPosition` CSS on `bgRef.current`:
  ```ts
  const bg = bgRef.current;
  const p = progressRef.current ?? 0;
  // tree "moves up" as we scroll down, revealing roots
  bg.style.backgroundPositionY = `${42 - p * 22}%`;
  ```
- This creates a slow vertical parallax (canopy at top → roots visible at bottom) without any Three.js overhead.
- The canvas overlay already mirrors `cover` transform per `IMG_ASPECT`; the `oY` offset in the draw loop would need to re-read `bg.getBoundingClientRect()` or accept the same progress shift.

**File to extend:** `src/components/scene/StaticTreeHero.tsx` — add `progressRef` prop and write parallax in the existing `frame` loop. `src/components/Gateway.tsx` — pass `progressRef` to `<StaticTreeHero>`.

**Guardrail:** Single `style.backgroundPositionY` write per frame — already inside the existing rAF; no cost increase. On `prefers-reduced-motion` (already gated by `motionRef.current`), skip the parallax write.

---

### 11. Splash → Home Transition: Page-Exit Motion

**Impact: Low | Effort: S**

**What & Where:** Clicking "Enter Midgard" on the splash triggers a hard Next.js navigation to `/home`. The transition is abrupt — the splash tree instantly replaced by the home hero tree.

**Technical approach:**
- Use Next.js 16 View Transitions API (if available in this build's `next.config`) or a `motion` `AnimatePresence` at the layout level.
- Simpler: add a `motion.div` exit overlay in the splash that fades to `#07120b` on click (`animate={{ opacity: 1 }}`, `transition={{ duration: 0.35 }}`) before the navigation fires. The home page's tree has its own appear ramp so it will fade in on the other side.
- Intercept the `<Link href="/home">` click with a `router.push` after the exit animation completes.

**File to extend:** `src/app/page.tsx` — replace `<Link>` with a client component `<SplashEnter>` that handles animation + navigation.  
New: `src/app/SplashEnter.tsx` (client, ~30 lines).

**Guardrail:** Navigation is delayed by exactly `350ms`. On `prefers-reduced-motion`, skip the overlay, navigate immediately.

---

### 12. ExploreGrid + ClosingCTA: Ambient Root-Vein SVG Overlay

**Impact: Low | Effort: S**

**What & Where:** The below-fold sections are `position: relative` on top of the `scene-stage`. Adding a very low-opacity SVG filter (turbulence + displacement) as a `::before` pseudo-element on `#explore` and `ClosingCTA`'s section creates organic texture without any canvas or JS.

**Technical approach:**
- In `globals.css`, add an SVG `<feTurbulence>` data URI as a `background-image` layered beneath the section:
  ```css
  #explore::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.04;
    background: url("data:image/svg+xml,...feTurbulence...");
    mix-blend-mode: screen;
  }
  ```
- Alternatively, a `filter: url(#root-warp)` on the section background where the SVG filter is embedded in the page `<head>` (via Next.js `layout.tsx`).

**File to extend:** `src/app/globals.css`

**Guardrail:** SVG filter at `opacity: 0.04` is imperceptible at a glance but adds organic depth. No JS, no rAF. `prefers-reduced-motion` irrelevant (static texture).

---

## Dependency Map

```
src/components/scene/sapEngine.ts  ← extracted from StaticTreeHero.tsx
  ↑ imported by SplashParticles.tsx
  ↑ imported by StaticTreeHero.tsx  (refactored to import helpers)

src/app/page.tsx
  ← SplashParticles.tsx  (#1)
  ← SplashEnter.tsx      (#11)

src/app/access/page.tsx
  ← AccessBackground.tsx (#3)
  ← AccessPanel.tsx      (#8)

src/components/Gateway.tsx
  ← scrollYProgress → scene-stage motion.div  (#2)
  ← scrollYProgress → hero copy parallax      (#9)
  ← progressRef → StaticTreeHero              (#10)
  ← ClosingCTAScene                           (#7)
  ← ExploreGrid panel glow hook               (#4)

src/components/scene/WorldTreeScene.tsx
  ← bloomRef scroll-driven intensity          (#5)

src/components/scene/StaticTreeHero.tsx
  ← progressRef parallax                      (#10)
  ← refactored to import sapEngine            (#1)

src/components/MidgardWordmark.tsx
  ← optional containerRef extension           (#6)
```

---

## Effort / Impact Matrix

| # | Title | Impact | Effort | Risk |
|---|-------|--------|--------|------|
| 1 | Splash particle canvas | High | S | Low |
| 2 | Hero scroll fade + depth | High | M | Low |
| 3 | Access GLSL fog background | High | S | Low |
| 4 | ExploreGrid cursor glow | Med | S | Low |
| 5 | WorldTree bloom scroll-drive | Med | S | Low |
| 6 | Splash wordmark spotlight extension | Med | S | Low |
| 7 | ClosingCTA mini root-scene | Med | M | Med |
| 8 | Access panel entry motion | Med | S | Low |
| 9 | Hero copy depth parallax | Med | S | Low |
| 10 | StaticTreeHero scroll parallax | Med | M | Low |
| 11 | Splash → home exit transition | Low | S | Low |
| 12 | Root-vein SVG texture overlay | Low | S | Low |

**Effort key:** S = hours / M = 1–2 days / L = 3+ days

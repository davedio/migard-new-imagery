# Visual Enhancement Opportunities: Explanatory Pages

**Surfaces audited:** `how-it-works` (ProtocolLifecycle + Layers + CtaBand) and `about` (PageHero + Prose sections + CardGrid + CtaBand)

---

## Quick Wins (all Low–Medium effort, ship independently)

1. **Lifecycle card shimmer on activation** — when `data-active="true"` flips, add a CSS `@keyframes` shimmer sweep across the card header via a `::after` pseudo-element using `background: linear-gradient(...var(--green-ghost)...)`. Zero JS, no bundle cost.
2. **Reveal upgrade with `motion` stagger** — replace the plain CSS `.reveal` on `Layers` items with `motion.div` using `viewport` + `staggerChildren`. Produces a cascade entrance instead of all items entering at once. Minimal change to `ui.tsx > Layers`.
3. **SVG rail flow-dash animation** — the existing `LifecycleRail` SVG already draws lines; add `stroke-dasharray` + CSS `animation: dash-march 2s linear infinite` to the `.is-live` line so the active segment visibly pulses data upward. Pure CSS, no new dependencies.
4. **Lifecycle section background: slow particle drift** — behind the existing `.lifecycle` grid, mount a lightweight `<Canvas>` (alpha, no shadow map) with ~80 instanced `Points` that drift upward over 60 s at near-zero opacity. Guards: `pointer-events: none`; skip entirely under `prefers-reduced-motion`.
5. **About page hero: ambient GLSL plane** — the About `PageHero` is a flat near-black void (confirmed in screenshot). Drop a `position: absolute; inset: 0; z-index: 0` R3F canvas behind the hero text with a single full-screen `PlaneGeometry` carrying a ShaderMaterial that runs a slow Perlin/simplex noise displacement and outputs a subtle gradient in the brand palette (`--canopy-glow` gold at top, `--root-glow` green at bottom). Cost: one draw call.

---

## All Opportunities, Ordered by Priority

---

### 1. Scroll-driven 3D Protocol Diagram (LifecycleFlow3D)

**Impact:** High | **Effort:** L

**What & where:** Replace (or supplement) the existing `LifecycleRail` SVG aside in `ProtocolLifecycle.tsx` with a persistent R3F `Canvas` that renders a live isometric or orthographic diagram of the five protocol steps. As the user scrolls through step cards, the diagram advances its own state: nodes illuminate, packets travel, L1 anchor grows. The current SVG rail becomes the fallback for `prefers-reduced-motion`.

**Technical approach:**

- Mount a `Canvas` (orthographic camera, `gl={{ alpha: true }}`, no shadow map) inside the `.lifecycle__rail` sticky aside, replacing the `LifecycleRail` SVG. Height matches the existing SVG (~`firstY + 4*stepGap + 20` px).
- Five node glyphs rendered as `RoundedBox` (drei) instances (`0.18 × 0.18 × 0.04` units) stacked vertically. Active node uses emissive `GREEN_BRIGHT` + `Bloom` (threshold 0.7, strength 0.4, radius 0.3); complete nodes use `GREEN` at lower emissive intensity; idle nodes use `--panel-edge-strong` colour.
- A `TubeGeometry` along a `CatmullRomCurve3` draws the vertical rail from top to bottom. A second `TubeGeometry` segment (re-created each frame, or morphed via uniform `uProgress`) advances from the start to the active node, coloured with the green stroke of `.is-live`.
- For steps with `flow: "l2-to-l1"` or `"both"`, animate a small sphere ("packet") travelling along a short horizontal `TubeGeometry` between the L2 column and a right-side L1 column (matching the existing SVG's cx=30, cx=70 concept in world space). Use `useFrame` with elapsed time modulo packet travel duration, driven by `activeStep` prop.
- The L1 column nodes (steps 3–5) use `--gold-bright` emissive colour and a separate `Bloom` layer via `@react-three/postprocessing` `BloomEffect` with a custom layer mask.
- `activeStep` is passed down as a prop from `ProtocolLifecycle`'s existing scroll listener — no new scroll logic needed.
- Extend `ProtocolLifecycle.tsx`: thread `activeStep` into a new `<LifecycleFlow3D activeStep={activeStep} />` client component (lazy-loaded via `next/dynamic`, `ssr: false`). The existing `<LifecycleRail>` SVG is preserved in a `<noscript>` fallback and rendered when `prefers-reduced-motion` is true (mirror the `MonolithShowcase` pattern).

**New component:** `src/components/scene/LifecycleFlowScene.tsx` (R3F inner) + `src/components/site/LifecycleFlow3D.tsx` (showcase wrapper, following `MonolithShowcase` pattern).

**Guardrail:** Cap at 1 draw call per frame; disable Canvas + fall back to SVG under `prefers-reduced-motion`; use `pixelRatio: Math.min(devicePixelRatio, 1.5)` to protect mobile GPUs. No shadow maps. Trust tone: geometric / schematic style, not game-like; keep orthographic camera.

---

### 2. Lifecycle Section Background: Slow Data-Particle Field

**Impact:** High | **Effort:** M

**What & where:** The `.lifecycle` section currently fills with a static CSS radial gradient. Add a full-bleed ambient canvas behind the step cards (position absolute, inset 0, z-index 0, pointer-events none) that shows ~120 tiny glowing particles drifting upward and rightward at 0.006 units/frame, representing "transactions in flight." They fade in at the bottom edge and dissolve at the top — echoing the world-tree root aesthetic.

**Technical approach:**

- Use a `THREE.Points` object with `THREE.InstancedBufferGeometry` (or a simple `BufferGeometry` with 120 position entries). Each point has a random XY start and a per-instance `speed` attribute. In `useFrame`, update `positions.needsUpdate = true` each frame, wrapping Y back to bottom when it exceeds the top boundary.
- `PointsMaterial` with `color: GREEN_BRIGHT`, `size: 0.004`, `sizeAttenuation: true`, `transparent: true`, `opacity: 0.45`, `blending: THREE.AdditiveBlending`. This creates the glow-without-bloom effect cheaply.
- Fragment shader variant (optional, higher quality): custom `ShaderMaterial` on a `Points` geometry where each fragment is `smoothstep`-based radial dot with a per-instance `vLife` varying — particles pulse subtly as they rise.
- Mount via a new `<LifecycleParticles />` component inside `ProtocolLifecycle`'s `<section className="lifecycle">`, using the `MonolithShowcase`-style `IntersectionObserver` lazy-mount.
- Wrap Canvas in `useSyncExternalStore(subscribeReducedMotion, ...)` — if reduced-motion, render null entirely.

**Component:** `src/components/site/LifecycleParticles.tsx` (thin wrapper) + inner scene in `src/components/scene/LifecycleParticlesScene.tsx`.

**Guardrail:** `alpha: true`, no shadows, `antialias: false` on this canvas; `pixelRatio: 1` fixed. Null-render under `prefers-reduced-motion`. Keep particle count ≤ 150. This canvas is purely decorative — `aria-hidden`.

---

### 3. About Hero: Ambient GLSL Noise Background

**Impact:** High | **Effort:** M

**What & where:** The About page hero is a completely flat near-black rectangle (confirmed in screenshot — just text floating on dark). Insert a `position: absolute; inset: 0; z-index: 0; pointer-events: none` canvas behind the `PageHero` text carrying a full-screen GLSL shader. The hero's `.page-hero__inner` gets `position: relative; z-index: 1`.

**Technical approach:**

- Single `PlaneGeometry(2, 2)` + `ShaderMaterial` rendered with an orthographic camera (no perspective needed for a background plane). The fragment shader:
  ```glsl
  uniform float uTime;
  varying vec2 vUv;

  // Classic value noise
  float noise(vec2 p) { ... } // standard 2D hash-based noise

  void main() {
    float n = noise(vUv * 3.5 + uTime * 0.04);
    float n2 = noise(vUv * 7.0 - uTime * 0.025);
    // gold canopy at top, green roots at bottom
    vec3 gold = vec3(0.114, 0.075, 0.012) * (1.0 - vUv.y);
    vec3 green = vec3(0.012, 0.059, 0.016) * vUv.y;
    vec3 col = (gold + green) * (0.55 + n * 0.45 + n2 * 0.2);
    float alpha = 0.72;
    gl_FragColor = vec4(col, alpha);
  }
  ```
- `uTime` advances at 0.5× real time so drift is almost imperceptible.
- Under `prefers-reduced-motion`: freeze `uTime` at 0.0 (static noise pattern — still visually rich, just still).
- Alternatively, use a CSS-only fallback: replace the canvas with an SVG `feTurbulence` filter on a `::before` pseudo-element — this gives the noise texture with zero JS.

**Component:** new `<AboutHeroCanvas />` inserted into `About` page, or make `PageHero` accept an optional `backgroundCanvas` slot.

**Guardrail:** `alpha: true`; text contrast must remain ≥ 4.5:1 — the shader intentionally keeps luminance very low (no white values). Under `prefers-reduced-motion`, `uTime` is frozen (static, no animation).

---

### 4. Lifecycle "COMMIT → L1" Step: Animated Data-Bridge Overlay

**Impact:** High | **Effort:** M

**What & where:** Step 03 (COMMIT) is the protocol's pivotal moment — the L2 block is anchored to Cardano L1. The existing card shows a static `→` symbol in `.lifecycle-card__bridge`. Upgrade this to a small inline SVG animation (or a tiny R3F canvas inset) that, when the step is active, animates a data packet travelling from the L2 column to the L1 column with a glow trail.

**Technical approach:**

Option A (CSS/SVG — zero bundle cost, recommended):
- Extend `.lifecycle-card__bridge` in `globals.css` with a CSS animation: an SVG `<circle>` inside `FlowIcon` that, when `data-active="true"`, translates along a `<path>` using `offsetPath` / `motion-path`. The circle starts at cx=0 (L2 edge), ends at cx=44 (L1 edge), over 1.2 s, repeating. Style with `fill: var(--green-bright); filter: drop-shadow(0 0 3px #3be863)`.
- For step 04 (WATCH, flow `"both"`), a second circle travels in the reverse direction simultaneously, using `stroke-dasharray` on the horizontal rule to suggest bidirectional signalling.

Option B (R3F inline):
- Small `Canvas` inside `.lifecycle-card__bridge` (44px wide × 100% height), orthographic camera, renders two sphere packets on an animated `LineCurve3`. Use `@react-three/postprocessing` `Bloom` to make them glow.

**Extend:** `ProtocolLifecycle.tsx > FlowIcon` and `StepCard`. No new files needed for Option A.

**Guardrail:** Under `prefers-reduced-motion`, `animation-play-state: paused` — packet freezes mid-travel (still visible, just still). For Option B, mount only when `!reducedMotion`.

---

### 5. Layers Section: Scroll-Stagger with `motion` + Depth Illusion

**Impact:** Med | **Effort:** S

**What & where:** The `Layers` component in `ui.tsx` uses `Reveal` (a plain CSS fade-up). The six layer rows on `how-it-works` enter all at once. Replace `Reveal` on `Layers` items with `motion.div` (from `motion` package) using `whileInView` + `staggerChildren: 0.07` so they cascade in sequence. Additionally, add a subtle `translateZ` + `scaleX` depth illusion: each successive row starts 4px more to the right and 0.5% narrower, creating a forced-perspective stack effect that visually communicates "layered architecture."

**Technical approach:**
```tsx
// In ui.tsx, Layers component:
import { motion } from "motion/react";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = (i: number) => ({
  hidden: { opacity: 0, x: -14, scaleX: 1 - i * 0.003 },
  show:   { opacity: 1, x: i * 4, scaleX: 1 - i * 0.003,
            transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] } },
});

// Wrap <div className="layers"> in <motion.div variants={container} whileInView="show" viewport={{ once: true }}>
// Wrap each <div className="layer-row panel"> in <motion.div variants={item(i)}>
```
- Check `window.matchMedia("(prefers-reduced-motion: reduce)")` and pass `variants` without any transforms if true — the `motion` library respects this natively via `MotionConfig reducedMotion="user"` at the app level.

**Extend:** `src/components/site/ui.tsx > Layers`.

**Guardrail:** `viewport={{ once: true }}` — fires once, no looping. `MotionConfig reducedMotion="user"` wrapper (can be added to `layout.tsx`) disables all `motion` animations globally when the OS flag is set.

---

### 6. About Page: Two-Column Split with 3D Trust-Path Schematic

**Impact:** Med | **Effort:** M

**What & where:** The "Throughput, with correctness intact" section (`Section eyebrow="The thesis"`) currently renders three prose paragraphs stacked on a flat black background. This is the best conceptual hook for a visual: L2 speed (left) vs L1 correctness (right), connected by a verifiable path. Add a small schematic 3D canvas alongside the prose in a two-column layout.

**Technical approach:**
- Change the `Section` layout to a two-column grid (`grid-template-columns: 1fr 1fr` at > 800px). Left: existing `<Prose>`. Right: a new `<TrustPathDiagram />` showcase component.
- The R3F scene contains two vertical columns (L2 left, L1 right) built from thin `BoxGeometry` pillars, connected by a `TubeGeometry` arc that bends from top-left to bottom-right. The arc carries a travelling dot (the "trust packet") that bounces back and forth at 0.3 Hz.
- Materials: L2 pillar emissive green; L1 pillar emissive gold; arc tube semi-transparent with `AdditiveBlending`; travelling dot uses `Bloom` for glow.
- Camera: slight perspective (~30°), looking down at 15° — reads as a schematic without being game-like.
- Lazy-mount via `IntersectionObserver` (same `MonolithShowcase` pattern).

**New component:** `src/components/scene/TrustPathScene.tsx` + `src/components/site/TrustPathDiagram.tsx`.

**Guardrail:** `prefers-reduced-motion` → static frozen frame (trust path at midpoint). Keep canvas height ≤ 280px; `pixelRatio: Math.min(devicePixelRatio, 1.5)`. Trust tone: explicitly schematic/architectural, not decorative. No particle effects in this scene.

---

### 7. ProtocolLifecycle: Step Transition Glow Pulse (CSS)

**Impact:** Med | **Effort:** S

**What & where:** When `activeStep` changes and `.lifecycle-card[data-active="true"]` flips, the card's green border and background transition (already present in CSS). Add a one-shot radial glow "pulse" emanating outward from the card border when it activates — like a signal arriving.

**Technical approach:**
- Add a `::before` pseudo-element to `.lifecycle-card[data-active="true"]`:
  ```css
  .lifecycle-card[data-active="true"]::before {
    content: "";
    position: absolute; inset: -1px;
    border-radius: var(--r-lg);
    border: 1px solid rgba(32, 190, 67, 0.6);
    animation: pulse-ring 0.8s var(--ease) forwards;
    pointer-events: none;
  }
  @keyframes pulse-ring {
    from { transform: scale(1); opacity: 0.7; }
    to   { transform: scale(1.015); opacity: 0; }
  }
  ```
- Because `data-active` toggles, the animation re-fires on each step change via the CSS `animation` property being re-applied each time the attribute changes (works reliably in modern browsers).
- Under `prefers-reduced-motion: reduce`, the global `animation-duration: 0.001ms` override in `globals.css` already suppresses this.

**Extend:** `src/app/globals.css`.

**Guardrail:** Pure CSS, no JS. Already covered by existing `prefers-reduced-motion` override in `globals.css`.

---

### 8. Layers Section: Subtle GLSL Background Grid Shimmer

**Impact:** Low | **Effort:** S

**What & where:** The `Section#layers` block (six layer rows) sits below the lifecycle cards in a flat dark void. The `.lifecycle::before` already has a grid pattern (masked). Carry this pattern into the layers section using CSS only: add a `section.layers-bg::before` with the same SVG inline `feTurbulence` + grid overlay pattern, but animate the `background-position` at `0 1px/s` to give a slow vertical scroll on the grid texture.

**Technical approach:**
```css
.section--layers::before {
  content: "";
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  opacity: 0.14;
  background-image:
    linear-gradient(rgba(215,226,216,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(215,226,216,0.05) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(80% 64% at 50% 40%, #000, transparent 78%);
  animation: grid-drift 120s linear infinite;
}
@keyframes grid-drift { to { background-position: 0 42px, 42px 0; } }
@media (prefers-reduced-motion: reduce) { .section--layers::before { animation: none; } }
```
Add `section--layers` class to the `Section` in `how-it-works/page.tsx`.

**Extend:** `src/app/globals.css`; add class name to `how-it-works/page.tsx`.

**Guardrail:** Pure CSS, negligible GPU cost. `prefers-reduced-motion` is respected inline.

---

### 9. About CtaBand: Gold "Proof Glow" Accent Canvas

**Impact:** Low | **Effort:** S

**What & where:** The CtaBand at the bottom of the About page ("Not just speed. A trust path you can check.") is a flat dark strip. Add a subtle gold-accent ambient glow that reinforces the "proof / settlement / final" tone — matching the site's `--canopy-glow` gold token.

**Technical approach:**
- CSS-only: add a `::before` to `.cta-band` with `background: radial-gradient(80% 60% at 50% 110%, rgba(207,154,46,0.14), transparent 65%)`. Animates with a slow `opacity` pulse: `3s ease-in-out infinite alternate` between 0.7 and 1.0 opacity.
- Under `prefers-reduced-motion`: static, no animation.

**Extend:** `src/app/globals.css`.

**Guardrail:** Zero JS, zero bundle impact. Color intentionally dim — never competes with CTA button legibility.

---

### 10. ProtocolLifecycle: Keyboard / Click Step Navigation

**Impact:** Med | **Effort:** S

**What & where:** The step rail is currently scroll-only. For users who prefer keyboard or who read on wide screens where all cards are partially visible, allow clicking/tapping a step number in `LifecycleRail` to smooth-scroll to that card.

**Technical approach:**
- In `LifecycleRail`, wrap each circle+number group in a `<button>` element (transparent background, same dimensions as the `<g>` currently). On click, call `itemRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })` via a callback prop from `ProtocolLifecycle`.
- Add `aria-label={`Go to step ${step.number}: ${step.title}`}` to each button.
- Style: cursor pointer, `:focus-visible` outline using `var(--green-bright)` (already defined globally).

**Extend:** `src/components/site/ProtocolLifecycle.tsx`.

**Guardrail:** This is an accessibility improvement as much as a visual one. `smooth` scroll behaviour is suppressed by the existing `scroll-behavior: auto` in the `prefers-reduced-motion` rule in `globals.css`.

---

## Implementation Notes

### Component Patterns to Follow
The `MonolithShowcase.tsx` + `MonolithScene.tsx` split is the established pattern for all new R3F work:
- Showcase wrapper: lazy-mount via `IntersectionObserver`, `useSyncExternalStore` for reduced-motion, `next/dynamic` with `ssr: false`
- Scene inner: pure R3F, receives props, no DOM interaction
- `pixelRatio: Math.min(devicePixelRatio, 1.5)` on all new Canvases
- `gl={{ alpha: true, antialias: false }}` for background Canvases; `antialias: true` only for featured hero scenes

### Postprocessing Budget
`@react-three/postprocessing` `Bloom` is already used in `MonolithScene`. The LifecycleFlowScene (item 1) can share a composer instance if co-located. Items 2, 3, and 9 should not use Bloom — they are ambient-only canvases.

### `motion` Package Usage
The project uses `motion` v12 (framer-motion successor). Use `import { motion, MotionConfig } from "motion/react"`. Add `<MotionConfig reducedMotion="user">` to `src/app/layout.tsx` to globally suppress animations for users who have the OS preference set — this is the single place to hook it.

### Trust-Tone Guardrails
- No particle systems in the foreground of any content
- No looping bounce/scale effects on interactive elements
- Glow effects must use brand colours only (`--green-bright`, `--gold-bright`)
- 3D diagrams must read as schematics / engineering diagrams, not games
- Bloom strength should be ≤ 0.5 for mid-page contexts (reserve ≥ 1.0 for hero focal points)

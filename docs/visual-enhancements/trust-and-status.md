# Visual Enhancement Opportunities — Trust & Status Pages

Surfaces: **Security** (`/security`) and **Testnet/Status** (`/testnet`).

---

## Quick Wins (low effort, high visibility)

| # | Title | Where |
|---|-------|--------|
| QW-1 | Proof-state ambient pulse on `NetworkStatusWidget` | `NetworkStatusWidget.tsx` |
| QW-2 | Layer-ring glow driven by live `latestProofStatus` | `RootworkScene.tsx` |
| QW-3 | Scroll-reveal scanline / HUD overline on Security section heads | `security/page.tsx` CSS |
| QW-4 | Section-level radial root-glow gradient connectors | `globals.css` + page layout |

---

## Priority-Ordered Opportunities

---

### 1. Proof-State Ambient Pulse — `NetworkStatusWidget`

**Impact:** High — the widget is the only live-data element on the Testnet page; currently it is a static flat panel with no visual feedback that data changes.  
**Effort:** Low  

**What / Where:** Extend `NetworkStatusWidget.tsx` with a `motion` framer-motion `animate` wrapper around the `Proof` row value, and a thin border-pulse on the panel itself keyed to `latestProofStatus`.

**Technical approach:**
- Import `motion` from `"motion/react"`.
- Wrap the `<span className="v">` for the proof row in `<motion.span key={snap.l2.latestProofStatus} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>` — the `key` swap triggers re-animation on each proof-state transition.
- Apply a CSS custom property `--proof-hue` on the panel element driven by the three states: `pending` → `--text-faint` border, `generated` → `--gold-line` border with `box-shadow: 0 0 12px var(--gold-ghost)`, `settled` → `--green-glow` border with green shadow. Set these with a `style` prop, no JS animation needed for the border.
- The `updatedAt` timestamp already updates every 3 s; wrap it in `<motion.span key={snap.updatedAt} ...>` for a subtle fade-in on each poll tick.

**Existing component to extend:** `src/components/site/NetworkStatusWidget.tsx`  

**Guardrail:** The `chip--demo` label and the existing "Simulated feed" chip are preserved unchanged; the animation amplifies the existing status signal, it does not suggest new verified authority. Respect `prefers-reduced-motion` by passing `transition={{ duration: reduced ? 0 : 0.35 }}`.

---

### 2. Live-Data-Bound Layer Ring Glow in RootworkScene

**Impact:** High — the Rootwork scene on How-It-Works already has LAYERS with gold/green ring pulses; the `activity` prop currently takes a static 0.5. Wiring the real `NetworkSnapshot` makes the 3D scene a true live status artifact.  
**Effort:** Low–Medium  

**What / Where:** `RootworkShowcase.tsx` already accepts an `activity` prop and forwards it to `RootworkScene`. Add a `useNetworkSnapshot` call inside `RootworkShowcase` (or at the call-site in the page that embeds it) and compute `activity` from `snap.l2.throughput` (already 0–40 ops/s range). Separately, animate the `LayerRings` inside `RootworkScene` to tint the "Proof" ring gold-bright when `latestProofStatus === "generated"` or `"settled"` and dim it when `"pending"`.

**Technical approach:**
- In `RootworkShowcase.tsx`: add `const { data: snap } = useNetworkSnapshot()` and pass `activity={snap.l2.throughput / 40}` (clamped 0..1) to `<RootworkScene>`.
- In `RootworkScene.tsx`: add a `proofStatus: ProofStatus` prop alongside `activity`. In `LayerRings`, receive `proofStatus` and in `useFrame`, lerp `emissiveIntensity` of the "Proof" ring material from baseline 1.7 up to 3.2 when status is `generated` or `settled`, and down to 0.6 when `pending`. Use `THREE.MathUtils.lerp` with a damping factor of ~0.04 per frame for smooth transitions.
- The sap `speed` in `SceneContents` already reads `params.activity`; this wire-up makes sap flow visibly speed up when L2 throughput is higher — a direct metaphor for activity.

**Existing component to extend:** `src/components/scene/RootworkScene.tsx` + `src/components/site/RootworkShowcase.tsx`  

**Guardrail:** `RootworkShowcase` caption already reads "Verified activity flows down the roots…" — when data source is `"demo"`, keep the existing caption suffix so it reads `"· Simulated feed"`. Cap `dpr` at 1.5 on mobile to protect frame budget on the data-driven path. Honor `motionOn` (already wired from `prefers-reduced-motion`).

---

### 3. Batch-Queue Fill Bar — Animated Progress Indicator

**Impact:** High — the `batchQueueDepth` (0–24 ops, 18-second fill cycle) is the most kinetically interesting piece of data in `NetworkSnapshot`; it has no visual representation at all today.  
**Effort:** Low  

**What / Where:** Add a horizontal progress bar inside `NetworkStatusWidget` below the "Batch queue" row. The bar fills over the 18-second cycle and clears on cut — directly readable as "how full is the current batch?".

**Technical approach:**
- Derive `progress = snap.l2.batchQueueDepth / 24` (max from `network.ts` mock logic: `2 + cyclePos * 22` ≈ 24 max).
- Render a `<motion.div>` track with `width: "100%"` and a filled inner `<motion.div animate={{ scaleX: progress }} style={{ transformOrigin: "left" }} transition={{ duration: 0.6, ease: "easeOut" }}`.
- Color: `--green-dim` at < 50% fill, `--gold-dim` at 50–80%, `--gold-bright` above 80% — echoes the gold proof accent at peak batch pressure.
- On batch-cut (batchQueueDepth drops from high to ~2 between polls), the scaleX will snap down naturally on the next poll cycle.
- Height: 2px, same monospace font-size row as the other metrics. No label needed — the row label "Batch queue" already names it.

**Existing component to extend:** `src/components/site/NetworkStatusWidget.tsx`  

**Guardrail:** The "Simulated feed" chip stays above the widget; the batch bar uses the same muted color range as the existing chip palette — not loud enough to read as a live production indicator. `prefers-reduced-motion`: set `transition={{ duration: 0 }}`.

---

### 4. Proof Verification Flash — Gold Ring Burst on Status Transition

**Impact:** High — the proof lifecycle (`pending → generated → settled`) is the core trust event on both pages. A momentary gold bloom flash at transition communicates finality without being decorative.  
**Effort:** Medium  

**What / Where:** New small scene component `ProofPulseRing.tsx` — a single torus mesh in a minimal R3F Canvas (or added inline to `RootworkScene`) that emits a brief gold Bloom burst when `proofStatus` transitions to `"settled"`.

**Technical approach:**
- Track the previous `proofStatus` value in a `useRef`. On the frame where it changes to `"settled"`, trigger an animated scale from 0.2 to 1.8 + opacity 1 → 0 over ~1.2 s using a `useFrame` accumulator.
- The ring: `<torusGeometry args={[0.9, 0.014, 8, 80]}` with `meshStandardMaterial emissive={GOLD_BRIGHT} emissiveIntensity` driven from the accumulator (peaks at 4.0, decays exponentially). The `EffectComposer` `<Bloom>` already present in `RootworkScene` will catch the peak and spread it naturally.
- For the standalone Testnet page (where there is no R3F canvas), a pure CSS/motion alternative: a `<motion.div>` ring overlay on `NetworkStatusWidget` with `border: 1px solid var(--gold-bright)`, `borderRadius: "50%"`, positioned absolute, `animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}` triggered by a `key` prop change on settlement.

**Existing component to extend:** `src/components/scene/RootworkScene.tsx` (3D path); `src/components/site/NetworkStatusWidget.tsx` (CSS/motion path for testnet page)  

**Guardrail:** Burst is one-shot per state transition and lasts < 1.5 s — not a persistent loop. `prefers-reduced-motion`: skip the animation entirely (just update the color token). Transition is labeled "proof settled" in `aria-live="polite"` region inside the widget for screen readers.

---

### 5. Scroll-Driven Trust-Layer Illumination — Security Page

**Impact:** High — the Security page's four-guarantee `<Layers>` list (`Finality`, `Censorship resistance`, `Liveness`, `L1 anchoring`) scrolls past as plain dark panels. A subtle layer-by-layer emissive stripe emerging on scroll would echo the RootworkScene layer-ring metaphor and bridge the hero 3D to the page body.  
**Effort:** Medium  

**What / Where:** Extend the `Layers` / `layer-row` elements in `globals.css` + add a thin `position: absolute; left: 0` stripe element inside each `.layer-row`. Use the Intersection Observer already baked into `<Reveal>` to trigger a CSS class that animates the stripe in.

**Technical approach:**
- Add a `::before` pseudo-element to `.layer-row`: `position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--green-dim); transform: scaleY(0); transform-origin: bottom; transition: transform 0.5s var(--ease)`.
- For `n: "03"` (Proof) and `n: "04"` (L1 anchoring), use `var(--gold-dim)` instead of `--green-dim`.
- When `<Reveal>` fires (already triggers a CSS class on intersection), extend the class to also set `transform: scaleY(1)` on the `::before`.
- No JavaScript animation library needed — pure CSS, fully accessible.
- Optionally: `motion` `<motion.div>` on the stripe with `initial={{ scaleY: 0 }} animate={{ scaleY: inView ? 1 : 0 }}` for slightly more control over spring physics.

**Existing component to extend:** `src/app/globals.css` (`.layer-row` styles) + `src/components/site/Reveal.tsx`  

**Guardrail:** The stripe is a 2px decorative accent that carries no information beyond "this row is visible" — it does not label simulated data as live. `@media (prefers-reduced-motion: reduce)`: `transition: none`.

---

### 6. Block-Height Odometer — Monospace Rolling Counter

**Impact:** Medium — `snap.l1.blockHeight` increments every ~20 s (Cardano block time). An odometer-style counter that rolls each new digit makes L1 liveness legible at a glance.  
**Effort:** Low–Medium  

**What / Where:** Replace the static `#${fmt(snap.l1.blockHeight)}` text in `NetworkStatusWidget` with an animated digit-rolling component.

**Technical approach:**
- Build a tiny `<RollingNumber value={n} />` component: split the formatted number into individual digit characters. For each digit, use `<motion.span style={{ display: "inline-block" }} animate={{ y: prev !== curr ? ["-100%", "0%"] : "0%" }} transition={{ duration: 0.2, ease: "easeOut" }} key={`${position}-${curr}`}>`.
- On each `useNetworkSnapshot` poll (every 3 s), digits that changed animate in from above; unchanged digits stay static.
- Font: `var(--font-mono)`, color `var(--text-hi)`.
- On first render, skip the animation (`initial={{ y: 0 }}`) to avoid an entrance-roll from nothing.

**New component:** `src/components/site/RollingNumber.tsx` (reusable across both pages)  

**Guardrail:** The demo source produces a block height at ~20 s real cadence, so the roll fires at most ~3 times per minute — not distracting. `prefers-reduced-motion`: render as plain text with no transition.

---

### 7. Floating HUD Overlay — Testnet Page Section Connectors

**Impact:** Medium — the Testnet page below the hero is a sequence of flat text sections with large dark voids between them. A fixed low-opacity HUD layer (CSS `position: sticky` or CSS-only) with faint monospace coordinate labels and thin horizontal scan lines would give the page ambient depth without a full 3D scene.  
**Effort:** Low–Medium  

**What / Where:** Add a `TestnetHUDOverlay` client component rendered inside the Testnet page's `<main>` that overlays purely cosmetic `position: fixed; pointer-events: none` HUD chrome — scan lines, faint grid, corner brackets.

**Technical approach:**
- A `<div aria-hidden>` with `position: fixed; inset: 0; z-index: 5; pointer-events: none` containing:
  - Two horizontal SVG lines at ~15% and ~85% viewport height, 1px, `stroke: var(--panel-edge)`, 100% width.
  - Four corner-bracket `<svg>` elements (10×10 px L-shapes) at each corner, `stroke: var(--gold-line)`, opacity 0.3.
  - A faint vertical center rule: `left: 50%; width: 1px; background: var(--panel-edge); opacity: 0.4`.
- Animate the scan lines to slowly drift vertically with `motion` `animate={{ y: ["0%", "2%"] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}`.
- This is the lowest GPU-cost option — SVG only, no canvas, no WebGL.

**New component:** `src/components/site/TestnetHUDOverlay.tsx`  

**Guardrail:** `aria-hidden="true"` throughout; `@media (prefers-reduced-motion: reduce)` removes the scroll animation entirely. No data values shown here — purely structural chrome.

---

### 8. Challenge-Window Open Indicator — Amber Alert State

**Impact:** Medium — `snap.l2.challengeWindowOpen` (`true` when `latestProofStatus === "generated"`) is a meaningful trust signal: it means a proof exists but the dispute period is still live.  
**Effort:** Low  

**What / Where:** Add a conditional row to `NetworkStatusWidget` that appears only when `challengeWindowOpen === true`, showing "Challenge window · open" with a pulsing amber dot.

**Technical approach:**
- Conditionally render a `<Row k="Challenge" v="OPEN" />` row when `snap.l2.challengeWindowOpen`.
- The dot uses the existing `.dot` class CSS but with `background: var(--gold-bright)` override and a `@keyframes pulse` animation at 1.5 s period.
- On `challengeWindowOpen` becoming `false` (window closes after settlement), use `<AnimatePresence>` + `<motion.div exit={{ opacity: 0, height: 0 }}>` for a graceful collapse.
- Alternatively: always show the row but style it dim when closed — reduces layout shift.

**Existing component to extend:** `src/components/site/NetworkStatusWidget.tsx`  

**Guardrail:** The row must carry a tooltip or adjacent label clarifying this is a simulated challenge window, not a live Cardano-chain event. `aria-live="polite"` on the widget container surfaces state changes to screen readers. `prefers-reduced-motion`: no dot pulse.

---

### 9. Proof-Flow Minimap — Inline 3D Accent (Testnet Page)

**Impact:** High — the Testnet page currently has zero 3D after the hero. A small (~220px tall) inline R3F canvas showing a stylized batch-to-proof-to-settlement pipeline visualization would anchor the "Deployed and verifiable surfaces" section. Three cubes (batch → proof → L1) connected by an animated particle tube, colored green → gold → green.  
**Effort:** High  

**What / Where:** New component `src/components/scene/ProofFlowScene.tsx` rendered via a lazy `dynamic()` import in `testnet/page.tsx` in the `#whats-live` section, adjacent to `NetworkStatusWidget`.

**Technical approach:**
- Three `<mesh>` box geometries arranged left-to-right: "Batch" (green emissive), "Proof" (gold, scales up/down with `latestProofStatus`), "L1" (gold, fixed, glows on `settled`).
- Between each pair: a `<TubeGeometry>` along a `CatmullRomCurve3`, with animated sap particles using the same pattern as `RootworkScene.tsx` `Sap` component (reuse the existing PRNG + curve traversal logic). Particle speed: `throughput / 40`.
- When `latestProofStatus === "pending"`: batch cube pulses green, proof cube dim. `"generated"`: proof cube brightens gold, challenge-window ring renders around it. `"settled"`: settlement L1 cube flares gold + bloom burst.
- `EffectComposer` with `<Bloom intensity={0.7} luminanceThreshold={0.55}>`.
- `dpr={[1, 1.5]}`, `frameloop="demand"` updated only on `snap` change for minimal GPU cost.
- Lazy-loaded via `dynamic(() => import(...), { ssr: false })` with IntersectionObserver gate (same pattern as `RootworkShowcase`).

**New component:** `src/components/scene/ProofFlowScene.tsx`  

**Guardrail:** Scene must be framed with an eyebrow label "SIMULATED · L2 PIPELINE" in monospace text above it. `frameloop="demand"` limits GPU use to data-change moments. `prefers-reduced-motion`: render as a static SVG diagram fallback (three labeled boxes, two arrows). This is the highest-effort item and should only ship after QW items are verified.

---

### 10. Roots-to-Page Gradient Bleed — Section Connector

**Impact:** Medium — addresses the "flat black void" below the Security page hero. The existing security backdrop ends abruptly above the first Section.  
**Effort:** Low  

**What / Where:** Add a CSS-only transitional element between the `<PageHero>` and the first `<Section>` in `security/page.tsx` — a `position: relative` div with a tall radial gradient using `--root-glow` and `--gold-ghost` that simulates the root illumination continuing downward.

**Technical approach:**
- After `</PageHero>` in `security/page.tsx`, insert: `<div aria-hidden style={{ height: "clamp(80px, 12vh, 160px)", background: "linear-gradient(to bottom, transparent, var(--basalt) 60%)", marginTop: -1 }} />`.
- In `globals.css`, strengthen `.security-backdrop` so it extends 20vh further down via `height: 120vh` instead of `100vh` with a bottom fade — this alone closes most of the void.
- For the guarantee-section background: add a faint `radial-gradient(60% 30% at 20% 50%, var(--gold-ghost), transparent)` pseudo-element on `#guarantees .section__inner`.

**Existing component to extend:** `src/components/SecurityPageBackdrop.tsx` + `globals.css`  

**Guardrail:** Purely CSS; no data displayed; accessible by definition. Keep the gradient subtle (opacity < 0.15 for gold, < 0.10 for green) so it reads as ambient depth, not aggressive decoration.

---

## Summary Table

| Priority | Title | Impact | Effort | Type |
|----------|-------|--------|--------|------|
| QW-1 / #1 | Proof-state widget pulse | High | Low | motion overlay |
| QW-2 / #2 | Live-data layer ring glow | High | Low | R3F data-bind |
| QW-3 / #3 | Batch-queue fill bar | High | Low | motion overlay |
| #4 | Proof verification flash | High | Medium | R3F + motion |
| #5 | Scroll-driven trust layer illumination | High | Medium | CSS + motion |
| QW-4 / #10 | Roots-to-page gradient bleed | Medium | Low | CSS |
| #6 | Block-height odometer | Medium | Low–Medium | motion |
| #7 | Floating HUD overlay | Medium | Low–Medium | CSS + SVG |
| #8 | Challenge-window indicator | Medium | Low | motion |
| #9 | Proof-flow minimap (3D) | High | High | R3F new scene |

---

## Implementation Notes

**Simulated-vs-live labeling rule (all items):** Any element that renders a value from `NetworkSnapshot` where `source === "demo"` must either (a) inherit the existing page-level "Simulated feed" chip without adding new trust signals, or (b) carry its own co-located label. No new metric surface should be added without a `chip--demo` or equivalent monospace overline that makes the simulation status unambiguous. This is especially critical for #9 (ProofFlowScene) and #4 (proof burst), which are the most visually authoritative.

**Shared prefers-reduced-motion pattern:** All motion items should read the same `useSyncExternalStore` pattern already in `RootworkShowcase.tsx` and pass `motionOn={!reduced}` or set `transition={{ duration: reduced ? 0 : N }}`. Do not duplicate the subscription logic — extract `useReducedMotion()` into `src/lib/useReducedMotion.ts` as a shared hook.

**Performance budget:** The Security page already has one R3F Canvas (`RootworkShowcase`). The Testnet page has none. Adding #9 (ProofFlowScene) to Testnet gives Testnet its first canvas — acceptable. Do not add a second canvas to Security unless #9 is deferred; two simultaneous WebGL contexts on mobile is inadvisable.

**Trust tone guardrail:** Items that visualize L2 data (batch queue, proof status, throughput) must use the established muted color vocabulary — `--green-dim`, `--gold-dim`, `--gold-line` — rather than full-brightness `--green-bright` or `--gold-bright` for idle/pending states. Bright emissives should only fire on proof-settled events, matching the gold = proof = settled metaphor already established in `RootworkScene`.

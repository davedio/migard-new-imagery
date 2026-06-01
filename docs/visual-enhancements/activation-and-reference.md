# Visual Enhancement Opportunities — Activation & Reference

**Scope:** `get-started`, `docs`, `faq`, `official-links` pages  
**Aesthetic target:** dark ancient-tech / trust architecture; green fluid smoke → gold glowing roots; near-black voids replaced by ambient depth without gimmicks.  
**Key constraint:** FluidScene is a fixed, full-viewport canvas that only fires at the top of the viewport — below the hero the pages are **pure `#07120b` black with no visual counterpart**. This is the primary problem.

---

## Quick Wins (≤ 1 day each)

| # | Title | Page(s) | What |
|---|-------|---------|------|
| QW-1 | Hero veil fade-out | All four | Let the hero's `#07120b` overlay dissolve into the page body, visually "continuing" the fluid instead of chopping it |
| QW-2 | Section divider glows | get-started, docs | A 1 px horizontal rule with a radial gold/green gradient centre — replaces the hard black gap between sections |
| QW-3 | Card hover shimmer | get-started, docs | Add a `motion`-driven radial shimmer that chases the mouse position within `.panel` cards |
| QW-4 | Scroll-driven FluidScene opacity | All four | Bind FluidScene's darkening-veil alpha to a CSS custom property updated via `IntersectionObserver` or scroll listener, so the mist brightens as the user scrolls into card areas |
| QW-5 | Bullets ambient dot | get-started | Replace the plain bullet `•` with a tiny pulsing green circle SVG (reuse `.chip--live .dot` animation) |

---

## Opportunity Catalogue

### 1. Scroll-Responsive Fluid Overlay — Extended Hero "Breathing"

**Impact: High / Effort: Low**

**What & Where:** `FluidScene.tsx` + the darkening veil div. Currently the veil gradient is static (`rgba(6,13,9,0.5)` → `rgba(5,12,8,0.62)`). As the user scrolls, the hero area becomes viewport-invisible but the fixed canvas continues running behind all sections — it just appears completely black because the static veil is too dark and there are no mid-page transparent areas.

**Technical approach:**  
In `FluidScene.tsx`, expose a CSS custom property `--veil-alpha` on `:root` and drive it from a scroll listener:

```ts
// in FluidScene.tsx (client component)
const handleScroll = () => {
  const t = Math.min(window.scrollY / 400, 1);
  // lighten the veil mid-page, darken at deep scroll so text stays legible
  const alpha = 0.50 + 0.18 * Math.sin(t * Math.PI);
  document.documentElement.style.setProperty('--veil-alpha', String(alpha));
};
window.addEventListener('scroll', handleScroll, { passive: true });
```

Then use `var(--veil-alpha)` in the veil background string. The fluid rises through the sections as if "breathing upward".

**Component to extend:** `src/components/scene/FluidScene.tsx` — veil div style.  
**Guardrail:** Passive scroll listener, no layout thrash; skip the update if `prefers-reduced-motion` is set (keep veil fully opaque → no animated breathing).

---

### 2. Per-Section Ambient Glow Layer (CSS Only)

**Impact: High / Effort: Very Low**

**What & Where:** `src/app/globals.css` `.section` class. Every `<Section>` wraps in a full-width `<section class="section">` with a black background that fully occludes the WebGL canvas below.

**Technical approach:**  
Add a subtle radial gradient overlay to `.section` using its `::before` pseudo-element (not a new element):

```css
.section::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(70% 42% at 50% 0%, rgba(32, 190, 67, 0.04) 0%, transparent 100%),
    radial-gradient(60% 38% at 50% 100%, rgba(183, 121, 31, 0.035) 0%, transparent 100%);
  z-index: 0;
}
```

Pair this with setting the section background to `transparent` (or `rgba(7,18,11,0.82)` instead of hard black) so the FluidScene bleeds through at reduced opacity.

**Component:** `globals.css` → `.section` rule.  
**Guardrail:** Pure CSS, no JS, no GPU impact; the semi-transparent section background replaces no accessibility features.

---

### 3. Layered Row Connector Lines — `Layers` Component

**Impact: Medium / Effort: Low**

**What & Where:** `get-started` page, Integration section. The four `<Layers>` rows (Throughput flow / Wallet path / Settlement path / Error path) are `.layer-row.panel` — styled panels with number, name, and desc. Currently they read as disconnected rectangles floating in black.

**Technical approach:**  
Add a vertical connecting "wire" running down the left edge of the `.layers` container using a CSS gradient line with green glow dots at each item:

```css
.layers {
  position: relative;
}
.layers::before {
  content: "";
  position: absolute;
  left: calc(var(--gut) + 18px); /* align with the .n column centre */
  top: 24px; bottom: 24px; width: 1px;
  background: linear-gradient(180deg,
    var(--green-ghost) 0%,
    var(--green-dim) 40%,
    var(--gold-dim) 80%,
    transparent 100%
  );
}
```

The `.n` number column already exists — a `::after` green circle badge on `.layer-row:not(:last-child)` creates a "flow path" suggesting data moving through L2 → settlement.

**Component:** `globals.css` → `.layers` + `src/components/site/ui.tsx` `Layers` component (add `relative` wrapper, no API change).  
**Guardrail:** Pure CSS; no motion; fully legible if colours are off.

---

### 4. Card Grid Background Depth Field

**Impact: High / Effort: Low–Medium**

**What & Where:** `get-started` Roles section (6 cards) and Docs page (4 cards). The `CardGrid` renders a flat grid of `.card.panel` elements on pure black.

**Technical approach:**  
Add a `motion`-powered radial "depth field" behind the card grid that follows mouse position. This is a CSS-only ambient glow blob that moves on `mousemove`:

```tsx
// New client wrapper: <CardGridAmbient> wraps <CardGrid>
"use client";
import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

export function CardGridAmbient({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const bg = useTransform([x, y], ([mx, my]) =>
    `radial-gradient(60% 50% at ${mx}% ${my}%, rgba(32,190,67,0.07) 0%, transparent 70%)`
  );
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width) * 100);
    y.set(((e.clientY - rect.top) / rect.height) * 100);
  };
  return (
    <div style={{ position: "relative" }} onMouseMove={handleMove}>
      <motion.div aria-hidden style={{ position: "absolute", inset: 0, background: bg, pointerEvents: "none" }} />
      {children}
    </div>
  );
}
```

Wrap `<CardGrid>` calls in pages that need it.

**Component:** New `src/components/site/CardGridAmbient.tsx`. Pages `get-started/page.tsx` and `docs/page.tsx` import and wrap.  
**Guardrail:** `motion`-driven CSS variable, no WebGL; falls back to nothing if JS disabled; skip on touch devices with a `matchMedia('(hover: none)')` check.

---

### 5. Scroll-Driven Hero-to-Body Gradient Bridge

**Impact: High / Effort: Low**

**What & Where:** `page-hero` header bottom edge. Looking at the screenshots, the sharp cut between the hero (green fluid mist) and the first section (pitch black) is the most visually jarring seam. The `.page-hero` ends and the black `.section` begins with zero transition.

**Technical approach:**  
Add a CSS `::after` to `.page-hero` that functions as a downward gradient bridge:

```css
.page-hero::after {
  content: "";
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: clamp(80px, 12vh, 140px);
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(7, 18, 11, 0.72) 60%,
    var(--deep-ink) 100%
  );
  pointer-events: none;
}
```

Then add a reciprocal top bridge to `.section:first-of-type` so the sections fade _in_ from the hero's colours:

```css
.section:first-of-type {
  position: relative;
}
.section:first-of-type::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 80px;
  background: linear-gradient(180deg, rgba(7,18,11,0) 0%, transparent 100%);
  pointer-events: none;
}
```

**Component:** `globals.css` — `.page-hero` and `.section` selectors.  
**Guardrail:** Pure CSS, no motion, no GPU cost.

---

### 6. FAQ — Subtle Group Dividers and Question Accent

**Impact: Medium / Effort: Very Low**

**What & Where:** `faq/page.tsx` → `<Faq>` component. Screenshots show a long list of text groups against black with no visual hierarchy beyond font size. The `faq-group` h3 headings are the only markers.

**Technical approach:**  
- Add a left border "tab" glow to each `.faq-group h3` using the gold token: `border-left: 2px solid var(--gold-line); padding-left: 12px;`
- Add a `::before` micro-line above each `.faq-item .q` (question row) using green: `border-top: 1px solid var(--green-ghost); padding-top: 10px;`
- Optionally: `motion`-powered accordion expand on click (toggle `.a` height with `motion/react` `AnimatePresence`), improving readability on long FAQ sections without adding visual noise

**Component:** `globals.css` → `.faq-group h3`, `.faq-item`; optionally refactor `Faq` in `ui.tsx` to a client component with accordion.

**NOTE — RESTRAINT FLAG:** The FAQ is the page people use to quickly find answers. Do NOT add 3D elements here. The accordion and the gold/green accent lines are the appropriate enhancement limit. Any animated background on this page will actively harm usability.

---

### 7. Official Links — Link Row Hover State + Pending Glow

**Impact: Medium / Effort: Very Low**

**What & Where:** `official-links/page.tsx` → `<LinksTable>` component. Currently each `.links-row` is a plain div. "Publishing soon" rows have `.v.pending` class but are visually identical to live rows.

**Technical approach:**  
- Add a hover state to `.links-row` that draws a left-border flash and a mild background tint: `background: rgba(32,190,67,0.04)` on hover
- Differentiate pending rows with a gold dim colour and a subtle `opacity: 0.6` so users can skim faster
- For live link rows: add a `→` arrow that shifts right on hover via CSS `transform: translateX(3px)`

```css
.links-row {
  transition: background 0.2s var(--ease);
  border-left: 2px solid transparent;
}
.links-row:has(.v:not(.pending)):hover {
  background: rgba(32, 190, 67, 0.035);
  border-left-color: var(--green-ghost);
}
.links-row .v.pending {
  color: var(--text-faint);
  font-style: italic;
}
```

**Component:** `globals.css` → `.links-row`, `.links-table`.

**NOTE — RESTRAINT FLAG:** This page is a trust/safety resource. Users navigating here are actively trying to verify official URLs. Do NOT add 3D, animations, or ambient effects that could distract from or visually obscure the actual link text. The hover tint and pending dimming are the absolute ceiling of appropriate enhancement here.

---

### 8. Scroll-Linked FluidScene Parallax Shift (r/f WebGL)

**Impact: Medium–High / Effort: Medium**

**What & Where:** `FluidScene.tsx`. The fluid background is static relative to the viewport. Adding a slow scroll-linked offset to the GLSL uniforms would make the mist appear to rise as the user scrolls down — continuous world metaphor.

**Technical approach:**  
Expose a `u_scroll` uniform in `FluidScene`'s FRAG shader and add a scroll driver:

```glsl
// in FRAG shader
uniform float u_scroll;
// ...
vec2 grav = vec2(0.0, t * u_gravity * 1.5 + u_scroll * 0.08);
```

```ts
// in FluidScene.tsx useEffect
const onScroll = () => {
  const s = window.scrollY / window.innerHeight;
  gl.useProgram(prog);
  gl.uniform1f(uScroll, s);
};
window.addEventListener('scroll', onScroll, { passive: true });
```

This makes the smoke appear to slowly drift upward as you scroll down, as if the page is descending into deeper roots — consistent with the world-tree metaphor.

**Component:** `src/components/scene/FluidScene.tsx`.  
**Guardrail:** Passive scroll handler; skip the uniform update when `prefers-reduced-motion` matches (already handled by `reduce` flag that stops RAF).

---

### 9. Section "Root Wire" Ambient Texture (GLSL, Optional / High-effort)

**Impact: High / Effort: High**

**What & Where:** Inter-section void space on `get-started` (the largest offender — ~70% black in the screenshot). New optional ambient component that could appear between specific sections.

**Technical approach:**  
A new lightweight `AmbientRootStrands.tsx` client component using a `<canvas>` with a stripped-down GLSL shader (no fbm, simpler than FluidScene) that renders 5–8 thin glowing vertical lines with subtle sine-wave wobble — evoking mycelium or root filaments:

```glsl
// Simplified strand fragment shader
float strand(vec2 uv, float xPos, float t, float freq) {
  float x = uv.x - xPos;
  float wave = sin(uv.y * freq + t) * 0.004;
  float dist = abs(x - wave);
  return smoothstep(0.006, 0.0, dist);
}
void main() {
  float s = strand(vUv, 0.18, t, 8.0) 
          + strand(vUv, 0.44, t*0.7, 6.0)
          + strand(vUv, 0.72, t*1.1, 9.0);
  vec3 col = mix(vec3(0.125,0.745,0.263), vec3(0.878,0.639,0.235), vUv.y);
  gl_FragColor = vec4(col * s, s * 0.55);
}
```

Mount it as `position: absolute; inset: 0; opacity: 0.18; pointer-events: none; z-index: -1` inside a `<Section>` inner wrapper.

**Component:** New `src/components/scene/AmbientRootStrands.tsx`. Import conditionally into `get-started` "Roles" section (the 6-card section with the most vertical void).  
**Guardrail:** Hard max opacity 0.2; skip mount if `prefers-reduced-motion`; lazy-loaded as it would be below-the-fold.

---

### 10. CtaBand Bloom / Glow Enhancement

**Impact: Medium / Effort: Low**

**What & Where:** All four pages end with `<CtaBand>`. Currently `.cta-band` is a section with `.cta-band__inner`. On the `get-started` screenshot the CTA band is partially visible but visually flat.

**Technical approach:**  
Add a radial glow "beacon" behind the CTA band heading, using CSS + the existing `--green-glow` token:

```css
.cta-band {
  position: relative;
  overflow: clip;
}
.cta-band::before {
  content: "";
  position: absolute;
  inset: -60px;
  background: radial-gradient(50% 60% at 50% 50%,
    rgba(32, 190, 67, 0.12) 0%,
    rgba(183, 121, 31, 0.06) 50%,
    transparent 80%
  );
  pointer-events: none;
}
```

Also add `motion`-based scale-pulse on the primary CTA button (already `.btn--primary`) on hover:

```tsx
// CtaBand can stay server component; the btn pulse uses CSS
.btn--primary:hover {
  box-shadow: inset 0 0 24px rgba(32, 190, 67, 0.22),
    0 8px 30px -12px var(--green-glow),
    0 0 60px -20px rgba(32, 190, 67, 0.15); /* add outer halo */
}
```

**Component:** `globals.css` → `.cta-band`.  
**Guardrail:** CSS only; no animation, no GPU overhead beyond what existing box-shadows already do.

---

## Priority Order

1. **[QW-3] Hero → body gradient bridge** (Opportunity 5) — fixes the most jarring visual cut, pure CSS, 15 min
2. **[QW-1/2] Per-section ambient glow + section `::before` radial** (Opportunity 2) — makes the full page feel lit, pure CSS, 20 min
3. **[QW-4] Scroll-driven FluidScene veil** (Opportunity 1) — makes the fluid "breathe" through sections, ~40 min in FluidScene.tsx
4. **Layers connector wire** (Opportunity 3) — elegant data-flow metaphor for get-started integration section, CSS only, 20 min
5. **Card grid ambient depth field** (Opportunity 4) — interactive depth on the most content-dense sections, ~2h new component
6. **CtaBand glow** (Opportunity 10) — polish pass on all page endings, CSS, 15 min
7. **FAQ group dividers** (Opportunity 6) — restrained readability improvement, CSS, 15 min
8. **Official links hover state** (Opportunity 7) — trust-safe micro-interaction, CSS, 15 min
9. **Scroll-linked FluidScene parallax** (Opportunity 8) — deeper world metaphor, ~1h GLSL edit
10. **Ambient root strands** (Opportunity 9) — richest effect but most effort; best deferred until the cheaper wins are validated

---

## Explicit Restraint Flags

**FAQ page (`faq/page.tsx`):**  
Readability-first. Users are scanning for factual answers to security, product, and integration questions. Maximum enhancement: left gold-border on group headings, green micro-line above each question row, optional accordion expand. Zero 3D. Zero particle effects. Zero animated backgrounds.

**Official Links page (`official-links/page.tsx`):**  
Trust-critical surface. Any visual noise that makes links harder to scan or easier to overlook creates a safety risk (phishing confusion). Maximum enhancement: pending-row dimming, live-row hover tint, `→` arrow nudge. Absolutely no 3D, no animated overlays, no bloom behind the link table. The Callout safety section must remain visually dominant.

**Performance note across all surfaces:**  
FluidScene already runs a full-screen GLSL RAF loop. Avoid adding a second WebGL canvas on the same page. Prefer CSS custom properties + `motion`-driven CSS transforms over additional canvases. If AmbientRootStrands (Opportunity 9) is pursued, it must be lazy-loaded and should share the page's existing WebGL context if possible.

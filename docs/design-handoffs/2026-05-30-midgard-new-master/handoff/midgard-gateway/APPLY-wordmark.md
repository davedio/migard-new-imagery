# Apply the Midgard wordmark spotlight to production (branch → Vercel)

Adds the **cursor-spotlight "Midgard" wordmark** (Syne; a soft green circle
follows the pointer, letters spread slightly, ease back slowly on leave) as a
reusable component. Additive — `main` stays your backup.

> Built to match the live reference at
> `ui_kits/website/experiments/wordmark-spotlight.html`.

---

## 1. Add the component

Copy `src/components/MidgardWordmark.tsx` into your repo (same path).

## 2. Make Syne available as a font variable

In `src/app/layout.tsx`, add Syne to your `next/font` imports and expose it as
`--font-syne`:

```diff
- import { Poppins, Inter, JetBrains_Mono } from "next/font/google";
+ import { Poppins, Inter, JetBrains_Mono, Syne } from "next/font/google";

+ const syne = Syne({ subsets: ["latin"], weight: ["600","700","800"], variable: "--font-syne", display: "swap" });
```

…and add `syne.variable` to the `<html className={…}>` list alongside the others.

> If you're also moving the whole site's display face to Syne, point
> `--font-display` at `var(--font-syne)` in `globals.css`. The component works
> either way — it reads `--font-syne` directly.

## 3. Use it

Anywhere you render the "Midgard" wordmark as text — e.g. the splash lockup or a
hero. Size it with normal CSS (font-size on a wrapper or via `className`):

```tsx
import MidgardWordmark from "@/components/MidgardWordmark";

<h1 style={{ fontSize: "clamp(56px,11vw,128px)" }}>
  <MidgardWordmark />
</h1>

// tighter spotlight, custom text:
<MidgardWordmark text="Midgard" radius={110} />
```

> Note: it's a live text treatment, not the small nav logo (that stays the
> tree-mark PNG + static wordmark). Best on a large wordmark the user will
> actually sweep the cursor across.

## 4. Ship on a branch

```bash
git checkout -b feature/wordmark-spotlight
git add src/components/MidgardWordmark.tsx src/app/layout.tsx
git commit -m "Add Syne cursor-spotlight Midgard wordmark"
git push -u origin feature/wordmark-spotlight
```

Vercel preview-deploys the branch automatically; `main` is untouched. Merge a PR
to keep it, or delete the branch to back out.

---

## Knobs

- `radius` prop — spotlight circle size (px). Default 130.
- Easing (in `MidgardWordmark.tsx`, the `loop`): `0.12` = open speed, `0.025` =
  green fade-out, `0.05` = spread-open, `0.007` = spread settle-back (lower =
  slower).
- Colors: base white `#eaf2ec`, spotlight green `#3be863` — both inline in the
  `<style jsx>` block.
- Honors `prefers-reduced-motion` (static white wordmark).

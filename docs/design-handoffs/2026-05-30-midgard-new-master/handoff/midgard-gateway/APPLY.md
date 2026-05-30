# Apply the fluid "mist" to midgard-gateway child pages (branch → Vercel)

This adds the **WebGL mist background** to every Midgard **child page**
(`/users`, `/builders`, `/how-it-works`, `/security`, `/docs`, `/testnet`,
`/faq`, `/official-links`) — **not** the home hero (`/home`, keeps the
world-tree) and **not** the splash (`/`). Calm, dim, no controls, no pointer
interaction.

Everything is additive — your `main` branch is the backup. To undo, don't merge
the branch (or delete it).

> Built against your real source (`src/app/(site)/layout.tsx`, `globals.css`).
> I can't push to your GitHub or trigger Vercel from here — these are the exact
> steps for you. ~4 commands.

---

## 1. Add two files

Copy these from the handoff folder into your repo at the same paths:

- `src/components/scene/FluidScene.tsx` — the WebGL mist (client component, fixed
  full-viewport canvas at `z-index:0` with a legibility veil).
- `src/components/InteriorFluidBackground.tsx` — a tiny client wrapper that uses
  `usePathname()` to render the mist **only** on child routes (skips `/` and
  `/home`).

## 2. Mount it in the (site) layout

`src/app/(site)/layout.tsx`:

```diff
  import type { ReactNode } from "react";
  import { SiteNav } from "@/components/site/SiteNav";
  import { SiteFooter } from "@/components/site/SiteFooter";
+ import InteriorFluidBackground from "@/components/InteriorFluidBackground";

  export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
      <>
+       <InteriorFluidBackground />
        <SiteNav />
        {children}
        <SiteFooter />
      </>
    );
  }
```

That's it. The mist sits at `z-index:0` (above the root `.world-bg`, below the
`.content` / `.page-main` layer at `z-index:10`), so all page text stays on top
and readable. The home hero is untouched because the wrapper returns `null` on
`/home`.

> If you'd rather scope it even tighter (e.g. only specific routes), edit the
> guard in `InteriorFluidBackground.tsx`.

## 3. Ship it on a branch (Vercel auto-previews)

```bash
git checkout -b feature/child-page-mist
git add src/components/scene/FluidScene.tsx src/components/InteriorFluidBackground.tsx src/app/\(site\)/layout.tsx
git commit -m "Add fluid mist background to child pages"
git push -u origin feature/child-page-mist
```

Vercel builds a **Preview Deployment** for the branch automatically and posts a
unique preview URL. `main` / production stay untouched — your safe backup.

## 4. Keep or revert

- **Keep:** open a PR `feature/child-page-mist` → `main` and merge.
- **Back out:** don't merge. Optionally `git push origin --delete feature/child-page-mist`.

---

## Notes / knobs

- Palette is baked into the fragment shader to match `globals.css`. The line
  `vec3 ink=…, green=…, gbri=…, gold=…;` and the `mix()` / `smoothstep()` stops
  control the balance.
- `const G = 0.6, S = 0.6, Wl = 0.45;` in `FluidScene.tsx` = gravity / flow speed
  / swirl. Lower = calmer.
- The legibility veil is the last `<div>` in `FluidScene.tsx`
  (`linear-gradient(180deg, rgba(6,13,9,0.5), rgba(5,12,8,0.62))`) — lighten it
  for a more visible mist, darken it for more text contrast.
- Honors `prefers-reduced-motion` (renders one static frame).
- Caps DPR at 2 for performance.
- A live reference of the same effect runs in this design system at
  `ui_kits/website/index.html` (navigate to any child page — Users / Builders /
  Security / Docs).

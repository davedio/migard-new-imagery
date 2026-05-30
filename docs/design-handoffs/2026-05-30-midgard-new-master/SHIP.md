# SHIP — Midgard Design System → GitHub (via Codex)

This is the complete **Midgard** design package. It contains the brand design
system, an interactive UI-kit recreation of the marketing gateway, the
interaction experiments, and **production-ready `.tsx` components** for the real
Next.js app (`midgard-gateway`).

There are two things to publish — pick either or both.

---

## A. Publish the design system as its own repo (reference / skill)

The whole project is a self-contained design system. To put it on GitHub as-is:

```bash
cd midgard-design          # the unzipped folder
git init
git add -A
git commit -m "Midgard design system: tokens, UI kit, experiments, handoff"
git branch -M main
git remote add origin git@github.com:<you>/midgard-design.git
git push -u origin main
```

Open `ui_kits/website/index.html` in a browser to see the kit run (splash →
home → child pages). No build step — it's static HTML + CDN React/Babel.

## B. Ship the production components into `midgard-gateway`

The `handoff/midgard-gateway/` folder mirrors your app's structure. Two features,
each additive and each on its own branch so `main` stays safe:

**1. Fluid mist on child pages** — see `handoff/midgard-gateway/APPLY.md`
- add `src/components/scene/FluidScene.tsx` + `src/components/InteriorFluidBackground.tsx`
- one 3-line edit to `src/app/(site)/layout.tsx`
- `git checkout -b feature/child-page-mist` → commit → push → Vercel preview

**2. Syne cursor-spotlight wordmark** — see `handoff/midgard-gateway/APPLY-wordmark.md`
- add `src/components/MidgardWordmark.tsx`
- wire **Syne** via `next/font` in `src/app/layout.tsx` (and optionally point
  `--font-display` at `var(--font-syne)` in `globals.css` to make Syne the
  system display face, which is what this system standardized on)
- `git checkout -b feature/wordmark-spotlight` → commit → push → Vercel preview

Each `APPLY*.md` has the exact diffs and git commands. Merge the PR to keep a
feature, delete the branch to back it out.

> **Splash:** intentionally unchanged — it keeps the existing world-tree image
> lockup. (The animated-roots splash was explored in `experiments/` and dropped.)

---

## What's in this package

```
README.md              Brand context · content & visual foundations · iconography
SKILL.md               Agent-Skill manifest (use as a downloadable Claude skill)
colors_and_type.css    Design tokens — Syne/Inter/JetBrains Mono, full palette
midgard.css            Component layer — buttons, chips, panels, cards, ambient bg
assets/                Logo, world-tree icon, hero image
preview/               Design System tab cards (type · color · spacing · components · brand)
ui_kits/website/       Interactive gateway recreation (index.html) + JSX components
  └ experiments/       wordmark-spotlight.html  (the cursor-spotlight wordmark)
handoff/midgard-gateway/
  ├ APPLY.md                          mist → child pages
  ├ APPLY-wordmark.md                 Syne spotlight wordmark
  └ src/components/…                  FluidScene.tsx · InteriorFluidBackground.tsx · MidgardWordmark.tsx
```

## Decisions locked in this round
- **Display font:** Syne (system-wide), Inter body, JetBrains Mono labels.
- **Wordmark:** all-white Syne with a compact green cursor-spotlight; opens
  gently, settles back slowly.
- **Child pages:** calm WebGL mist (no pointer interaction); **hero/splash** keep
  the world-tree.
- **Gold:** brightened to `#cf9a2e` (yellower, keeps the brown root tint).

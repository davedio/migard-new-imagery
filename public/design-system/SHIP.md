# SHIP — Midgard Design System → GitHub

This is the **Midgard** design package: the brand design system, an interactive
UI-kit recreation of the marketing gateway, and the interaction experiments.

## Publish the design system as its own repo (reference / skill)

The whole project is a self-contained design system. To put it on GitHub as-is:

```bash
cd midgard-design          # the unzipped folder
git init
git add -A
git commit -m "Midgard design system: tokens, UI kit, experiments"
git branch -M main
git remote add origin git@github.com:<you>/midgard-design.git
git push -u origin main
```

Open `ui_kits/website/index.html` in a browser to see the kit run (splash →
home → child pages). No build step — it's static HTML + CDN React/Babel.

> **Production components are already upstream.** The earlier handoff features —
> the child-page **fluid mist** (`FluidScene` / `InteriorFluidBackground`) and the
> **Syne cursor-spotlight wordmark** (`MidgardWordmark`) — have been merged into
> `midgard-gateway` `main`. The standalone `handoff/` package has been removed
> from this system because it is no longer pending work.

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
  └ experiments/       wordmark-spotlight.html  (the Syne cursor-spotlight wordmark)
```

## Decisions locked in this round
- **Source of truth:** synced to `davedio/midgard-gateway` `main` (`src/app/globals.css`).
- **Display font:** Syne (system-wide), Inter body, JetBrains Mono labels.
- **Wordmark:** all-white Syne with a compact green cursor-spotlight.
- **Child pages:** calm WebGL mist; **`/security`** uses a tree-roots photo backdrop;
  **hero/splash** keep the world-tree.
- **Gold:** `#cf9a2e` (yellower, keeps the brown root tint); bright `#e0a33c`.
- **Navigation:** Home · How It Works · Security · Testnet · FAQ · About · Docs,
  with a **Get Started** CTA. `/users`, `/builders`, `/partners` fold into `/get-started`.
- **Footer:** built-by **Anastasia Labs**, GitHub/X/Discord glyphs, three link columns.

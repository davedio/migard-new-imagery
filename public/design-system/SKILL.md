---
name: midgard-design
description: Use this skill to generate well-branded interfaces and assets for Midgard, a Cardano-native Layer 2 optimistic rollup from Anastasia Labs ("Built to scale. Rooted in Cardano."), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping in the Midgard "Dark Ancient Tech / Trust Architecture" style.
user-invocable: true
---

Read the `README.md` file in this skill, and explore the other available files.

- **Tokens:** `colors_and_type.css` (color + type custom properties; Syne display / Inter body / JetBrains Mono labels) and `midgard.css` (buttons, chips, panels, cards, callouts, layer rows, ambient background).
- **Assets:** `assets/` — `midgard-logo.png`, `midgard-icon.png` (world-tree mark), `hero-tree-green.png` (Yggdrasil hero / splash).
- **Design system cards:** `preview/` — type, color, spacing, component, and brand specimens.
- **UI kit:** `ui_kits/website/` — a high-fidelity, interactive recreation of the Midgard marketing gateway (splash → home → child pages), plus `experiments/` (the cursor-spotlight wordmark).

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask a few questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

**Brand essentials:** dark green-black surfaces (deep ink `#07120b`), Midgard green `#20be43` / bright `#3be863` for live/valid signals, gold `#cf9a2e`/`#e0a33c` for proof/settlement, Cardano-blue for L1 references. Syne display headings, JetBrains Mono for eyebrows/chips/metrics/CTAs. Glow not shadow; gold hairline on panels; status chips with dots; calm, exact, anti-hype copy; no emoji.

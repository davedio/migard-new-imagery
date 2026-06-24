"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { PageBackdrop, type BackdropVariant } from "@/components/site/PageBackdrop";

// Both backdrops carry canvases; keep them out of SSR AND out of the shared
// layout chunk (the static import shipped the security backdrop everywhere).
const AmbientDepth = dynamic(() => import("./scene/AmbientDepth"), {
  ssr: false,
});
const SecurityPageBackdrop = dynamic(() => import("./SecurityPageBackdrop"), {
  ssr: false,
});

/**
 * Mounts the shared ambient background on Midgard CHILD pages only.
 * The home hero keeps its world-tree; /how-it-works owns the full-screen
 * flagship JourneyScene (its experience
 * component portals its own fixed 3D stage), so the ambient canvas would be
 * a redundant second R3F canvas there. AmbientDepth is the single persistent
 * ambient canvas (drifting motes + fbm mist + scroll parallax) on the rest;
 * /security keeps its dedicated stone backdrop. /contracts intentionally keeps
 * the shared canvas off so the rune/address reference surface stays readable.
 * Drop <InteriorFluidBackground /> into the (site) layout.
 */
/* Light-mode preview: only pages without their own strong art direction get a
   painterly plate. Contracts keeps its rune hero; security keeps its page hero. */
const LIGHT_BACKDROPS: Record<string, { name: string; variant: BackdropVariant }> = {
  "/learn": { name: "tree-canopy", variant: "soft" },
  "/developers": { name: "tree-terraces", variant: "bold" },
  "/faq": { name: "tree-forest-path", variant: "banner" },
  "/faqs": { name: "tree-forest-path", variant: "banner" },
};

export default function InteriorFluidBackground() {
  const pathname = usePathname();
  const { theme } = useTheme();

  // Light preview — painterly per-page backdrops (dark theme is unchanged).
  if (theme === "light") {
    const hit = LIGHT_BACKDROPS[pathname];
    if (hit) return <PageBackdrop name={hit.name} variant={hit.variant} />;
    return null; // home hero + the how-it-works 3D journey own their own canvas
  }

  // Dark theme — original behaviour.
  if (
    pathname === "/" ||
    pathname === "/home" ||
    pathname === "/how-it-works" ||
    pathname === "/contracts"
  ) {
    return null;
  }
  if (pathname === "/security") {
    return <SecurityPageBackdrop />;
  }
  return <AmbientDepth />;
}

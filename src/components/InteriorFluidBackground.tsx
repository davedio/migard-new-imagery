"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

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
 * /security keeps its dedicated stone backdrop.
 * Drop <InteriorFluidBackground /> into the (site) layout.
 */
export default function InteriorFluidBackground() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/home" || pathname === "/how-it-works") {
    return null;
  }
  /* the carved-stone backdrop moved with the security content to /contracts */
  if (pathname === "/contracts") {
    return <SecurityPageBackdrop />;
  }
  return <AmbientDepth />;
}

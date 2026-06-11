"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import SecurityPageBackdrop from "./SecurityPageBackdrop";

// AmbientDepth carries an R3F canvas; keep it out of SSR.
const AmbientDepth = dynamic(() => import("./scene/AmbientDepth"), {
  ssr: false,
});

/**
 * Mounts the shared ambient background on Midgard CHILD pages only.
 * The home hero (/home) keeps its world-tree; the splash (/) has its own;
 * /how-it-works owns the full-screen flagship JourneyScene (its experience
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
  if (pathname === "/security") {
    return <SecurityPageBackdrop />;
  }
  return <AmbientDepth />;
}

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
 * The home hero (/home) keeps its world-tree; the splash (/) has its own.
 * AmbientDepth is the single persistent ambient canvas (drifting motes + fbm
 * mist + scroll parallax); /security keeps its dedicated root backdrop.
 * Drop <InteriorFluidBackground /> into the (site) layout.
 */
export default function InteriorFluidBackground() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/home") return null;
  if (pathname === "/security") {
    return <SecurityPageBackdrop />;
  }
  return <AmbientDepth />;
}

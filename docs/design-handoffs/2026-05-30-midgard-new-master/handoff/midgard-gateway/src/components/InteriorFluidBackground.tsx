"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// load the WebGL scene client-side only
const FluidScene = dynamic(() => import("./scene/FluidScene"), { ssr: false });

/**
 * Mounts the fluid "mist" background on Midgard CHILD pages only.
 * The home hero (/home) keeps its world-tree; the splash (/) has its own.
 * Drop <InteriorFluidBackground /> into the (site) layout.
 */
export default function InteriorFluidBackground() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/home") return null;
  return <FluidScene />;
}

"use client";

import { usePathname } from "next/navigation";
import FluidScene from "./scene/FluidScene";
import SecurityPageBackdrop from "./SecurityPageBackdrop";

/**
 * Mounts the fluid "mist" background on Midgard CHILD pages only.
 * The home hero (/home) keeps its world-tree; the splash (/) has its own.
 * Drop <InteriorFluidBackground /> into the (site) layout.
 */
export default function InteriorFluidBackground() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/home") return null;
  if (pathname === "/security") return <SecurityPageBackdrop />;
  return <FluidScene />;
}

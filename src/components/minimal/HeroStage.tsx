"use client";

/* Picks the home hero backdrop by theme: the new painterly tree plate
   with a scroll-zoom in light mode, and the original animated particle
   World Tree in dark mode (kept fully intact for the later dark pass). */

import { useTheme } from "@/lib/theme";
import { HeroWorldTree } from "@/components/minimal/HeroWorldTree";
import { HeroTreeImage } from "@/components/minimal/HeroTreeImage";

export function HeroStage() {
  const { theme } = useTheme();
  return theme === "light" ? <HeroTreeImage /> : <HeroWorldTree />;
}

export default HeroStage;

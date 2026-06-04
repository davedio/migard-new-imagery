import type { ReactNode } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollEffects } from "@/components/site/ScrollEffects";
import { CardFx } from "@/components/site/CardFx";
import InteriorFluidBackground from "@/components/InteriorFluidBackground";

/**
 * Layout for the (site) route group — every navigable page (home + children)
 * shares the fixed top nav and the footer. The splash at `/` lives outside
 * this group, so it stays full-bleed with no chrome.
 *
 * Note: route groups `(site)` are organizational only and do NOT appear in the
 * URL. This is a nested layout, so it must not render <html>/<body> — the root
 * layout owns those plus the world background.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <InteriorFluidBackground />
      <SiteNav />
      <ScrollEffects />
      <CardFx />
      {children}
      <SiteFooter />
    </>
  );
}

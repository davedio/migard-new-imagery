import type { ReactNode } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import InteriorFluidBackground from "@/components/InteriorFluidBackground";
import { ScrollProgress } from "@/components/v2/ChromeV2";

/**
 * Layout for the (site) route group — every navigable page (home + children)
 * shares the fixed top nav and the footer.
 *
 * Note: route groups `(site)` are organizational only and do NOT appear in the
 * URL. This is a nested layout, so it must not render <html>/<body> — the root
 * layout owns those plus the world background.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Keyboard users skip the ~11 nav controls straight to the page. */}
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <InteriorFluidBackground />
      {/* Subtle shared ambient layer — faint green/gold radial light so pages
          never fall into a flat black void below their hero (audit Phase 0). */}
      <div className="site-ambient" aria-hidden />
      <ScrollProgress />
      <SiteNav />
      {/* Keep the fixed nav outside the scrolling page-content + footer group.
          The data attribute also provides a stable, route-agnostic styling
          hook for pages with fixed visual layers. */}
      <div data-scroll-content id="content">
        {children}
        <SiteFooter />
      </div>
    </>
  );
}

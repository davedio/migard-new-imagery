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
      {/* `data-scroll-content` is the smooth-scroll transform root. The fixed
          nav stays outside it; everything that scrolls (page content + footer)
          lives inside so the inertial-scroll hook can translate them as one.
          Inert on every route except home, where Gateway activates the hook. */}
      <div data-scroll-content id="content">
        {children}
        <SiteFooter />
      </div>
    </>
  );
}

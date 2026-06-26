"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OfficialSocialLinks } from "@/components/site/OfficialSocialLinks";
import { useTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/*  Nav model                                                           */
/* ------------------------------------------------------------------ */

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Developers", href: "/developers" },
  { label: "Security", href: "/learn#security-overview" },
  { label: "FAQ", href: "/faq" },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * Fixed top navigation shared across every page in the (site) route group.
 *
 * Desktop: the real first-level pages are all exposed as plain links so the
 * site map can be reviewed directly. A scrim fades in once the page is
 * scrolled (data-scrolled).
 *
 * Mobile: burger menu with the same page list.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ pathname: "", open: false });
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();

  const open = menu.open && menu.pathname === pathname;

  /* Scrim once scrolled — content scrolls beneath the transparent nav. */
  useEffect(() => {
    let last = false;
    const syncInitial = window.requestAnimationFrame(() => {
      last = window.scrollY > 16;
      setScrolled(last);
    });
    const onScroll = () => {
      const next = window.scrollY > 16;
      if (next === last) return;
      last = next;
      setScrolled(next);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(syncInitial);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenu({ pathname, open: false });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pathname]);

  const closeMenu = () => setMenu({ pathname, open: false });
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));

  /* Home is active only on exactly "/" — every route starts with "/". */
  const isActive = (href: string) => {
    if (!href.startsWith("/")) return false;
    if (href.startsWith("/#")) return false;
    if (href.includes("#")) return false;
    return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) => ({
    className: "site-nav__link",
    "data-active": isActive(href),
  });

  return (
    <>
      <nav className="site-nav" data-scrolled={scrolled}>
        <Link href="/" className="site-nav__logo" aria-label="Midgard home">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={28} height={28} priority unoptimized />
          <span className="wm">Midgard</span>
        </Link>

        <div className="site-nav__links">
          {NAV_LINKS.map((item) => (
            <Link key={item.label} href={item.href} {...linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="site-nav__right">
          <OfficialSocialLinks className="site-nav__social" linkClassName="site-nav__social-link" iconSize={17} />
          <button
            type="button"
            className="site-nav__theme"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title="Toggle dark mode"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 2.6v2.4M12 19v2.4M4.6 12H2.2M21.8 12h-2.4M5.6 5.6 7.3 7.3M16.7 16.7l1.7 1.7M18.4 5.6 16.7 7.3M7.3 16.7l-1.7 1.7" />
                </g>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="site-nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={toggleMenu}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile menu — same page list as desktop. */}
      <div className="site-nav__mobile" data-open={open} aria-hidden={!open} inert={!open}>
        {NAV_LINKS.map((item) => (
          <Link key={item.label} href={item.href} data-active={isActive(item.href)} onClick={closeMenu}>
            {item.label}
          </Link>
        ))}
        <OfficialSocialLinks
          className="site-nav__mobile-social"
          linkClassName="site-nav__mobile-social-link"
          iconSize={18}
          showLabels
          onNavigate={closeMenu}
        />
      </div>
    </>
  );
}

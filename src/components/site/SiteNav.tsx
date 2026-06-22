"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GitHubIcon } from "@/components/site/BrandIcons";
import { OFFICIAL_LINKS } from "@/lib/officialLinks";
import { useTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/*  Nav model                                                           */
/* ------------------------------------------------------------------ */

type NavLink = {
  label: string;
  href: string;
};

/* Two-page preview build (2026-06-12): only the routes that exist on
   this branch — the new-tree home and the How It Works descent. */
const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Choose your path", href: "/#trunk" },
  { label: "How It Works", href: "/how-it-works" },
] as const;

/* Sun/moon toggle — flips between the night tree and the dawn tree. */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={!dark}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
      title={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      {dark ? (
        /* moon — night is active, clicking brings the dawn */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        /* sun — day is active, clicking brings back the night */
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2.6v2.2M12 19.2v2.2M21.4 12h-2.2M4.8 12H2.6M18.6 5.4l-1.6 1.6M7 17l-1.6 1.6M18.6 18.6 17 17M7 7 5.4 5.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

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

  const closeMenu = () => setMenu({ pathname, open: false });
  const toggleMenu = () =>
    setMenu((state) => ({
      pathname,
      open: state.pathname === pathname ? !state.open : true,
    }));

  /* Home is active only on exactly "/" — every route starts with "/". */
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) => ({
    className: "site-nav__link",
    "data-active": isActive(href),
  });

  return (
    <>
      <nav className="site-nav" data-scrolled={scrolled}>
        <Link href="/" className="site-nav__logo" aria-label="Midgard home">
          <Image src="/midgard-icon.png" alt="" aria-hidden width={28} height={28} />
          <span className="wm">Midgard</span>
        </Link>

        <div className="site-nav__links">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} {...linkClass(item.href)}>
              {item.label}
            </Link>
          ))}
          <a
            href={OFFICIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav__link site-nav__link--external"
          >
            GitHub
            <GitHubIcon size={15} aria-hidden />
          </a>
        </div>

        <div className="site-nav__right">
          <ThemeToggle />
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
      <div className="site-nav__mobile" data-open={open}>
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-active={isActive(item.href)}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={OFFICIAL_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="site-nav__mobile-link--external"
          onClick={closeMenu}
        >
          GitHub
          <GitHubIcon size={16} aria-hidden />
        </a>
      </div>
    </>
  );
}
